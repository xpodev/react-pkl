import { PluginRegistry } from './plugin-registry.js';
import type {
  PluginEntry,
  PluginEventListener,
  PluginModule,
  RemotePluginDescriptor,
} from './types.js';

export interface PluginClientOptions<TContext = unknown> {
  /**
   * URL of the remote manifest endpoint.
   * The endpoint must return `RemotePluginDescriptor[]` as JSON.
   */
  manifestUrl: string;

  /**
   * Host context passed to each plugin's `activate` hook after loading.
   */
  context?: TContext;

  /**
   * Custom fetch implementation (defaults to `globalThis.fetch`).
   */
  fetch?: typeof fetch;
}

/**
 * PluginClient – Client Mode
 *
 * Fetches a plugin manifest from a remote URL, dynamically imports each
 * plugin bundle, and registers the modules into the registry.
 *
 * In client mode, plugins cannot be added or removed locally – that must
 * be done on the server side.
 */
export class PluginClient<TContext = unknown> {
  private readonly _registry: PluginRegistry<TContext>;
  private readonly _options: PluginClientOptions<TContext>;
  private readonly _fetch: typeof fetch;

  constructor(options: PluginClientOptions<TContext>, registry?: PluginRegistry<TContext>) {
    this._options = options;
    this._registry = registry ?? new PluginRegistry<TContext>();
    this._fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  // -------------------------------------------------------------------------
  // Sync
  // -------------------------------------------------------------------------

  /**
   * Fetch the manifest and load all plugins.
   * Replaces any previously loaded plugins.
   */
  async sync(): Promise<void> {
    const descriptors = await this._fetchManifest();
    const modules = await Promise.all(
      descriptors.map((d) => this._loadDescriptor(d))
    );

    for (const module of modules) {
      if (!this._registry.has(module.meta.id)) {
        this._registry.add(module, 'enabled');
        if (this._options.context !== undefined) {
          await module.activate?.(this._options.context);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Read
  // -------------------------------------------------------------------------

  getAll(): ReadonlyArray<PluginEntry<TContext>> {
    return this._registry.getAll();
  }

  getEnabled(): ReadonlyArray<PluginEntry<TContext>> {
    return this._registry.getEnabled();
  }

  subscribe(listener: PluginEventListener): () => void {
    return this._registry.subscribe(listener);
  }

  /** Expose the underlying registry for React integration. */
  get registry(): PluginRegistry<TContext> {
    return this._registry;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private async _fetchManifest(): Promise<RemotePluginDescriptor[]> {
    const res = await this._fetch(this._options.manifestUrl);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch plugin manifest from "${this._options.manifestUrl}": ${res.status} ${res.statusText}`
      );
    }
    return res.json() as Promise<RemotePluginDescriptor[]>;
  }

  private async _loadDescriptor(
    descriptor: RemotePluginDescriptor
  ): Promise<PluginModule<TContext>> {
    // Dynamic import of the remote bundle URL
    const mod = await import(/* @vite-ignore */ descriptor.url) as { default?: PluginModule<TContext> } & PluginModule<TContext>;
    const pluginModule: PluginModule<TContext> = mod.default ?? mod;

    // Verify the module has at least the expected meta
    if (!pluginModule.meta) {
      // Fall back to the descriptor's meta if the bundle doesn't export it
      return { ...pluginModule, meta: descriptor.meta };
    }
    return pluginModule;
  }
}
