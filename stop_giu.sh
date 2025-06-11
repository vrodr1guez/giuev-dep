#!/bin/bash

# 🛑 GIU EV Charging Infrastructure - Stop Script
# Cleanly stops all running services

echo "🛑 Stopping GIU EV Charging Infrastructure Platform..."

# Kill processes on known ports
echo "📍 Stopping services on default ports..."

# Stop backend (port 8000)
echo "   🐍 Stopping Python backend (port 8000)..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Stop frontend (ports 3000-3003)
for port in 3000 3001 3002 3003; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   ⚛️  Stopping frontend service (port $port)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

# Clean up any remaining uvicorn processes
pkill -f "uvicorn app.main:app" 2>/dev/null || true

# Clean up any remaining npm/node processes related to this project
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

echo "✅ GIU Platform services stopped successfully"
echo "🔄 To restart, run: ./start_giu.sh" 