/**
 * Application Type Definitions
 *
 * Common type definitions used throughout the application.
 *
 * @example
 * import type { User, AppConfig } from '@/shared/types/app';
 */

/**
 * User information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  autoUpdate: boolean;
}

/**
 * Application state
 */
export interface AppState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  config: AppConfig;
}
