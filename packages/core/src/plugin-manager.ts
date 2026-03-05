import { PluginRegistry } from './plugin-registry.js';
import { ResourceTracker } from './resource-tracker.js';
import type {
  PluginEntry,
  PluginEventListener,
  PluginLoader,
  PluginModule,
} from './types.js';

/**
 * PluginManager – Standalone Mode
 *
 * Responsible for adding, removing, enabling, and disabling plugins at
 * runtime. Plugin loaders may be synchronous objects or async factories.
 */
export class PluginManager<TContext = unknown> {
  private readonly _registry: PluginRegistry<TContext>;
  private readonly _resources: ResourceTracker;
  private _context: TContext | undefined;

  constructor(context?: TContext) {
    this._registry = new PluginRegistry<TContext>();
    this._resources = new ResourceTracker();
    if (context) {
      this._context = context;
      // Inject resource tracker into context
      (context as any)._resources = this._resources;
    }
  }

  // -------------------------------------------------------------------------
  // Context
  // -------------------------------------------------------------------------

  /**
   * Set the host context that will be passed to plugin `activate` hooks.
   * Can be called before or after plugins are added.
   */
  setContext(context: TContext): void {
    this._context = context;
    // Inject resource tracker into context
    (context as any)._resources = this._resources;
  }

  /**
   * Get the resource tracker for accessing plugin resources.
   */
  get resources(): ResourceTracker {
    return this._resources;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Register a plugin module and optionally enable it immediately.
   */
  async add(
    loader: PluginLoader<TContext>,
    options?: { enabled?: boolean }
  ): Promise<void> {
    const module = await this._resolve(loader);
    const status = options?.enabled ? 'enabled' : 'disabled';
    this._registry.add(module, status);
    if (options?.enabled) {
      await this.enable(module.meta.id);
    }
  }

  /**
   * Enable a plugin (calls `activate` with context).
   */
  async enable(id: string): Promise<void> {
    const entry = this._registry.get(id);
    if (!entry) throw new Error(`Plugin "${id}" not found.`);
    this._registry.setStatus(id, 'enabled');
    if (entry.module.activate && this._context) {
      // Set current plugin ID for resource tracking
      (this._context as any)._currentPluginId = id;
      await entry.module.activate(this._context);
      // Clean up the plugin ID after activation
      delete (this._context as any)._currentPluginId;
    }
  }

  /**
   * Disable a plugin (calls `deactivate`) without removing it.
   */
  async disable(id: string): Promise<void> {
    const entry = this._registry.get(id);
    if (!entry) throw new Error(`Plugin "${id}" not found.`);
    
    // Clean up resources first
    this._resources.cleanup(id);
    
    // Then deactivate
    await entry.module.deactivate?.();
    this._registry.setStatus(id, 'disabled');
  }

  /**
   * Deactivate the plugin and remove it from the registry.
   */
  async remove(id: string): Promise<void> {
    const entry = this._registry.get(id);
    if (!entry) return;
    
    // Clean up resources first
    this._resources.cleanup(id);
    
    // Then deactivate and remove
    await entry.module.deactivate?.();
    this._registry.remove(id);
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

  private async _resolve(
    loader: PluginLoader<TContext>
  ): Promise<PluginModule<TContext>> {
    if (typeof loader === 'function') {
      return loader();
    }
    return loader;
  }
}
