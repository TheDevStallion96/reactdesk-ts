# Code Quality Setup

This project has been configured with ESLint, Prettier, Husky, and EditorConfig to enforce consistent code quality and formatting.

## Tools Installed

### ESLint

- **Version**: 9.x (Flat Config)
- **Plugins**:
  - `@typescript-eslint/eslint-plugin` - TypeScript linting
  - `eslint-plugin-react` - React best practices
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `eslint-plugin-prettier` - Prettier integration

### Prettier

- Automatic code formatting
- Integrated with ESLint via `eslint-plugin-prettier`

### Husky

- Git hooks automation
- Pre-commit hook configured to run linting and formatting

### lint-staged

- Runs linters only on staged files
- Improves performance by not linting the entire codebase

## Configuration Files

### `.eslintrc.js` → `eslint.config.mjs`

ESLint flat config with:

- `eslint:recommended` rules
- `plugin:@typescript-eslint/recommended` for TypeScript
- `plugin:react/recommended` for React
- `plugin:react-hooks/recommended` for React Hooks
- Custom rules for this project

### `.prettierrc`

Prettier configuration:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### `.editorconfig`

Editor configuration for consistent settings across IDEs:

- UTF-8 encoding
- LF line endings
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

### `.husky/pre-commit`

Pre-commit hook that runs `lint-staged` to:

1. Lint staged TypeScript/JavaScript files with ESLint
2. Format staged files with Prettier
3. Prevent commits if there are linting errors

## Available Scripts

### Linting

```bash
# Run ESLint on all files
npm run lint

# Run ESLint and auto-fix issues
npm run lint:fix
```

### Formatting

```bash
# Format all files with Prettier
npm run format

# Check if files are properly formatted (no changes)
npm run format:check
```

### Build

```bash
# Build the entire project (runs lint automatically via git hooks)
npm run build
```

## How It Works

### Pre-commit Hook

When you commit code:

1. Husky intercepts the commit
2. `lint-staged` identifies staged files
3. ESLint runs on staged `.ts`, `.tsx`, `.js`, `.jsx` files
4. Prettier formats staged files
5. If any errors exist, the commit is blocked
6. If all checks pass, the commit proceeds

### Configuration Highlights

#### ESLint Rules

- **TypeScript**: Warns on explicit `any`, enforces type safety
- **React**: No need for `React` import in JSX (React 18+)
- **Code Quality**: Enforces `const` over `let`, `===` over `==`
- **Console**: Allows `console.warn` and `console.error`, warns on `console.log`

#### Environment-Specific Rules

- **Main Process** (`src/main/**`): Node.js globals, allows all console methods
- **Renderer Process** (`src/renderer/**`): Browser globals
- **Tests** (`tests/**`, `**/*.test.ts`): Jest globals, relaxed `any` rules

## Troubleshooting

### ESLint Errors on Commit

If you see linting errors when committing:

```bash
# Run lint:fix to auto-fix issues
npm run lint:fix

# Manually fix remaining issues
# Then stage and commit again
```

### Prettier Conflicts

If you have editor formatting that conflicts with Prettier:

```bash
# Format all files to match Prettier config
npm run format

# Then commit
```

### Skip Hooks (Not Recommended)

Only use in emergencies:

```bash
git commit --no-verify -m "emergency fix"
```

## IDE Integration

### VS Code

Install recommended extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **EditorConfig** (`editorconfig.editorconfig`)

Settings will be automatically picked up from the config files.

### Other IDEs

Most modern IDEs support EditorConfig, ESLint, and Prettier. Check your IDE's documentation for plugin installation.

## Benefits

1. **Consistency**: All developers follow the same code style
2. **Quality**: Catches common errors before they reach production
3. **Automation**: No manual formatting needed
4. **Fast Feedback**: Issues caught at commit time, not in CI/CD
5. **Type Safety**: TypeScript rules enforce better typing practices

## Customization

To modify linting rules, edit `eslint.config.mjs`:

```javascript
rules: {
  // Add or override rules here
  'no-console': 'off',  // Example: allow console statements
}
```

To modify formatting, edit `.prettierrc`:

```json
{
  "printWidth": 120 // Example: allow longer lines
}
```

## Learn More

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [EditorConfig](https://editorconfig.org/)
