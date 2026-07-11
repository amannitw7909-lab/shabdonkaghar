import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  clearConfig,
  deleteFile,
  getConfig,
  putFile,
  saveConfig,
  verifyRepo,
  type GhConfig,
} from "@/lib/github";
import { serializePoem, type Poem } from "@/lib/frontmatter";
import { slugify } from "@/lib/slug";
import { poems } from "@/lib/poems";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Shabdon Ka Ghar" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [cfg, setCfg] = useState<GhConfig | null>(null);
  useEffect(() => setCfg(getConfig()), []);

  if (!cfg) return <TokenSetup onSaved={setCfg} />;
  return <Editor cfg={cfg} onSignOut={() => { clearConfig(); setCfg(null); }} />;
}

function TokenSetup({ onSaved }: { onSaved: (c: GhConfig) => void }) {
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState("main");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const cfg = { token, repo, branch: branch || "main" };
    const check = await verifyRepo(cfg);
    setBusy(false);
    if (!check.ok) {
      toast.error("Could not reach repo. Check the repo path and token permissions.");
      return;
    }
    saveConfig(cfg);
    toast.success("Connected to " + repo);
    onSaved(cfg);
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Toaster />
      <h1 className="serif-title text-3xl">Admin · One-time setup</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste a GitHub fine-grained personal access token with{" "}
        <code className="text-primary">Contents: Read and write</code> access to
        the repo where this site lives. The token stays in your browser only —
        it's never sent anywhere except github.com.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Repository (owner/name)">
          <input
            required
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="yourname/shabdon-ka-ghar"
            className={inputCls}
          />
        </Field>
        <Field label="Branch">
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className={inputCls}
          />
        </Field>
        <Field label="Personal access token">
          <input
            required
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_…"
            className={inputCls}
          />
        </Field>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Checking…" : "Connect"}
        </button>
      </form>
      <p className="mt-6 text-xs text-muted-foreground">
        Create a token at github.com → Settings → Developer settings → Personal
        access tokens → Fine-grained tokens. Scope it to this one repo.
      </p>
    </div>
  );
}

function Editor({ cfg, onSignOut }: { cfg: GhConfig; onSignOut: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  const [category, setCategory] = useState<Poem["category"]>("nazm");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(today);
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const autoSlug = useMemo(() => slugify(titleEn || title), [title, titleEn]);
  const finalSlug = slug || autoSlug;

  function loadPoem(p: Poem) {
    setEditingSlug(p.slug);
    setTitle(p.title);
    setTitleEn(p.title_en ?? "");
    setLanguage(p.language);
    setCategory(p.category);
    setTags(p.tags.join(", "));
    setDate(p.date);
    setSlug(p.slug);
    setBody(p.body);
  }

  function resetForm() {
    setEditingSlug(null);
    setTitle(""); setTitleEn(""); setTags(""); setSlug(""); setBody("");
    setDate(today); setLanguage("hi"); setCategory("nazm");
  }

  async function publish() {
    if (!title.trim() || !body.trim() || !finalSlug) {
      toast.error("Title, slug, and body are required.");
      return;
    }
    setBusy(true);
    try {
      const poem: Poem = {
        title: title.trim(),
        title_en: titleEn.trim() || undefined,
        language,
        category,
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        date,
        slug: finalSlug,
        body: body.trim(),
      };
      const content = serializePoem(poem);
      const oldPath = editingSlug ? `content/poems/${editingSlug}.md` : null;
      const newPath = `content/poems/${finalSlug}.md`;
      await putFile(cfg, newPath, content, `poem: ${editingSlug ? "update" : "add"} "${poem.title}"`);
      if (oldPath && oldPath !== newPath) {
        await deleteFile(cfg, oldPath, `poem: rename ${editingSlug} → ${finalSlug}`);
      }
      toast.success("Published! Site will rebuild in ~1 min.");
      resetForm();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Poem) {
    if (!confirm(`Delete "${p.title}"? This commits a removal to GitHub.`)) return;
    setBusy(true);
    try {
      await deleteFile(cfg, `content/poems/${p.slug}.md`, `poem: delete "${p.title}"`);
      toast.success("Deleted. Rebuild in ~1 min.");
      if (editingSlug === p.slug) resetForm();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Toaster />
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="serif-title text-3xl">Writing desk</h1>
          <p className="text-sm text-muted-foreground">
            Connected to <span className="text-primary">{cfg.repo}</span> · {cfg.branch}
            {editingSlug && <span className="ml-2">· editing {editingSlug}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {editingSlug && (
            <button onClick={resetForm} className="text-sm text-muted-foreground hover:text-primary">
              New poem
            </button>
          )}
          <button onClick={onSignOut} className="text-sm text-muted-foreground hover:text-primary">
            Sign out
          </button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Editor */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Title (English, optional)">
              <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Language">
              <select value={language} onChange={(e) => setLanguage(e.target.value as "hi" | "en")} className={inputCls}>
                <option value="hi">हिन्दी</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="Form">
              <select value={category} onChange={(e) => setCategory(e.target.value as Poem["category"])} className={inputCls}>
                <option value="ghazal">Ghazal</option>
                <option value="nazm">Nazm</option>
                <option value="sher">Sher</option>
                <option value="poem">Poem</option>
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Tags (comma separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="love, monsoon" className={inputCls} />
          </Field>
          <Field label={`Slug (auto: ${autoSlug || "…"})`}>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={autoSlug} className={inputCls} />
          </Field>
          <Field label="Body">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className={cn(inputCls, "font-serif text-lg leading-loose min-h-[400px]", language === "hi" && "deva")}
              placeholder="लिखिए…"
            />
          </Field>
          <div className="flex gap-3">
            <button
              onClick={publish}
              disabled={busy}
              className="rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Publishing…" : editingSlug ? "Update poem" : "Publish poem"}
            </button>
          </div>
        </div>

        {/* Poem list */}
        <aside className="border-l border-border pl-8">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Existing poems
          </h2>
          <ul className="space-y-2">
            {poems.map((p) => (
              <li
                key={p.slug}
                className={cn(
                  "rounded-md border border-border bg-card p-3 text-sm",
                  editingSlug === p.slug && "border-primary/50",
                )}
              >
                <p className={cn("serif-title", p.language === "hi" && "deva")}>
                  {p.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {p.date}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button onClick={() => loadPoem(p)} className="text-primary hover:underline">
                    Edit
                  </button>
                  <button onClick={() => remove(p)} className="text-destructive hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            Changes commit to GitHub immediately. The live site rebuilds via
            GitHub Actions (~1 min).
          </p>
        </aside>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
