import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type VerifySearch = { token?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: [{ title: "Verify your email — SafariConnect Kenya" }],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification link. Please use the link from your email.");
      return;
    }
    if (ran.current) return;
    ran.current = true;

    verifyEmail(token)
      .then((res: any) => {
        setStatus("success");
        
        // Dynamically check user role from the verification response
        const userRoles = res?.user?.roles?.map((r: any) => typeof r === 'string' ? r : r.role) || [res?.user?.role];
        const isAdmin = userRoles.includes("admin");
        const isOperator = userRoles.includes("operator");

        setTimeout(() => {
          if (isAdmin) {
            window.location.href = "/admin";
          } else if (isOperator) {
            window.location.href = "/operator"; // Routes operators to their dashboard!
          } else {
            navigate({ to: "/my-trips" });
          }
        }, 2000);
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token, verifyEmail, navigate]);

  return (
    <div className="mx-auto w-full max-w-md px-5 py-24 text-center">
      {status === "verifying" && (
        <>
          <h1 className="text-2xl font-semibold">Verifying your email…</h1>
          <p className="mt-2 text-muted-foreground">Just a moment.</p>
        </>
      )}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-semibold">Email verified!</h1>
          <p className="mt-2 text-muted-foreground">Redirecting you now…</p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-semibold">Verification failed</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/auth">Back to sign in</Link>
          </Button>
        </>
      )}
    </div>
  );
}