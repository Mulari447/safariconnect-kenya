import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ShieldAlert, Users, Compass, FileText, CheckCircle2, XCircle, Trash2, Award, Settings, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Super Admin Control Center — SafariConnect Kenya" }],
  }),
  component: SuperAdminPortal,
});

function SuperAdminPortal() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"operators" | "trips" | "users" | "plans">("operators");
  
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<any>({});
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/admin-login" });
    }
  }, [user, loading, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await api.get<any>("/api/admin/overview");
      return res;
    },
    enabled: !!user,
  });

  const updateOperator = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      await api.patch(`/api/admin/operators/${id}/verify`, updates);
    },
    onSuccess: () => {
      toast.success("Operator approval status updated successfully.");
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Failed to update operator status."),
  });

  const rejectOperator = useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote: string }) => {
      await api.patch(`/api/operators/admin/${id}/reject`, { adminNote });
    },
    onSuccess: () => {
      toast.success("Operator application rejected with note.");
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Failed to reject operator application."),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      await api.put(`/api/admin/plans/${id}`, updates);
    },
    onSuccess: () => {
      toast.success("Plan settings saved successfully.");
      setEditingPlanId(null);
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Failed to update plan settings."),
  });

  const deleteTrip = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/trip-requests/${id}`);
    },
    onSuccess: () => {
      toast.success("Trip request deleted.");
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Could not delete trip request."),
  });

  if (loading || !user) {
    return <div className="p-20 text-center text-muted-foreground">Checking authentication session...</div>;
  }

  const isAdmin = user.email === "mdlazaro46@gmail.com" || user.roles?.includes("admin") || user.role === "admin";

  if (!isAdmin) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-2xl bg-destructive/10 p-8 text-center text-destructive">
        <h2 className="font-semibold text-lg">Access Restricted</h2>
        <p className="mt-1 text-sm">You must have admin privileges to view this portal.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground gap-1"><ShieldAlert className="size-3.5" /> Super Admin</Badge>
            <p className="text-sm text-muted-foreground">Logged in as {user?.email}</p>
          </div>
          <h1 className="mt-2 text-3xl font-bold">Platform Control Center</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={activeTab === "operators" ? "default" : "outline"} className="rounded-xl gap-2" onClick={() => setActiveTab("operators")}>
            <Compass className="size-4" /> Approvals & Operators ({data?.operators?.length || 0})
          </Button>
          <Button variant={activeTab === "trips" ? "default" : "outline"} className="rounded-xl gap-2" onClick={() => setActiveTab("trips")}>
            <FileText className="size-4" /> Trip Requests ({data?.tripRequests?.length || 0})
          </Button>
          <Button variant={activeTab === "users" ? "default" : "outline"} className="rounded-xl gap-2" onClick={() => setActiveTab("users")}>
            <Users className="size-4" /> Users ({data?.users?.length || 0})
          </Button>
          <Button variant={activeTab === "plans" ? "default" : "outline"} className="rounded-xl gap-2" onClick={() => setActiveTab("plans")}>
            <Settings className="size-4" /> Plan Settings ({data?.plans?.length || 0})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-12 text-center text-muted-foreground">Loading platform records...</p>
      ) : error ? (
        <div className="mt-12 rounded-2xl bg-destructive/10 p-8 text-center text-destructive">
          <h2 className="font-semibold text-lg">Server Error</h2>
          <p className="mt-1 text-sm">Failed to fetch platform records. Please check your backend connection.</p>
        </div>
      ) : (
        <div className="mt-8">
          
          {/* TAB 1: OPERATOR APPROVALS & CREDENTIALS REVIEW */}
          {activeTab === "operators" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tour Operator Account Approvals</h2>
              <div className="grid gap-6">
                {data?.operators?.map((op: any) => (
                  <div key={op.id} className="rounded-2xl bg-card p-6 shadow-soft space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{op.name}</h3>
                          {op.verified ? (
                            <Badge className="bg-green-600 text-white gap-1"><CheckCircle2 className="size-3" /> Approved / Verified</Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1"><XCircle className="size-3" /> Pending Approval</Badge>
                          )}
                          {op.premium_badge && <Badge className="bg-amber-500 text-white gap-1"><Award className="size-3" /> Premium</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Owner Email: {op.owner?.email || "N/A"} · County: {op.county || "Not specified"} · Physical Address: {op.physicalAddress || "Not specified"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant={op.verified ? "outline" : "default"} className="rounded-xl" onClick={() => updateOperator.mutate({ id: op.id, updates: { verified: !op.verified } })}>
                          {op.verified ? "Revoke Approval" : "Approve Account"}
                        </Button>
                        <Button size="sm" variant={op.premium_badge ? "outline" : "secondary"} className="rounded-xl" onClick={() => updateOperator.mutate({ id: op.id, updates: { premium_badge: !op.premium_badge } })}>
                          {op.premium_badge ? "Remove Premium" : "Make Premium"}
                        </Button>
                      </div>
                    </div>

                    {/* STRUCTURED SUBMITTED DETAILS GRID */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Submitted Business Credentials</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-xl border border-border text-sm">
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">Business Reg. No.</dt>
                          <dd className="mt-0.5 font-medium">{op.businessRegNumber || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">KRA PIN</dt>
                          <dd className="mt-0.5 font-medium">{op.kraPin || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">Tourism Licence No.</dt>
                          <dd className="mt-0.5 font-medium">{op.licenseNumber || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">KATO Membership</dt>
                          <dd className="mt-0.5 font-medium">{op.katoMembership || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">Contact Person</dt>
                          <dd className="mt-0.5 font-medium">{op.contactPerson || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">Business Email</dt>
                          <dd className="mt-0.5 font-medium">{op.email || op.owner?.email || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">Business Phone</dt>
                          <dd className="mt-0.5 font-medium">{op.phone || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">WhatsApp</dt>
                          <dd className="mt-0.5 font-medium">{op.whatsapp || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-muted-foreground font-semibold">Website</dt>
                          <dd className="mt-0.5 font-medium truncate">{op.website || "—"}</dd>
                        </div>
                      </dl>
                    </div>

                    {op.description && (
                      <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Company Overview</h4>
                        <p className="text-sm text-muted-foreground bg-background p-3 rounded-xl border border-border whitespace-pre-wrap">{op.description}</p>
                      </div>
                    )}

                    {/* REJECTION REASON SECTION */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Rejection Reason / Admin Note (e.g., fake docs, invalid KRA PIN)
                      </label>
                      <div className="flex flex-wrap gap-3 items-center">
                        <Textarea
                          className="flex-1 rounded-xl border-input text-sm"
                          rows={2}
                          placeholder="Provide a reason for rejection..."
                          value={rejectionNotes[op.id] ?? op.adminNote ?? ""}
                          onChange={(e) => setRejectionNotes({ ...rejectionNotes, [op.id]: e.target.value })}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-xl h-10 px-4"
                          onClick={() => {
                            const note = rejectionNotes[op.id] || "";
                            if (!note.trim()) {
                              toast.error("Please provide a reason before rejecting.");
                              return;
                            }
                            rejectOperator.mutate({ id: op.id, adminNote: note });
                          }}
                        >
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRIP REQUESTS */}
          {activeTab === "trips" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">All Traveller Trip Requests & Quotations</h2>
              <div className="grid gap-4">
                {data?.tripRequests?.map((trip: any) => (
                  <div key={trip.id} className="rounded-2xl bg-card p-6 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{trip.destinationName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Traveller: {trip.user?.email || "Unknown"} · Adults: {trip.adults} · Status: <span className="font-semibold text-primary capitalize">{trip.status}</span>
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => deleteTrip.mutate(trip.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Registered Platform Users</h2>
              <div className="rounded-2xl bg-card p-6 shadow-soft overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Roles</th>
                      <th className="pb-3 font-semibold">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data?.users?.map((u: any) => (
                      <tr key={u.id} className="h-12">
                        <td className="font-medium">{u.email}</td>
                        <td>
                          <div className="flex gap-1">
                            {(u.roles ? u.roles.map((r: any) => typeof r === 'string' ? r : r.role) : [u.role]).map((r: string) => (
                              <Badge key={r} variant="secondary" className="capitalize text-xs">{r}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PLAN SETTINGS */}
          {activeTab === "plans" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Subscription Plan Settings</h2>
              {(!data?.plans || data.plans.length === 0) ? (
                <div className="rounded-2xl bg-card p-10 text-center shadow-soft">
                  <p className="text-muted-foreground">No subscription plans found in the database.</p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {data.plans.map((plan: any) => (
                    <div key={plan.id} className="rounded-2xl bg-card p-6 shadow-soft transition-all">
                      {editingPlanId === plan.id ? (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">Plan Name</label>
                            <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={planForm.name || ""} onChange={e => setPlanForm({...planForm, name: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground">Description</label>
                            <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={planForm.description || ""} onChange={e => setPlanForm({...planForm, description: e.target.value})} rows={2} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground">Monthly Price (KES)</label>
                              <input type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={planForm.priceKes ?? ""} onChange={e => setPlanForm({...planForm, priceKes: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground">Annual Price (KES)</label>
                              <input type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={planForm.priceKesAnnual ?? ""} onChange={e => setPlanForm({...planForm, priceKesAnnual: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground">Priority Rank</label>
                              <input type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={planForm.priorityRank ?? ""} onChange={e => setPlanForm({...planForm, priorityRank: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-muted-foreground">Staff Accounts</label>
                              <input type="number" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={planForm.staffAccounts ?? ""} onChange={e => setPlanForm({...planForm, staffAccounts: e.target.value})} />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 py-2 border-y border-border my-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={planForm.premiumBadge || false} onChange={e => setPlanForm({...planForm, premiumBadge: e.target.checked})} className="rounded" /> 
                              Premium Badge Target
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={planForm.featuredListing || false} onChange={e => setPlanForm({...planForm, featuredListing: e.target.checked})} className="rounded" /> 
                              Featured Listing
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={planForm.isActive !== false} onChange={e => setPlanForm({...planForm, isActive: e.target.checked})} className="rounded" /> 
                              Plan is Active
                            </label>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="rounded-xl" onClick={() => updatePlan.mutate({ id: plan.id, updates: planForm })}>
                              Save All Changes
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditingPlanId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{plan.name}</h3>
                                {!plan.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                              </div>
                              <p className="text-xs font-semibold text-primary uppercase mt-1">Priority Rank: {plan.priorityRank}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-primary text-primary-foreground text-sm py-1">KES {plan.priceKes} / mo</Badge>
                              <p className="text-xs text-muted-foreground mt-1 text-right">KES {plan.priceKesAnnual} / yr</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground border-y border-border py-3 my-2">
                            {plan.description || "No description provided."}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {plan.premiumBadge && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Premium Badge</Badge>}
                            {plan.featuredListing && <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Featured Placement</Badge>}
                            <Badge variant="outline" className="bg-muted text-muted-foreground">{plan.staffAccounts} Staff Account(s)</Badge>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              className="rounded-xl gap-1.5"
                              onClick={() => {
                                setEditingPlanId(plan.id);
                                setPlanForm({ ...plan });
                              }}
                            >
                              <Edit2 className="size-3.5" /> Edit Full Plan Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}