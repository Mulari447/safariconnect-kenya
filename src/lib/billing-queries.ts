// src/lib/billing-queries.ts
import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Invoice = {
  id: string;
  company_id: string;
  plan_id: string | null;
  invoice_number: string;
  billing_cycle: string;
  amount_kes: number;
  currency: string;
  status: string;
  description: string | null;
  period_start: string;
  period_end: string;
  due_date: string;
  paid_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string | null;
  company_id: string;
  provider: string;
  method: string;
  amount_kes: number;
  status: string;
  api_ref: string | null;
  provider_invoice_id: string | null;
  provider_state: string | null;
  mpesa_receipt: string | null;
  payer_phone: string | null;
  checkout_url: string | null;
  failure_reason: string | null;
  created_at: string;
};

export type PaymentReminder = {
  id: string;
  company_id: string;
  invoice_id: string | null;
  kind: string;
  channel: string;
  message: string | null;
  due_at: string;
  sent_at: string | null;
};

type ApiInvoice = {
  id: string; companyId: string; planId: string | null; invoiceNumber: string;
  billingCycle: string; amountKes: number; currency: string; status: string;
  description: string | null; periodStart: string; periodEnd: string;
  dueDate: string; paidAt: string | null; createdAt: string;
};

function mapInvoice(i: ApiInvoice): Invoice {
  return {
    id: i.id, company_id: i.companyId, plan_id: i.planId, invoice_number: i.invoiceNumber,
    billing_cycle: i.billingCycle, amount_kes: i.amountKes, currency: i.currency,
    status: i.status, description: i.description, period_start: i.periodStart,
    period_end: i.periodEnd, due_date: i.dueDate, paid_at: i.paidAt, created_at: i.createdAt,
  };
}

export const invoicesQuery = (companyId: string | undefined) =>
  queryOptions({
    queryKey: ["invoices", companyId],
    queryFn: async (): Promise<Invoice[]> => {
      if (!companyId) return [];
      const data = await api.get<ApiInvoice[]>("/api/billing/invoices");
      return data.map(mapInvoice);
    },
  });

type ApiPayment = {
  id: string; invoiceId: string | null; companyId: string; provider: string; method: string;
  amountKes: number; status: string; apiRef: string | null; providerInvoiceId: string | null;
  providerState: string | null; mpesaReceipt: string | null; payerPhone: string | null;
  checkoutUrl: string | null; failureReason: string | null; createdAt: string;
};

function mapPayment(p: ApiPayment): Payment {
  return {
    id: p.id, invoice_id: p.invoiceId, company_id: p.companyId, provider: p.provider,
    method: p.method, amount_kes: p.amountKes, status: p.status, api_ref: p.apiRef,
    provider_invoice_id: p.providerInvoiceId, provider_state: p.providerState,
    mpesa_receipt: p.mpesaReceipt, payer_phone: p.payerPhone, checkout_url: p.checkoutUrl,
    failure_reason: p.failureReason, created_at: p.createdAt,
  };
}

export const paymentsQuery = (companyId: string | undefined) =>
  queryOptions({
    queryKey: ["payments", companyId],
    queryFn: async (): Promise<Payment[]> => {
      if (!companyId) return [];
      const data = await api.get<ApiPayment[]>("/api/billing/payments");
      return data.map(mapPayment);
    },
  });

type ApiReminder = {
  id: string; companyId: string; invoiceId: string | null; kind: string; channel: string;
  message: string | null; dueAt: string; sentAt: string | null;
};

function mapReminder(r: ApiReminder): PaymentReminder {
  return {
    id: r.id, company_id: r.companyId, invoice_id: r.invoiceId, kind: r.kind,
    channel: r.channel, message: r.message, due_at: r.dueAt, sent_at: r.sentAt,
  };
}

export const remindersQuery = (companyId: string | undefined) =>
  queryOptions({
    queryKey: ["payment-reminders", companyId],
    queryFn: async (): Promise<PaymentReminder[]> => {
      if (!companyId) return [];
      const data = await api.get<ApiReminder[]>("/api/billing/reminders");
      return data.map(mapReminder);
    },
  });

export function statusTone(status: string): string {
  if (status === "paid" || status === "completed") return "text-primary";
  if (status === "failed") return "text-destructive";
  return "text-muted-foreground";
}