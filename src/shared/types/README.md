# Shared Type Definitions

This directory contains TypeScript type definitions shared between main and renderer processes.

## Organization

Types are organized by domain:

- **app.d.ts** - Application types (User, Config, State)
- **electron.d.ts** - Electron API type definitions
- **ipc.d.ts** - IPC message types and payloads

## Usage

```typescript
import type { IPCResponse, User, ElectronAPI } from "@/shared/types";

const response: IPCResponse<User> = {
  success: true,
  data: { id: "1", name: "John", email: "john@example.com" },
};
```

## Benefits

- Type safety across processes
- Better IDE autocomplete
- Catch errors at compile time
- Self-documenting interfaces
- Easier refactoring

## Adding New Types

1. Create or update appropriate `.d.ts` file
2. Use clear, descriptive names
3. Add JSDoc comments
4. Export from `index.ts`
5. Update this README

## Naming Conventions

- Interfaces: `PascalCase`
- Types: `PascalCase`
- Enums: `PascalCase`
- File names: `category.d.ts`

## Legacy Types

The original `types.ts` file is maintained for backward compatibility and is re-exported through `index.ts`.
