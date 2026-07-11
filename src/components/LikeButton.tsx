import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getCount, hasLiked, incrementLike } from "@/lib/likes";
import { cn } from "@/lib/utils";

export function LikeButton({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(hasLiked(slug));
    getCount(slug).then(setCount);
  }, [slug]);

  async function onClick() {
    if (liked || busy) return;
    setBusy(true);
    try {
      const next = await incrementLike(slug);
      setCount(next);
      setLiked(true);
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
