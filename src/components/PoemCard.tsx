import { Link } from "@tanstack/react-router";
import type { Poem } from "@/lib/frontmatter";
import { cn } from "@/lib/utils";
import { LikeButton } from "@/components/LikeButton";

interface PoemCardProps {
  poem: Poem;
  /** Search params to forward so the poem detail page knows the filter context */
  poemSearch?: Record<string, string>;
}

export function PoemCard({ poem, poemSearch = {} }: PoemCardProps) {
  const isDeva = poem.language === "hi";
  const preview = poem.body.split("\n").slice(0, 2).join("\n");

  return (
    <div className="rounded-lg border border-border bg-card transition hover:border-primary/40 hover:shadow-sm">
      <Link
        to="/poems/$slug"
        params={{ slug: poem.slug }}
        search={poemSearch}
        className="block p-5 sm:p-6 pb-3"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={cn("serif-title text-xl sm:text-2xl min-w-0 break-words", isDeva && "deva")}>{poem.title}</h3>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground shrink-0">
            {poem.category}
          </span>
        </div>
        {poem.title_en && isDeva && (
          <p className="text-sm text-muted-foreground mt-1">{poem.title_en}</p>
        )}
        <p
          className={cn(
            "mt-3 text-muted-foreground whitespace-pre-line line-clamp-3",
            isDeva && "deva",
          )}
        >
          {preview}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {poem.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </Link>
      {/* Like button lives outside the <Link> so it's a valid button inside a div, not nested in an <a> */}
      <div className="px-5 sm:px-6 pb-4 flex justify-end">
        <LikeButton slug={poem.slug} />
      </div>
    </div>
  );
}
