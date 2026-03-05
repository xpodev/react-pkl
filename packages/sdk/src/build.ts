import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build as esbuild } from 'esbuild';
import type { PluginBuildConfig, PluginBuildResult } from './types.js';

/**
 * buildPlugin
 *
 * Bundles a plugin's source into a self-contained directory.
 *
 * Steps:
 * 1. Compile & bundle to JS (ESM by default) using esbuild.
 * 2. Copy / inline CSS if the plugin imports it (handled by esbuild).
 * 3. Optionally generate metadata via the user-supplied `generateMetadata` fn.
 *
 * @example
 * ```ts
 * await buildPlugin({
 *   entry: './src/index.ts',
 *   outDir: './dist',
 *   meta: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
 * });
 * ```
 */
export async function buildPlugin<TMeta = unknown>(
  config: PluginBuildConfig<TMeta>
): Promise<PluginBuildResult<TMeta>> {
  const {
    entry,
    outDir,
    meta,
    formats = ['esm'],
    minify = false,
    sourcemap = true,
    external = [],
    esbuildPlugins = [],
    generateMetadata,
    metadataFileName = 'meta.json',
  } = config;

  const resolvedOutDir = path.resolve(outDir);
  await mkdir(resolvedOutDir, { recursive: true });

  const outputFiles: string[] = [];

  // -------------------------------------------------------------------------
  // Bundle each requested format
  // -------------------------------------------------------------------------
  for (const format of formats) {
    const outfile = path.join(
      resolvedOutDir,
      formats.length > 1 ? `index.${format}.js` : 'index.js'
    );

    const result = await esbuild({
      entryPoints: [path.resolve(entry)],
      outfile,
      bundle: true,
      format,
      platform: 'browser',
      jsx: 'automatic',
      minify,
      sourcemap,
      external: ['react', 'react-dom', ...external],
      plugins: esbuildPlugins,
      metafile: false,
    });

    // esbuild writes the file; track it
    outputFiles.push(outfile);

    if (sourcemap) {
      outputFiles.push(`${outfile}.map`);
    }

    if (result.errors.length > 0) {
      const messages = result.errors.map((e) => e.text).join('\n');
      throw new Error(`Plugin build failed:\n${messages}`);
    }
  }

  // -------------------------------------------------------------------------
  // Metadata
  // -------------------------------------------------------------------------
  let metadata: TMeta | undefined;

  if (generateMetadata) {
    const generated = await generateMetadata(meta, resolvedOutDir);
    if (generated != null) {
      metadata = generated;
      const metaPath = path.join(resolvedOutDir, metadataFileName);
      await writeFile(metaPath, JSON.stringify(generated, null, 2), 'utf-8');
      outputFiles.push(metaPath);
    }
  }

  // Only include metadata if it was generated (exactOptionalPropertyTypes compliance)
  return metadata !== undefined
    ? { outDir: resolvedOutDir, outputFiles, metadata }
    : { outDir: resolvedOutDir, outputFiles };
}
