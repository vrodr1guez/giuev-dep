#!/bin/bash

# 🚀 GIU EV Charging Infrastructure - Automated Startup Script
# This script handles all environment setup and service startup

echo "🚀 Starting GIU EV Charging Infrastructure Platform..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📍 Working directory: $SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "ev_charging_env" ]; then
    echo "❌ Virtual environment not found. Creating..."
    python3 -m venv ev_charging_env
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating Python virtual environment..."
source ev_charging_env/bin/activate

# Check if activation was successful
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
fi

echo "✅ Virtual environment activated: $VIRTUAL_ENV"

# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
echo "✅ Python path set: $PYTHONPATH"

# Install/update dependencies if requirements.txt has changed
if [ requirements.txt -nt ev_charging_env/pyvenv.cfg ]; then
    echo "📦 Installing/updating Python dependencies..."
    pip install -r requirements.txt
fi

# Check if Node.js dependencies need to be installed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules/.package-lock.json ]; then
    echo "📦 Installing/updating Node.js dependencies..."
    npm install
fi

# Start the backend server in the background
echo "🐍 Starting Python backend server..."
python -m uvicorn app.main:app --host localhost --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start the frontend server in the background
echo "⚛️  Starting React frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend server started successfully (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 GIU EV Charging Infrastructure Platform is now running!"
echo ""
echo "📍 Available Services:"
echo "   🌐 Frontend Dashboard: http://localhost:3000"
echo "   🔌 Backend API: http://localhost:8000"
echo "   📚 API Documentation: http://localhost:8000/docs"
echo "   💊 Health Check: http://localhost:8000/health"
echo "   🧠 ML Dashboard: http://localhost:3000/ml-dashboard"
echo "   🎮 3D Digital Twin Demo: http://localhost:3000/3d-digital-twin-demo"
echo ""
echo "🛑 To stop the servers, press Ctrl+C or run: ./stop_giu.sh"

# Function to handle shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down GIU Platform..."
    echo "   Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    echo "   Stopping frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    
    # Wait for processes to terminate
    sleep 2
    
    # Force kill if still running
    kill -9 $BACKEND_PID 2>/dev/null
    kill -9 $FRONTEND_PID 2>/dev/null
    
    echo "✅ Platform shutdown complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running and monitor the processes
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server stopped unexpectedly"
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend server stopped unexpectedly"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    sleep 10
done 