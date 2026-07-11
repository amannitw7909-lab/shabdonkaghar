
# Poetry & Shayari Site — Plan

## Product shape

Two experiences on one site:

- **Reader view** (public): browse, search, filter, and read poems in Hindi (Devanagari) and English, with a like button.
- **Admin view** at `/admin` (public URL but useless without your GitHub token): a writing form that commits a new poem file straight to your GitHub repo — no backend, no login page.

Design language: **Rekhta-like** — warm cream background, serif display type, category chips (Ghazal, Nazm, Sher, Poem), poem-centric cards, generous whitespace, script-aware typography.

## Tech choices (minimal, GitHub-Pages friendly)

- **Frontend**: keep the existing React + Vite + Tailwind + shadcn stack, but configure Vite to build a **static SPA** (no SSR) so GitHub Pages can serve it. Routing via a lightweight client router (hash or history with a `404.html` fallback for Pages).
- **Content storage**: poems live as **Markdown files with frontmatter** in `/content/poems/*.md` inside the repo. Loaded at build time via Vite's `import.meta.glob` — zero runtime DB, fully version-controlled, diff-able in GitHub.
- **Search**: client-side **Fuse.js** over the pre-built poem index (title, body, tags, language, category). Instant, no backend.
- **Likes**: **Abacus (abacus.jasoncameron.dev)** — a free, no-signup HTTP counter. One namespace per site, one key per poem slug. Also mirror the "already liked" flag in `localStorage` so a visitor can't inflate the count by refresh-spamming (soft guard only).
- **Admin commits to GitHub**: a hidden `/admin` route with a poem editor (title, language, category, tags, body, optional cover). On save, it uses the **GitHub Contents API** (`PUT /repos/:owner/:repo/contents/:path`) with a **fine-grained Personal Access Token** you paste once and that stays only in **your browser's localStorage** — never in the repo, never sent anywhere except github.com. Pushing a commit triggers GitHub Pages to rebuild → poem appears on the live site in ~1 minute.
- **Deploy**: **GitHub Actions** workflow that runs `bun install && bun run build` and deploys `dist/` to the `gh-pages` branch (or Pages "build from Actions"). Custom domain optional.

## Content model (frontmatter)

```yaml
---
title: "शाम की चाय"
title_en: "Evening Tea"        # optional transliteration/translation
language: "hi"                  # "hi" | "en"
category: "nazm"                # ghazal | nazm | sher | poem
tags: ["nostalgia", "monsoon"]
date: "2026-07-11"
slug: "shaam-ki-chai"           # used for URL and like counter key
---
poem body in markdown…
```

## Pages

- `/` — Home: featured poem, latest, category chips, poet intro (about you).
- `/poems` — All poems, filter by language + category, search bar, sort by newest/most-liked.
- `/poems/:slug` — Single poem view: big serif title, script-aware body font, like button with live count, share button, tags, "next / previous poem".
- `/tags/:tag` and `/categories/:category` — filtered lists.
- `/about` — about the poet (you).
- `/admin` — writing dashboard (see below). No auth page; just prompts for a GitHub token on first use.

## Admin experience

- One-time setup screen: paste GitHub PAT (fine-grained, scoped to this repo, `contents: read/write`), stored in `localStorage` only. Clear-token button.
- Editor: title (Hindi/English), language selector, category, tag chips, markdown body with a preview pane using the same reader typography.
- Slug auto-generated from title, editable.
- "Publish" button → builds the frontmatter + markdown → base64-encodes → `PUT` to `content/poems/<slug>.md` with a commit message like `poem: add "<title>"`.
- Also supports **edit** and **delete** for existing poems (fetches file SHA, then updates/deletes via same API).
- Draft mode: save locally in `localStorage` before publishing.

## Typography & design tokens

- Devanagari body: **Noto Serif Devanagari**; English body: **Cormorant Garamond** or **Fraunces**; UI: **Inter**.
- Cream background `#FBF7EF`, ink `#1B1B1B`, accent maroon `#7A1F2B`, muted gold `#B08A3E`.
- Poem card: soft border, serif title, 2-line preview, category chip, like count.
- All colors and fonts wired as semantic tokens in `src/styles.css` (no hardcoded classes in components).
- Loaded via `<link>` tags in the root head (not `@import` in CSS — Tailwind v4 constraint).

## Like counter details

- Namespace: fixed per site (e.g. `poetry-<yourhandle>`).
- Key: poem slug.
- On mount: `GET /hit/<ns>/<slug>` returns current count without incrementing (using `/get/` endpoint).
- On click: `GET /hit/<ns>/<slug>` to increment, then set `liked:<slug>=1` in localStorage and disable the button. Not tamper-proof; acceptable for a personal poetry site.

## Development plan (build order)

1. **Static SPA config**: switch build to client-only React + Vite; add hash-router or history + `404.html`; strip TanStack Start SSR bits.
2. **Design system**: cream/ink/maroon tokens, Devanagari + serif fonts loaded in root head, base typography for `.prose-poem`.
3. **Content pipeline**: `/content/poems/*.md` + a small loader using `import.meta.glob` with `gray-matter` for frontmatter; seed 3 sample poems (2 Hindi, 1 English).
4. **Reader pages**: Home, All Poems (with Fuse.js search + filters), Poem detail with Devanagari-aware rendering.
5. **Like button**: Abacus integration + localStorage guard.
6. **Admin editor**: token setup, form + live preview, GitHub Contents API for create/update/delete, draft autosave.
7. **GitHub Actions deploy**: build + publish to Pages; document repo settings (Pages source = Actions).
8. **Docs**: `README.md` explaining how to create the fine-grained PAT, enable Pages, and add a custom domain.

## Trade-offs you should know

- **Publishing latency**: after you hit "Publish" in admin, GitHub Actions needs ~30–90s to rebuild before the poem is visible on the live site. Acceptable for a poetry site; not real-time.
- **PAT in browser**: convenient but anyone with access to your device/browser profile can post. Use a fine-grained token limited to this one repo and rotate if needed.
- **Likes are soft-secured**: Abacus has no auth, so counts can be manipulated by determined users. Fine for a personal site; if abuse becomes a problem later we can swap in Cloudflare Workers KV without changing the UI.
- **No SSR** means slightly weaker SEO than a prerendered site. If you later want per-poem SEO, we can add a prerender step in the same GitHub Action.

Approve this and I'll switch to build mode and start with the static config + design system + content pipeline.
