#!/bin/bash

# Refresh Vite Dependencies Script
# Use this script when you add new dependencies and encounter cache issues

echo "🔄 Refreshing Vite dependencies..."

# Stop any running dev server
echo "⏹️  Stopping development server..."
pkill -f "vite"

# Clean Vite cache
echo "🧹 Cleaning Vite cache..."
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies to ensure they're fresh
echo "📦 Reinstalling dependencies..."
npm install

# Start fresh dev server
echo "🚀 Starting fresh development server..."
npm run dev

echo "✅ Dependencies refreshed! Check your browser."