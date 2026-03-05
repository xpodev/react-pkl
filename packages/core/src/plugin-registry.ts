import type {
  PluginEntry,
  PluginEvent,
  PluginEventListener,
  PluginModule,
  PluginStatus,
} from './types.js';

/**
 * PluginRegistry
 *
 * Low-level store that tracks all registered plugin entries.
 * Both PluginManager and PluginClient delegate to this.
 */
export class PluginRegistry<TContext = unknown> {
  private readonly _entries = new Map<string, PluginEntry<TContext>>();
  private readonly _listeners = new Set<PluginEventListener>();

  // -------------------------------------------------------------------------
  // Read
  // -------------------------------------------------------------------------

  has(id: string): boolean {
    return this._entries.has(id);
  }

  get(id: string): PluginEntry<TContext> | undefined {
    return this._entries.get(id);
  }

  getAll(): ReadonlyArray<PluginEntry<TContext>> {
    return Array.from(this._entries.values());
  }

  getEnabled(): ReadonlyArray<PluginEntry<TContext>> {
    return this.getAll().filter((e) => e.status === 'enabled');
  }

  // -------------------------------------------------------------------------
  // Write
  // -------------------------------------------------------------------------

  add(module: PluginModule<TContext>, status: PluginStatus = 'enabled'): void {
    if (this._entries.has(module.meta.id)) {
      throw new Error(
        `Plugin with id "${module.meta.id}" is already registered.`
      );
    }
    this._entries.set(module.meta.id, { module, status });
    this._emit({ type: 'added', pluginId: module.meta.id });
  }

  remove(id: string): void {
    if (!this._entries.has(id)) return;
    this._entries.delete(id);
    this._emit({ type: 'removed', pluginId: id });
  }

  setStatus(id: string, status: PluginStatus): void {
    const entry = this._entries.get(id);
    if (!entry) throw new Error(`Plugin "${id}" not found.`);
    if (entry.status === status) return;
    entry.status = status;
    this._emit({ type: status === 'enabled' ? 'enabled' : 'disabled', pluginId: id });
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  subscribe(listener: PluginEventListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _emit(event: PluginEvent): void {
    for (const listener of this._listeners) {
      listener(event);
    }
  }
}
