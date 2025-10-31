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

/*
 * This file augments the global Window interface to expose the Electron API
 * defined in `src/shared/types.ts`. We import the typed `ElectronAPI` from
 * that module and assign it to `window.electronAPI` so renderer code gets
 * the detailed, secure API shape used across the project.
 */
import type { ElectronAPI } from '../types';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
