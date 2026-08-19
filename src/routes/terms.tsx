import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — SafariConnect Kenya" },
      {
        name: "description",
        content: "Read the terms and conditions for using SafariConnect Kenya's travel marketplace and platform services.",
      },
      { property: "og:title", content: "Terms & Conditions — SafariConnect Kenya" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="eyebrow text-primary">Legal Agreement</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms & Conditions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-card p-6 sm:p-10 shadow-soft space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              Welcome to SafariConnect Kenya (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website, platform, and services, you agree to comply with and be bound by these Terms & Conditions. Please read them carefully before creating an account or submitting a trip enquiry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Nature of the Platform</h2>
            <p>
              SafariConnect Kenya operates as a digital marketplace connecting independent travellers with licensed third-party tour operators in Kenya. We do not directly own, operate, or control the safari vehicles, accommodation facilities, or tour execution provided by independent operators. Contracts for tours are formed directly between you and the respective tour operator.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts & Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate, current, and complete information during registration.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and password.</li>
              <li>Traveller accounts are free of charge, but you agree not to abuse the quote request system with fraudulent or malicious bookings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Quotes, Bookings, and Payments</h2>
            <p>
              Tour operators submit independent pricing and quotes based on your customized trip requests. SafariConnect Kenya facilitates payments securely through integrated providers such as IntaSend (supporting M-Pesa and card transactions). Applicable payment terms, deposits, and installment schedules will be clearly outlined by your chosen tour operator upon quote acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p>
              All platform design, text, graphics, logos, and software code related to SafariConnect Kenya are protected under intellectual property laws and remain our exclusive property. Unauthorised reproduction or commercial exploitation is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              SafariConnect Kenya shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from tour operations, safety incidents, weather disruptions, or contractual disputes arising between travellers and third-party tour operators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of Kenya. Any legal disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Nairobi, Kenya.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Contact Information</h2>
            <p>
              If you have any questions regarding these Terms & Conditions, please reach out to us at{" "}
              <a href="mailto:info@safariconnectkenya.co.ke" className="text-primary hover:underline font-medium">
                info@safariconnectkenya.co.ke
              </a>{" "}
              or via phone/WhatsApp at <span className="font-medium">+254 748 390 976</span>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}