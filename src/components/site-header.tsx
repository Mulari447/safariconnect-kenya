import { Link, useRouter } from "@tanstack/react-router";
import { Compass, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isAdminQuery } from "@/lib/plan-queries";
import { cn } from "@/lib/utils";

const baseLinks = [
  { to: "/destinations", label: "Destinations" },
  { to: "/plan-trip", label: "Plan a trip" },
  { to: "/my-trips", label: "My requests" },
  { to: "/operators", label: "Operators" },
  { to: "/operator", label: "For operators" },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: isAdmin } = useQuery({ ...isAdminQuery, enabled: !!user });

  const links = isAdmin
    ? [
        { to: "/destinations", label: "Destinations" },
        { to: "/operators", label: "Operators" },
        { to: "/admin/operators", label: "Approvals" },
        { to: "/admin/plans", label: "Plan settings" },
      ]
    : baseLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/75 shadow-[0_4px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo + Tagline */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-primary/75 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <Compass
              className="relative size-[21px] transition-transform duration-500 group-hover:rotate-12"
              strokeWidth={2.2}
            />
          </span>

          <span className="hidden sm:flex sm:flex-col sm:justify-center">
            <span className="font-display text-[17px] font-bold leading-none tracking-[-0.02em]">
              SafariConnect
              <span className="text-primary"> Kenya</span>
            </span>

            <span className="mt-1 text-[9px] font-medium leading-none tracking-[0.04em] text-muted-foreground">
              The Smarter Way to Explore Kenya.
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden items-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "relative rounded-xl px-3.5 py-2 text-[13px] font-medium",
                "text-muted-foreground transition-all duration-200",
                "hover:bg-background hover:text-foreground",
                "hover:shadow-sm"
              )}
              activeProps={{
                className: cn(
                  "relative rounded-xl px-3.5 py-2 text-[13px] font-semibold",
                  "bg-background text-foreground shadow-sm",
                  "ring-1 ring-border/50"
                ),
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                router.navigate({ to: "/" });
              }}
              className="hidden rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive sm:flex"
            >
              <LogOut className="mr-1.5 size-4" />
              Sign out
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="hidden rounded-full px-5 font-semibold shadow-sm shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25 sm:flex"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl border border-border/50 bg-background/50 transition-all duration-200 hover:bg-secondary md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          open
            ? "max-h-[500px] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        )}
      >
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="group flex items-center rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:pl-5 hover:text-foreground"
              activeProps={{
                className:
                  "group flex items-center rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-foreground",
              }}
            >
              <span className="mr-3 h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
              {l.label}
            </Link>
          ))}

          {/* Mobile Auth Action */}
          <div className="mt-2 border-t border-border/50 pt-3 pb-1 sm:hidden">
            {user ? (
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  await signOut();
                  router.navigate({ to: "/" });
                  setOpen(false);
                }}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </Button>
            ) : (
              <Button
                asChild
                className="w-full rounded-xl font-semibold shadow-sm"
              >
                <Link to="/auth" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}