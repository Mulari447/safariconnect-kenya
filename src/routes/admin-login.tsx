import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api, setToken } from "@/lib/api";
import { ShieldAlert, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [{ title: "System Access — SafariConnect Kenya" }],
  }),
  component: AdminLoginPortal,
});

function AdminLoginPortal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calls your standard login endpoint using your exact original logic
      const res = await api.post<any>("/api/auth/login", { email, password });
      
      if (res.token) {
        setToken(res.token);
        toast.success("Admin access granted.");
        // Force a hard redirect to the admin panel so the global auth state refreshes
        window.location.href = "/admin";
      } else {
        throw new Error("Authentication failed.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Invalid credentials or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e6e9ef] p-4 py-12">
      <div className="w-full max-w-md bg-[#e6e9ef] shadow-[12px_12px_24px_#c5c8cc,-12px_-12px_24px_#ffffff] rounded-[2.5rem] p-8 sm:p-10 space-y-8 border border-white/40">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e6e9ef] shadow-[6px_6px_12px_#c5c8cc,-6px_-6px_12px_#ffffff] text-red-500 mb-4">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">System Access</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Restricted to authorized administrators only.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block pl-1">Admin Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 size-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@safariconnect.co.ke"
                className="w-full bg-[#e6e9ef] shadow-[inset_4px_4px_8px_#c5c8cc,inset_-4px_-4px_8px_#ffffff] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none border-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block pl-1">Password</label>
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
            <Lock className="size-4" />
            {loading ? "Authenticating..." : "Secure Login"}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}