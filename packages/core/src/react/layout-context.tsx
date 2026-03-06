import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * Controller for updating layout state.
 * Provided separately to avoid exposing the entire state setter.
 */
export interface LayoutController<TLayout> {
  /**
   * Update a specific slot's data in the layout.
   */
  updateSlot<K extends keyof TLayout>(key: K, value: TLayout[K]): void;

  /**
   * Update multiple slots at once.
   */
  updateLayout(updates: Partial<TLayout>): void;
}

/**
 * Result of creating a layout context.
 */
export interface LayoutContextResult<TLayout> {
  /** Provider component to wrap the app */
  LayoutProvider: (props: { children: ReactNode; initialLayout?: Partial<TLayout> }) => ReactNode;
  
  /** Hook to read layout state */
  useLayout: () => TLayout;
  
  /** Hook to get layout controller for updates */
  useLayoutController: () => LayoutController<TLayout>;
}

/**
 * Create a global layout context for the application.
 * 
 * @example
 * ```tsx
 * interface MyLayout {
 *   headerItems: ReactNode[];
 *   sidebarItems: ReactNode[];
 *   theme: 'light' | 'dark';
 * }
 * 
 * const { LayoutProvider, useLayout, useLayoutController } = 
 *   createLayoutContext<MyLayout>();
 * 
 * // In app
 * <LayoutProvider initialLayout={{ theme: 'light', headerItems: [], sidebarItems: [] }}>
 *   <App />
 * </LayoutProvider>
 * 
 * // In components
 * const { headerItems, theme } = useLayout();
 * const { updateSlot } = useLayoutController();
 * ```
 */
export function createLayoutContext<TLayout extends Record<string, any>>(): LayoutContextResult<TLayout> {
  const LayoutContext = createContext<TLayout | null>(null);
  const LayoutControllerContext = createContext<LayoutController<TLayout> | null>(null);

  function LayoutProvider({ 
    children, 
    initialLayout 
  }: { 
    children: ReactNode; 
    initialLayout?: Partial<TLayout> 
  }) {
    const [layout, setLayout] = useState<TLayout>(initialLayout as TLayout);

    const updateSlot = useCallback(<K extends keyof TLayout>(key: K, value: TLayout[K]) => {
      setLayout(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateLayout = useCallback((updates: Partial<TLayout>) => {
      setLayout(prev => ({ ...prev, ...updates }));
    }, []);

    const controller: LayoutController<TLayout> = useMemo(() => ({
      updateSlot,
      updateLayout,
    }), [updateSlot, updateLayout]);

    return (
      <LayoutContext.Provider value={layout}>
        <LayoutControllerContext.Provider value={controller}>
          {children}
        </LayoutControllerContext.Provider>
      </LayoutContext.Provider>
    );
  }

  function useLayout(): TLayout {
    const layout = useContext(LayoutContext);
    if (!layout) {
      throw new Error('useLayout must be used within LayoutProvider');
    }
    return layout;
  }

  function useLayoutController(): LayoutController<TLayout> {
    const controller = useContext(LayoutControllerContext);
    if (!controller) {
      throw new Error('useLayoutController must be used within LayoutProvider');
    }
    return controller;
  }

  return {
    LayoutProvider,
    useLayout,
    useLayoutController,
  };
}
