# Project Structure Documentation

This document describes the modular folder structure of the ReactDesk TypeScript project.

## Overview

The project is organized into three main sections:

- **main/** - Electron main process code
- **renderer/** - React application code
- **shared/** - Code and types shared between processes

## Directory Structure

```
src/
├── main/
│   ├── main.ts           # Main process entry point
│   ├── preload.ts        # Preload script for secure IPC
│   ├── index.ts          # Main process initialization
│   └── ipc/              # IPC handlers and events
│       ├── handlers.ts   # IPC request handlers
│       ├── events.ts     # Main-to-renderer events
│       └── README.md     # IPC documentation
│
├── renderer/
│   ├── main.tsx          # Renderer entry point
│   ├── App.tsx           # Root App component
│   ├── index.html        # HTML template
│   ├── renderer.ts       # Renderer initialization
│   ├── vite-env.d.ts     # Vite type definitions
│   │
│   ├── components/       # Reusable React components
│   │   ├── Button.tsx    # Example button component
│   │   ├── index.ts      # Component exports
│   │   └── README.md     # Components documentation
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useIPC.ts     # IPC communication hook
│   │   ├── useAppVersion.ts  # Version fetching hook
│   │   ├── index.ts      # Hook exports
│   │   └── README.md     # Hooks documentation
│   │
│   ├── pages/            # Page components (routes)
│   │   ├── HomePage.tsx  # Main page component
│   │   ├── index.ts      # Page exports
│   │   └── README.md     # Pages documentation
│   │
│   ├── styles/           # CSS stylesheets
│   │   ├── global.css    # Global styles
│   │   ├── components.css # Component styles
│   │   ├── styles.css    # Legacy styles
│   │   └── README.md     # Styles documentation
│   │
│   └── utils/            # Utility functions
│       ├── format.ts     # Formatting utilities
│       ├── index.ts      # Utility exports
│       └── README.md     # Utils documentation
│
└── shared/               # Shared code between processes
    ├── types.ts          # Legacy type definitions
    │
    ├── constants/        # Application constants
    │   ├── app.ts        # App-level constants
    │   ├── ipc.ts        # IPC channel constants
    │   ├── index.ts      # Constants exports
    │   └── README.md     # Constants documentation
    │
    └── types/            # Type definitions
        ├── app.d.ts      # Application types
        ├── electron.d.ts # Electron API types
        ├── ipc.d.ts      # IPC message types
        ├── index.ts      # Type exports
        └── README.md     # Types documentation
```

## Design Principles

### 1. **Separation of Concerns**

Each directory has a specific purpose and contains related code only.

### 2. **Modular Organization**

Code is organized by feature/function, making it easy to find and maintain.

### 3. **Clear Boundaries**

- `main/` contains Electron main process code
- `renderer/` contains React UI code
- `shared/` contains code used by both processes

### 4. **Index Exports**

Each directory with multiple files has an `index.ts` that exports everything, allowing clean imports:

```typescript
import { Button, Card } from "@/renderer/components";
import { useIPC, useAppVersion } from "@/renderer/hooks";
```

### 5. **Documentation**

Every major directory includes a README.md explaining its purpose and usage.

### 6. **Type Safety**

TypeScript types are centralized in `shared/types/` and shared across processes.

### 7. **Constants Management**

Magic strings are replaced with constants from `shared/constants/`.

## Import Patterns

### Component Imports

```typescript
import { Button } from "@/renderer/components";
import { HomePage } from "@/renderer/pages";
```

### Hook Imports

```typescript
import { useIPC, useAppVersion } from "@/renderer/hooks";
```

### Type Imports

```typescript
import type { IPCResponse, User } from "@/shared/types";
```

### Constant Imports

```typescript
import { APP_NAME, IPC_CHANNELS } from "@/shared/constants";
```

### Utility Imports

```typescript
import { formatDate, formatFileSize } from "@/renderer/utils";
```

## Adding New Code

### New Component

1. Create `src/renderer/components/ComponentName.tsx`
2. Export from `src/renderer/components/index.ts`
3. Update components README

### New Hook

1. Create `src/renderer/hooks/useHookName.ts`
2. Export from `src/renderer/hooks/index.ts`
3. Update hooks README

### New Page

1. Create `src/renderer/pages/PageName.tsx`
2. Export from `src/renderer/pages/index.ts`
3. Update pages README

### New Type

1. Add to appropriate file in `src/shared/types/`
2. Export from `src/shared/types/index.ts`
3. Update types README

### New IPC Handler

1. Add handler in `src/main/ipc/handlers.ts`
2. Add channel constant in `src/shared/constants/ipc.ts`
3. Add types in `src/shared/types/ipc.d.ts`

## Benefits of This Structure

✅ **Maintainability** - Easy to find and update code
✅ **Scalability** - Structure supports project growth
✅ **Readability** - Clear organization and documentation
✅ **Type Safety** - Centralized type definitions
✅ **Reusability** - Modular components and utilities
✅ **Collaboration** - Easy for teams to work together
✅ **Testing** - Clear boundaries for unit tests

## Migration Notes

The original `src/shared/types.ts` is preserved for backward compatibility. New types should be added to the appropriate file in `src/shared/types/`, and the legacy file will eventually be deprecated.

## Future Enhancements

Consider adding:

- `renderer/context/` - React context providers
- `renderer/store/` - State management (Redux, Zustand, etc.)
- `renderer/services/` - API and service layer
- `main/services/` - Backend services
- `main/utils/` - Main process utilities
- `tests/` directories alongside source files
