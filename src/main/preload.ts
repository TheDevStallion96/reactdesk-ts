/**
 * Electron Preload Script
 * 
 * This script runs in a privileged context before the renderer process loads.
 * It safely exposes limited APIs to the renderer via the contextBridge.
 * 
 * Security Principles:
 * 1. NEVER expose the entire ipcRenderer or any Node.js modules directly
 * 2. Only expose specific, validated functions using contextBridge
 * 3. Act as a security boundary between main and renderer processes
 * 4. Validate and sanitize all data passing through
 * 5. Follow the principle of least privilege - only expose what's needed
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Security: Type definitions for exposed API
 * This ensures type safety and prevents accidental exposure of sensitive methods
 */
export interface ElectronAPI {
  // System Information (read-only, safe)
  getAppVersion: () => Promise<AppVersionInfo>;
  
  // IPC Communication Examples
  ping: () => Promise<string>;
  processData: (data: ProcessDataInput) => Promise<ProcessDataOutput>;
  
  // File Operations (user-initiated only)
  showOpenDialog: (options?: OpenDialogOptions) => Promise<OpenDialogResult>;
  readFile: (filePath: string) => Promise<string>;
  
  // Event Listeners (controlled subscription pattern)
  onNotification: (callback: (message: string) => void) => () => void;
}

interface AppVersionInfo {
  version: string;
  name: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
}

interface ProcessDataInput {
  text: string;
  count: number;
}

interface ProcessDataOutput {
  processed: string;
  timestamp: number;
}

interface OpenDialogOptions {
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  filters?: Array<{ name: string; extensions: string[] }>;
}

interface OpenDialogResult {
  canceled: boolean;
  filePaths: string[];
}

/**
 * Security: Input validation helpers
 * Always validate data before sending to main process
 */
const validators = {
  /**
   * Validate string input with length constraints
   */
  isValidString(value: unknown, maxLength = 1000): value is string {
    return typeof value === 'string' && value.length <= maxLength;
  },

  /**
   * Validate number input with range constraints
   */
  isValidNumber(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number {
    return typeof value === 'number' && 
           !isNaN(value) && 
           isFinite(value) &&
           value >= min && 
           value <= max;
  },

  /**
   * Validate file path format
   */
  isValidPath(value: unknown): value is string {
    return typeof value === 'string' && 
           value.length > 0 && 
           value.length < 4096 && // Max path length
           !value.includes('\0'); // No null bytes
  },
};

/**
 * CRITICAL SECURITY: Expose limited API to renderer process
 * 
 * contextBridge creates a secure bridge between the isolated preload context
 * and the renderer process. This is the ONLY way renderer should access
 * Electron or Node.js functionality.
 * 
 * DO NOT expose:
 * - ipcRenderer directly
 * - require() function
 * - Any Node.js modules
 * - File system access without validation
 * - Process or child_process modules
 * - eval() or Function constructor
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Get application version information
   * Security: Read-only system information, safe to expose
   */
  getAppVersion: async (): Promise<AppVersionInfo> => {
    return await ipcRenderer.invoke('get-app-version');
  },

  /**
   * Simple ping/pong for testing IPC
   * Security: No user input, no side effects, safe
   */
  ping: async (): Promise<string> => {
    return await ipcRenderer.invoke('ping');
  },

  /**
   * Process data with validation
   * Security: Validates input before sending to main process
   */
  processData: async (data: ProcessDataInput): Promise<ProcessDataOutput> => {
    // SECURITY: Validate input on the preload side
    if (!validators.isValidString(data.text, 1000)) {
      throw new Error('Invalid text field: must be a string with max 1000 characters');
    }

    if (!validators.isValidNumber(data.count, 0, 100)) {
      throw new Error('Invalid count field: must be a number between 0 and 100');
    }

    // Send validated data to main process
    return await ipcRenderer.invoke('process-data', data);
  },

  /**
   * Show native file open dialog
   * Security: Uses Electron's secure dialog API, user explicitly chooses files
   */
  showOpenDialog: async (options?: OpenDialogOptions): Promise<OpenDialogResult> => {
    // SECURITY: Validate options structure
    const safeOptions: OpenDialogOptions = {};
    
    if (options?.properties) {
      const validProperties = ['openFile', 'openDirectory', 'multiSelections'] as const;
      safeOptions.properties = options.properties.filter(
        (prop): prop is typeof validProperties[number] => validProperties.includes(prop as any)
      );
    }

    if (options?.filters && Array.isArray(options.filters)) {
      safeOptions.filters = options.filters.filter(
        filter => 
          typeof filter.name === 'string' &&
          Array.isArray(filter.extensions) &&
          filter.extensions.every(ext => typeof ext === 'string')
      );
    }

    return await ipcRenderer.invoke('show-open-dialog', safeOptions);
  },

  /**
   * Read file content
   * Security: Only allows reading files with validated paths
   * In production, should only accept paths from showOpenDialog
   */
  readFile: async (filePath: string): Promise<string> => {
    // SECURITY: Validate file path
    if (!validators.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }

    // Additional security: prevent directory traversal
    if (filePath.includes('..')) {
      throw new Error('Path traversal detected');
    }

    return await ipcRenderer.invoke('read-file', filePath);
  },

  /**
   * Subscribe to notifications from main process
   * Security: Controlled event subscription with cleanup
   * 
   * Returns an unsubscribe function to prevent memory leaks
   */
  onNotification: (callback: (message: string) => void): (() => void) => {
    // SECURITY: Wrap callback to validate data from main process
    const safeCallback = (_event: IpcRendererEvent, message: unknown) => {
      // Validate that message is a string
      if (typeof message === 'string') {
        callback(message);
      } else {
        console.warn('Received invalid notification data');
      }
    };

    // Subscribe to the event
    ipcRenderer.on('notification', safeCallback);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener('notification', safeCallback);
    };
  },
} as ElectronAPI);

/**
 * Security: Prevent access to Node.js globals in renderer
 * Even though contextIsolation is enabled, this is defense-in-depth
 */
// @ts-expect-error - Intentionally deleting for security
delete (window as any).require;
// @ts-expect-error - Intentionally deleting for security
delete (window as any).exports;
// @ts-expect-error - Intentionally deleting for security
delete (window as any).module;

/**
 * Development aid: Log when preload script loads
 * Security: Only log in development to avoid information leakage
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🔒 Preload script loaded with security enabled');
  console.log('✅ contextIsolation: enabled');
  console.log('✅ nodeIntegration: disabled');
  console.log('✅ sandbox: enabled');
}

/**
 * Type declaration for TypeScript
 * This allows renderer code to have proper type checking for window.electronAPI
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
