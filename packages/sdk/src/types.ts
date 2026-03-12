import type { PluginMeta } from '@pkl.js/react';
import type { Format, Plugin as EsbuildPlugin } from 'esbuild';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/**
 * A function that generates metadata for a plugin bundle.
 * Receives the resolved plugin meta and the output directory path.
 * Return `null` or `undefined` to skip metadata generation.
 *
 * @example
 * ```ts
 * const generateMeta: MetadataGenerator = (meta, outDir) => ({
 *   id: meta.id,
 *   version: meta.version,
 *   entryPoint: path.join(outDir, 'index.js'),
 * });
 * ```
 */
export type MetadataGenerator<TMeta = unknown> = (
  meta: PluginMeta,
  outDir: string
) => TMeta | null | undefined | Promise<TMeta | null | undefined>;

// ---------------------------------------------------------------------------
// Build Config
// ---------------------------------------------------------------------------

export interface PluginBuildConfig<TMeta = unknown> {
  /**
   * Path to the plugin's entry point (TypeScript/JavaScript file).
   * @example './src/index.ts'
   */
  entry: string;

  /**
   * Directory to write the bundle output into.
   * @example './dist'
   */
  outDir: string;

  /**
   * Static plugin metadata. Used when the metadata cannot be determined from
   * the entry point at build time.
   */
  meta: PluginMeta;

  /**
   * Output format(s). Defaults to `['esm']`.
   */
  formats?: Format[];

  /**
   * Whether to minify the output. Defaults to `false`.
   */
  minify?: boolean;

  /**
   * Whether to generate source maps. Defaults to `true`.
   */
  sourcemap?: boolean;

  /**
   * External packages that should not be bundled.
   * `react` and `react-dom` are always external.
   */
  external?: string[];

  /**
   * Additional esbuild plugins.
   */
  esbuildPlugins?: EsbuildPlugin[];

  /**
   * Metadata generator. When provided, the result is written to
   * `<outDir>/meta.json`.
   */
  generateMetadata?: MetadataGenerator<TMeta>;

  /**
   * Name of the metadata output file. Defaults to `'meta.json'`.
   */
  metadataFileName?: string;
}

// ---------------------------------------------------------------------------
// Build Result
// ---------------------------------------------------------------------------

export interface PluginBuildResult<TMeta = unknown> {
  /** Resolved output directory */
  outDir: string;
  /** List of files written to outDir */
  outputFiles: string[];
  /** Metadata written to disk (if generateMetadata was provided) */
  metadata?: TMeta;
}
