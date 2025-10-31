# Security Quick Reference Card

## 🔒 Critical Security Settings

```typescript
// src/main/main.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false, // ✅ MUST be false
    contextIsolation: true, // ✅ MUST be true
    sandbox: true, // ✅ MUST be true
    preload: path.join(__dirname, "preload.js"),
    webSecurity: true, // ✅ Keep enabled
  },
});
```

## 🛡️ Preload Script Pattern

```typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from "electron";

// ✅ DO: Use contextBridge
contextBridge.exposeInMainWorld("electronAPI", {
  myFunction: (arg) => {
    // Validate input
    if (!isValid(arg)) throw new Error("Invalid");
    return ipcRenderer.invoke("my-channel", arg);
  },
});

// ❌ DON'T: Expose entire modules
// contextBridge.exposeInMainWorld('ipc', ipcRenderer); // WRONG!
```

## 🔌 IPC Handler Pattern

```typescript
// src/main/main.ts
ipcMain.handle("my-channel", async (_event, data) => {
  // 1. Validate input type
  if (typeof data !== "object") throw new Error("Invalid");

  // 2. Validate structure
  const { field } = data;
  if (typeof field !== "string") throw new Error("Invalid");

  // 3. Validate constraints
  if (field.length > 1000) throw new Error("Too long");

  // 4. Process safely
  return processData(field);
});
```

## 🚫 What NOT to Do

```typescript
// ❌ NEVER expose these in preload:
contextBridge.exposeInMainWorld('unsafe', {
  ipcRenderer,           // Direct IPC access
  require,               // Node.js require
  process,               // Process object
  fs: require('fs'),     // File system
  exec: require('child_process').exec, // Command execution
});

// ❌ NEVER in main process:
nodeIntegration: true,     // Gives renderer Node.js access
contextIsolation: false,   // Breaks security boundary
enableRemoteModule: true,  // Deprecated and insecure
webSecurity: false,        // Disables same-origin policy
```

## ✅ Safe API Exposure Patterns

### Read-Only Data

```typescript
// Preload
getAppVersion: () => ipcRenderer.invoke("get-version");

// Main
ipcMain.handle("get-version", () => app.getVersion());
```

### User-Initiated Actions

```typescript
// Preload
selectFile: () => ipcRenderer.invoke("select-file");

// Main
ipcMain.handle("select-file", async () => {
  return dialog.showOpenDialog({ properties: ["openFile"] });
});
```

### Validated Data Processing

```typescript
// Preload
processData: (data) => {
  if (!validate(data)) throw new Error("Invalid");
  return ipcRenderer.invoke("process", data);
};

// Main
ipcMain.handle("process", async (_event, data) => {
  validateAgain(data); // Defense in depth
  return processSecurely(data);
});
```

## 🔍 Input Validation Helpers

```typescript
const validators = {
  isString: (v, max = 1000) => typeof v === "string" && v.length <= max,

  isNumber: (v, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof v === "number" && v >= min && v <= max && !isNaN(v),

  isPath: (v) => typeof v === "string" && !v.includes("..") && v.length < 4096,

  isValidJSON: (v) => {
    try {
      JSON.parse(v);
      return true;
    } catch {
      return false;
    }
  },
};
```

## 🛡️ Security Checklist

- [ ] `nodeIntegration: false`
- [ ] `contextIsolation: true`
- [ ] `sandbox: true`
- [ ] Preload uses `contextBridge`
- [ ] All IPC handlers validate input
- [ ] No `eval()` or `Function()`
- [ ] No direct module exposure
- [ ] CSP configured
- [ ] Navigation restricted
- [ ] File paths sanitized
- [ ] Dependencies audited
- [ ] Electron up to date

## 📚 Common Patterns

### Event Subscription

```typescript
// Preload
onEvent: (callback) => {
  const safe = (_e, data) => {
    if (validate(data)) callback(data);
  };
  ipcRenderer.on("event", safe);
  return () => ipcRenderer.removeListener("event", safe);
};

// Renderer
const unsub = window.electronAPI.onEvent((data) => {
  console.log(data);
});
// Later: unsub();
```

### File Operations

```typescript
// Always require user consent via dialog
const result = await window.electronAPI.showOpenDialog();
if (!result.canceled) {
  const content = await window.electronAPI.readFile(result.filePaths[0]);
}
```

## 🚨 Red Flags

If you see any of these, fix immediately:

- `nodeIntegration: true` in production
- `contextIsolation: false`
- `webSecurity: false`
- `require()` exposed to renderer
- `eval()` or `Function()` usage
- Unvalidated file paths
- Direct IPC exposure
- Remote module usage

## 📖 Further Reading

- [Electron Security Docs](https://electronjs.org/docs/tutorial/security)
- Full docs: `SECURITY.md`
- Testing: `SECURITY_TESTING.md`
- Summary: `IMPLEMENTATION.md`
