import { type ComponentType } from 'react';
import { usePluginHost } from './hooks.js';

/**
 * Create a layout slot component that can be replaced by theme plugins.
 * 
 * The returned component will automatically check for overrides from the theme plugin
 * and fall back to the default implementation if no override is set.
 * 
 * @param DefaultComponent - The default implementation for this layout slot
 * @returns A component that renders either the override or the default
 * 
 * @example
 * ```tsx
 * const Header = createLayoutSlot(() => {
 *   const { headerItems } = useLayout();
 *   return <header>{headerItems}</header>;
 * });
 * 
 * // In app
 * <Header /> // Renders default or theme override
 * 
 * // In theme plugin
 * export default {
 *   layout(slots) {
 *     slots.set(Header, () => {
 *       const { headerItems } = useLayout();
 *       return <header className="dark">{headerItems}</header>;
 *     });
 *   }
 * }
 * ```
 */
export function createLayoutSlot<TProps = {}>(
  DefaultComponent: ComponentType<TProps>
): ComponentType<TProps> {
  function LayoutSlot(props: TProps) {
    const host = usePluginHost();
    // Use LayoutSlot itself as the key for lookups, not DefaultComponent
    const OverrideComponent = host.getLayoutSlotOverride(LayoutSlot);
    
    const Component = (OverrideComponent as ComponentType<TProps>) || DefaultComponent;
    
    return <Component {...(props as any)} />;
  }

  // Preserve display name for debugging
  LayoutSlot.displayName = `LayoutSlot(${DefaultComponent.displayName || DefaultComponent.name || 'Component'})`;

  return LayoutSlot;
}
