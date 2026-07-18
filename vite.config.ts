import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
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
