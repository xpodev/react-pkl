import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    platform: 'node',
    external: ['esbuild'],
  },
  {
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    platform: 'node',
    external: ['esbuild'],
    banner: { js: '#!/usr/bin/env node' },
  },
]);
