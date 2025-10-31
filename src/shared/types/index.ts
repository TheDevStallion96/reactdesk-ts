/**
 * Type Exports
 * 
 * Central export point for all type definitions.
 * Use this to import types throughout the application.
 * 
 * @example
 * import type { IPCResponse, User, ElectronAPI } from '@/shared/types';
 */

export * from './app';
export * from './electron';
export * from './ipc';

// Re-export legacy types from the original types.ts for backward compatibility
export type {
  AppConfig,
  AppVersionInfo,
  ProcessDataInput,
  ProcessDataOutput,
  OpenDialogOptions,
  OpenDialogResult,
  ElectronAPI,
} from '../types';
