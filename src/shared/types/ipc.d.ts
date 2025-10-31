/**
 * IPC Type Definitions
 *
 * Type definitions for IPC message payloads and responses.
 * These types ensure type safety when communicating between
 * main and renderer processes.
 *
 * @example
 * import type { IPCResponse, DataProcessRequest } from '@/shared/types/ipc';
 */

/**
 * Standard IPC response wrapper
 */
export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Data processing request payload
 */
export interface DataProcessRequest {
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Window action types
 */
export type WindowAction = 'minimize' | 'maximize' | 'close' | 'restore';
