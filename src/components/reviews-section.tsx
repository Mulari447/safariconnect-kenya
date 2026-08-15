import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, ImagePlus, ShieldCheck, ThumbsUp, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StarPicker, StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  destinationReviewsQuery,
  myReviewVotesQuery,
  signPhotoPaths,
  type Review,
} from "@/lib/operator-queries";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(20, { message: "Tell us at least 20 characters" }).max(2000),
});

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function ReviewsSection({ slug, name }: { slug: string; name: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: reviews } = useQuery(destinationReviewsQuery(slug));
  const { data: myVotes } = useQuery({ ...myReviewVotesQuery, enabled: !!user });

  const list = reviews ?? [];
  const average =
    list.length > 0 ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  const vote = useMutation({
    mutationFn: async ({ reviewId, voted }: { reviewId: string; voted: boolean }) => {
      if (!user) throw new Error("Sign in to vote");
      if (voted) {
        const { error } = await supabase
          .from("review_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("review_votes")
          .insert({ review_id: reviewId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reviews", slug] });
      void qc.invalidateQueries({ queryKey: ["my-review-votes"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save your vote"),
  });

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-14" id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">Traveller reviews</p>
          <h2 className="mt-2 text-3xl font-semibold">What travellers say</h2>
        </div>
        {list.length > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-2">
              <StarRating value={average} size="md" />
              <span className="text-lg font-semibold">{average.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {list.length} review{list.length === 1 ? "" : "s"}
            </p>
          </div>
        )}
      </div>

      <ReviewForm slug={slug} name={name} />

      {list.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          No reviews for {name} yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {list.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              voted={(myVotes ?? []).includes(r.id)}
              canVote={!!user}
              onVote={(voted) => vote.mutate({ reviewId: r.id, voted })}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewCard({
  review,
  voted,
  canVote,
  onVote,
}: {
  review: Review;
  voted: boolean;
  canVote: boolean;
  onVote: (voted: boolean) => void;
}) {
  const { data: photoUrls } = useQuery({
    queryKey: ["review-photos", review.id, review.photos],
    queryFn: () => signPhotoPaths(review.photos),
    enabled: review.photos.length > 0,
  });

  return (
    <li className="rounded-2xl bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StarRating value={review.rating} />
            {review.verified_traveler && (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3.5" /> Verified traveller
              </Badge>
            )}
          </div>
          {review.title && <h3 className="mt-2 font-semibold">{review.title}</h3>}
          <p className="mt-1 text-xs text-muted-foreground">
            {review.author_name || "Traveller"} · {new Date(review.created_at).toLocaleDateString()}
          </p>
        </div>
        <ReportDialog reviewId={review.id} />
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{review.body}</p>

      {photoUrls && photoUrls.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {photoUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt={`Photo from ${review.author_name || "a traveller"}'s review`}
              loading="lazy"
              className="size-24 rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          variant={voted ? "secondary" : "ghost"}
          size="sm"
          disabled={!canVote}
          onClick={() => onVote(voted)}
        >
          <ThumbsUp className="size-4" /> Helpful
          {review.helpful_count > 0 ? ` · ${review.helpful_count}` : ""}
        </Button>
        {!canVote && <span className="text-xs text-muted-foreground">Sign in to vote</span>}
      </div>
    </li>
  );
}

function ReportDialog({ reviewId }: { reviewId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Spam or advertising");
  const [details, setDetails] = useState("");

  const report = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to report a review");
      const { error } = await supabase.from("review_reports").insert({
        review_id: reviewId,
        reporter_id: user.id,
        reason,
        details: details.trim() ? details.trim().slice(0, 1000) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setDetails("");
      toast.success("Thanks — our team will review this.");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not send your report"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="size-4" /> Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this review</DialogTitle>
          <DialogDescription>
            Let us know what is wrong and our team will look into it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor={`reason-${reviewId}`}>Reason</Label>
          <select
            id={`reason-${reviewId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option>Spam or advertising</option>
            <option>Offensive language</option>
            <option>Not a real experience</option>
            <option>Private or personal information</option>
            <option>Other</option>
          </select>
          <Label htmlFor={`details-${reviewId}`}>Details (optional)</Label>
          <Textarea
            id={`details-${reviewId}`}
            value={details}
            maxLength={1000}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Anything else we should know?"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => report.mutate()}
            disabled={report.isPending || !user}
            className="rounded-xl"
          >
            Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({ slug, name }: { slug: string; name: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        Sign in to rate {name}, upload photos and vote on reviews.
      </p>
    );
  }

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (next.length >= MAX_PHOTOS) {
        toast.error(`Up to ${MAX_PHOTOS} photos per review`);
        break;
      }
      if (!f.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        continue;
      }
      if (f.size > MAX_PHOTO_BYTES) {
        toast.error(`${f.name} is larger than 5MB`);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ rating, title, body });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Add a rating and a short review");
      return;
    }
    setBusy(true);
    try {
      const paths: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("review-photos").upload(path, file);
        if (error) throw error;
        paths.push(path);
      }
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        destination_slug: slug,
        rating: parsed.data.rating,
        title: parsed.data.title?.trim() ? parsed.data.title.trim() : null,
        body: parsed.data.body,
        photos: paths,
      });
      if (error) throw error;
      setRating(0);
      setTitle("");
      setBody("");
      setFiles([]);
      toast.success("Thanks for your review!");
      void qc.invalidateQueries({ queryKey: ["reviews", slug] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish your review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-soft">
      <div>
        <Label className="mb-2 block">Your rating of {name}</Label>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-title">Headline (optional)</Label>
        <Input
          id="review-title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Unforgettable river crossing"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          value={body}
          maxLength={2000}
          rows={5}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What made the trip special? What should other travellers know?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-photos">Photos (up to {MAX_PHOTOS})</Label>
        <div className="flex flex-wrap items-center gap-2">
          {files.map((f, i) => (
            <span
              key={`${f.name}-${i}`}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs"
            >
              {f.name.slice(0, 22)}
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => document.getElementById("review-photos")?.click()}
          >
            <ImagePlus className="size-4" /> Add photos
          </Button>
          <input
            id="review-photos"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      </div>

      <Button type="submit" className="rounded-xl" disabled={busy}>
        {busy ? "Publishing…" : "Publish review"}
      </Button>
    </form>
  );
}
