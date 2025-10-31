# Copilot Instructions for ReactDesk TypeScript

## Project Overview

This is a **security-hardened Electron + React + TypeScript** template built with Vite. The architecture enforces strict process isolation with context isolation, sandbox mode, and no node integration in renderers.

## Critical Security Architecture

### Three-Layer Security Model

1. **Main Process** (`src/main/`) - Full Electron/Node.js access, handles IPC with validation
2. **Preload Script** (`src/main/preload.ts`) - Security boundary using `contextBridge`, validates all data
3. **Renderer Process** (`src/renderer/`) - Sandboxed React app, zero direct Node/Electron API access

**⚠️ NEVER expose ipcRenderer, require(), or Node.js modules directly to the renderer.**

### IPC Communication Pattern

All renderer-to-main communication MUST follow this validated pattern:

```typescript
// 1. Define in src/shared/constants/ipc.ts
export const IPC_CHANNELS = { MY_ACTION: 'my:action' };

// 2. Add types in src/shared/types/ipc.d.ts
export interface MyRequest {
  data: string;
}

// 3. Validate in preload (src/main/preload.ts)
contextBridge.exposeInMainWorld('electronAPI', {
  myAction: async (request: MyRequest) => {
    if (!validators.isValidString(request.data, 1000)) {
      throw new Error('Invalid input');
    }
    return await ipcRenderer.invoke('my:action', request);
  },
});

// 4. Validate again in main (src/main/main.ts)
ipcMain.handle('my:action', async (_event, request: unknown) => {
  // Validate structure, sanitize, process
});

// 5. Use in renderer
const result = await window.electronAPI.myAction({ data: 'test' });
```

**Double validation (preload + main) is mandatory for security.**

## Build & Development Workflow

### Start Development

```bash
npm run dev  # Builds main → starts Vite → launches Electron with auto-reload
```

This runs three processes: TypeScript compilation for main, Vite dev server (port 5173), and Electron with electronmon.

### Build for Production

```bash
npm run build        # Builds both processes
npm run build:main   # Main process only (tsc)
npm run build:renderer  # Renderer only (tsc + vite)
npm start           # Run built app
```

### Code Quality

- Pre-commit hooks run ESLint + Prettier via Husky
- Main process allows console logs; renderer warns on `console.log`
- TypeScript strict mode enforced across all configs

## Project Structure Conventions

### Import Aliases (vite.config.ts)

- `@/` → `src/`
- `@renderer/` → `src/renderer/`
- `@shared/` → `src/shared/`

### Modular Organization

Each feature directory has:

- `index.ts` - Barrel exports for clean imports
- `README.md` - Usage documentation
- Feature-specific files

**Examples:**

```typescript
import { Button } from '@renderer/components'; // Not components/Button
import { useIPC } from '@renderer/hooks';
import { IPC_CHANNELS } from '@shared/constants';
```

### TypeScript Configs

- `tsconfig.main.json` - Main process (NodeNext, Node types)
- `tsconfig.renderer.json` - Renderer (DOM, React types)
- `tsconfig.json` - Base config (strict mode)

## Key Files to Understand

| File                          | Purpose           | Critical Details                                                               |
| ----------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| `src/main/main.ts`            | Main entry point  | Security config (BrowserWindow webPreferences), CSP headers, navigation guards |
| `src/main/preload.ts`         | Security boundary | All renderer API exposure happens here via contextBridge                       |
| `src/shared/types/ipc.d.ts`   | IPC contracts     | Shared types for type-safe IPC                                                 |
| `src/shared/constants/ipc.ts` | Channel names     | Prevents typos in IPC channel strings                                          |
| `vite.config.ts`              | Build config      | Renderer bundling, dev server, path aliases                                    |

## Security Best Practices

### When Adding IPC Handlers

1. ✅ Define channel constant in `shared/constants/ipc.ts`
2. ✅ Add TypeScript types in `shared/types/ipc.d.ts`
3. ✅ Validate in preload script (first defense)
4. ✅ Validate in main process (second defense)
5. ✅ Never trust renderer input - sanitize paths, limit sizes, check types
6. ❌ Never expose: `ipcRenderer`, `require`, `fs`, `child_process`, `eval()`

### Content Security Policy

- Dev mode: Relaxed CSP for Vite HMR (`unsafe-inline`, `unsafe-eval`)
- Production: Strict CSP (`default-src 'self'`, no inline scripts)
- Configured in `src/main/main.ts` via `webRequest.onHeadersReceived`

### Navigation Protection

- `will-navigate` blocks external URLs (prevents phishing)
- `setWindowOpenHandler` opens HTTPS in system browser, denies new windows
- `will-attach-webview` blocks webview tags (security risk)

## Common Patterns

### Custom React Hooks

Place in `src/renderer/hooks/` with this structure:

```typescript
export function useMyHook() {
  // Implementation
}
```

Export from `src/renderer/hooks/index.ts`, document in `README.md`.

### Components

- Functional components with TypeScript
- Use `@renderer/components` barrel imports
- Styles in `src/renderer/styles/` (CSS modules or global)

### Error Handling

- IPC handlers throw typed errors, caught in renderer
- Never expose sensitive error details to renderer
- Log security events in main process only

## Testing & Validation

### Security Validation

```bash
./scripts/demo-security.sh  # Demonstrates security features
npm audit                   # Check dependencies
```

### What to Verify

- Try `require('fs')` in renderer DevTools → Should fail
- Try navigating to external URL → Should be blocked
- Check CSP in Network tab → Should be enforced

## Documentation

- **SECURITY.md** - Complete security architecture and attack scenarios
- **PROJECT_STRUCTURE.md** - Detailed folder organization
- **IMPLEMENTATION.md** - Security implementation summary
- **CODE_QUALITY.md** - ESLint, Prettier, Husky setup

## Anti-Patterns to Avoid

❌ Disabling security features for "convenience"
❌ Adding `nodeIntegration: true` (destroys security model)
❌ Exposing entire modules via contextBridge
❌ Skipping input validation in preload or main
❌ Using `eval()` or `Function()` constructor
❌ Loading remote content without strict CSP
❌ Storing sensitive data in renderer localStorage

## When Modifying Architecture

- **Adding dependencies:** Run `npm audit` after install
- **Changing security config:** Review SECURITY.md first
- **New IPC channel:** Follow double-validation pattern
- **File operations:** Use dialog.showOpenDialog (user consent), validate paths (prevent traversal)
- **External content:** Disable or use `<webview>` with strict permissions (not recommended)

## Key Dependencies

- **electron** `^27.0.0` - Desktop runtime
- **react** `^18.2.0` - UI framework (no import needed for JSX)
- **vite** `^5.0.0` - Build tool with HMR
- **electronmon** - Auto-reload for main process
- **concurrently** - Run multiple dev processes
- **husky** + **lint-staged** - Git hooks for quality

---

**Remember:** This template prioritizes security over convenience. Every IPC endpoint is a potential attack surface—validate everything twice (preload + main).
