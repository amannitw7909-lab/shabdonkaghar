import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shabdon Ka Ghar" },
      { name: "description", content: "About the poet behind Shabdon Ka Ghar." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="serif-title text-4xl">About</h1>
      <div className="prose mt-8 text-lg leading-relaxed text-foreground/90 font-serif space-y-4">
        <p>
          This is a small, slow corner of the internet where I keep my poems and
          shayari. Some are in Hindi, some in English — most were written on
          quiet evenings.
        </p>
        <p>
          There are no accounts here, no ads, no algorithms. Just verses. If
          something moves you, tap the heart — that's the only conversation this
          site knows.
        </p>
        <p className="deva text-primary text-xl">— लिखता रहूँगा।</p>
      </div>
    </div>
  );
}
