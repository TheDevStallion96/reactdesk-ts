# Shared Constants

This directory contains application-wide constants shared between main and renderer processes.

## Organization

Constants are organized by category:

- **app.ts** - Application-level constants (name, version, window config)
- **ipc.ts** - IPC channel names and types

## Usage

```typescript
import { APP_NAME, IPC_CHANNELS } from "@/shared/constants";

console.log(APP_NAME);
ipcMain.handle(IPC_CHANNELS.APP_PING, () => "pong");
```

## Benefits

- Prevents typos in channel names
- Single source of truth
- Type-safe with TypeScript
- Easy to refactor
- Self-documenting code

## Adding New Constants

1. Add to appropriate file or create new category
2. Use uppercase SNAKE_CASE for constants
3. Add JSDoc comments
4. Export from `index.ts`
5. Update this README
