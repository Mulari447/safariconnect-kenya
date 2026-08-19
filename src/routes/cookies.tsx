import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — SafariConnect Kenya" },
      {
        name: "description",
        content: "Understand how SafariConnect Kenya uses cookies and similar technologies to enhance your browsing experience.",
      },
      { property: "og:title", content: "Cookie Policy — SafariConnect Kenya" },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="eyebrow text-primary">Website Tracking</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Cookie Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-card p-6 sm:p-10 shadow-soft space-y-8 text-foreground/80 leading-relaxed text-sm sm:text-base">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit websites. They are widely used to make websites work efficiently, remember your preferences, and provide analytical data to site owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How SafariConnect Kenya Uses Cookies</h2>
            <p>We use cookies and similar technologies for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential Authentication Cookies:</strong> To keep you securely logged in as you navigate between pages or manage your trip requests and operator dashboards.</li>
              <li><strong>Preference Cookies:</strong> To remember your site preferences, such as preferred display settings or language options.</li>
              <li><strong>Analytics & Performance Cookies:</strong> To monitor traffic patterns, understand how users interact with our marketplace, and fix bugs or performance glitches.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Managing and Disabling Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. You can choose to block or delete cookies entirely. However, please note that disabling essential cookies may prevent you from logging into your account or submitting trip requests smoothly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or platform features. Any updates will be posted directly on this page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Contact Us</h2>
            <p>
              If you have any questions regarding our use of cookies, please contact us at{" "}
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