import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const startSchema = z.object({
  planId: z.string().uuid(),
  cycle: z.enum(["monthly", "annual"]),
  method: z.enum(["mpesa", "card"]),
  phone: z.string().min(9).max(20).optional(),
  origin: z.string().url(),
});

export const startPlanPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => startSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { startPlanCheckout } = await import("./billing.server");
    const email =
      typeof context.claims?.["email"] === "string" ? (context.claims["email"] as string) : null;
    return startPlanCheckout(context.userId, email, data);
  });

export const refreshPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ paymentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { refreshPayment } = await import("./billing.server");
    return refreshPayment(context.userId, data.paymentId);
  });
