# Shabdon Ka Ghar — Poems & Shayari

A quiet, database-free home for your poems. Fully static, deployed to GitHub Pages.

## How it works

- **Poems** live as Markdown files in `content/poems/*.md` (frontmatter for title, language, category, tags, date, slug — body below).
- **Reader site** is generated at build time from those files: home, all-poems (with search + filters), and one page per poem.
- **Likes** are counted globally by [Abacus](https://abacus.jasoncameron.dev) — a free no-signup HTTP counter. A localStorage flag prevents the same browser from spamming the button.
- **Admin** at `/admin` is a writing UI. On first use it asks for a GitHub fine-grained Personal Access Token. That token is stored **only in your browser's localStorage** — never in the repo, never sent anywhere except `api.github.com`. Clicking "Publish" commits a new `content/poems/<slug>.md` file directly to your repo, which triggers the GitHub Actions workflow to rebuild the site (~1 min).

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes.

## Create the admin token

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → pick this repo.
3. Repository permissions → **Contents: Read and write**.
4. Copy the `github_pat_…` token.
5. Visit `/admin` on your published site, paste `owner/repo` + branch (`main`) + the token. That's it.

## Add a poem manually

Drop a file at `content/poems/my-poem.md`:

```md
---
title: शीर्षक
title_en: Optional English title
language: hi     # or "en"
category: nazm   # ghazal | nazm | sher | poem
tags: [nostalgia, monsoon]
date: 2026-07-11
slug: my-poem
---
पहली पंक्ति
दूसरी पंक्ति…
```

Commit and push — GitHub Actions rebuilds and publishes.

## Local development

```
bun install
bun run dev
```
