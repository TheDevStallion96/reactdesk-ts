# Renderer Utilities

This directory contains utility functions and helpers for the renderer process.

## Organization

Utilities should be:

- Pure functions when possible
- Well-typed with TypeScript
- Properly documented
- Organized by category (format, validation, etc.)
- Exported via `index.ts`

## Current Utilities

- **format.ts** - Formatting utilities (dates, file sizes, numbers)

## Usage

```typescript
import { formatDate, formatFileSize } from '@/renderer/utils';

const dateStr = formatDate(new Date());
const sizeStr = formatFileSize(1024000);
```

## Adding New Utilities

1. Create a new file by category: `categoryName.ts`
2. Implement utility functions
3. Add proper TypeScript types
4. Add JSDoc documentation
5. Export from `index.ts`
6. Update this README

## Categories to Consider

- **format** - Data formatting utilities
- **validation** - Input validation helpers
- **storage** - Local storage helpers
- **dom** - DOM manipulation utilities
- **async** - Async operation helpers
