import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { myCompanyQuery, uploadCompanyMedia } from "@/lib/operator-queries";

export const Route = createFileRoute("/operator/profile")({
  head: () => ({
    meta: [
      { title: "Operator Registration — SafariConnect Kenya" },
      {
        name: "description",
        content:
          "Register your licensed Kenyan tour company on SafariConnect Kenya: business registration, KRA PIN, TRA licence, fleet, specialties and contacts. Admin approval required.",
      },
      { property: "og:title", content: "Operator Registration — SafariConnect Kenya" },
      {
        property: "og:description",
        content: "Register your Kenyan tour company and start receiving traveller leads.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/operator/profile" },
    ],
    links: [{ rel: "canonical", href: "/operator/profile" }],
  }),
  component: CompanyProfile,
});

const schema = z.object({
  name: z.string().trim().min(2, { message: "Company name is required" }).max(120),
  business_reg_number: z
    .string()
    .trim()
    .min(2, { message: "Business registration number is required" })
    .max(60),
  kra_pin: z.string().trim().min(5, { message: "KRA PIN is required" }).max(30),
  kato_membership: z.string().trim().max(60).optional(),
  license_number: z
    .string()
    .trim()
    .min(2, { message: "TRA licence number is required" })
    .max(60),
  county: z.string().trim().min(2, { message: "County is required" }).max(60),
  physical_address: z
    .string()
    .trim()
    .min(4, { message: "Physical address is required" })
    .max(200),
  maps_url: z.string().trim().max(500).optional(),
  contact_person: z.string().trim().min(2, { message: "Contact person is required" }).max(120),
  email: z.string().trim().email({ message: "Enter a valid company email" }).max(255),
  phone: z.string().trim().min(7, { message: "Phone number is required" }).max(30),
  whatsapp: z.string().trim().max(30).optional(),
  website: z.string().trim().max(255).optional(),
  description: z
    .string()
    .trim()
    .min(20, { message: "Tell travellers about your company (20+ characters)" })
    .max(1500),
  years_in_business: z.string().trim().max(3).optional(),
  employees: z.string().trim().max(6).optional(),
  languages: z.string().trim().max(300).optional(),
  vehicle_types: z.string().trim().max(300).optional(),
  safari_specialties: z.string().trim().max(300).optional(),
  tour_categories: z.string().trim().max(300).optional(),
});

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const toList = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);

const emptyForm = {
  name: "",
  business_reg_number: "",
  kra_pin: "",
  kato_membership: "",
  license_number: "",
  county: "",
  physical_address: "",
  maps_url: "",
  contact_person: "",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  description: "",
  years_in_business: "",
  employees: "",
  languages: "",
  vehicle_types: "",
  safari_specialties: "",
  tour_categories: "",
};

