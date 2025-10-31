# Electron Security Best Practices

This document explains the security features implemented in this Electron application.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Security Features](#security-features)
3. [IPC Communication](#ipc-communication)
4. [Best Practices](#best-practices)
5. [Security Checklist](#security-checklist)

## Security Architecture

This application follows Electron's security best practices by implementing a three-layer security model:

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  (Privileged - Full Node.js & Electron API access)          │
│  - Creates windows                                           │
│  - Handles IPC requests                                      │
│  - Validates all input                                       │
│  - Enforces security policies                                │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ IPC (invoke/handle)
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Preload Script                            │
│  (Bridge - Limited Context)                                  │
│  - Runs before renderer loads                                │
│  - Uses contextBridge to expose APIs                         │
│  - Validates renderer input                                  │
│  - Acts as security boundary                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ window.electronAPI
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Renderer Process                           │
│  (Untrusted - Sandboxed Web Environment)                     │
│  - React application                                         │
│  - No direct Node.js access                                  │
│  - No direct Electron API access                             │
│  - Only accesses APIs via window.electronAPI                 │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### 1. Context Isolation (✅ Enabled)

**What it does:** Separates the preload script's JavaScript context from the renderer's context.

**Why it matters:** Prevents malicious code in the renderer from accessing Electron or Node.js APIs through the preload script's scope.

**Implementation:**

```typescript
// src/main/main.ts
webPreferences: {
  contextIsolation: true,  // CRITICAL
}
```

### 2. Node Integration Disabled (✅ Disabled)

**What it does:** Prevents the renderer process from using Node.js APIs like `require()`, `fs`, etc.

**Why it matters:** If a renderer process is compromised (e.g., via XSS), the attacker cannot execute arbitrary Node.js code.

**Implementation:**

```typescript
// src/main/main.ts
webPreferences: {
  nodeIntegration: false,  // CRITICAL
}
```

### 3. Sandbox Mode (✅ Enabled)

**What it does:** Runs the renderer process in a sandboxed environment with limited system access.

**Why it matters:** Provides an additional layer of OS-level isolation, limiting what a compromised renderer can do.

**Implementation:**

```typescript
// src/main/main.ts
webPreferences: {
  sandbox: true,
}
```

### 4. Secure Preload Script (✅ Implemented)

**What it does:** Uses `contextBridge` to expose only specific, validated APIs to the renderer.

**Why it matters:** Creates a controlled security boundary between privileged and unprivileged code.

**Implementation:**

```typescript
// src/main/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // Only expose specific, safe functions
  ping: async () => ipcRenderer.invoke('ping'),
  // Never expose: ipcRenderer, require, or Node.js modules
});
```

### 5. Content Security Policy (✅ Implemented)

**What it does:** Restricts what resources can be loaded and what code can be executed.

**Why it matters:** Mitigates XSS attacks by preventing execution of inline scripts and loading of untrusted resources.

**Implementation:**

```typescript
// src/main/main.ts
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'; script-src 'self'; ..."],
    },
  });
});
```

### 6. Navigation Protection (✅ Implemented)

**What it does:** Prevents the renderer from navigating to external URLs.

**Why it matters:** Stops phishing attacks where malicious code tries to navigate to a fake login page.

**Implementation:**

```typescript
// src/main/main.ts
mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
  // Block navigation to external URLs
  event.preventDefault();
});
```

### 7. New Window Handling (✅ Implemented)

**What it does:** Controls how new windows/popups are created.

**Why it matters:** Prevents malicious popups and ensures external links open in the system browser (safer).

**Implementation:**

```typescript
// src/main/main.ts
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https://')) {
    shell.openExternal(url); // Open in browser, not in app
  }
  return { action: 'deny' };
});
```

### 8. Input Validation (✅ Implemented)

**What it does:** Validates all data coming from the renderer before processing.

**Why it matters:** Prevents injection attacks and ensures data integrity.

**Implementation:**

```typescript
// src/main/preload.ts
processData: async (data: ProcessDataInput) => {
  // Validate before sending to main
  if (!validators.isValidString(data.text, 1000)) {
    throw new Error('Invalid text field');
  }
  return await ipcRenderer.invoke('process-data', data);
};

// src/main/main.ts
ipcMain.handle('process-data', async (_event, data: unknown) => {
  // Validate again in main process
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data format');
  }
  // ... more validation
});
```

### 9. eval() Prevention (✅ Disabled)

**What it does:** Prevents the use of `eval()` which can execute arbitrary code.

**Why it matters:** `eval()` is a common attack vector for code injection.

**Implementation:**

```typescript
// src/main/main.ts
global.eval = function () {
  throw new Error('eval() is disabled for security reasons');
};
```

### 10. Remote Module Disabled (✅ Not Used)

**What it does:** The deprecated `remote` module is not enabled.

**Why it matters:** The remote module allowed renderers to execute code in the main process, which is extremely dangerous.

**Implementation:**

```typescript
// Not included in modern Electron - deprecated and removed
// Old (insecure): enableRemoteModule: true
// This app doesn't use it at all
```

## IPC Communication

### Safe IPC Pattern

This application uses a secure IPC pattern:

1. **Renderer → Preload:** Renderer calls `window.electronAPI.functionName()`
2. **Preload validates:** Input is validated in preload script
3. **Preload → Main:** Preload uses `ipcRenderer.invoke()` to call main
4. **Main validates:** Main process validates input again (defense in depth)
5. **Main processes:** Main executes the privileged operation
6. **Main → Preload → Renderer:** Result is returned through the chain

### Example: File Reading

```typescript
// 1. Renderer calls the API
const content = await window.electronAPI.readFile(filePath);

// 2. Preload validates
readFile: async (filePath: string) => {
  if (!validators.isValidPath(filePath)) {
    throw new Error('Invalid file path');
  }
  return await ipcRenderer.invoke('read-file', filePath);
};

// 3. Main validates and executes
ipcMain.handle('read-file', async (_event, filePath: string) => {
  if (filePath.includes('..')) {
    throw new Error('Invalid file path');
  }
  return await fs.promises.readFile(filePath, 'utf-8');
});
```

## Best Practices

### ✅ DO

- **DO** use `contextBridge.exposeInMainWorld()` to expose APIs
- **DO** validate all input from the renderer in both preload and main
- **DO** use IPC handlers (`ipcMain.handle()`) for request-response patterns
- **DO** sanitize file paths to prevent directory traversal
- **DO** use Electron's native dialogs for file selection
- **DO** implement rate limiting for IPC calls in production
- **DO** log security-relevant events
- **DO** keep Electron up to date with security patches
- **DO** use HTTPS for loading remote content (if needed)
- **DO** implement proper error handling without leaking sensitive info

### ❌ DON'T

- **DON'T** expose `ipcRenderer` directly to the renderer
- **DON'T** expose Node.js modules (`fs`, `child_process`, etc.) directly
- **DON'T** use `nodeIntegration: true` in production
- **DON'T** disable `contextIsolation` or `sandbox`
- **DON'T** trust data from the renderer without validation
- **DON'T** use `eval()` or `Function()` constructor
- **DON'T** allow arbitrary file system access
- **DON'T** execute shell commands with user input
- **DON'T** use the deprecated `remote` module
- **DON'T** load remote content over HTTP (use HTTPS)
- **DON'T** disable web security in production

## Security Checklist

Before deploying your Electron app, verify:

- [ ] `nodeIntegration` is set to `false`
- [ ] `contextIsolation` is set to `true`
- [ ] `sandbox` is set to `true`
- [ ] Preload script uses `contextBridge` to expose APIs
- [ ] No direct exposure of `ipcRenderer` or Node.js modules
- [ ] All IPC handlers validate input
- [ ] Content Security Policy is configured
- [ ] Navigation is restricted to app URLs
- [ ] New window creation is controlled
- [ ] File paths are validated to prevent traversal
- [ ] No use of `eval()` or `Function()` constructor
- [ ] Remote module is not enabled
- [ ] Web views are disabled or properly configured
- [ ] Electron version is up to date
- [ ] Dependencies are audited (`npm audit`)
- [ ] Code signing is implemented (for production)
- [ ] Auto-updates use HTTPS and signature verification

## Additional Resources

- [Electron Security Documentation](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations)
- [OWASP Electron Security](https://owasp.org/www-community/vulnerabilities/Electron_Security)
- [Doyensec Electron Security Guide](https://doyensec.com/resources/us-17-Carettoni-Electronegativity-A-Study-Of-Electron-Security-wp.pdf)

## Reporting Security Issues

If you discover a security vulnerability in this application, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security details to [your-security-email]
3. Include steps to reproduce and potential impact
4. Allow time for a fix before public disclosure

## License

This security documentation is provided as-is for educational purposes.
