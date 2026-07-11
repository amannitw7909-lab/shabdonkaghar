import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPoem, poems } from "@/lib/poems";
import { LikeButton } from "@/components/LikeButton";
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
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        to="/poems"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All poems
      </Link>

      <header className="mt-8 text-center">
        <p className="text-xs uppercase tracking-widest text-primary">
          {poem.category}
        </p>
        <h1
          className={cn(
            "serif-title text-5xl md:text-6xl mt-3",
            isDeva && "deva",
          )}
        >
          {poem.title}
        </h1>
        {poem.title_en && isDeva && (
          <p className="mt-2 text-muted-foreground italic">{poem.title_en}</p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{poem.date}</p>
      </header>

      <div
        className={cn(
          "poem-body mt-12 text-center",
          isDeva ? "deva" : "font-serif",
        )}
      >
        {poem.body}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
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

      <nav className="mt-12 flex justify-between gap-4 text-sm">
        {prev ? (
          <Link
            to="/poems/$slug"
            params={{ slug: prev.slug }}
            className="flex-1 rounded-lg border border-border bg-card p-4 hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">← Older</p>
            <p className={cn("mt-1 serif-title", prev.language === "hi" && "deva")}>
              {prev.title}
            </p>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            to="/poems/$slug"
            params={{ slug: next.slug }}
            className="flex-1 rounded-lg border border-border bg-card p-4 text-right hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">Newer →</p>
            <p className={cn("mt-1 serif-title", next.language === "hi" && "deva")}>
              {next.title}
            </p>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  );
}
