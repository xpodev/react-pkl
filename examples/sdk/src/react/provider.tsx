import { PluginProvider, type PluginProviderProps } from '@react-pkl/core/react';

/**
 * AppPluginProvider
 *
 * A re-export of the core PluginProvider with PluginInfrastructure typing.
 * 
 * Apps should compose this with their own service providers:
 * 
 * @example
 * ```tsx
 * const host = createAppHost();
 * 
 * <NotificationsProvider value={notificationService}>
 *   <RouterProvider value={router}>
 *     <UserProvider value={user}>
 *       <LoggerProvider value={logger}>
 *         <AppPluginProvider host={host}>
 *           <App />
 *         </AppPluginProvider>
 *       </LoggerProvider>
 *     </UserProvider>
 *   </RouterProvider>
 * </NotificationsProvider>
 * ```
 */
export const AppPluginProvider = PluginProvider;

export type AppPluginProviderProps = PluginProviderProps;
