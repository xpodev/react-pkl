/**
 * pkl-build CLI
 *
 * Usage:
 *   pkl-build --config ./pkl.config.js
 *   pkl-build --entry ./src/index.ts --out ./dist --id my-plugin --name "My Plugin" --version 1.0.0
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildPlugin } from './build.js';
import type { PluginBuildConfig } from './types.js';

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

async function main(): Promise<void> {
  const configPath = getArg('--config');

  let config: PluginBuildConfig;

  if (configPath) {
    // Load config from file (must export default PluginBuildConfig)
    const resolved = pathToFileURL(path.resolve(configPath)).href;
    const mod = (await import(resolved)) as { default: PluginBuildConfig };
    config = mod.default;
  } else {
    // Build config from CLI flags
    const entry = getArg('--entry');
    const outDir = getArg('--out') ?? './dist';
    const id = getArg('--id');
    const name = getArg('--name');
    const version = getArg('--version') ?? '0.0.0';
    const description = getArg('--description');

    if (!entry) {
      console.error('Error: --entry or --config is required.');
      process.exit(1);
    }
    if (!id || !name) {
      console.error('Error: --id and --name are required when not using --config.');
      process.exit(1);
    }

    config = {
      entry,
      outDir,
      meta: { id, name, version, ...(description ? { description } : {}) },
    };
  }

  console.log(`Building plugin "${config.meta.name}" (${config.meta.id})...`);
  const result = await buildPlugin(config);
  console.log(`Done. Output written to: ${result.outDir}`);
  for (const file of result.outputFiles) {
    console.log(`  ${file}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
