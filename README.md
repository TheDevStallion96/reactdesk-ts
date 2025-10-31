# ReactDesk TypeScript

An Electron desktop application built with React 18+, TypeScript, and Vite.

## Features

- ⚡ **Vite** - Lightning-fast HMR and build tool
- ⚛️ **React 18+** - Modern React with hooks
- 📘 **TypeScript** - Strict type checking
- 🔒 **Secure** - Context isolation and preload scripts
- 🎨 **Modern UI** - Clean, responsive design

## Project Structure

```
reactdesk-ts/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Main entry point
│   │   └── preload.ts  # Preload script
│   ├── renderer/       # React frontend
│   │   ├── App.tsx     # Main React component
│   │   ├── main.tsx    # React entry point
│   │   ├── index.html  # HTML template
│   │   └── styles.css  # Global styles
│   └── shared/         # Shared types and utilities
├── dist/               # Build output
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # Base TypeScript config
├── tsconfig.main.json  # Main process TS config
└── tsconfig.renderer.json  # Renderer process TS config
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

This will:

1. Build the main process
2. Start the Vite dev server on port 5173
3. Launch Electron with auto-reload

### Building

Build the application for production:

```bash
npm run build
```

Then run the built application:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development mode with HMR
- `npm run build` - Build both main and renderer processes
- `npm run build:main` - Build only the main process
- `npm run build:renderer` - Build only the renderer process
- `npm start` - Start the built application
- `npm run preview` - Preview the Vite build

## Configuration

### TypeScript

- **tsconfig.json** - Base configuration with strict mode
- **tsconfig.main.json** - Main process (Node.js environment)
- **tsconfig.renderer.json** - Renderer process (DOM + React)

### Vite

The Vite configuration (`vite.config.ts`) is set up for Electron integration:

- Outputs to `dist/renderer/`
- Uses relative paths for asset loading
- Includes path aliases (`@`, `@renderer`, `@shared`)
- Dev server on port 5173

## License

ISC
