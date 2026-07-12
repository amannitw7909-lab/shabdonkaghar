import { Link } from "@tanstack/react-router";
import type { Poem } from "@/lib/frontmatter";
import { cn } from "@/lib/utils";

export function PoemCard({ poem }: { poem: Poem }) {
  const isDeva = poem.language === "hi";
  const preview = poem.body.split("\n").slice(0, 2).join("\n");
  return (
    <Link
      to="/poems/$slug"
      params={{ slug: poem.slug }}
      className="block rounded-lg border border-border bg-card p-5 sm:p-6 transition hover:border-primary/40 hover:shadow-sm"
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
      <div className="mt-4 flex flex-wrap gap-2">
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
  );
}
