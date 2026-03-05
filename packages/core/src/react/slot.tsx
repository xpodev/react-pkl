import type { ComponentType, ReactNode } from 'react';
import { useSlotComponents } from './hooks.js';

export interface PluginSlotProps {
  /**
   * The slot name. Each plugin module that exports a `components` map with
   * this key will have its component rendered inside the slot.
   */
  name: string;
  /**
   * Props forwarded to every plugin component rendered in this slot.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: Record<string, any>;
  /**
   * Rendered when no plugin provides a component for this slot.
   */
  fallback?: ReactNode;
}

/**
 * PluginSlot
 *
 * Renders all enabled plugin components registered under the given slot name.
 * Place this inside a <PluginProvider> anywhere in your application tree.
 *
 * @example
 * ```tsx
 * <PluginSlot name="toolbar" componentProps={{ compact: true }} />
 * ```
 */
export function PluginSlot({
  name,
  componentProps = {},
  fallback = null,
}: PluginSlotProps): ReactNode {
  const components = useSlotComponents(name);

  if (components.length === 0) return fallback;

  return (
    <>
      {components.map((Component, index) => (
        <SlotEntry
          key={index}
          component={Component}
          props={componentProps}
        />
      ))}
    </>
  );
}

interface SlotEntryProps {
  component: ComponentType<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
}

function SlotEntry({ component: Component, props }: SlotEntryProps): ReactNode {
  return <Component {...props} />;
}
