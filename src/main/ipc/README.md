# Main Process IPC

This directory contains IPC (Inter-Process Communication) handlers and utilities for the Electron main process.

## Files

- **handlers.ts** - IPC handler registration and implementation
  - Defines all IPC handlers that respond to renderer requests
  - Handles app-level operations, data processing, etc.
- **events.ts** - Event emitters for main-to-renderer communication
  - Utilities for sending messages from main to renderer processes
  - Broadcasting capabilities for multiple windows

## Usage

Import and register handlers in `main.ts`:

```typescript
import { registerIPCHandlers } from "./ipc/handlers";

app.whenReady().then(() => {
  registerIPCHandlers();
  // ... rest of app initialization
});
```

## Security Considerations

- Always validate input data in handlers
- Use typed interfaces for request/response data
- Avoid exposing sensitive system APIs directly
- Implement proper error handling
