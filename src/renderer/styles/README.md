# Renderer Styles

This directory contains all CSS stylesheets for the application.

## Files

- **global.css** - Global styles, resets, and base styles
- **components.css** - Component-specific styles
- **styles.css** - Original legacy styles (will be migrated)

## Organization

Styles are organized by purpose:

- Global/base styles in `global.css`
- Component styles in `components.css`
- Utility classes can be added as needed

## Usage

Import styles in `main.tsx`:

```typescript
import './styles/global.css';
import './styles/components.css';
```

## Styling Approach

- Use semantic class names
- Keep styles modular and scoped
- Consider CSS modules for component-specific styles
- Use CSS custom properties for theming
- Follow BEM or similar naming convention

## Future Improvements

- Migrate to CSS modules
- Add theme support with CSS variables
- Consider CSS-in-JS if needed
- Add utility-first CSS framework (Tailwind) if desired
