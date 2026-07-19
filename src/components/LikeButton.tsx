import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getCount, hasLiked, incrementLike } from "@/lib/likes";
import { cn } from "@/lib/utils";

export function LikeButton({ slug, initialCount }: { slug: string; initialCount?: number }) {
  const [count, setCount] = useState<number | null>(initialCount ?? null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(hasLiked(slug));
    // Only fetch if we really need to, or just fetch to sync
    getCount(slug).then((c) => {
      // If we got a 0 but initialCount is higher, it might be a rate limit or uninitialized remote key.
      // Let's prefer the higher count to avoid showing 0.
      if (c === 0 && initialCount && initialCount > 0) {
        setCount(initialCount);
      } else {
        setCount(c);
      }
    });
  }, [slug, initialCount]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigating if wrapped in a link area
    if (liked || busy) return;
    setBusy(true);
    
    // Optimistic UI update
    const prevCount = count ?? 0;
    setCount(prevCount + 1);
    setLiked(true);
    
    try {
      const next = await incrementLike(slug);
      if (next > 0) {
        setCount(next);
      }
    } catch (err) {
      // Revert on failure
      setCount(prevCount);
      setLiked(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={liked || busy}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition",
        liked ? "text-primary" : "hover:border-primary/40 hover:text-primary",
        "disabled:cursor-default",
      )}
      aria-label={liked ? "Liked" : "Like"}
    >
      <Heart
        className={cn("h-4 w-4", liked && "fill-primary")}
        strokeWidth={1.5}
      />
      <span>{count ?? "…"}</span>
    </button>
  );
}
