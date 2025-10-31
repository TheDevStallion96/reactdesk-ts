/**
 * Electron API Type Definitions
 * 
 * Type definitions for the Electron API exposed to the renderer process
 * through the preload script.
 * 
 * @example
 * // In renderer process:
 * const api: ElectronAPI = window.electronAPI;
 */

/**
 * Electron API interface exposed via preload script
 */
export interface ElectronAPI {
  /**
   * Invoke an IPC handler in the main process
   */
  invoke: (channel: string, ...args: any[]) => Promise<any>;

  /**
   * Listen to IPC events from the main process
   */
  on: (channel: string, callback: (...args: any[]) => void) => void;

  /**
   * Remove an IPC event listener
   */
  off: (channel: string, callback: (...args: any[]) => void) => void;

  /**
   * Send a message to the main process (one-way)
   */
  send: (channel: string, ...args: any[]) => void;
}

/**
 * Extend the Window interface to include the Electron API
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
