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

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // Ship as a single-page app: emit a static shell + client bundle, then
    // prerender each known route to its own HTML file. No server runtime is
    // needed at deploy time, so this can be hosted on GitHub Pages.
    spa: { enabled: true, maskPath: "/" },
    pages: [
      { path: "/", prerender: { enabled: true } },
      { path: "/poems", prerender: { enabled: true } },
      { path: "/about", prerender: { enabled: true } },
      { path: "/admin", prerender: { enabled: true } },
      ...poemPages(),
    ],
  },
  vite: {
    plugins: [
      {
        name: "fix-ssr-html-input",
        config(config) {
          if (config.build?.ssr && config.build.rollupOptions?.input) {
            const input = config.build.rollupOptions.input;
            if (typeof input === "string" && input.endsWith(".html")) {
              delete config.build.rollupOptions.input;
            } else if (Array.isArray(input)) {
              config.build.rollupOptions.input = input.filter(
                (i) => !i.endsWith(".html")
              );
            } else if (typeof input === "object") {
              for (const key in input) {
                if (input[key].endsWith(".html")) {
                  delete input[key];
                }
              }
            }
          }
        },
      },
    ],
  },
});
