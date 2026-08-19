import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Calendar, DollarSign, MapPin, Users, Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { openLeadsQuery, myCompanyQuery, type Lead } from "@/lib/operator-queries";

export const Route = createFileRoute("/operator/leads")({
  component: OperatorLeadsPage,
});

function OperatorLeadsPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const { data: company } = useQuery({ ...myCompanyQuery, enabled: !!user });
  const { data: leads, isLoading } = useQuery({ ...openLeadsQuery, enabled: !!company });

  // --- QUOTE & PDF MODAL STATE ---
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [offerAmountKes, setOfferAmountKes] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const sendQuoteMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await api.post("/api/leads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Quote and PDF brochure sent successfully to the traveller!");
      qc.invalidateQueries({ queryKey: ["open-leads"] });
      setSelectedLead(null);
      setOfferAmountKes("");
      setPackageDetails("");
      setMessage("");
      setPdfFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to send quote.");
    },
  });

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const formData = new FormData();
    formData.append("tripRequestId", selectedLead.id);
    formData.append("offerAmountKes", offerAmountKes);
    formData.append("packageDetails", packageDetails);
    if (message) formData.append("message", message);
    if (pdfFile) {
      formData.append("attachment", pdfFile); // Maps directly to multer upload.single('attachment')
    }

    sendQuoteMutation.mutate(formData);
  };

  if (loading || isLoading) {
    return <p className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading open traveller leads...</p>;
  }

  const allLeads = leads ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground gap-1.5">
            <Link to="/operator">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Browse Open Traveller Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review custom trip requests submitted by travellers and submit your pricing with a PDF tour brochure.
          </p>
        </div>
      </div>

      {allLeads.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold">No open leads right now</h3>
          <p className="mt-2 text-sm text-muted-foreground">Check back later when travellers submit new itineraries.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          {allLeads.map((lead) => (
            <div key={lead.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="size-5 text-primary" /> {lead.destination_name}
                  </h3>
                  <span className="text-xs text-muted-foreground">Requested {new Date(lead.created_at).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-muted/40 p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-semibold flex items-center gap-1"><Calendar className="size-3" /> Dates</span>
                    <span className="font-medium">{lead.start_date ? new Date(lead.start_date).toLocaleDateString() : "Flexible"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-semibold flex items-center gap-1"><Users className="size-3" /> Travelers</span>
                    <span className="font-medium">{lead.adults} Adults, {lead.children || 0} Kids</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-semibold flex items-center gap-1"><DollarSign className="size-3" /> Budget</span>
                    <span className="font-medium">{lead.budget_usd ? `USD ${lead.budget_usd.toLocaleString()}` : "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-semibold">Transport</span>
                    <span className="font-medium capitalize">{lead.transport_preference || "Standard"}</span>
                  </div>
                </div>

                {lead.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl italic">
                    "{lead.notes}"
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border/60">
                <Button onClick={() => setSelectedLead(lead)} className="rounded-xl gap-2 font-semibold">
                  Send Quote & PDF Brochure
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- QUOTE & PDF UPLOAD MODAL --- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl border border-border space-y-6">
            
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-bold">Send Quote: {selectedLead.destination_name}</h3>
                <p className="text-xs text-muted-foreground">Provide your pricing, itinerary details, and company PDF brochure.</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground text-sm font-bold px-3 py-1 rounded-lg bg-muted">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <Label htmlFor="amount">Offer Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g. 75000"
                  value={offerAmountKes}
                  onChange={(e) => setOfferAmountKes(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="details">Package Details & Itinerary *</Label>
                <Textarea
                  id="details"
                  rows={4}
                  placeholder="Describe accommodation, game drives, meals, park fees included..."
                  value={packageDetails}
                  onChange={(e) => setPackageDetails(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Personal Note to Traveller (Optional)</Label>
                <Input
                  id="message"
                  placeholder="e.g. We look forward to hosting you on this amazing safari!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* PDF Uploader */}
              <div className="space-y-2">
                <Label>Attach Company PDF / Tour Package Brochure (Optional)</Label>
                
                {!pdfFile ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center hover:bg-muted/50 transition-colors">
                    <Upload className="size-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Click to upload PDF package / brochure</span>
                    <span className="text-xs text-muted-foreground">Maximum file size: 10MB (.pdf)</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPdfFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{pdfFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-xs text-destructive hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedLead(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={sendQuoteMutation.isPending} className="rounded-xl gap-2 font-semibold">
                  {sendQuoteMutation.isPending ? "Sending Quote & PDF..." : "Submit Quote & Brochure"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}