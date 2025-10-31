#!/bin/bash

# Electron Security Demo Script
# This script demonstrates the security features of the application

echo "🔒 Electron Security Features Demo"
echo "=================================="
echo ""

# Check if build exists
if [ ! -f "dist/main/main.js" ]; then
  echo "📦 Building main process..."
  npm run build:main
  echo ""
fi

echo "✅ Security Features Enabled:"
echo ""
echo "  1. nodeIntegration: false"
echo "     → Renderer cannot use Node.js APIs directly"
echo ""
echo "  2. contextIsolation: true"
echo "     → Preload script runs in isolated context"
echo ""
echo "  3. sandbox: true"
echo "     → Renderer runs in OS-level sandbox"
echo ""
echo "  4. contextBridge API"
echo "     → Only specific functions exposed to renderer"
echo ""
echo "  5. Content Security Policy"
echo "     → Restricts resource loading and script execution"
echo ""
echo "  6. Navigation Protection"
echo "     → Prevents navigation to external URLs"
echo ""
echo "  7. Input Validation"
echo "     → All IPC data is validated in preload and main"
echo ""
echo "  8. No eval()"
echo "     → eval() is disabled to prevent code injection"
echo ""

echo "🚀 Starting application in development mode..."
echo ""
echo "Try these security features in the app:"
echo "  • Click 'Send Ping' - Demonstrates secure IPC"
echo "  • Click 'Process Data' - Shows input validation"
echo "  • Click 'Open Text File' - Native file dialog (user consent)"
echo "  • Check DevTools Console for security logs"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start the application
npm run dev
