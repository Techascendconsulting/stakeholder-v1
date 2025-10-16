#!/bin/bash

# Stakeholder App Restore Script
# This script restores the app to the backed-up state

echo "🔄 Restoring Stakeholder App from backup..."

# Get the backup directory (this script's location)
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Go to the app root directory (parent of backup)
APP_ROOT="$(dirname "$BACKUP_DIR")"
cd "$APP_ROOT"

echo "📁 Backup directory: $BACKUP_DIR"
echo "📁 App root: $APP_ROOT"

# Restore source code
echo "📦 Restoring source code..."
rm -rf src/
cp -r "$BACKUP_DIR/src/" .

# Restore public files (including process documents)
echo "📄 Restoring public files..."
rm -rf public/
cp -r "$BACKUP_DIR/public/" .

# Restore configuration files
echo "⚙️ Restoring configuration files..."
cp "$BACKUP_DIR/package.json" .
cp "$BACKUP_DIR/package-lock.json" .
cp "$BACKUP_DIR/tsconfig.json" .
cp "$BACKUP_DIR/vite.config.ts" .
cp "$BACKUP_DIR/tailwind.config.js" .

echo "✅ Restore complete!"
echo "🚀 You can now run: npm install && npm run dev"

# Optional: Install dependencies
read -p "🤔 Do you want to install dependencies now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
fi

echo "🎉 App restored successfully!"
echo "📖 Check BACKUP_SUMMARY.md for details about what was restored."



















