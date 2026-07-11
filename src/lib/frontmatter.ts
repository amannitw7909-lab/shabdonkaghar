// Minimal YAML frontmatter parser tailored to our poem schema.
// Avoids Buffer polyfills that gray-matter would require in the browser.

export type PoemMeta = {
  title: string;
  title_en?: string;
  language: "hi" | "en";
  category: "ghazal" | "nazm" | "sher" | "poem";
  tags: string[];
  date: string;
  slug: string;
};

export type Poem = PoemMeta & {
  body: string;
};

function parseValue(raw: string): string | string[] {
  const v = raw.trim();
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return v.replace(/^["']|["']$/g, "");
}

export function parseMarkdown(source: string): Poem {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error("Poem file missing frontmatter");
  const [, fm, body] = match;
  const meta: Record<string, string | string[]> = {};
  for (const line of fm.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1);
    if (!key) continue;
    meta[key] = parseValue(value);
  }
  return {
    title: String(meta.title ?? "Untitled"),
    title_en: meta.title_en ? String(meta.title_en) : undefined,
    language: (meta.language as "hi" | "en") ?? "en",
    category: (meta.category as PoemMeta["category"]) ?? "poem",
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    date: String(meta.date ?? ""),
    slug: String(meta.slug ?? ""),
    body: body.trim(),
  };
}

export function serializePoem(poem: Poem): string {
  const fm = [
    `title: ${poem.title}`,
    poem.title_en ? `title_en: ${poem.title_en}` : null,
    `language: ${poem.language}`,
    `category: ${poem.category}`,
    `tags: [${poem.tags.map((t) => t).join(", ")}]`,
    `date: ${poem.date}`,
    `slug: ${poem.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `---\n${fm}\n---\n${poem.body.trim()}\n`;
}
