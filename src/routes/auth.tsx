import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api, setToken } from "@/lib/api";
import { Compass, Mail, Lock, User, Briefcase, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Welcome — SafariConnect Kenya" }],
  }),
  component: AuthPortal,
});

function AuthPortal() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "operator">("customer");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const res = await api.post<any>("/api/auth/login", { email, password });
        
        // Safely catch token from any common backend naming convention
        const token = res.token || res.accessToken || res.jwt || res.sck_token;

        if (token) {
          setToken(token);
          toast.success("Welcome back!");
          
          const userRoles = res.user?.roles?.map((r: any) => typeof r === 'string' ? r : r.role) || [res.user?.role];
          const isAdmin = userRoles.includes("admin");
          const isOperator = userRoles.includes("operator");

          if (isAdmin) {
            window.location.href = "/admin";
          } else if (isOperator) {
            window.location.href = "/operator";
          } else {
            window.location.href = "/";
          }
        } else {
          console.error("Login response payload missing token:", res);
          toast.error("Login successful, but server session token was missing.");
          setLoading(false);
        }
      } else {
        // --- SIGN UP FLOW ---
        await api.post<any>("/api/auth/register", { 
          email, 
          password, 
          role 
        });
        
        setVerificationSent(true);
        setLoading(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || (isLogin ? "Invalid credentials." : "Failed to create account."));
      setLoading(false);
    }
  };

  // --- NEUMORPHIC VERIFICATION SCREEN ---
  if (verificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e6e9ef] p-5">
        <div className="w-full max-w-md bg-[#e6e9ef] shadow-[12px_12px_24px_#c5c8cc,-12px_-12px_24px_#ffffff] rounded-[2.5rem] p-8 sm:p-10 text-center border border-white/40">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] text-green-600 mb-6">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Check your inbox</h1>
          <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed">
            We've sent a verification link to <span className="font-bold text-slate-700">{email}</span>. Please verify your email before logging in.
          </p>
          <button 
            onClick={() => { setVerificationSent(false); setIsLogin(true); }}
            className="w-full bg-[#e6e9ef] shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-4 mt-8 text-sm font-bold text-slate-700 transition-all"
          >
            Proceed to Sign In
          </button>
        </div>
      </div>
    );
  }

  // --- NEUMORPHIC LOGIN/REGISTER SCREEN ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e6e9ef] p-4 py-12">
      <div className="w-full max-w-md bg-[#e6e9ef] shadow-[12px_12px_24px_#c5c8cc,-12px_-12px_24px_#ffffff] rounded-[2.5rem] p-8 sm:p-10 space-y-8 border border-white/40">
        
        {/* Header Toggle */}
        <div className="flex rounded-2xl bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] p-1.5 mb-2">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              isLogin
                ? "bg-[#e6e9ef] shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] text-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              !isLogin
                ? "bg-[#e6e9ef] shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] text-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e6e9ef] shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff] text-primary mb-4">
            <Compass className="size-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            {isLogin ? "Welcome Back" : "Join SafariConnect"}
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            {isLogin ? "Access your dashboard" : "Start your journey today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Role Selection (Only visible during Sign Up) */}
          {!isLogin && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block pl-1">
                I am a...
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                    role === "customer"
                      ? "bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] border border-primary/20 text-primary"
                      : "bg-[#e6e9ef] shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] text-slate-500 hover:text-primary"
                  }`}
                >
                  <User className="size-6" />
                  <span className="text-xs font-bold">Traveller</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("operator")}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                    role === "operator"
                      ? "bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] border border-primary/20 text-primary"
                      : "bg-[#e6e9ef] shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] text-slate-500 hover:text-primary"
                  }`}
                >
                  <Briefcase className="size-6" />
                  <span className="text-xs font-bold">Tour Operator</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block pl-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 size-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none border-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Password
              </label>
              {isLogin && (
                <a href="#" className="text-xs font-bold text-primary hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 size-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none border-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none rounded-full"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e6e9ef] shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#c5c8cc,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-4 text-base font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

      </div>
    </div>
  );
}