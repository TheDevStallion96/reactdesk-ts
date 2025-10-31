// Shared types between main and renderer processes

/**
 * Application configuration interface
 */
export interface AppConfig {
  version: string;
  name: string;
}

/**
 * Application version information returned from main process
 */
export interface AppVersionInfo {
  version: string;
  name: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
}

/**
 * Input data for process-data IPC call
 */
export interface ProcessDataInput {
  text: string;
  count: number;
}

/**
 * Output data from process-data IPC call
 */
export interface ProcessDataOutput {
  processed: string;
  timestamp: number;
}

/**
 * Options for file open dialog
 */
export interface OpenDialogOptions {
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  filters?: Array<{ name: string; extensions: string[] }>;
}

/**
 * Result from file open dialog
 */
export interface OpenDialogResult {
  canceled: boolean;
  filePaths: string[];
}

/**
 * Electron API exposed to renderer via contextBridge
 * This interface should match what's exposed in preload.ts
 */
export interface ElectronAPI {
  // System Information
  getAppVersion: () => Promise<AppVersionInfo>;

  // IPC Communication
  ping: () => Promise<string>;
  processData: (data: ProcessDataInput) => Promise<ProcessDataOutput>;

  // File Operations
  showOpenDialog: (options?: OpenDialogOptions) => Promise<OpenDialogResult>;
  readFile: (filePath: string) => Promise<string>;

  // Event Listeners
  onNotification: (callback: (message: string) => void) => () => void;
}

/**
 * Global type augmentation for window.electronAPI
 * This allows TypeScript to recognize the electronAPI on the window object
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
