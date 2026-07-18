import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Build the list of routes to prerender from the markdown files in /content/poems.
// This keeps the static export in sync with actual content.
function poemRoutes(): string[] {
  try {
    const dir = join(process.cwd(), "content", "poems");
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => `/poems/${f.replace(/\.md$/, "")}`);
  } catch {
    return [];
  }
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  // Build a fully static site (no server runtime) for GitHub Pages.
  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ["/", "/poems", "/about", "/admin", "/404", ...poemRoutes()],
    },
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
