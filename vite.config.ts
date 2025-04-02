import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import dotenv from "dotenv";

dotenv.config();

installGlobals();

export default defineConfig({
  experimental: {
    renderBuiltUrl(filename) {
      return {
        runtime: `(typeof window !== 'undefined' ? window.PUBLIC_URL : process.env.PUBLIC_URL) + ${JSON.stringify(
          filename
        )}`,
      };
    },
  },
  assetsInclude: ["**/*.woff", "**/*.woff2"],
  plugins: [
    remix({ ignoredRouteFiles: ["**/*.css", "**/*.spec.ts", "**/*.spec.tsx"] }),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      external: [
        "@remix-run/node", // Exclude node modules from client-side bundle
        "stream-slice", // Exclude Node.js stream modules
        "util", // Exclude Node.js util module
      ],
    },
  },
  server: {
    host: true,
  },
  optimizeDeps: {
    include: ["dayjs", "@remix-run/react", "clsx", "react"],
  },
  ssr: {
    noExternal: ["remix-utils"],
  },
});
