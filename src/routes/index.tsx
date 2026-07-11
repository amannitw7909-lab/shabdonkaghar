import { createFileRoute, Link } from "@tanstack/react-router";
import { poems, categories } from "@/lib/poems";
import { PoemCard } from "@/components/PoemCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = poems[0];
  const recent = poems.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-20 text-center">
        <p className="deva text-primary text-sm tracking-widest uppercase">
          शब्दों का घर
        </p>
        <h1 className="serif-title text-5xl md:text-6xl mt-4">
          A quiet corner for
          <br />
          <em className="text-primary">poems & shayari</em>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
          Verses in Hindi and English — written slowly, read slower. Wander through
          ghazals, nazms, shers, and small poems.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/poems"
            className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:opacity-90"
          >
            Read the collection
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Featured
          </p>
          <Link
            to="/poems/$slug"
            params={{ slug: featured.slug }}
            className="block rounded-lg border border-border bg-card p-10 hover:border-primary/40 transition"
          >
            <h2
              className={`serif-title text-4xl ${
                featured.language === "hi" ? "deva" : ""
              }`}
            >
              {featured.title}
            </h2>
            <p
              className={`mt-6 poem-body text-foreground/80 line-clamp-6 ${
                featured.language === "hi" ? "deva" : "font-serif"
              }`}
            >
              {featured.body}
            </p>
            <p className="mt-6 text-sm text-primary">Read the whole poem →</p>
          </Link>
        </section>
      )}

      {/* Categories */}
      <section className="mb-10 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/poems"
            search={{ category: c.id } as never}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:border-primary/40"
          >
            {c.label}
          </Link>
        ))}
      </section>

      {/* Recent */}
      <section className="mb-20">
        <h2 className="serif-title text-2xl mb-6">Latest</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {recent.map((p) => (
            <PoemCard key={p.slug} poem={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
