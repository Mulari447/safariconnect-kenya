// Server-only IntaSend helpers and payment reconciliation.
// IntaSend covers M-Pesa STK Push / Paybill and Visa / Mastercard from one account.

type IntaSendConfig = {
  baseUrl: string;
  secretKey: string;
  publishableKey: string;
};

export function intasendConfig(): IntaSendConfig {
  const secretKey = process.env["INTASEND_SECRET_KEY"];
  const publishableKey = process.env["INTASEND_PUBLISHABLE_KEY"];
  if (!secretKey || !publishableKey) {
    throw new Error(
      "Payment gateway is not configured yet. Add the IntaSend API keys to enable checkout.",
    );
  }
  const live = (process.env["INTASEND_LIVE"] ?? "false").toLowerCase() === "true";
  return {
    baseUrl: live ? "https://payment.intasend.com/api/v1" : "https://sandbox.intasend.com/api/v1",
    secretKey,
    publishableKey,
  };
}

async function intasendPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const cfg = intasendConfig();
  const response = await fetch(`${cfg.baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.secretKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // IntaSend sits behind Cloudflare, which returns 403 (error 1010) for
      // requests without a recognised browser-style User-Agent.
      "User-Agent": "Mozilla/5.0 (compatible; SafariConnectKenya/1.0)",
    },
    body: JSON.stringify({ public_key: cfg.publishableKey, ...body }),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`[IntaSend] ${path} failed [${response.status}]: ${text}`);
    throw new Error(`Payment gateway rejected the request [${response.status}]: ${text}`);
  }
  return JSON.parse(text) as T;
}

export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export type StkPushResult = { invoice?: { invoice_id?: string; state?: string }; id?: string };

export function mpesaStkPush(params: {
  amount: number;
  phone: string;
  apiRef: string;
  narrative: string;
  email?: string;
  firstName?: string;
}) {
  return intasendPost<StkPushResult>("/payment/mpesa-stk-push/", {
    amount: params.amount,
    currency: "KES",
    phone_number: normalisePhone(params.phone),
    api_ref: params.apiRef,
    narrative: params.narrative,
    ...(params.email ? { email: params.email } : {}),
    ...(params.firstName ? { first_name: params.firstName } : {}),
  });
}

export type CheckoutResult = { id?: string; url?: string; invoice?: { invoice_id?: string } };

export function createCardCheckout(params: {
  amount: number;
  apiRef: string;
  email: string;
  redirectUrl: string;
  narrative: string;
}) {
  return intasendPost<CheckoutResult>("/checkout/", {
    amount: params.amount,
    currency: "KES",
    email: params.email,
    api_ref: params.apiRef,
    redirect_url: params.redirectUrl,
    comment: params.narrative,
    method: "CARD-PAYMENT",
  });
}

export type StatusResult = {
  invoice?: {
    invoice_id?: string;
    state?: string;
    provider?: string;
    mpesa_reference?: string;
    failed_reason?: string | null;
    value?: string | number;
  };
};

export function queryPaymentStatus(providerInvoiceId: string) {
  return intasendPost<StatusResult>("/payment/status/", { invoice_id: providerInvoiceId });
}

const COMPLETE_STATES = new Set(["COMPLETE", "PAID", "COMPLETED"]);
const FAILED_STATES = new Set(["FAILED", "CANCELLED", "RETRY"]);

export type ReconcileInput = {
  providerInvoiceId: string;
  state: string;
  mpesaReceipt?: string | null;
  failureReason?: string | null;
  paymentId?: string | null;
};

/**
 * Applies a gateway state to our records: marks the payment, settles the invoice,
 * activates or extends the subscription, and queues renewal / failure reminders.
 */
export async function reconcilePayment(input: ReconcileInput): Promise<{ status: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const state = (input.state ?? "").toUpperCase();

  const lookup = supabaseAdmin.from("payments").select("*").limit(1);
  const { data: payments } = input.paymentId
    ? await lookup.eq("id", input.paymentId)
    : await lookup.eq("provider_invoice_id", input.providerInvoiceId);
  const payment = payments?.[0];
  if (!payment) return { status: "unknown" };

  const status = COMPLETE_STATES.has(state)
    ? "completed"
    : FAILED_STATES.has(state)
      ? "failed"
      : "processing";

  await supabaseAdmin
    .from("payments")
    .update({
      status,
      provider_state: state,
      provider_invoice_id: input.providerInvoiceId || payment.provider_invoice_id,
      mpesa_receipt: input.mpesaReceipt ?? payment.mpesa_receipt,
      failure_reason: status === "failed" ? (input.failureReason ?? "Payment not completed") : null,
    })
    .eq("id", payment.id);

  if (status === "completed" && payment.invoice_id) {
    const { data: invoice } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", payment.invoice_id)
      .maybeSingle();

    await supabaseAdmin
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payment.invoice_id);

    if (invoice?.plan_id) {
      const start = new Date();
      const end = new Date(start);
      if (invoice.billing_cycle === "annual") end.setFullYear(end.getFullYear() + 1);
      else end.setDate(end.getDate() + 30);

      const { data: existing } = await supabaseAdmin
        .from("operator_subscriptions")
        .select("id")
        .eq("company_id", payment.company_id)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("operator_subscriptions")
          .update({
            plan_id: invoice.plan_id,
            status: "active",
            current_period_start: start.toISOString(),
            current_period_end: end.toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin.from("operator_subscriptions").insert({
          company_id: payment.company_id,
          plan_id: invoice.plan_id,
          status: "active",
          current_period_start: start.toISOString(),
          current_period_end: end.toISOString(),
        });
      }

      const remindAt = new Date(end);
      remindAt.setDate(remindAt.getDate() - 5);
      await supabaseAdmin.from("payment_reminders").insert({
        company_id: payment.company_id,
        invoice_id: payment.invoice_id,
        kind: "renewal_upcoming",
        message: `Your subscription renews on ${end.toDateString()}.`,
        due_at: remindAt.toISOString(),
      });
    }
  }

  if (status === "failed") {
    if (payment.invoice_id) {
      await supabaseAdmin
        .from("invoices")
        .update({ status: "failed" })
        .eq("id", payment.invoice_id);
    }
    await supabaseAdmin.from("payment_reminders").insert({
      company_id: payment.company_id,
      invoice_id: payment.invoice_id,
      kind: "payment_failed",
      message: input.failureReason ?? "Your last payment attempt did not go through. Please retry.",
      due_at: new Date().toISOString(),
    });
  }

  return { status };
}

export type StartCheckoutInput = {
  planId: string;
  cycle: "monthly" | "annual";
  method: "mpesa" | "card";
  phone?: string | undefined;
  origin: string;
};

export type StartCheckoutResult = {
  paymentId: string;
  invoiceNumber: string;
  method: "mpesa" | "card";
  amount: number;
  checkoutUrl: string | null;
  message: string;
};

/** Creates the invoice + payment records, then hands off to IntaSend. */
export async function startPlanCheckout(
  userId: string,
  userEmail: string | null,
  input: StartCheckoutInput,
): Promise<StartCheckoutResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: company } = await supabaseAdmin
    .from("operator_companies")
    .select("id, name, email, phone, status")
    .eq("owner_id", userId)
    .maybeSingle();
  if (!company) throw new Error("Register your tour company before subscribing.");

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("id", input.planId)
    .maybeSingle();
  if (!plan || !plan.is_active) throw new Error("That plan is not available.");

  const amount = Number(input.cycle === "annual" ? plan.price_kes_annual : plan.price_kes);
  if (!(amount > 0)) throw new Error("This plan is free — no payment is required.");

  const now = new Date();
  const periodEnd = new Date(now);
  if (input.cycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setDate(periodEnd.getDate() + 30);

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .insert({
      company_id: company.id,
      plan_id: plan.id,
      billing_cycle: input.cycle,
      amount_kes: amount,
      status: "pending",
      description: `${plan.name} plan — ${input.cycle} subscription`,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .select("*")
    .single();
  if (invoiceError || !invoice) throw new Error(invoiceError?.message ?? "Could not create invoice.");

  const email = userEmail ?? company.email ?? "billing@safariconnect.co.ke";
  const phone = input.phone ?? company.phone ?? "";

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from("payments")
    .insert({
      invoice_id: invoice.id,
      company_id: company.id,
      provider: "intasend",
      method: input.method,
      amount_kes: amount,
      status: "pending",
      api_ref: invoice.invoice_number,
      payer_email: email,
      payer_phone: input.method === "mpesa" ? normalisePhone(phone) : null,
    })
    .select("*")
    .single();
  if (paymentError || !payment) throw new Error(paymentError?.message ?? "Could not create payment.");

  try {
    if (input.method === "mpesa") {
      if (!phone) throw new Error("Enter the M-Pesa phone number to receive the payment prompt.");
      const result = await mpesaStkPush({
        amount,
        phone,
        apiRef: invoice.invoice_number,
        narrative: `${plan.name} subscription`,
        email,
        firstName: company.name,
      });
      const providerInvoiceId = result.invoice?.invoice_id ?? result.id ?? null;
      await supabaseAdmin
        .from("payments")
        .update({
          status: "processing",
          provider_invoice_id: providerInvoiceId,
          provider_state: result.invoice?.state ?? "PENDING",
        })
        .eq("id", payment.id);
      return {
        paymentId: payment.id,
        invoiceNumber: invoice.invoice_number,
        method: "mpesa",
        amount,
        checkoutUrl: null,
        message: `Check ${normalisePhone(phone)} for the M-Pesa prompt and enter your PIN.`,
      };
    }

    const result = await createCardCheckout({
      amount,
      apiRef: invoice.invoice_number,
      email,
      redirectUrl: `${input.origin}/operator/billing`,
      narrative: `${plan.name} subscription`,
    });
    const providerInvoiceId = result.id ?? result.invoice?.invoice_id ?? null;
    await supabaseAdmin
      .from("payments")
      .update({
        status: "processing",
        provider_invoice_id: providerInvoiceId,
        provider_state: "PENDING",
        checkout_url: result.url ?? null,
      })
      .eq("id", payment.id);
    return {
      paymentId: payment.id,
      invoiceNumber: invoice.invoice_number,
      method: "card",
      amount,
      checkoutUrl: result.url ?? null,
      message: "Continue to the secure card checkout to complete payment.",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Gateway request failed";
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", failure_reason: reason })
      .eq("id", payment.id);
    await supabaseAdmin.from("invoices").update({ status: "failed" }).eq("id", invoice.id);
    throw new Error(reason);
  }
}

/** Re-checks a pending payment against the gateway and reconciles it. */
export async function refreshPayment(userId: string, paymentId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("*, operator_companies!inner(owner_id)")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) throw new Error("Payment not found.");
  const owner = (payment as unknown as { operator_companies: { owner_id: string } })
    .operator_companies;
  if (owner.owner_id !== userId) throw new Error("Not your payment.");
  if (!payment.provider_invoice_id) return { status: payment.status };

  const result = await queryPaymentStatus(payment.provider_invoice_id);
  return reconcilePayment({
    providerInvoiceId: payment.provider_invoice_id,
    state: result.invoice?.state ?? "PENDING",
    mpesaReceipt: result.invoice?.mpesa_reference ?? null,
    failureReason: result.invoice?.failed_reason ?? null,
    paymentId: payment.id,
  });
}
