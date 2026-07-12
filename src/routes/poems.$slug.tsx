import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPoem, poems } from "@/lib/poems";
import { LikeButton } from "@/components/LikeButton";
import { SITE_AUTHOR } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";


export const Route = createFileRoute("/poems/$slug")({
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
  const isDeva = poem.language === "hi";

  const index = poems.findIndex((p) => p.slug === poem.slug);
  const prev = poems[index + 1];
  const next = poems[index - 1];

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/poems"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All poems
      </Link>

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

      <nav className="mt-10 sm:mt-12 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 text-sm">
        {prev ? (
          <Link
            to="/poems/$slug"
            params={{ slug: prev.slug }}
            className="flex-1 rounded-lg border border-border bg-card p-4 hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">← Older</p>
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
            className="flex-1 rounded-lg border border-border bg-card p-4 sm:text-right hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">Newer →</p>
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
