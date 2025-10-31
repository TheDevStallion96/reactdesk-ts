# Renderer Components

This directory contains all reusable React components for the application.

## Organization

Components should be:

- Self-contained and reusable
- Well-documented with JSDoc comments
- Type-safe using TypeScript interfaces
- Exported via `index.ts` for clean imports

## Example Component Structure

```typescript
/**
 * Component description
 */
interface ComponentProps {
  // props definition
}

export const Component: React.FC<ComponentProps> = (props) => {
  // implementation
};
```

## Usage

```typescript
import { Button, Card } from "@/renderer/components";

<Button variant="primary">Click me</Button>;
```

## Current Components

- **Button** - Reusable button with different variants (primary, secondary, danger)

Add more components here as the application grows.
