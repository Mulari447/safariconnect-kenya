import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/operator-terms")({
  head: () => ({
    meta: [
      { title: "Operator Terms & Conditions — SafariConnect Kenya" },
      {
        name: "description",
        content: "Review the terms, verification standards, and subscription guidelines for tour operators joining SafariConnect Kenya.",
      },
      { property: "og:title", content: "Operator Terms & Conditions — SafariConnect Kenya" },
      { property: "og:url", content: "/operator-terms" },
    ],
    links: [{ rel: "canonical", href: "/operator-terms" }],
  }),
  component: OperatorTermsPage,
});

function OperatorTermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="eyebrow text-primary">Partner Agreement</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tour Operator Terms</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-card p-6 sm:p-10 shadow-soft space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Operator Qualification & Licensing</h2>
            <p>
              To register as a tour operator on SafariConnect Kenya, your company must be a legally registered business entity in Kenya with valid licensing (such as Tourism Regulatory Authority [TRA] registration, KATO membership where applicable, and a valid KRA PIN). You are required to submit accurate compliance details for admin review and approval before your company profile goes live.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Subscriptions & Billing</h2>
            <p>
              Access to operator tools, lead generation, and CRM features operates via subscription plans billed through our secure payment gateway (IntaSend). Subscriptions renew according to your selected billing cycle (monthly or annual). Operators are responsible for keeping billing details up to date to prevent temporary suspension of lead access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Lead Management & Quotations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Professional Conduct:</strong> Operators must provide professional, competitive, and transparent quotes directly to prospective travellers.</li>
              <li><strong>Direct Client Dealing:</strong> Once an enquiry or quote is connected, all financial arrangements, safari execution details, and payments are handled independently between you and the customer. SafariConnect Kenya is not a party to the underlying tour contract.</li>
              <li><strong>Prohibited Practices:</strong> Misleading pricing, deceptive service descriptions, or failure to deliver paid tours will result in immediate suspension or termination of your operator account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Account Suspension & Termination</h2>
            <p>
              SafariConnect Kenya reserves the right to suspend or revoke operator verification status at any time if fraudulent activity, licensing expiration, or persistent customer complaints are reported against the company.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Contact Information</h2>
            <p>
              For partner support, verification assistance, or subscription queries, contact our team at{" "}
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