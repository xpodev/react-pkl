import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'hello-plugin': 'src/hello-plugin.tsx',
    'user-greeting-plugin': 'src/user-greeting-plugin.tsx',
    'theme-toggle-plugin': 'src/theme-toggle-plugin.tsx',
    'custom-page-plugin': 'src/custom-page-plugin.tsx',
    'dark-theme-plugin': 'src/dark-theme-plugin.tsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@react-pkl/core', '@react-pkl/example-sdk'],
  treeshake: true,
});
