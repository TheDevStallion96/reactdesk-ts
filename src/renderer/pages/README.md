# Application Pages

This directory contains top-level page components that represent different views/routes in the application.

## Organization

Pages are:

- High-level components that compose smaller components
- Represent distinct views or routes
- May manage page-level state
- Exported via `index.ts`

## Current Pages

- **HomePage** - Main landing page with IPC demo

## Usage

```typescript
import { HomePage } from "@/renderer/pages";

<HomePage />;
```

## Adding New Pages

1. Create a new file: `PageName.tsx`
2. Implement the page component
3. Add proper documentation
4. Export from `index.ts`
5. Update routing if applicable
