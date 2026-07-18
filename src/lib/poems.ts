import { parseMarkdown, type Poem } from "./frontmatter";

// Load all poem markdown files at build time as raw strings.
const modules = import.meta.glob("/content/poems/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const poems: Poem[] = Object.entries(modules)
  .map(([, source]) => parseMarkdown(source))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getPoem(slug: string): Poem | undefined {
  return poems.find((p) => p.slug === slug);
}

export function allTags(): string[] {
  const s = new Set<string>();
  for (const p of poems) p.tags.forEach((t) => s.add(t));
  return Array.from(s).sort();
}

export const categories = [
  { id: "ghazal", label: "Ghazal" },
  { id: "shayari", label: "Shayari" },
  { id: "sher", label: "Sher" },
  { id: "poem", label: "Poem" },
] as const;

export const languages = [
  { id: "hi", label: "हिन्दी" },
  { id: "en", label: "English" },
] as const;
