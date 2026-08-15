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

export const Route = createFileRoute("/admin/operators")({
  head: () => ({
    meta: [
      { title: "Operator Approvals — SafariConnect Kenya Admin" },
      {
        name: "description",
        content:
          "Review pending Kenyan tour operator applications: business registration, KRA PIN, TRA licence and contacts, then approve or reject each company.",
      },
      { property: "og:title", content: "Operator Approvals — SafariConnect Kenya Admin" },
      {
        property: "og:description",
        content: "Approve or reject tour operator registrations on SafariConnect Kenya.",
      },
      { property: "og:type", content: "website" },
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
          Operator approvals are restricted to the SafariConnect administrator.
        </p>
        <Button asChild className="mt-6 rounded-xl">
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

  const all = companies ?? [];
  const shown = all.filter((c) => c.status === filter);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12">
      <p className="eyebrow text-primary">Administration</p>
      <h1 className="mt-2 text-4xl font-semibold">Operator approvals</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Every tour company stays pending until you approve it. Approved companies appear in the
        public directory and unlock the lead marketplace.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="rounded-full capitalize"
            onClick={() => setFilter(f)}
          >
            {f} ({all.filter((c) => c.status === f).length})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading applications…</p>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-card p-10 text-center shadow-soft">
          <p className="font-semibold">No {filter} applications</p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {shown.map((c) => (
            <article key={c.id} className="rounded-2xl bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{c.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.county ?? "County not set"} · {c.physical_address ?? "No address"}
                  </p>
                </div>
                <Badge variant={c.status === "approved" ? "default" : "secondary"}>
                  {c.status}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Row label="Business reg. no." value={c.business_reg_number} />
                <Row label="KRA PIN" value={c.kra_pin} />
                <Row label="TRA licence" value={c.license_number} />
                <Row label="KATO membership" value={c.kato_membership} />
                <Row label="Contact person" value={c.contact_person} />
                <Row label="Email" value={c.email} />
                <Row label="Phone" value={c.phone} />
                <Row label="WhatsApp" value={c.whatsapp} />
                <Row label="Website" value={c.website} />
                <Row label="Google Maps" value={c.maps_url} />
                <Row
                  label="Years in business"
                  value={c.years_in_business == null ? null : String(c.years_in_business)}
                />
                <Row label="Employees" value={c.employees == null ? null : String(c.employees)} />
                <Row label="Languages" value={c.languages.join(", ") || null} />
                <Row label="Vehicles" value={c.vehicle_types.join(", ") || null} />
                <Row label="Specialties" value={c.safari_specialties.join(", ") || null} />
                <Row label="Tour categories" value={c.tour_categories.join(", ") || null} />
              </dl>

              {c.description && <p className="mt-4 text-sm">{c.description}</p>}

              <Textarea
                className="mt-4"
                rows={2}
                maxLength={500}
                placeholder="Note to the operator (optional)"
                value={notes[c.id] ?? c.admin_note ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="rounded-xl"
                  disabled={busyId === c.id || c.status === "approved"}
                  onClick={() => void decide(c, "approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={busyId === c.id || c.status === "rejected"}
                  onClick={() => void decide(c, "rejected")}
                >
                  Reject
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words">{value ?? "—"}</dd>
    </div>
  );
}