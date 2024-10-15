import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';

installGlobals();

export default defineConfig({
  experimental: {
    renderBuiltUrl(filename) {
      return {
        runtime: `(typeof window !== 'undefined' ? window.PUBLIC_URL : process.env.PUBLIC_URL) + ${JSON.stringify(filename)}`,
      };
    },
  },
  assetsInclude: ['**/*.woff', '**/*.woff2'],
  plugins: [remix({ ignoredRouteFiles: ['**/*.css', '**/*.spec.ts', '**/*.spec.tsx'] }), tsconfigPaths()],
  build: {
    outDir: 'dist', // Ensure this is set to 'dist'
  },
  server: {
    host: true, // allow external connections for testing on mobile devices on the same network
  },
  optimizeDeps: {
    include: ['dayjs', '@remix-run/react', 'clsx', 'react'],
  },
  ssr: {
    noExternal: ["remix-utils"],
  },
});
