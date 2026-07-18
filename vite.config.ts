// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Build the list of poem routes from the markdown files in /content/poems so
// each poem detail page gets prerendered to HTML for GitHub Pages.
function poemPages() {
  try {
    const dir = join(process.cwd(), "content", "poems");
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({ path: `/poems/${f.replace(/\.md$/, "")}`, prerender: { enabled: true } }));
  } catch {
    return [];
  }
}

// The GitHub Pages deployment lives at /shabdonkaghar/ — set the Vite base so
// all asset URLs are emitted with this prefix instead of root /.
const BASE = "/shabdonkaghar/";

export default defineConfig({
  // Disable nitro so TanStack Start's SPA prerender pipeline owns the build
  // and emits plain static HTML/JS/CSS into dist/ — deployable to GitHub Pages.
  nitro: false,
  vite: {
    base: BASE,
  },
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true, maskPath: "/" },
    pages: [
      { path: "/", prerender: { enabled: true } },
      { path: "/poems", prerender: { enabled: true } },
      { path: "/about", prerender: { enabled: true } },
      { path: "/admin", prerender: { enabled: true } },
      ...poemPages(),
    ],
  },
});
