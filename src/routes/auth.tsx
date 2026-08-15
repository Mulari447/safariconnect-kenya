import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthSearch = { mode?: "signup" | undefined; role?: "operator" | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : undefined,
    role: search["role"] === "operator" ? "operator" : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Sign in — SafariConnect Kenya" },
      {
        name: "description",
        content:
          "Sign in or create a free traveller account to send trip requests and compare quotes from Kenyan tour operators.",
      },
      { property: "og:title", content: "Sign in — SafariConnect Kenya" },
      {
        property: "og:description",
        content: "Create a free traveller account to compare Kenyan safari quotes.",
      },
      { property: "og:url", content: "/auth" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Use at least 8 characters" }).max(72),
  fullName: z.string().trim().max(120).optional(),
});

function AuthPage() {
  const { mode, role } = Route.useSearch();
  const isOperator = role === "operator";
  const home = isOperator ? "/operator/profile" : "/my-trips";
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [signUpMode, setSignUpMode] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: home });
  }, [user, navigate, home]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    try {
      if (signUpMode) {
        await signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
        setCheckEmail(true);
      } else {
        await signIn(parsed.data.email, parsed.data.password);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-muted-foreground">
          We've sent a verification link to <strong>{email}</strong>. Click it to activate your
          account, then come back and sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <p className="eyebrow text-primary">{isOperator ? "Operator account" : "Traveller account"}</p>
      <h1 className="mt-2 text-3xl font-semibold">
        {signUpMode
          ? isOperator
            ? "Create your operator account"
            : "Create your free account"
          : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isOperator
          ? "Register your licensed tour company. After sign-up you complete your company details for admin approval."
          : "Travellers never pay. Your account keeps your trip requests and quotes in one place."}
      </p>

      <div className="mt-8 rounded-2xl bg-card p-6 shadow-soft">
        <form className="space-y-4" onSubmit={submit}>
          {signUpMode && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amina Otieno"
                maxLength={120}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              maxLength={72}
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={busy}>
            {signUpMode ? "Create account" : "Sign in"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setSignUpMode((v) => !v)}
        >
          {signUpMode ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {isOperator ? (
          <>
            Travelling instead?{" "}
            <Link to="/auth" search={{ mode: "signup" }} className="font-semibold text-primary hover:underline">
              Create a traveller account
            </Link>
          </>
        ) : (
          <>
            Are you a tour company?{" "}
            <Link
              to="/auth"
              search={{ mode: "signup", role: "operator" }}
              className="font-semibold text-primary hover:underline"
            >
              Register as an operator
            </Link>
          </>
        )}
      </p>
    </div>
  );
}