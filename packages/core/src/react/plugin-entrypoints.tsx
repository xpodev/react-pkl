import { Fragment, useEffect } from 'react';
import { useEnabledPlugins, usePluginHost } from './hooks.js';

/**
 * PluginEntrypoints
 * 
 * Renders the entrypoint of all enabled plugins.
 * Each plugin's entrypoint is executed in React context and can render
 * slot items or perform other React-based initialization.
 * 
 * Place this component where you want plugin entrypoints to execute,
 * typically near the top of your app tree after providers.
 * 
 * @example
 * ```tsx
 * <PluginProvider host={host}>
 *   <LayoutProvider>
 *     <HeaderProvider>
 *       <PluginEntrypoints />
 *       <Header />
 *     </HeaderProvider>
 *   </LayoutProvider>
 * </PluginProvider>
 * ```
 */
export function PluginEntrypoints() {
  const plugins = useEnabledPlugins();
  const host = usePluginHost();

  return (
    <>
      {plugins.map((entry) => {
        if (!entry.module.entrypoint) return null;
        
        return (
          <PluginEntrypointRenderer
            key={entry.module.meta.id}
            plugin={entry.module}
            host={host}
          />
        );
      })}
    </>
  );
}

/**
 * Internal component to render a single plugin's entrypoint.
 * Sets the current plugin before rendering.
 */
function PluginEntrypointRenderer({ plugin, host }: { plugin: any; host: any }) {
  useEffect(() => {
    // Set current plugin when this component mounts
    host.setCurrentPlugin(plugin);
    
    return () => {
      // Clear current plugin when unmounting
      if (host.getCurrentPlugin() === plugin) {
        host.setCurrentPlugin(null);
      }
    };
  }, [plugin, host]);

  // Execute the entrypoint
  const content = plugin.entrypoint?.();

  return content ? <Fragment>{content}</Fragment> : null;
}
