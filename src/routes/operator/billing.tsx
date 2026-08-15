import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, FileText, RefreshCw, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { myCompanyQuery } from "@/lib/operator-queries";
import { companyPlanQuery, plansQuery } from "@/lib/plan-queries";
import {
  invoicesQuery,
  paymentsQuery,
  remindersQuery,
  statusTone,
  type Invoice,
} from "@/lib/billing-queries";
import { api } from "@/lib/api";

export const Route = createFileRoute("/operator/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Payments — SafariConnect Kenya Operators" },
      {
        name: "description",
        content:
          "Pay your SafariConnect Kenya operator subscription with M-Pesa or Visa/Mastercard, download invoices and receipts, and track renewals and failed payments.",
      },
      { property: "og:title", content: "Billing & Payments — SafariConnect Kenya Operators" },
      {
        property: "og:description",
        content: "M-Pesa and card checkout, invoices, receipts and renewal reminders for operators.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/operator/billing" }],
  }),
  component: BillingPage,
});

function BillingPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const { data: company, isLoading: loadingCompany } = useQuery({
    ...myCompanyQuery,
    enabled: !!user,
  });
  const { data: current } = useQuery({ ...companyPlanQuery(company?.id), enabled: !!company });
  const { data: plans } = useQuery(plansQuery);
  const { data: invoices } = useQuery({ ...invoicesQuery(company?.id), enabled: !!company });
  const { data: payments } = useQuery({ ...paymentsQuery(company?.id), enabled: !!company });
  const { data: reminders } = useQuery({ ...remindersQuery(company?.id), enabled: !!company });

  const startPayment = (data: {
    planId: string;
    cycle: "monthly" | "annual";
    method: "mpesa" | "card";
    phone?: string;
    origin: string;
  }) =>
    api.post<{
      paymentId: string;
      invoiceNumber: string;
      method: "mpesa" | "card";
      amount: number;
      checkoutUrl: string | null;
      message: string;
    }>("/api/billing/checkout", data);

  const refresh = (data: { paymentId: string }) =>
    api.post<{ status: string }>("/api/billing/refresh", data);

  const [planId, setPlanId] = useState<string>("");
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [phone, setPhone] = useState("");

  const payable = (plans ?? []).filter((p) => p.is_active && Number(p.price_kes) > 0);
  const selected = payable.find((p) => p.id === planId) ?? payable[0];
  const amount = selected
    ? Number(cycle === "annual" ? selected.price_kes_annual : selected.price_kes)
    : 0;

  const pay = useMutation({
    mutationFn: async (method: "mpesa" | "card") => {
      if (!selected) throw new Error("Choose a plan first.");
      return startPayment({
        planId: selected.id,
        cycle,
        method,
        ...(method === "mpesa" && phone ? { phone } : {}),
        origin: window.location.origin,
      });
    },
    onSuccess: (result) => {
      toast.success(result.message);
      void qc.invalidateQueries({ queryKey: ["invoices"] });
      void qc.invalidateQueries({ queryKey: ["payments"] });
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const check = useMutation({
    mutationFn: (paymentId: string) => refresh({ paymentId }),
    onSuccess: (result) => {
      toast.success(
        result.status === "completed"
          ? "Payment confirmed — your plan is active."
          : `Payment status: ${result.status}`,
      );
      void qc.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading || loadingCompany) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading…</p>;
  }

  if (!user || !company) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Register your company</h1>
        <p className="mt-3 text-muted-foreground">
          Billing becomes available once your tour company is registered.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/operator/profile">Register company</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="eyebrow text-primary">Billing</p>
      <h1 className="mt-2 text-4xl font-semibold">Payments &amp; invoices</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Pay with M-Pesa (STK push to your phone) or Visa/Mastercard. Your plan activates the moment
        payment confirms, and every charge produces an invoice and receipt below.
      </p>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Subscribe or renew</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current plan: {current?.plan?.name ?? "None"}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                value={selected?.id ?? ""}
                onChange={(e) => setPlanId(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {payable.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {(["monthly", "annual"] as const).map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={cycle === c ? "default" : "outline"}
                  className="rounded-xl capitalize"
                  onClick={() => setCycle(c)}
                >
                  {c}
                </Button>
              ))}
            </div>

            <div>
              <Label htmlFor="phone">M-Pesa phone number</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 h-11 rounded-xl"
              />
            </div>

            <p className="text-lg font-semibold">
              Total: KES {amount.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground"> / {cycle}</span>
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-xl"
                disabled={pay.isPending || !selected}
                onClick={() => pay.mutate("mpesa")}
              >
                <Smartphone className="size-4" /> Pay with M-Pesa
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={pay.isPending || !selected}
                onClick={() => pay.mutate("card")}
              >
                <CreditCard className="size-4" /> Pay by card
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Payments are processed by IntaSend. M-Pesa Paybill and card payments settle to your
              SafariConnect account; renewals are billed on the same cycle.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Reminders</h2>
          {(reminders ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No reminders yet. We&apos;ll notify you before each renewal and if a payment fails.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {(reminders ?? []).map((r) => (
                <li key={r.id} className="rounded-xl bg-secondary/60 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium capitalize">{r.kind.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.due_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.message && <p className="mt-1 text-muted-foreground">{r.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <h2 className="mt-14 text-2xl font-semibold">Invoices</h2>
      {(invoices ?? []).length === 0 ? (
        <p className="mt-2 text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-border/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(invoices ?? []).map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.description}</td>
                  <td className="px-4 py-3">KES {Number(inv.amount_kes).toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium capitalize ${statusTone(inv.status)}`}>
                    {inv.status}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.period_start).toLocaleDateString()} –{" "}
                    {new Date(inv.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => printInvoice(inv, company.name)}
                    >
                      <FileText className="size-4" /> Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-14 text-2xl font-semibold">Payment attempts</h2>
      {(payments ?? []).length === 0 ? (
        <p className="mt-2 text-muted-foreground">No payments recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {(payments ?? []).map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-soft"
            >
              <div>
                <p className="font-medium">
                  KES {Number(p.amount_kes).toLocaleString()}{" "}
                  <Badge variant="secondary" className="ml-1 uppercase">
                    {p.method}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.api_ref} · {new Date(p.created_at).toLocaleString()}
                  {p.mpesa_receipt ? ` · receipt ${p.mpesa_receipt}` : ""}
                </p>
                {p.failure_reason && (
                  <p className="text-sm text-destructive">{p.failure_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium capitalize ${statusTone(p.status)}`}>
                  {p.status}
                </span>
                {p.checkout_url && p.status !== "completed" && (
                  <Button asChild variant="outline" size="sm" className="rounded-lg">
                    <a href={p.checkout_url}>Resume checkout</a>
                  </Button>
                )}
                {p.status !== "completed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    disabled={check.isPending}
                    onClick={() => check.mutate(p.id)}
                  >
                    <RefreshCw className="size-4" /> Check
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function printInvoice(invoice: Invoice, companyName: string) {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  const paid = invoice.status === "paid";
  win.document.write(`<!doctype html><html><head><title>${invoice.invoice_number}</title>
  <style>body{font-family:system-ui,sans-serif;padding:40px;color:#123}
  h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}
  td,th{text-align:left;padding:10px 0;border-bottom:1px solid #ddd}
  .total{font-size:20px;font-weight:600}</style></head><body>
  <h1>SafariConnect Kenya</h1>
  <p>${paid ? "Receipt" : "Invoice"} ${invoice.invoice_number}</p>
  <p><strong>${companyName}</strong></p>
  <table><tr><th>Description</th><th>Period</th><th>Amount</th></tr>
  <tr><td>${invoice.description ?? "Subscription"}</td>
  <td>${new Date(invoice.period_start).toLocaleDateString()} – ${new Date(invoice.period_end).toLocaleDateString()}</td>
  <td>KES ${Number(invoice.amount_kes).toLocaleString()}</td></tr></table>
  <p class="total">Total: KES ${Number(invoice.amount_kes).toLocaleString()} — ${invoice.status.toUpperCase()}</p>
  ${paid && invoice.paid_at ? `<p>Paid on ${new Date(invoice.paid_at).toLocaleString()}</p>` : ""}
  </body></html>`);
  win.document.close();
  win.print();
}