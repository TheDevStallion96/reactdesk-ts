/**
 * Application Constants
 *
 * Application-wide configuration values and constants.
 * These values are shared between main and renderer processes.
 *
 * @example
 * import { APP_NAME, DEFAULT_WINDOW_SIZE } from '@/shared/constants/app';
 */

export const APP_NAME = 'ReactDesk';
export const APP_VERSION = '1.0.0';

export const DEFAULT_WINDOW_SIZE = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
};

export const WINDOW_TITLE = 'ReactDesk - Electron + React + TypeScript';

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
