import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/intasend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["INTASEND_WEBHOOK_CHALLENGE"];
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        // IntaSend echoes the challenge string configured on the webhook.
        if (!expected || body["challenge"] !== expected) {
          return new Response("Invalid challenge", { status: 401 });
        }

        const providerInvoiceId = String(body["invoice_id"] ?? "");
        const state = String(body["state"] ?? "");
        if (!providerInvoiceId) return new Response("Missing invoice_id", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { reconcilePayment } = await import("@/lib/billing.server");

        const safePayload = { ...body };
        delete safePayload["challenge"];

        await supabaseAdmin.from("payment_events").insert({
          provider: "intasend",
          event_type: state || "unknown",
          provider_invoice_id: providerInvoiceId,
          payload: JSON.parse(JSON.stringify(safePayload)),
        });

        await reconcilePayment({
          providerInvoiceId,
          state,
          mpesaReceipt: (body["mpesa_reference"] as string | undefined) ?? null,
          failureReason: (body["failed_reason"] as string | undefined) ?? null,
        });

        return new Response("ok");
      },
    },
  },
});
