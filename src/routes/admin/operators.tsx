import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { allCompaniesQuery, type OperatorCompany } from "@/lib/operator-queries";
import { isAdminQuery } from "@/lib/plan-queries";
import { ShieldAlert, UserCheck, UserX } from "lucide-react";

export const Route = createFileRoute("/admin/operators")({
  head: () => ({
    meta: [
      { title: "Operator Approvals & Management — SafariConnect Kenya Admin" },
      {
        name: "description",
        content:
          "Review pending Kenyan tour operator applications and manage active operator suspensions.",
      },
      { property: "og:title", content: "Operator Approvals & Management — SafariConnect Kenya Admin" },
    ],
  }),
  component: AdminOperators,
});

const FILTERS = ["pending", "approved", "rejected"] as const;

function AdminOperators() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const { data: isAdmin, isLoading: loadingRole } = useQuery({ ...isAdminQuery, enabled: !!user });
  const { data: companies, isLoading } = useQuery({ ...allCompaniesQuery, enabled: !!isAdmin });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading || (user && loadingRole)) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading…</p>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Admins only</h1>
        <p className="mt-3 text-muted-foreground">
          Operator management is restricted to SafariConnect administrators.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link to="/">Back to marketplace</Link>
        </Button>
      </div>
    );
  }

  const decide = async (company: OperatorCompany, status: "approved" | "rejected") => {
    setBusyId(company.id);
    try {
      const note = notes[company.id]?.trim();
      await api.patch(`/api/operators/admin/${company.id}/${status === "approved" ? "approve" : "reject"}`, {
        adminNote: note ? note.slice(0, 500) : null,
      });
      toast.success(status === "approved" ? "Operator approved" : "Operator rejected");
      await qc.invalidateQueries({ queryKey: ["all-companies"] });
      await qc.invalidateQueries({ queryKey: ["operator-directory"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this operator");
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspend = async (ownerId: string, type: 'temporary' | 'permanent' | 'lift', days?: number) => {
    setBusyId(ownerId);
    try {
      await api.patch(`/api/admin/users/${ownerId}/suspend`, {
        suspensionType: type,
        durationDays: days,
      });
      toast.success(
        type === 'lift' 
          ? "Operator suspension lifted." 
          : type === 'temporary' 
          ? `Operator suspended for ${days} days.` 
          : "Operator permanently suspended."
      );
      await qc.invalidateQueries({ queryKey: ["all-companies"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update suspension status");
    } finally {
      setBusyId(null);
    }
  };

  const all = companies ?? [];
  const shown = all.filter((c) => c.status === filter);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Administration</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Operator management</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Review submitted registration details, licensing, and credentials below. Manage active operator approvals and account suspensions.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="rounded-lg capitalize text-xs"
            onClick={() => setFilter(f)}
          >
            {f} ({all.filter((c) => c.status === f).length})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading applications…</p>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">No {filter} applications found</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {shown.map((c) => {
            const ownerUser = (c as any).owner;
            const isSuspended = ownerUser?.suspended;
            const suspendedUntil = ownerUser?.suspendedUntil;

            return (
              <article key={c.id} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {c.name}
                      {isSuspended && (
                        <Badge variant="destructive" className="text-[10px]">
                          {suspendedUntil ? `Suspended until ${new Date(suspendedUntil).toLocaleDateString()}` : "Banned"}
                        </Badge>
                      )}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      County: {c.county ?? "Not set"} · Physical Address: {c.physical_address ?? "Not provided"}
                    </p>
                  </div>
                  <Badge variant={c.status === "approved" ? "default" : c.status === "rejected" ? "destructive" : "secondary"}>
                    {c.status}
                  </Badge>
                </div>

                {/* STRUCTURED SUBMITTED INFO GRID */}
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Submitted Business Credentials</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-lg border border-border text-sm">
                    <Row label="Business Reg. No." value={c.business_reg_number} />
                    <Row label="KRA PIN" value={c.kra_pin} />
                    <Row label="Tourism Licence No." value={c.license_number} />
                    <Row label="KATO Membership" value={c.kato_membership} />
                    <Row label="Contact Person" value={c.contact_person} />
                    <Row label="Business Email" value={c.email} />
                    <Row label="Business Phone" value={c.phone} />
                    <Row label="WhatsApp Number" value={c.whatsapp} />
                    <Row label="Website URL" value={c.website} />
                    <Row label="Google Maps URL" value={c.maps_url} />
                    <Row label="Years in Business" value={c.years_in_business == null ? null : String(c.years_in_business)} />
                    <Row label="Number of Employees" value={c.employees == null ? null : String(c.employees)} />
                  </dl>
                </div>

                {(c.languages?.length > 0 || c.vehicle_types?.length > 0 || c.safari_specialties?.length > 0 || c.tour_categories?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                    <Row label="Languages Spoken" value={c.languages?.join(", ") || null} />
                    <Row label="Vehicle Types" value={c.vehicle_types?.join(", ") || null} />
                    <Row label="Safari Specialties" value={c.safari_specialties?.join(", ") || null} />
                    <Row label="Tour Categories" value={c.tour_categories?.join(", ") || null} />
                  </div>
                )}

                {c.description && (
                  <div className="border-t border-border pt-4">
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Company Overview / Description</dt>
                    <dd className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border whitespace-pre-wrap">{c.description}</dd>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                    Admin Feedback Note (sent to operator)
                  </label>
                  <Textarea
                    className="rounded-lg border-input text-sm"
                    rows={2}
                    maxLength={500}
                    placeholder="Optional review notes or rejection reasons..."
                    value={notes[c.id] ?? c.admin_note ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                  />
                </div>

                <div className="border-t border-border pt-4 flex flex-wrap gap-2.5 justify-between items-center">
                  {/* SUSPENSION CONTROLS FOR APPROVED OPERATORS */}
                  <div className="flex items-center gap-2">
                    {c.status === "approved" && ownerUser?.id && (
                      isSuspended ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === ownerUser.id}
                          onClick={() => void handleSuspend(ownerUser.id, 'lift')}
                          className="text-green-600 border-green-200 hover:bg-green-50 rounded-lg text-xs"
                        >
                          <UserCheck className="size-4 mr-1" /> Lift Suspension
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={busyId === ownerUser.id}
                            onClick={() => {
                              const days = prompt("Enter temporary suspension duration in days (e.g., 7):");
                              if (days) void handleSuspend(ownerUser.id, 'temporary', parseInt(days, 10));
                            }}
                            className="text-amber-600 border-amber-200 hover:bg-amber-50 rounded-lg text-xs"
                          >
                            <ShieldAlert className="size-4 mr-1" /> Temp Suspend
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busyId === ownerUser.id}
                            onClick={() => {
                              if (confirm("Are you sure you want to permanently suspend this operator?")) {
                                void handleSuspend(ownerUser.id, 'permanent');
                              }
                            }}
                            className="rounded-lg text-xs"
                          >
                            <UserX className="size-4 mr-1" /> Permanent Ban
                          </Button>
                        </>
                      )
                    )}
                  </div>

                  {/* APPROVAL / REJECTION ACTIONS */}
                  <div className="flex flex-wrap gap-2.5 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={busyId === c.id || c.status === "rejected"}
                      onClick={() => void decide(c, "rejected")}
                    >
                      Reject Application
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      disabled={busyId === c.id || c.status === "approved"}
                      onClick={() => void decide(c, "approved")}
                    >
                      Approve &amp; Verify Operator
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground break-words">{value ?? "—"}</dd>
    </div>
  );
}