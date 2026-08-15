import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            i <= Math.round(value)
              ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "size-7",
              i <= value
                ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
