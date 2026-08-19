import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SafariConnect Kenya" },
      {
        name: "description",
        content: "Learn how SafariConnect Kenya collects, uses, and protects your personal and travel information.",
      },
      { property: "og:title", content: "Privacy Policy — SafariConnect Kenya" },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="eyebrow text-primary">Data Protection</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-card p-6 sm:p-10 shadow-soft space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Overview</h2>
            <p>
              At SafariConnect Kenya, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal information when using our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p>We collect information you provide directly to us when creating an account, planning a trip, or communicating with us:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Details:</strong> Full name, email address, and encrypted password credentials.</li>
              <li><strong>Trip Request Data:</strong> Travel dates, destination choices, group sizes, dietary notes, and budget preferences.</li>
              <li><strong>Operator Information:</strong> Business registration records, KRA PIN numbers, and KATO credentials (for tour operator accounts).</li>
              <li><strong>Transaction Data:</strong> Payment verification details and records processed securely through IntaSend.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>Your information is used strictly to facilitate the marketplace experience, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Matching your trip requests with verified Kenyan tour operators so they can provide customized quotes.</li>
              <li>Sending essential account notifications, password resets, and email verifications.</li>
              <li>Improving platform security, customer support response times, and overall user experience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Sharing with Tour Operators</h2>
            <p>
              When you submit a trip request, relevant details (such as your destination choices, dates, and headcounts) are shared exclusively with verified tour operators on our network to enable them to quote for your business. We do not sell or rent your personal contact information to third-party marketers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
            <p>
              We implement industry-standard security measures, including HTTPS encryption, secure hashing for passwords, and secure cloud databases, to protect your data from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>
              You have the right to access, update, or request the deletion of your personal account data at any time by logging into your profile or contacting our support team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy, please contact us at{" "}
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