import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { z } from "zod";
import { poems, categories, languages, allTags } from "@/lib/poems";
import { PoemCard } from "@/components/PoemCard";
import { Search } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  tab: z.enum(["all", "starred"]).optional(),
  sort: z.enum(["newest", "oldest", "likes"]).optional(),
  tag: z.string().optional(),
});

export const Route = createFileRoute("/poems/")({
  validateSearch: searchSchema,
  component: PoemsIndex,
});

function PoemsIndex() {
  const initial = Route.useSearch();
  const navigate = useNavigate({ from: "/poems/" });
  const [query, setQuery] = useState(initial.q ?? "");
  const [category, setCategory] = useState<string>(initial.category ?? "");
  const [language, setLanguage] = useState<string>(initial.language ?? "");
  const [tab, setTab] = useState<"all" | "starred">(initial.tab ?? "all");
  const [sort, setSort] = useState<"newest" | "oldest" | "likes">(initial.sort ?? "newest");
  const [tag, setTag] = useState<string>(initial.tag ?? "");

  // Keep URL search params in sync with filter state
  function updateSearch(patch: { q?: string; category?: string; language?: string; tab?: "all" | "starred"; sort?: "newest" | "oldest" | "likes"; tag?: string }) {
    navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        q: ("q" in patch ? patch.q : prev.q) || undefined,
        category: ("category" in patch ? patch.category : prev.category) || undefined,
        language: ("language" in patch ? patch.language : prev.language) || undefined,
        tab: ("tab" in patch ? patch.tab : prev.tab) || undefined,
        sort: ("sort" in patch ? patch.sort : prev.sort) || undefined,
        tag: ("tag" in patch ? patch.tag : prev.tag) || undefined,
      }),
      replace: true,
    });
  }

  const fuse = useMemo(
    () =>
      new Fuse(poems, {
        keys: ["title", "title_en", "body", "tags"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [],
  );

  const results = useMemo(() => {
    let list = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : [...poems];
    if (category) list = list.filter((p) => p.category === category);
    if (language) list = list.filter((p) => p.language === language);
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    
    if (tab === "starred") {
      list = list.filter((p) => p.starred);
    }
    
    if (sort === "likes") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sort === "oldest") {
      list.sort((a, b) => (a.date > b.date ? 1 : -1));
    } else {
      list.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    
    return list;
  }, [query, category, language, tab, sort, tag, fuse]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="serif-title text-3xl sm:text-4xl">All Poems</h1>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground">
        {poems.length} verses · search or filter by mood, language, and form.
      </p>

      {/* Search */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); updateSearch({ q: e.target.value }); }}
            placeholder="Search poems, tags, lines…"
            className="w-full rounded-full border border-input bg-card pl-10 pr-4 py-2.5 text-base sm:text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); updateSearch({ category: e.target.value }); }}
            className="flex-1 sm:flex-none rounded-full border border-input bg-card px-4 py-2.5 text-sm"
          >
            <option value="">All forms</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); updateSearch({ language: e.target.value }); }}
            className="flex-1 sm:flex-none rounded-full border border-input bg-card px-4 py-2.5 text-sm"
          >
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            value={tag}
            onChange={(e) => { setTag(e.target.value); updateSearch({ tag: e.target.value }); }}
            className="flex-1 sm:flex-none rounded-full border border-input bg-card px-4 py-2.5 text-sm"
          >
            <option value="">All tags</option>
            {allTags().map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => { 
              const val = e.target.value as "newest" | "oldest" | "likes";
              setSort(val); 
              updateSearch({ sort: val }); 
            }}
            className="flex-1 sm:flex-none rounded-full border border-input bg-card px-4 py-2.5 text-sm font-medium text-primary"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="likes">Sort: Most Loved</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b border-border">
        {(
          [
            { id: "all", label: "All Poems" },
            { id: "starred", label: "Starred" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              updateSearch({ tab: t.id });
            }}
            className={`pb-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {results.map((p) => {
          // Build the search params to forward into the poem detail URL
          const poemSearch: Record<string, string> = {};
          if (category) poemSearch.category = category;
          if (language) poemSearch.language = language;
          if (query.trim()) poemSearch.q = query.trim();
          if (tab !== "all") poemSearch.tab = tab;
          if (sort !== "newest") poemSearch.sort = sort;
          if (tag) poemSearch.tag = tag;
          return <PoemCard key={p.slug} poem={p} poemSearch={poemSearch} />;
        })}
      </div>
      {results.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">
          No poems match your search.
        </p>
      )}
    </div>
  );
}
