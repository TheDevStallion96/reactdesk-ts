/**
 * IPC Handlers
 *
 * This file contains the main process IPC handlers that respond to
 * requests from the renderer process.
 *
 * @example
 * // Register handlers in main.ts:
 * import { registerIPCHandlers } from './ipc/handlers';
 * registerIPCHandlers();
 */

import { ipcMain } from 'electron';

/**
 * Register all IPC handlers for the application
 */
export function registerIPCHandlers(): void {
  // Example: Handle a ping request
  ipcMain.handle('app:ping', async () => {
    return 'pong';
  });

  // Example: Get app version
  ipcMain.handle('app:getVersion', async () => {
    return process.env.npm_package_version || '1.0.0';
  });

  // Example: Handle data processing
  ipcMain.handle('data:process', async (_event, data: unknown) => {
    // Process data here
    console.log('Processing data:', data);
    return { success: true, data };
  });
}

/**
 * Remove all IPC handlers (cleanup)
 */
export function unregisterIPCHandlers(): void {
  ipcMain.removeHandler('app:ping');
  ipcMain.removeHandler('app:getVersion');
  ipcMain.removeHandler('data:process');
}
