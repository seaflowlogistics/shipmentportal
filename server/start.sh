#!/bin/bash

# Shipment Portal - Backend Server Startup Script

echo "🚀 Starting Shipment Portal Backend Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create server/.env with your database credentials"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Starting server on port 5000..."
echo ""
npm run dev
