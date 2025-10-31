/**
 * useIPC Hook
 * 
 * A React hook for safely calling IPC methods exposed via the preload script.
 * Provides type-safe access to Electron IPC functionality.
 * 
 * @example
 * const { invoke, on, off } = useIPC();
 * 
 * // Call an IPC handler
 * const result = await invoke('app:ping');
 * 
 * // Listen to IPC events
 * useEffect(() => {
 *   const handler = (data) => console.log(data);
 *   on('notification', handler);
 *   return () => off('notification', handler);
 * }, []);
 */

import { useCallback } from 'react';

export function useIPC() {
  const electronAPI = (window as any).electronAPI;

  const invoke = useCallback(
    async (channel: string, ...args: any[]) => {
      if (!electronAPI?.invoke) {
        console.warn('IPC not available');
        return null;
      }
      return electronAPI.invoke(channel, ...args);
    },
    [electronAPI]
  );

  const on = useCallback(
    (channel: string, callback: (...args: any[]) => void) => {
      if (!electronAPI?.on) {
        console.warn('IPC not available');
        return;
      }
      electronAPI.on(channel, callback);
    },
    [electronAPI]
  );

  const off = useCallback(
    (channel: string, callback: (...args: any[]) => void) => {
      if (!electronAPI?.off) {
        console.warn('IPC not available');
        return;
      }
      electronAPI.off(channel, callback);
    },
    [electronAPI]
  );

  return { invoke, on, off };
}
