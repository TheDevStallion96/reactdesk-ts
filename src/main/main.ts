/**
 * Electron Main Process Entry Point
 *
 * This file serves as the main entry point for the Electron application.
 * It implements security best practices as recommended by the Electron team.
 *
 * Security Principles Applied:
 * 1. Context Isolation: Prevents renderer from accessing Electron internals
 * 2. No Node Integration: Renderer cannot use Node.js APIs directly
 * 3. Preload Scripts: Safely expose limited APIs via contextBridge
 * 4. Content Security Policy: Restricts resource loading
 * 5. Secure defaults for all BrowserWindow instances
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Global reference to the main window to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

/**
 * Determine if running in development mode
 * Security Note: Different loading strategies for dev vs production
 */
const rendererPath = path.join(__dirname, '../renderer/index.html');
const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(rendererPath);
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

/**
 * Creates the main application window with secure defaults
 *
 * Security Features:
 * - nodeIntegration: false - Prevents renderer from using Node.js APIs
 * - contextIsolation: true - Isolates preload script context from renderer
 * - sandbox: true - Runs renderer in a sandboxed environment (additional protection)
 * - webSecurity: true - Enforces same-origin policy (default, explicit for clarity)
 * - allowRunningInsecureContent: false - Blocks mixed content (default, explicit)
 * - enableRemoteModule: false - Remote module is deprecated and insecure
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // CRITICAL SECURITY SETTINGS

      // Disable Node.js integration in the renderer process
      // This prevents arbitrary code execution in the renderer
      nodeIntegration: false,

      // Enable context isolation to separate preload script from renderer
      // This creates a separate JavaScript context for the preload script
      contextIsolation: true,

      // Specify the preload script path
      // Preload scripts run before the renderer and can safely expose APIs
      preload: path.join(__dirname, 'preload.js'),

      // Enable sandbox mode for additional security
      // This runs the renderer process in a restricted environment
      sandbox: true,

      // Enforce web security policies (same-origin policy, etc.)
      webSecurity: true,

      // Prevent loading insecure content on HTTPS pages
      allowRunningInsecureContent: false,

      // Disable the deprecated and insecure remote module
      // Note: This is deprecated in newer Electron versions
      // enableRemoteModule: false, // Uncomment if using older Electron

      // Disable navigation via middle-click to prevent unintended navigation
      // This is handled via event listeners below for more control
    },

    // Additional window security options
    show: false, // Don't show until ready (prevents white flash and potential exploits)
  });

  /**
   * Content Security Policy (CSP)
   * Security Note: Restricts what resources can be loaded and executed
   * - default-src 'self': Only load resources from the app itself
   * - script-src 'self': Only execute scripts from the app
   * - style-src 'self' 'unsafe-inline': Allow inline styles (needed for React)
   * - img-src 'self' data: https:: Allow images from self, data URIs, and HTTPS
   */
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
        ],
      },
    });
  });

  /**
   * Security: Prevent navigation to external URLs
   * This prevents malicious code from navigating the app to phishing sites
   */
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Allow navigation within dev server or app origin
    if (isDev && parsedUrl.origin === VITE_DEV_SERVER_URL) {
      return; // Allow dev server navigation
    }

    // Block all other navigation attempts
    event.preventDefault();
    console.warn(`Blocked navigation to: ${navigationUrl}`);
  });

  /**
   * Security: Handle new window requests safely
   * Prevent renderer from opening arbitrary windows/popups
   */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Only allow HTTPS URLs to be opened in the default browser
    if (url.startsWith('https://')) {
      shell.openExternal(url); // Open in system browser, not in app
    }
    return { action: 'deny' }; // Deny opening new windows within the app
  });

  /**
   * Security: Disable web view tags
   * Web views can be security risks if not properly configured
   */
  mainWindow.webContents.on('will-attach-webview', (event) => {
    event.preventDefault();
    console.warn('Attempted to attach webview - blocked for security');
  });

  // Load the appropriate content based on environment
  if (isDev) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // Open DevTools in development (helpful for debugging, not a security risk in dev)
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built HTML file
    mainWindow.loadFile(rendererPath);
  }

  // Show window when ready to prevent visual glitches
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Clean up reference when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * IPC Handlers - Secure Communication Examples
 *
 * Security Note: All IPC handlers should validate input and sanitize output
 * Never trust data from the renderer process - always validate!
 */

