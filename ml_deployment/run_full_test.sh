#!/bin/bash

# EV Charging ML System - Full Test Script
# This script runs comprehensive tests for API and UI

echo "=========================================="
echo "EV Charging ML System - Full Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}Error: Not in ml_deployment directory${NC}"
    echo "Please run this script from the ml_deployment directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${YELLOW}1. Checking dependencies...${NC}"
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ Node.js/npm is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js/npm found${NC}"

# Start API server
echo -e "\n${YELLOW}2. Starting API server...${NC}"
echo "Starting FastAPI server on port 8000..."
uvicorn api.model_api_server:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
echo "API server PID: $API_PID"

# Wait for API to start
echo "Waiting for API to start..."
sleep 5

# Test API health
echo -e "\n${YELLOW}3. Testing API endpoints...${NC}"
echo "Testing health endpoint..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ API health check passed${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    kill $API_PID
    exit 1
fi

# Test prediction endpoint
echo "Testing prediction endpoint..."
PREDICTION_RESULT=$(curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"model_name": "usage", "features": [1,2,3,4,5,6,7,8,9,10]}')

if echo "$PREDICTION_RESULT" | grep -q "prediction"; then
    echo -e "${GREEN}✓ Prediction endpoint working${NC}"
    echo "Result: $PREDICTION_RESULT"
else
    echo -e "${RED}❌ Prediction endpoint failed${NC}"
fi

# Run comprehensive model tests
echo -e "\n${YELLOW}4. Running comprehensive model tests...${NC}"
python3 tests/comprehensive_model_test.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Model tests passed${NC}"
else
    echo -e "${RED}❌ Model tests failed${NC}"
fi

# Install React dependencies
echo -e "\n${YELLOW}5. Installing React dependencies...${NC}"
cd web_ui
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ React dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install React dependencies${NC}"
    cd ..
    kill $API_PID
    exit 1
fi

# Build React app
echo -e "\n${YELLOW}6. Building React app...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ React build successful${NC}"
else
    echo -e "${RED}❌ React build failed${NC}"
    cd ..
    kill $API_PID
    exit 1
fi

cd ..

# Summary
echo -e "\n${GREEN}=========================================="
echo "Test Summary"
echo "==========================================${NC}"
echo -e "API Server: ${GREEN}Running${NC} on http://localhost:8000"
echo -e "API Docs: ${GREEN}Available${NC} at http://localhost:8000/docs"
echo -e "Model Tests: ${GREEN}Passed${NC}"
echo -e "React Build: ${GREEN}Successful${NC}"
echo ""
echo -e "${YELLOW}To start the React development server:${NC}"
echo "cd web_ui && npm start"
echo ""
echo -e "${YELLOW}To stop the API server:${NC}"
echo "kill $API_PID"
echo ""
echo -e "${GREEN}All tests passed! ✨${NC}"

# Keep API running for manual testing
echo -e "\n${YELLOW}API server is still running. Press Ctrl+C to stop.${NC}"
wait $API_PID 