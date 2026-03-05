# @react-pkl/sdk

Build tools for creating React PKL plugins.

## Installation

```bash
npm install --save-dev @react-pkl/sdk
```

## Usage

### Basic Build

```typescript
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'com.example.plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A sample plugin',
  },
});
```

This will:
1. Bundle your plugin with esbuild
2. Handle React/JSX transformation
3. External React and React DOM
4. Generate sourcemaps
5. Output to `dist/index.js`

### Advanced Configuration

```typescript
await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'com.example.plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  
  // Output formats
  formats: ['esm', 'cjs'],
  
  // Minification
  minify: true,
  
  // Sourcemaps
  sourcemap: true,
  
  // Additional external dependencies
  external: ['lodash', 'axios'],
  
  // Custom esbuild plugins
  esbuildPlugins: [
    myCustomPlugin(),
  ],
  
  // Generate custom metadata
  generateMetadata: async (meta, outDir) => {
    const stats = await fs.stat(path.join(outDir, 'index.js'));
    return {
      ...meta,
      buildTime: new Date().toISOString(),
      size: stats.size,
      hash: await computeHash(outDir),
    };
  },
  
  // Metadata filename
  metadataFileName: 'plugin.json',
});
```

## API

### `buildPlugin(config: PluginBuildConfig): Promise<PluginBuildResult>`

Bundle a plugin with esbuild.

#### Config Options

```typescript
interface PluginBuildConfig<TMeta = unknown> {
  // Required
  entry: string;              // Entry point path
  outDir: string;             // Output directory
  meta: TMeta;                // Plugin metadata

  // Optional
  formats?: Array<'esm' | 'cjs'>;  // Output formats (default: ['esm'])
  minify?: boolean;                 // Minify output (default: false)
  sourcemap?: boolean;              // Generate sourcemaps (default: true)
  external?: string[];              // External dependencies
  esbuildPlugins?: Plugin[];        // Custom esbuild plugins
  generateMetadata?: MetadataGenerator<TMeta>;
  metadataFileName?: string;        // Default: 'meta.json'
}
```

#### Result

```typescript
interface PluginBuildResult<TMeta = unknown> {
  outDir: string;           // Resolved output directory
  outputFiles: string[];    // Generated file paths
  metadata?: TMeta;         // Generated metadata (if provided)
}
```

## Examples

### NPM Script

```json
{
  "scripts": {
    "build": "node build.js"
  }
}
```

```javascript
// build.js
import { buildPlugin } from '@react-pkl/sdk';

await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: process.env.npm_package_version,
  },
  minify: process.env.NODE_ENV === 'production',
});

console.log('✅ Build complete!');
```

### With CSS

```typescript
// Your plugin imports CSS
import './styles.css';

// esbuild will bundle it automatically
await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: { /* ... */ },
});
```

### Multiple Formats

```typescript
await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: { /* ... */ },
  formats: ['esm', 'cjs'],
  // Generates: dist/index.esm.js and dist/index.cjs.js
});
```

### Custom Metadata

```typescript
await buildPlugin({
  entry: './src/index.tsx',
  outDir: './dist',
  meta: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  },
  generateMetadata: async (meta, outDir) => {
    const pkg = await readFile('./package.json', 'utf-8');
    const { dependencies } = JSON.parse(pkg);
    
    return {
      ...meta,
      buildTime: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dependencies,
    };
  },
});
// Writes: dist/meta.json
```

## Features

- ✅ Fast builds with esbuild
- ✅ Automatic React/JSX transformation
- ✅ CSS bundling and imports
- ✅ Multiple output formats (ESM, CJS)
- ✅ Sourcemap generation
- ✅ Minification
- ✅ Custom metadata generation
- ✅ External dependency handling
- ✅ Custom esbuild plugin support

## Integration

### With tsup

If you prefer tsup for bundling:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  outDir: 'dist',
});
```

### With Vite

For development with Vite:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.tsx',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
```

## Documentation

- [Getting Started Guide](../../docs/GETTING_STARTED.md)
- [API Reference](../../docs/API.md)
- [Examples](../../examples/plugins/)

## License

[Insert license]
