import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Plus, CheckCircle, XCircle, Mail, Phone, Globe, ExternalLink, Eye, FileText, Calendar, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/my-trips")({
  component: MyTripsPage,
});

function MyTripsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

  const { data: trips, isLoading, error } = useQuery({
    queryKey: ["my-trips"],
    queryFn: async () => {
      const res = await api.get<any>("/api/trip-requests/mine");
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!user,
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      return await api.patch(`/api/leads/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      setSelectedQuote(null);
      alert("Quote status updated successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to update quote status");
    },
  });

  if (loading || isLoading) {
    return <div className="p-20 text-center text-muted-foreground">Loading your safari trip requests...</div>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-2xl bg-destructive/10 p-8 text-center text-destructive">
        <h2 className="font-semibold text-lg">Failed to load trips</h2>
        <p className="mt-1 text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold">My Trip Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your submitted safaris and view custom quotes from operators.</p>
        </div>
        <Button asChild className="rounded-xl gap-2">
          <Link to="/plan-trip">
            <Plus className="size-4" /> Plan New Trip
          </Link>
        </Button>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold">No trip requests found</h3>
          <p className="mt-2 text-sm text-muted-foreground">You haven't planned any safaris yet. Start your journey today!</p>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/plan-trip">Plan Your First Safari</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8">
          {trips.map((trip: any) => (
            <div key={trip.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              
              {/* Trip Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{trip.destinationName}</h3>
                  <Badge variant="secondary" className="capitalize">{trip.status || "Open"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Submitted on {new Date(trip.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Trip Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-muted/40 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold flex items-center gap-1"><Calendar className="size-3" /> Dates</span>
                  <span className="font-medium">{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Flexible"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold flex items-center gap-1"><Users className="size-3" /> Travelers</span>
                  <span className="font-medium">{trip.adults} Adults, {trip.children || 0} Children</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold flex items-center gap-1"><DollarSign className="size-3" /> Budget</span>
                  <span className="font-medium">
                    {trip.budgetCurrency || "KES"} {Number(trip.budget || trip.budgetUsd || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">Quotes Received</span>
                  <span className="font-medium text-primary">{trip.leadRequests?.length || 0} Quote(s)</span>
                </div>
              </div>

              {/* Quotes Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Operator Quotes & Proposals ({trip.leadRequests?.length || 0})</h4>

                {(!trip.leadRequests || trip.leadRequests.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No quotes received yet. Verified local operators are reviewing your itinerary.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {trip.leadRequests.map((lead: any) => (
                      <div key={lead.id} className="rounded-xl border border-primary/20 bg-background p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div>
                          <h5 className="font-bold text-lg text-primary">{lead.company?.name || "Tour Operator"}</h5>
                          <p className="text-sm font-extrabold text-foreground mt-1">
                            KES {Number(lead.offerAmountKes || 0).toLocaleString()}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant={lead.status === "accepted" ? "default" : lead.status === "declined" ? "destructive" : "outline"} className="capitalize">
                              {lead.status}
                            </Badge>
                            {lead.attachmentUrl && (
                              <span className="text-xs text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                                <FileText className="size-3" /> PDF Attached
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedQuote(lead)} className="rounded-lg gap-1.5 font-semibold">
                            <Eye className="size-4" /> View Full Quote
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- QUOTE DETAILS MODAL / POPUP --- */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl border border-border space-y-6">
            
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedQuote.company?.name || "Tour Operator"}</h3>
                <p className="text-xs text-muted-foreground">Submitted Proposal Details</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-muted-foreground hover:text-foreground text-sm font-bold px-3 py-1 rounded-lg bg-muted">
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
              <div>
                <span className="text-xs text-muted-foreground uppercase block font-semibold">Offer Amount</span>
                <span className="text-2xl font-extrabold text-primary">KES {Number(selectedQuote.offerAmountKes || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block font-semibold">Status</span>
                <span className="capitalize font-semibold text-foreground">{selectedQuote.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">Package Details & Itinerary</h4>
              <div className="rounded-xl border border-border bg-background p-4 text-sm whitespace-pre-line text-foreground/90">
                {selectedQuote.packageDetails}
              </div>
            </div>

            {selectedQuote.message && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Operator Note</h4>
                <p className="text-sm italic text-muted-foreground bg-muted/50 p-3 rounded-xl">{selectedQuote.message}</p>
              </div>
            )}

            {selectedQuote.attachmentUrl && (
              <div className="pt-2">
                <a
                  href={`http://localhost:4000${selectedQuote.attachmentUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors w-full justify-center"
                >
                  📥 Download Official PDF Itinerary / Brochure
                </a>
              </div>
            )}

            {/* Operator Contact info shown if accepted */}
            {selectedQuote.status === "accepted" && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 space-y-2 text-green-800 dark:text-green-300">
                <h4 className="font-semibold text-sm">🎉 Offer Accepted! Operator Contact Details:</h4>
                <div className="text-xs space-y-1">
                  {selectedQuote.company?.phone && <p className="flex items-center gap-2"><Phone className="size-3.5" /> {selectedQuote.company.phone}</p>}
                  {selectedQuote.company?.email && <p className="flex items-center gap-2"><Mail className="size-3.5" /> {selectedQuote.company.email}</p>}
                  {selectedQuote.company?.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="size-3.5" /> 
                      <a href={selectedQuote.company.website} target="_blank" rel="noreferrer" className="underline">{selectedQuote.company.website}</a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
              {selectedQuote.status !== "declined" && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={updateQuoteStatusMutation.isPending}
                  onClick={() => updateQuoteStatusMutation.mutate({ id: selectedQuote.id, status: "declined" })}
                  className="rounded-xl gap-1.5"
                >
                  <XCircle className="size-4" /> Decline Offer
                </Button>
              )}
              {selectedQuote.status !== "accepted" && (
                <Button
                  size="sm"
                  disabled={updateQuoteStatusMutation.isPending}
                  onClick={() => updateQuoteStatusMutation.mutate({ id: selectedQuote.id, status: "accepted" })}
                  className="rounded-xl gap-1.5 font-semibold"
                >
                  <CheckCircle className="size-4" /> Accept Offer
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}