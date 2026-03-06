import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useId,
  type ReactNode,
} from 'react';
import type { LayoutController } from './layout-context.js';

interface SlotItem {
  id: string;
  content: ReactNode;
}

interface SlotContextValue {
  addItem: (content: ReactNode) => () => void;
}

/**
 * Result of creating a slot.
 */
export interface SlotResult {
  /** Provider component to wrap the part of app where this slot is used */
  Provider: (props: { children: ReactNode }) => ReactNode;
  
  /** Item component for plugins to register content */
  Item: (props: { children: ReactNode }) => null;
}

/**
 * Create a regular slot that can contain multiple plugin items.
 * Items are managed in a list and synced to the global layout.
 * 
 * @param layoutKey - The key in the layout object where items will be stored
 * @param useLayoutController - Hook to get the layout controller
 * 
 * @example
 * ```tsx
 * const { Provider: HeaderProvider, Item: HeaderItem } = 
 *   createSlot('headerItems', useLayoutController);
 * 
 * // In app
 * <HeaderProvider>
 *   <Header />
 * </HeaderProvider>
 * 
 * // In plugin
 * <HeaderItem>
 *   <MyButton />
 * </HeaderItem>
 * ```
 */
export function createSlot<TLayout extends Record<string, any>, K extends keyof TLayout>(
  layoutKey: K,
  useLayoutController: () => LayoutController<TLayout>
): SlotResult {
  const SlotContext = createContext<SlotContextValue | null>(null);

  function Provider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<SlotItem[]>([]);
    const controller = useLayoutController();

    // Sync items to global layout whenever they change
    useEffect(() => {
      const itemContents = items.map(item => item.content);
      controller.updateSlot(layoutKey, itemContents as TLayout[K]);
    }, [items, controller]);

    const addItem = useCallback((content: ReactNode): (() => void) => {
      const itemId = Math.random().toString(36).slice(2);
      
      setItems(prev => [...prev, { id: itemId, content }]);

      // Return cleanup function
      return () => {
        setItems(prev => prev.filter(item => item.id !== itemId));
      };
    }, []);

    const contextValue = useMemo(() => ({ addItem }), [addItem]);

    return (
      <SlotContext.Provider value={contextValue}>
        {children}
      </SlotContext.Provider>
    );
  }

  function Item({ children }: { children: ReactNode }) {
    const context = useContext(SlotContext);
    
    if (!context) {
      throw new Error('Slot Item must be used within its Provider');
    }

    useEffect(() => {
      const cleanup = context.addItem(children);
      return cleanup;
    }, [children, context]);

    return null;
  }

  return {
    Provider,
    Item,
  };
}
