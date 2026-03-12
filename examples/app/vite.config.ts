import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Helper: resolve a path relative to this config file.
function pkgSrc(pkg: string, file = 'index.ts') {
  return fileURLToPath(new URL(`../../packages/${pkg}/src/${file}`, import.meta.url));
}

function exampleSrc(pkg: string, file = 'index.ts') {
  return fileURLToPath(new URL(`../${pkg}/src/${file}`, import.meta.url));
}

export default defineConfig({
  plugins: [react()],

  resolve: {
    // One copy of React across all workspace packages.
    dedupe: ['react', 'react-dom'],

    // Point every workspace package import at its TypeScript source.
    // This means:
    //   1. No need to build packages before running the dev server.
    //   2. All context singletons (React.createContext) are created once,
    //      so useAppContext() always finds the value provided by
    //      AppPluginProvider – the duplicate-module / blank-page problem
    //      goes away.
    // NOTE: more-specific subpath aliases must come before the package root.
    alias: [
      { find: '@pkl.js/react/react',    replacement: pkgSrc('core', 'react/index.ts') },
      { find: '@pkl.js/react',          replacement: pkgSrc('core') },
      { find: 'example-sdk/react',        replacement: exampleSrc('sdk', 'react/index.ts') },
      { find: 'example-sdk',              replacement: exampleSrc('sdk') },
      { find: 'example-plugins',          replacement: exampleSrc('plugins') },
    ],
  },

  server: {
    fs: {
      // Serve files from anywhere in the monorepo (workspace symlinks go
      // two levels above packages/example-app).
      allow: ['../..'],
    },
  },
});

