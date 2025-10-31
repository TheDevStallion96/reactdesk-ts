/**
 * IPC Events
 * 
 * This file contains event emitters for sending messages from the main
 * process to the renderer process.
 * 
 * @example
 * // Send an event to the renderer:
 * import { sendToRenderer } from './ipc/events';
 * sendToRenderer(mainWindow, 'notification', { message: 'Hello!' });
 */

import { BrowserWindow } from 'electron';

/**
 * Send a message to the renderer process
 */
export function sendToRenderer(
  window: BrowserWindow | null,
  channel: string,
  data?: unknown
): void {
  if (window && !window.isDestroyed()) {
    window.webContents.send(channel, data);
  }
}

/**
 * Broadcast a message to all renderer windows
 */
export function broadcastToAll(channel: string, data?: unknown): void {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, data);
    }
  });
}
