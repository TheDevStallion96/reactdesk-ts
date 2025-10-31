# Custom React Hooks

This directory contains custom React hooks for shared functionality across components.

## Organization

Hooks should:

- Follow React hooks naming convention (use\*)
- Be properly documented
- Handle cleanup in useEffect when needed
- Be exported via `index.ts`

## Current Hooks

- **useIPC** - Safe IPC communication with the main process
- **useAppVersion** - Fetch application version information

## Usage

```typescript
import { useIPC, useAppVersion } from "@/renderer/hooks";

function MyComponent() {
  const { invoke } = useIPC();
  const version = useAppVersion();

  // Use the hooks...
}
```

## Creating New Hooks

1. Create a new file: `useHookName.ts`
2. Implement the hook with proper types
3. Add JSDoc documentation
4. Export from `index.ts`
5. Update this README
