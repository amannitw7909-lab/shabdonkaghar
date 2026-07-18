import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPoem, poems, categories, languages } from "@/lib/poems";
import { LikeButton } from "@/components/LikeButton";
import { SITE_AUTHOR } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import Fuse from "fuse.js";
import { useMemo } from "react";

// Search params forwarded from the poems list (the active filter context)
const searchSchema = z.object({
  category: z.string().optional(),
  language: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/poems/$slug")({
  validateSearch: searchSchema,
  loader: ({ params }) => {
    const poem = getPoem(params.slug);
    if (!poem) throw notFound();
    return { poem };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.poem.title} — Shabdon Ka Ghar` },
          {
            name: "description",
            content: loaderData.poem.body.slice(0, 160),
          },
          { property: "og:title", content: loaderData.poem.title },
          {
            property: "og:description",
            content: loaderData.poem.body.slice(0, 160),
          },
        ]
      : [{ title: "Poem not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="serif-title text-4xl">Poem not found</h1>
      <Link to="/poems" className="mt-6 inline-block text-primary">
        ← Back to all poems
      </Link>
    </div>
  ),
  component: PoemDetail,
});

function PoemDetail() {
  const { poem } = Route.useLoaderData();
  const search = Route.useSearch();
  const isDeva = poem.language === "hi";

  // Build the filtered list based on the context passed from the poems index
  const fuse = useMemo(
    () =>
      new Fuse(poems, {
        keys: ["title", "title_en", "body", "tags"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [],
  );

  const filteredPoems = useMemo(() => {
    let list = search.q?.trim()
      ? fuse.search(search.q.trim()).map((r) => r.item)
      : poems;
    if (search.category) list = list.filter((p) => p.category === search.category);
    if (search.language) list = list.filter((p) => p.language === search.language);
    return list;
  }, [search.q, search.category, search.language, fuse]);

  const hasFilter = !!(search.category || search.language || search.q);

  // Compute prev/next within the filtered list (or full list if no filter)
  const activeList = hasFilter ? filteredPoems : poems;
  const index = activeList.findIndex((p) => p.slug === poem.slug);
  const prev = index > 0 ? activeList[index - 1] : undefined;
  const next = index < activeList.length - 1 ? activeList[index + 1] : undefined;

  // Label for the filter back button
  const filterLabel = useMemo(() => {
    if (search.category) {
      const cat = categories.find((c) => c.id === search.category);
      return cat ? cat.label : search.category;
    }
    if (search.language) {
      const lang = languages.find((l) => l.id === search.language);
      return lang ? lang.label : search.language;
    }
    if (search.q) return `"${search.q}"`;
    return null;
  }, [search.category, search.language, search.q]);

  // The search params to restore when going back to filtered list
  const backSearch: Record<string, string> = {};
  if (search.category) backSearch.category = search.category;
  if (search.language) backSearch.language = search.language;
  if (search.q) backSearch.q = search.q;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/poems"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All poems
        </Link>
        {hasFilter && filterLabel && (
          <>
            <span className="text-muted-foreground/40 text-sm">|</span>
            <Link
              to="/poems"
              search={backSearch}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> {filterLabel}
            </Link>
          </>
        )}
      </div>

      <header className="mt-6 sm:mt-8 text-center">
        <p className="text-xs uppercase tracking-widest text-primary">
          {poem.category}
        </p>
        <h1
          className={cn(
            "serif-title text-3xl sm:text-5xl md:text-6xl mt-3 leading-tight break-words",
            isDeva && "deva",
          )}
        >
          {poem.title}
        </h1>
        {poem.title_en && isDeva && (
          <p className="mt-2 text-muted-foreground italic text-sm sm:text-base">{poem.title_en}</p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{poem.date}</p>
      </header>

      <div
        className={cn(
          "poem-body mt-8 sm:mt-12 text-center",
          isDeva ? "deva" : "font-serif",
        )}
      >
        {poem.body}
      </div>

      <p
        className={cn(
          "mt-8 text-center text-primary italic",
          isDeva && "deva not-italic",
        )}
      >
        — {isDeva ? SITE_AUTHOR.nameDeva : SITE_AUTHOR.name}
      </p>


      <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 sm:pt-8">
        <div className="flex flex-wrap gap-2">
          {poem.tags.map((t: string) => (
            <span
              key={t}
              className="text-xs rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
        <LikeButton slug={poem.slug} />
      </div>

      {/* Filter-aware prev / next navigation */}
      <nav className="mt-10 sm:mt-12 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 text-sm">
        {prev ? (
          <Link
            to="/poems/$slug"
            params={{ slug: prev.slug }}
            search={backSearch}
            className="flex-1 rounded-lg border border-border bg-card p-4 hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">← Previous</p>
            <p className={cn("mt-1 serif-title truncate", prev.language === "hi" && "deva")}>
              {prev.title}
            </p>
          </Link>
        ) : (
          <span className="hidden sm:block flex-1" />
        )}
        {next ? (
          <Link
            to="/poems/$slug"
            params={{ slug: next.slug }}
            search={backSearch}
            className="flex-1 rounded-lg border border-border bg-card p-4 sm:text-right hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">Next →</p>
            <p className={cn("mt-1 serif-title truncate", next.language === "hi" && "deva")}>
              {next.title}
            </p>
          </Link>
        ) : (
          <span className="hidden sm:block flex-1" />
        )}
      </nav>
    </article>
  );
}