/**
 * Example: Ping/Pong IPC for testing communication
 * Security: Simple string response, no user input - safe
 */
ipcMain.handle('ping', async () => {
  console.log('Received ping from renderer');
  return 'pong';
});

/**
 * Example: Get app version (read-only system info)
 * Security: Only exposing safe, read-only application metadata
 */
ipcMain.handle('get-app-version', async () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
  };
});

/**
 * Example: Show open dialog (file selection)
 * Security: Uses Electron's native dialog - safe and sandboxed
 * The user explicitly chooses files, preventing arbitrary file access
 */
ipcMain.handle('show-open-dialog', async (_event, options) => {
  // Validate options to prevent injection attacks
  const safeOptions = {
    properties: Array.isArray(options?.properties)
      ? options.properties.filter((p: string) =>
          ['openFile', 'openDirectory', 'multiSelections'].includes(p)
        )
      : ['openFile'],
    filters: Array.isArray(options?.filters) ? options.filters : [],
  };

  if (!mainWindow) {
    throw new Error('No main window available');
  }

  return await dialog.showOpenDialog(mainWindow, safeOptions);
});

/**
 * Example: Read file content (with validation)
 * Security: Only allows reading files that the user explicitly selected
 * Never allow arbitrary file path access from renderer
 */
ipcMain.handle('read-file', async (_event, filePath: string) => {
  // SECURITY: Validate that the file path is safe
  // In a real app, you'd want to maintain a whitelist of allowed paths
  // or only allow paths that were returned from showOpenDialog

  // Prevent directory traversal attacks
  if (filePath.includes('..') || !path.isAbsolute(filePath)) {
    throw new Error('Invalid file path');
  }

  try {
    // Check if file exists and is actually a file (not a directory)
    const stats = await fs.promises.stat(filePath);
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }

    // Limit file size to prevent memory exhaustion (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error('File too large');
    }

    // Read and return file content
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

/**
 * Example: Process data (demonstrates input validation)
 * Security: Always validate and sanitize input from renderer
 */
ipcMain.handle('process-data', async (_event, data: unknown) => {
  // SECURITY: Validate input type and structure
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data format');
  }

  const { text, count } = data as { text?: unknown; count?: unknown };

  // Validate each field
  if (typeof text !== 'string' || text.length > 1000) {
    throw new Error('Invalid text field');
  }

  if (typeof count !== 'number' || count < 0 || count > 100 || !Number.isInteger(count)) {
    throw new Error('Invalid count field');
  }

  // Process the validated data
  return {
    processed: text.repeat(count),
    timestamp: Date.now(),
  };
});

/**
 * Security: Prevent eval() usage in the main process
 * This is a defense-in-depth measure
 */
global.eval = function () {
  throw new Error('eval() is disabled for security reasons');
};

/**
 * App Lifecycle Events
 */

// Create window when app is ready
app.whenReady().then(() => {
  // Security: Set app-wide permissions
  // This prevents the renderer from requesting dangerous permissions
  app.on('web-contents-created', (_event, contents) => {
    // Prevent navigation to external URLs in any web contents
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (isDev && parsedUrl.origin !== VITE_DEV_SERVER_URL) {
        event.preventDefault();
      } else if (!isDev && !navigationUrl.startsWith('file://')) {
        event.preventDefault();
      }
    });

    // Disable or limit permissions
    contents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
      // Deny all permissions by default
      // In a real app, you might allow specific permissions with user consent
      const allowedPermissions: string[] = []; // e.g., ['notifications']

      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        console.warn(`Denied permission request: ${permission}`);
        callback(false);
      }
    });
  });

  createWindow();

  // On macOS, recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Security: Handle uncaught exceptions gracefully
 * Prevents the app from crashing and potentially exposing sensitive info
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // In production, you might want to log this to a file or service
  // But never expose the full error to the renderer
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
