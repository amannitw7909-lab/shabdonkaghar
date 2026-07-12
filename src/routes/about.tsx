import { createFileRoute } from "@tanstack/react-router";
import { SITE_AUTHOR } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About ${SITE_AUTHOR.name} — Shabdon Ka Ghar` },
      {
        name: "description",
        content: `About ${SITE_AUTHOR.name}, the poet behind Shabdon Ka Ghar.`,
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
      <p className="text-xs uppercase tracking-widest text-primary">The poet</p>
      <h1 className="serif-title text-4xl sm:text-5xl mt-2 leading-tight">
        {SITE_AUTHOR.name}
        <span className="deva text-2xl sm:text-3xl text-muted-foreground ml-3">
          · {SITE_AUTHOR.nameDeva}
        </span>
      </h1>
      <div className="prose mt-6 sm:mt-8 text-base sm:text-lg leading-relaxed text-foreground/90 font-serif space-y-4">
        <p>
          Hi, I'm {SITE_AUTHOR.name}. This is a small, slow corner of the
          internet where I keep my poems and shayari. Some are in Hindi, some in
          English — most were written on quiet evenings, when a thought refused
          to leave without becoming a verse.
        </p>
        <p>
          There are no accounts here, no ads, no algorithms. Just verses. If
          something moves you, tap the heart — that's the only conversation
          this site knows.
        </p>
        <p className="deva text-primary text-xl">— लिखता रहूँगा।</p>
      </div>
    </div>
  );
}
