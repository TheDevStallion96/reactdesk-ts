/**
 * IPC Channel Constants
 * 
 * Defines all IPC channel names used for communication between
 * main and renderer processes. Using constants helps prevent typos
 * and makes refactoring easier.
 * 
 * @example
 * import { IPC_CHANNELS } from '@/shared/constants/ipc';
 * ipcMain.handle(IPC_CHANNELS.APP_PING, () => 'pong');
 */

export const IPC_CHANNELS = {
  // App-related channels
  APP_PING: 'app:ping',
  APP_GET_VERSION: 'app:getVersion',
  APP_QUIT: 'app:quit',

  // Data-related channels
  DATA_PROCESS: 'data:process',
  DATA_SAVE: 'data:save',
  DATA_LOAD: 'data:load',

  // Window-related channels
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // Notification channels
  NOTIFICATION_SHOW: 'notification:show',
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