function CompanyProfile() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: company, isLoading } = useQuery({ ...myCompanyQuery, enabled: !!user });

  const [form, setForm] = useState(emptyForm);
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        business_reg_number: company.business_reg_number ?? "",
        kra_pin: company.kra_pin ?? "",
        kato_membership: company.kato_membership ?? "",
        license_number: company.license_number ?? "",
        county: company.county ?? "",
        physical_address: company.physical_address ?? "",
        maps_url: company.maps_url ?? "",
        contact_person: company.contact_person ?? "",
        email: company.email ?? "",
        phone: company.phone ?? "",
        whatsapp: company.whatsapp ?? "",
        website: company.website ?? "",
        description: company.description ?? "",
        years_in_business:
          company.years_in_business == null ? "" : String(company.years_in_business),
        employees: company.employees == null ? "" : String(company.employees),
        languages: company.languages.join(", "),
        vehicle_types: company.vehicle_types.join(", "),
        safari_specialties: company.safari_specialties.join(", "),
        tour_categories: company.tour_categories.join(", "),
      });
    }
  }, [company]);

  if (!loading && !user) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl font-semibold">Create your operator account</h1>
        <p className="mt-3 text-muted-foreground">
          Sign up as a tour company, then complete your registration for admin approval.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/auth" search={{ mode: "signup", role: "operator" }}>
            Create operator account
          </Link>
        </Button>
      </div>
    );
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const intOrNull = (v: string) => {
    const n = Number(v);
    return v.trim() === "" || !Number.isFinite(n) || n < 0 ? null : Math.round(n);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your company details");
      return;
    }
    setBusy(true);
    try {
      const d = parsed.data;
      let logo_url = company?.logo_url ?? null;
      let cover_image_url = company?.cover_image_url ?? null;
      if (logo) logo_url = await uploadCompanyMedia(user.id, "logo", logo);
      if (cover) cover_image_url = await uploadCompanyMedia(user.id, "cover", cover);

      const payload = {
        name: d.name,
        business_reg_number: d.business_reg_number,
        kra_pin: d.kra_pin,
        kato_membership: d.kato_membership ?? null,
        license_number: d.license_number,
        county: d.county,
        physical_address: d.physical_address,
        maps_url: d.maps_url ?? null,
        contact_person: d.contact_person,
        email: d.email,
        phone: d.phone,
        whatsapp: d.whatsapp ?? null,
        website: d.website ?? null,
        description: d.description,
        years_in_business: intOrNull(d.years_in_business ?? ""),
        employees: intOrNull(d.employees ?? ""),
        languages: toList(d.languages),
        vehicle_types: toList(d.vehicle_types),
        safari_specialties: toList(d.safari_specialties),
        tour_categories: toList(d.tour_categories),
        logo_url,
        cover_image_url,
      };

      if (company) {
        await api.patch("/api/operators/me", payload);
        toast.success("Company profile updated");
      } else {
        await api.post("/api/operators", payload);
        toast.success("Application submitted — an administrator will review your company.");
      }
      await qc.invalidateQueries({ queryKey: ["my-company"] });
      await qc.invalidateQueries({ queryKey: ["my-roles"] });
      void navigate({ to: "/operator" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your company");
    } finally {
      setBusy(false);
    }
  };

  const status = company?.status ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <p className="eyebrow text-primary">Tour operators</p>
      <h1 className="mt-2 flex flex-wrap items-center gap-3 text-4xl font-semibold">
        {company ? "Company profile" : "Register your tour company"}
        {status === "approved" && <Badge>Approved</Badge>}
        {status === "pending" && <Badge variant="secondary">Pending approval</Badge>}
        {status === "rejected" && <Badge variant="destructive">Not approved</Badge>}
      </h1>
      <p className="mt-3 text-muted-foreground">
        Your company stays pending until a SafariConnect administrator approves your licence and
        registration documents. Approved companies appear in the public directory and can access
        traveller leads.
      </p>
      {company?.admin_note && (
        <p className="mt-4 rounded-xl bg-secondary p-4 text-sm">
          <span className="font-semibold">Admin note: </span>
          {company.admin_note}
        </p>
      )}

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-8">
          <Section title="Company & registration">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company name" id="name">
                <Input id="name" value={form.name} onChange={set("name")} maxLength={120} required />
              </Field>
              <Field label="Business registration number" id="business_reg_number">
                <Input
                  id="business_reg_number"
                  value={form.business_reg_number}
                  onChange={set("business_reg_number")}
                  maxLength={60}
                  required
                />
              </Field>
              <Field label="KRA PIN" id="kra_pin">
                <Input
                  id="kra_pin"
                  value={form.kra_pin}
                  onChange={set("kra_pin")}
                  maxLength={30}
                  required
                />
              </Field>
              <Field label="KATO membership (optional)" id="kato_membership">
                <Input
                  id="kato_membership"
                  value={form.kato_membership}
                  onChange={set("kato_membership")}
                  maxLength={60}
                />
              </Field>
              <Field label="TRA licence number" id="license_number">
                <Input
                  id="license_number"
                  value={form.license_number}
                  onChange={set("license_number")}
                  maxLength={60}
                  required
                />
              </Field>
              <Field label="Years in business" id="years_in_business">
                <Input
                  id="years_in_business"
                  inputMode="numeric"
                  value={form.years_in_business}
                  onChange={set("years_in_business")}
                  maxLength={3}
                />
              </Field>
              <Field label="Number of employees" id="employees">
                <Input
                  id="employees"
                  inputMode="numeric"
                  value={form.employees}
                  onChange={set("employees")}
                  maxLength={6}
                />
              </Field>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="County" id="county">
                <Input
                  id="county"
                  value={form.county}
                  onChange={set("county")}
                  maxLength={60}
                  required
                />
              </Field>
              <Field label="Physical address" id="physical_address">
                <Input
                  id="physical_address"
                  value={form.physical_address}
                  onChange={set("physical_address")}
                  maxLength={200}
                  required
                />
              </Field>
            </div>
            <Field label="Google Maps location link" id="maps_url">
              <Input
                id="maps_url"
                value={form.maps_url}
                onChange={set("maps_url")}
                maxLength={500}
                placeholder="https://maps.google.com/…"
              />
            </Field>
          </Section>

          <Section title="Contacts">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Contact person" id="contact_person">
                <Input
                  id="contact_person"
                  value={form.contact_person}
                  onChange={set("contact_person")}
                  maxLength={120}
                  required
                />
              </Field>
              <Field label="Company email" id="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  maxLength={255}
                  required
                />
              </Field>
              <Field label="Phone number" id="phone">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={set("phone")}
                  maxLength={30}
                  required
                />
              </Field>
              <Field label="WhatsApp number" id="whatsapp">
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={set("whatsapp")}
                  maxLength={30}
                />
              </Field>
            </div>
            <Field label="Website" id="website">
              <Input
                id="website"
                value={form.website}
                onChange={set("website")}
                maxLength={255}
                placeholder="https://"
              />
            </Field>
          </Section>

          <Section title="Branding & description">
            <Field label="Company description" id="description">
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={set("description")}
                maxLength={1500}
                placeholder="Safari specialists based in Nairobi, 12 years of Maasai Mara experience…"
                required
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company logo" id="logo">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                />
              </Field>
              <Field label="Company cover image" id="cover">
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Services">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Languages spoken (comma separated)" id="languages">
                <Input
                  id="languages"
                  value={form.languages}
                  onChange={set("languages")}
                  maxLength={300}
                  placeholder="English, Swahili, German"
                />
              </Field>
              <Field label="Vehicle types (comma separated)" id="vehicle_types">
                <Input
                  id="vehicle_types"
                  value={form.vehicle_types}
                  onChange={set("vehicle_types")}
                  maxLength={300}
                  placeholder="4x4 Land Cruiser, Safari van, Minibus"
                />
              </Field>
              <Field label="Safari specialties (comma separated)" id="safari_specialties">
                <Input
                  id="safari_specialties"
                  value={form.safari_specialties}
                  onChange={set("safari_specialties")}
                  maxLength={300}
                  placeholder="Big Five, Great Migration, Birding"
                />
              </Field>
              <Field label="Tour categories (comma separated)" id="tour_categories">
                <Input
                  id="tour_categories"
                  value={form.tour_categories}
                  onChange={set("tour_categories")}
                  maxLength={300}
                  placeholder="Luxury, Budget camping, Honeymoon, Group tours"
                />
              </Field>
            </div>
          </Section>

          <Button type="submit" className="rounded-xl" disabled={busy}>
            {busy ? "Saving…" : company ? "Save changes" : "Submit for approval"}
          </Button>
        </form>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl bg-card p-6 shadow-soft">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}