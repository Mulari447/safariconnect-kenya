import { Link } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

// TODO: replace these placeholders with real details when ready
const CONTACT_PHONE = "+254 748 390 976";
const CONTACT_EMAIL = "info@safariconnectkenya.co.ke";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61593027555665",
  instagram: "https://www.instagram.com/safariconnectkenya",
  x: "https://twitter.com/safariconnectkenya",
  whatsapp: "https://wa.me/254748390976",
  tiktok: "https://www.tiktok.com/@safariconnectkenya",
};

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.52 3.68-8.2 8.22-8.2 2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.8c0 4.53-3.68 8.21-8.22 8.21Zm4.5-6.15c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.47-.01a.9.9 0 0 0-.65.3c-.23.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.47-.28Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.15-1.4V15.4a4.6 4.6 0 1 1-4.6-4.6c.16 0 .32.01.48.03v2.34a2.26 2.26 0 1 0 1.9 2.23V2h2.27a4.28 4.28 0 0 0 3.1 3.85v2Z" />
    </svg>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between text-sm text-white/55 transition-all duration-200 hover:translate-x-0.5 hover:text-white"
    >
      <span>{children}</span>

      <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-60" />
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-slate-950 text-white">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 size-[32rem] rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-48 right-0 size-[34rem] rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.025),transparent_40%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =========================================================
            TOP BRAND / TRUST SECTION
        ========================================================= */}
        <div className="border-b border-white/[0.08] py-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">

            {/* Brand */}
            <div className="max-w-2xl">
              <Link
                to="/"
                className="group inline-flex items-center gap-3"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 text-lg font-bold shadow-xl shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
                  S
                </span>

                <span className="font-display text-xl font-bold tracking-tight">
                  SafariConnect
                  <span className="text-primary"> Kenya</span>
                </span>
              </Link>

              <h2 className="mt-6 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Discover Kenya. Compare. Connect. Travel.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                Connect with Kenyan tour operators, compare travel quotes,
                discover incredible destinations, and plan your perfect
                Kenyan adventure — all from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/60">
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  Kenya-focused travel marketplace
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/60">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  Free for travellers
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="lg:justify-self-end">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl shadow-black/10 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <MessageCircle className="size-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Need help planning?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/45">
                      Talk to SafariConnect Kenya on WhatsApp.
                    </p>
                  </div>
                </div>

                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-500/20"
                >
                  <WhatsAppIcon />
                  Chat on WhatsApp
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            MAIN NAVIGATION
        ========================================================= */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
              Explore
            </p>

            <div className="mt-5 flex flex-col gap-3.5">
              <FooterLink to="/destinations">
                Destinations
              </FooterLink>

              <FooterLink to="/plan-trip">
                Plan a trip
              </FooterLink>

              <FooterLink to="/my-trips">
                My requests
              </FooterLink>

              <FooterLink to="/operators">
                Tour operators
              </FooterLink>
            </div>
          </div>

          {/* Popular Destinations */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
              Destinations
            </p>

            <div className="mt-5 flex flex-col gap-3.5">
              <FooterLink to="/destinations">
                Maasai Mara
              </FooterLink>

              <FooterLink to="/destinations">
                Amboseli
              </FooterLink>

              <FooterLink to="/destinations">
                Tsavo
              </FooterLink>

              <FooterLink to="/destinations">
                Diani Beach
              </FooterLink>

              <FooterLink to="/destinations">
                Mombasa
              </FooterLink>

              <FooterLink to="/destinations">
                Samburu
              </FooterLink>
            </div>
          </div>

          {/* Experiences */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
              Experiences
            </p>

            <div className="mt-5 flex flex-col gap-3.5">
              <FooterLink to="/plan-trip">
                Kenya Safaris
              </FooterLink>

              <FooterLink to="/plan-trip">
                Beach Holidays
              </FooterLink>

              <FooterLink to="/plan-trip">
                Luxury Safaris
              </FooterLink>

              <FooterLink to="/plan-trip">
                Family Holidays
              </FooterLink>

              <FooterLink to="/plan-trip">
                Honeymoon Safaris
              </FooterLink>

              <FooterLink to="/plan-trip">
                Cultural Tours
              </FooterLink>
            </div>
          </div>

          {/* For Operators */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
              For Operators
            </p>

            <div className="mt-5 flex flex-col gap-3.5">
              <FooterLink to="/operator">
                Join SafariConnect
              </FooterLink>

              <FooterLink to="/operator">
                Operator Portal
              </FooterLink>

              <FooterLink to="/operator">
                Manage Enquiries
              </FooterLink>

              <FooterLink to="/operator">
                Manage Quotes
              </FooterLink>

              <FooterLink to="/operator">
                Operator Plans
              </FooterLink>
            </div>
          </div>

          {/* Why SafariConnect */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
              Why Us
            </p>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-start gap-2.5 text-sm text-white/55">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Compare multiple quotes</span>
              </div>

              <div className="flex items-start gap-2.5 text-sm text-white/55">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Free for travellers</span>
              </div>

              <div className="flex items-start gap-2.5 text-sm text-white/55">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Kenya-focused platform</span>
              </div>

              <div className="flex items-start gap-2.5 text-sm text-white/55">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Secure online payments</span>
              </div>

              <div className="flex items-start gap-2.5 text-sm text-white/55">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>Connect with tour operators</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            CONTACT + SOCIAL
        ========================================================= */}
        <div className="border-t border-white/[0.08] py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                Get in touch
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white/60 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                    <Phone className="size-4" />
                  </span>

                  <span>{CONTACT_PHONE}</span>
                </a>

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white/60 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                    <Mail className="size-4" />
                  </span>

                  <span>{CONTACT_EMAIL}</span>
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35 lg:text-right">
                Follow SafariConnect
              </p>

              <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Facebook className="size-[18px]" />
                </a>

                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Instagram className="size-[18px]" />
                </a>

                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <span className="text-[17px] font-bold">𝕏</span>
                </a>

                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <WhatsAppIcon />
                </a>

                <a
                  href={SOCIAL_LINKS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <TikTokIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECURE PAYMENTS
        ========================================================= */}
        <div className="border-t border-white/[0.08] py-10">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl shadow-black/10 sm:p-7">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* Security Copy */}
              <div className="max-w-md">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 className="size-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      Secure payments
                    </p>

                    <p className="text-xs text-white/40">
                      Safe and secure payment processing
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/45">
                  Payments on SafariConnect Kenya are securely processed
                  through IntaSend, supporting trusted payment methods
                  including M-Pesa.
                </p>
              </div>

              {/* IntaSend Badge */}
              <a
                href="https://intasend.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 sm:flex-row"
              >
                <img
                  src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-with-mpesa-hr-light.png"
                  width="375"
                  alt="IntaSend Secure Payments (PCI-DSS Compliant)"
                  className="h-auto w-[375px] max-w-full opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                />

                <span className="text-center text-xs leading-5 text-white/35 transition-colors group-hover:text-white/60 sm:text-left">
                  Secure
                  <br />
                  Payments
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* =========================================================
            LEGAL / BOTTOM BAR
        ========================================================= */}
        <div className="border-t border-white/[0.08] py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* Copyright */}
            <div>
              <p className="text-xs text-white/40">
                © {new Date().getFullYear()} SafariConnect Kenya. All rights
                reserved.
              </p>

              <p className="mt-1.5 text-xs text-white/25">
                The Smarter Way to Explore Kenya.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/35">
              <Link
                to="/terms"
                className="transition-colors hover:text-white"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                to="/cookies"
                className="transition-colors hover:text-white"
              >
                Cookie Policy
              </Link>

              <Link
                to="/refund-policy"
                className="transition-colors hover:text-white"
              >
                Refund Policy
              </Link>

              <Link
                to="/operator-terms"
                className="transition-colors hover:text-white"
              >
                Operator Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}