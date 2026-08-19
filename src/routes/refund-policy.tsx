import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — SafariConnect Kenya" },
      {
        name: "description",
        content: "Learn about refund terms, subscription payments, and booking cancellation policies on SafariConnect Kenya.",
      },
      { property: "og:title", content: "Refund Policy — SafariConnect Kenya" },
      { property: "og:url", content: "/refund-policy" },
    ],
    links: [{ rel: "canonical", href: "/refund-policy" }],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="eyebrow text-primary">Financial Terms</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Refund Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-card p-6 sm:p-10 shadow-soft space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Overview</h2>
            <p>
              SafariConnect Kenya operates strictly as a digital marketplace connecting independent travellers with licensed third-party tour operators. We do not collect money, booking deposits, or tour payments on behalf of customers for safari trips. All financial transactions regarding tour packages, deposits, and refunds are negotiated and handled independently between you and your chosen tour operator.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Traveller Bookings & Tour Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free Platform Access:</strong> Submitting trip requests and comparing quotes is completely free for travellers.</li>
              <li><strong>Direct Operator Agreements:</strong> Any payments, deposits, or refunds for safari packages are strictly between the traveller and the respective tour operator. SafariConnect Kenya holds no liability or custody over tour booking funds.</li>
              <li><strong>Cancellations:</strong> Cancellation policies, rescheduling rules, and refund schedules must be discussed and agreed upon directly with your selected tour operator.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Tour Operator Subscriptions</h2>
            <p>
              Subscription plans purchased by tour operators to access leads, premium badges, or platform features are billed directly through our secure payment gateway (IntaSend) and are generally non-refundable once activated, except in cases of verified technical billing errors or duplicate charges.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Contact Us</h2>
            <p>
              For any questions regarding platform subscriptions or general inquiries, reach out to us at{" "}
              <a href="mailto:info@safariconnectkenya.co.ke" className="text-primary hover:underline font-medium">
                info@safariconnectkenya.co.ke
              </a>{" "}
              or call/WhatsApp <span className="font-medium">+254 748 390 976</span>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}