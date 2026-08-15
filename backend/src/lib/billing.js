// backend/src/lib/billing.js
const prisma = require('./prisma');
const { mpesaStkPush, createCardCheckout, queryPaymentStatus, normalisePhone } = require('./intasend');
const { generateInvoicePdf } = require('./invoice-pdf');
const { sendInvoiceEmail } = require('./mailer');

const COMPLETE_STATES = new Set(['COMPLETE', 'PAID', 'COMPLETED']);
const FAILED_STATES = new Set(['FAILED', 'CANCELLED', 'RETRY']);

// Applies a gateway state to our records: marks the payment, settles the
// invoice, activates/extends the subscription, and queues reminders.
async function reconcilePayment(input) {
  const state = (input.state ?? '').toUpperCase();

  const payment = input.paymentId
    ? await prisma.payment.findUnique({ where: { id: input.paymentId } })
    : await prisma.payment.findFirst({ where: { providerInvoiceId: input.providerInvoiceId } });

  if (!payment) return { status: 'unknown' };

  const status = COMPLETE_STATES.has(state) ? 'completed' : FAILED_STATES.has(state) ? 'failed' : 'processing';

  const wasAlreadyCompleted = payment.status === 'completed';

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      providerState: state,
      providerInvoiceId: input.providerInvoiceId || payment.providerInvoiceId,
      mpesaReceipt: input.mpesaReceipt ?? payment.mpesaReceipt,
      failureReason: status === 'failed' ? (input.failureReason ?? 'Payment not completed') : null,
    },
  });

  if (status === 'completed' && payment.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });

    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'paid', paidAt: new Date() },
    });

    if (invoice?.planId) {
      const start = new Date();
      const end = new Date(start);
      if (invoice.billingCycle === 'annual') end.setFullYear(end.getFullYear() + 1);
      else end.setDate(end.getDate() + 30);

      await prisma.operatorSubscription.upsert({
        where: { companyId: payment.companyId },
        update: { planId: invoice.planId, status: 'active', currentPeriodStart: start, currentPeriodEnd: end },
        create: {
          companyId: payment.companyId,
          planId: invoice.planId,
          status: 'active',
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
      });

      const remindAt = new Date(end);
      remindAt.setDate(remindAt.getDate() - 5);
      await prisma.paymentReminder.create({
        data: {
          companyId: payment.companyId,
          invoiceId: payment.invoiceId,
          kind: 'renewal_upcoming',
          message: `Your subscription renews on ${end.toDateString()}.`,
          dueAt: remindAt,
        },
      });

      // Send the PDF invoice/receipt by email — only the first time this
      // payment flips to completed, so re-checking status doesn't resend it.
      if (!wasAlreadyCompleted) {
        try {
          const [company, plan] = await Promise.all([
            prisma.operatorCompany.findUnique({ where: { id: payment.companyId } }),
            prisma.subscriptionPlan.findUnique({ where: { id: invoice.planId } }),
          ]);

          const pdfBuffer = await generateInvoicePdf({
            invoiceNumber: invoice.invoiceNumber,
            companyName: company?.name ?? 'Operator',
            contactPerson: company?.contactPerson ?? null,
            county: company?.county ?? null,
            planName: plan?.name ?? 'Subscription',
            billingCycle: invoice.billingCycle,
            amountKes: invoice.amountKes,
            method: payment.method,
            paidAt: new Date(),
            periodStart: invoice.periodStart,
            periodEnd: invoice.periodEnd,
            mpesaReceipt: input.mpesaReceipt ?? payment.mpesaReceipt ?? null,
          });

          const recipientEmail = payment.payerEmail ?? company?.email;
          if (recipientEmail) {
            await sendInvoiceEmail(recipientEmail, {
              companyName: company?.name ?? 'Operator',
              invoiceNumber: invoice.invoiceNumber,
              planName: plan?.name ?? 'Subscription',
              amountKes: invoice.amountKes,
              pdfBuffer,
            });
          }
        } catch (mailErr) {
          console.error('Failed to send invoice email:', mailErr.message);
          // Don't fail the payment reconciliation just because the email didn't send.
        }
      }
    }
  }

  if (status === 'failed') {
    if (payment.invoiceId) {
      await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: 'failed' } });
    }
    await prisma.paymentReminder.create({
      data: {
        companyId: payment.companyId,
        invoiceId: payment.invoiceId,
        kind: 'payment_failed',
        message: input.failureReason ?? 'Your last payment attempt did not go through. Please retry.',
        dueAt: new Date(),
      },
    });
  }

  return { status };
}

function invoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Creates the invoice + payment records, then hands off to IntaSend.
async function startPlanCheckout(userId, userEmail, input) {
  const company = await prisma.operatorCompany.findUnique({ where: { ownerId: userId } });
  if (!company) throw new Error('Register your tour company before subscribing.');

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: input.planId } });
  if (!plan || !plan.isActive) throw new Error('That plan is not available.');

  const amount = Number(input.cycle === 'annual' ? plan.priceKesAnnual : plan.priceKes);
  if (!(amount > 0)) throw new Error('This plan is free — no payment is required.');

  const now = new Date();
  const periodEnd = new Date(now);
  if (input.cycle === 'annual') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setDate(periodEnd.getDate() + 30);

  const invoice = await prisma.invoice.create({
    data: {
      companyId: company.id,
      planId: plan.id,
      invoiceNumber: invoiceNumber(),
      billingCycle: input.cycle,
      amountKes: amount,
      status: 'pending',
      description: `${plan.name} plan — ${input.cycle} subscription`,
      periodStart: now,
      periodEnd,
      dueDate: now,
    },
  });

  const email = userEmail ?? company.email ?? 'billing@safariconnect.co.ke';
  const phone = input.phone ?? company.phone ?? '';

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      companyId: company.id,
      provider: 'intasend',
      method: input.method,
      amountKes: amount,
      status: 'pending',
      apiRef: invoice.invoiceNumber,
      payerEmail: email,
      payerPhone: input.method === 'mpesa' ? normalisePhone(phone) : null,
    },
  });

  try {
    if (input.method === 'mpesa') {
      if (!phone) throw new Error('Enter the M-Pesa phone number to receive the payment prompt.');
      const result = await mpesaStkPush({
        amount, phone, apiRef: invoice.invoiceNumber,
        narrative: `${plan.name} subscription`, email, firstName: company.name,
      });
      const providerInvoiceId = result.invoice?.invoice_id ?? result.id ?? null;
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'processing', providerInvoiceId, providerState: result.invoice?.state ?? 'PENDING' },
      });
      return {
        paymentId: payment.id, invoiceNumber: invoice.invoiceNumber, method: 'mpesa', amount,
        checkoutUrl: null, message: `Check ${normalisePhone(phone)} for the M-Pesa prompt and enter your PIN.`,
      };
    }

    const result = await createCardCheckout({
      amount, apiRef: invoice.invoiceNumber, email,
      redirectUrl: `${input.origin}/operator/billing`, narrative: `${plan.name} subscription`,
    });
    const providerInvoiceId = result.id ?? result.invoice?.invoice_id ?? null;
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'processing', providerInvoiceId, providerState: 'PENDING', checkoutUrl: result.url ?? null },
    });
    return {
      paymentId: payment.id, invoiceNumber: invoice.invoiceNumber, method: 'card', amount,
      checkoutUrl: result.url ?? null, message: 'Continue to the secure card checkout to complete payment.',
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Gateway request failed';
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'failed', failureReason: reason } });
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'failed' } });
    throw new Error(reason);
  }
}

// Re-checks a pending payment against the gateway and reconciles it.
async function refreshPayment(userId, paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { company: true },
  });
  if (!payment) throw new Error('Payment not found.');
  if (payment.company.ownerId !== userId) throw new Error('Not your payment.');
  if (!payment.providerInvoiceId) return { status: payment.status };

  const result = await queryPaymentStatus(payment.providerInvoiceId);
  return reconcilePayment({
    providerInvoiceId: payment.providerInvoiceId,
    state: result.invoice?.state ?? 'PENDING',
    mpesaReceipt: result.invoice?.mpesa_reference ?? null,
    failureReason: result.invoice?.failed_reason ?? null,
    paymentId: payment.id,
  });
}

module.exports = { reconcilePayment, startPlanCheckout, refreshPayment };