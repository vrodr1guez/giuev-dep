#!/bin/bash

# 🚀 GIU EV Charging Infrastructure - Comprehensive Website Analysis
# Tests all endpoints, frontend pages, and identifies 404 errors

echo "🌐 GIU EV CHARGING INFRASTRUCTURE - COMPREHENSIVE WEBSITE ANALYSIS"
echo "=================================================================="
echo

BASE_URL="http://localhost:8000"
FRONTEND_URLS=("http://localhost:3000" "http://localhost:3001" "http://localhost:3002")
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
declare -a failed_endpoints=()
declare -a working_endpoints=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing $name... "
    ((TOTAL_TESTS++))
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url" --max-time 10)
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $status_code${NC}"
        ((PASSED_TESTS++))
        working_endpoints+=("$name: $url")
    else
        echo -e "${RED}❌ $status_code${NC}"
        ((FAILED_TESTS++))
        failed_endpoints+=("$name: $url (Expected: $expected_status, Got: $status_code)")
        
        # Show error details for 404s and 500s
        if [ "$status_code" = "404" ] || [ "$status_code" = "500" ]; then
            echo "   Error details: $(cat /tmp/response.json 2>/dev/null | head -c 200)..."
        fi
    fi
}

echo -e "${CYAN}🔍 BACKEND API ANALYSIS${NC}"
echo "================================"

# Core API endpoints
test_endpoint "System Health" "$BASE_URL/health"
test_endpoint "System Root" "$BASE_URL/"
test_endpoint "API Documentation" "$BASE_URL/docs"
test_endpoint "OpenAPI Schema" "$BASE_URL/openapi.json"
test_endpoint "Metrics" "$BASE_URL/metrics"

echo
echo -e "${CYAN}⚡ CHARGING INFRASTRUCTURE ENDPOINTS${NC}"
echo "================================"

test_endpoint "Demo Charging Stations" "$BASE_URL/api/v1/charging-stations/demo"
test_endpoint "Charging Schedules Demo" "$BASE_URL/api/v1/charging-schedules/demo/schedules"
test_endpoint "Fleet Schedule" "$BASE_URL/api/v1/charging-schedules/fleet/demo_fleet/schedule"

echo
echo -e "${CYAN}💰 GRID PARTNERSHIPS ENDPOINTS${NC}"
echo "================================"

test_endpoint "Grid Partnerships Demo" "$BASE_URL/api/v1/grid-partnerships/demo/partnerships"
test_endpoint "V2G Energy Flow" "$BASE_URL/api/v1/grid-partnerships/v2g/energy-flow"
test_endpoint "Market Opportunities" "$BASE_URL/api/v1/grid-partnerships/market-opportunities"

echo
echo -e "${CYAN}🤖 ENHANCED FEDERATED LEARNING ENDPOINTS${NC}"
echo "================================"

test_endpoint "FL 2.0+ Status" "$BASE_URL/api/v1/federated-learning-plus/status"
test_endpoint "Quantum Aggregation" "$BASE_URL/api/v1/federated-learning-plus/quantum/aggregation-demo"
test_endpoint "Performance Benchmarks" "$BASE_URL/api/v1/federated-learning-plus/performance/benchmarks"
test_endpoint "Cross-Fleet Intelligence" "$BASE_URL/api/v1/federated-learning-plus/cross-fleet/intelligence-demo"

echo
echo -e "${CYAN}🛡️ SECURITY & MONITORING ENDPOINTS${NC}"
echo "================================"

test_endpoint "Security Monitoring" "$BASE_URL/api/security-monitoring/health"

echo
echo -e "${CYAN}🌐 FRONTEND ANALYSIS${NC}"
echo "================================"

# Check which frontend port is active
ACTIVE_FRONTEND=""
for url in "${FRONTEND_URLS[@]}"; do
    echo -n "Checking frontend at $url... "
    response=$(curl -s -w "%{http_code}" -o /dev/null "$url" --max-time 5)
    if [ "${response: -3}" = "200" ]; then
        echo -e "${GREEN}✅ Active${NC}"
        ACTIVE_FRONTEND="$url"
        break
    else
        echo -e "${RED}❌ Not responding${NC}"
    fi
done

if [ -n "$ACTIVE_FRONTEND" ]; then
    echo
    echo "Found active frontend at: $ACTIVE_FRONTEND"
    
    # Test frontend pages
    test_endpoint "Frontend Home" "$ACTIVE_FRONTEND"
    test_endpoint "Frontend EV Management" "$ACTIVE_FRONTEND/ev-management"
    test_endpoint "Frontend API Docs" "$ACTIVE_FRONTEND/api-docs"
    
    # Test if frontend can reach backend
    echo
    echo -e "${CYAN}🔄 FRONTEND-BACKEND INTEGRATION${NC}"
    echo "================================"
    
    # Test CORS from frontend origin
    echo -n "Testing CORS from frontend... "
    cors_response=$(curl -s -H "Origin: $ACTIVE_FRONTEND" -I "$BASE_URL/health" --max-time 5)
    if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✅ CORS Working${NC}"
    else
        echo -e "${YELLOW}⚠️  CORS Headers Missing${NC}"
    fi
else
    echo -e "${RED}❌ No active frontend found on any port${NC}"
    ((FAILED_TESTS++))
    failed_endpoints+=("Frontend: No active frontend server found")
fi

echo
echo -e "${CYAN}🔍 SPECIFIC ENDPOINT ANALYSIS${NC}"
echo "================================"

# Test POST endpoints
echo -n "Testing POST Schedule Optimization... "
post_response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/v1/charging-schedules/optimize?fleet_size=5" --max-time 10)
post_status="${post_response: -3}"
if [ "$post_status" = "200" ]; then
    echo -e "${GREEN}✅ $post_status${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ $post_status${NC}"
    ((FAILED_TESTS++))
    failed_endpoints+=("POST Schedule Optimization: Expected 200, Got $post_status")
fi
((TOTAL_TESTS++))

echo -n "Testing POST Revenue Forecast... "
forecast_response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/v1/grid-partnerships/partnerships/revenue-forecast?partnership_id=pgne-01" --max-time 10)
forecast_status="${forecast_response: -3}"
if [ "$forecast_status" = "200" ]; then
    echo -e "${GREEN}✅ $forecast_status${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ $forecast_status${NC}"
    ((FAILED_TESTS++))
    failed_endpoints+=("POST Revenue Forecast: Expected 200, Got $forecast_status")
fi
((TOTAL_TESTS++))

echo
echo -e "${PURPLE}📊 WEBSITE ANALYSIS RESULTS${NC}"
echo "================================"
echo -e "✅ ${GREEN}Working Endpoints: $PASSED_TESTS${NC}"
echo -e "❌ ${RED}Failed Endpoints: $FAILED_TESTS${NC}"
echo -e "📊 ${BLUE}Total Tested: $TOTAL_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    echo -e "📈 ${YELLOW}Success Rate: ${success_rate}%${NC}"
else
    success_rate=0
fi

echo
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}❌ FAILED ENDPOINTS:${NC}"
    for endpoint in "${failed_endpoints[@]}"; do
        echo "   • $endpoint"
    done
    echo
fi

echo -e "${GREEN}✅ WORKING ENDPOINTS:${NC}"
for endpoint in "${working_endpoints[@]}"; do
    echo "   • $endpoint"
done

echo
echo -e "${PURPLE}🎯 WEBSITE STATUS ASSESSMENT${NC}"
echo "================================"

if [ $success_rate -ge 95 ]; then
    echo -e "${GREEN}🎉 EXCELLENT: Website is fully functional (${success_rate}% success)${NC}"
    echo -e "${GREEN}✅ All critical features working${NC}"
    echo -e "${GREEN}✅ Ready for production use${NC}"
elif [ $success_rate -ge 85 ]; then
    echo -e "${YELLOW}⚠️  GOOD: Website mostly functional (${success_rate}% success)${NC}"
    echo -e "${YELLOW}📝 Minor issues to address${NC}"
elif [ $success_rate -ge 70 ]; then
    echo -e "${YELLOW}⚠️  MODERATE: Website has some issues (${success_rate}% success)${NC}"
    echo -e "${YELLOW}🔧 Several endpoints need attention${NC}"
else
    echo -e "${RED}🚨 CRITICAL: Website has major issues (${success_rate}% success)${NC}"
    echo -e "${RED}🔧 Significant fixes needed${NC}"
fi

echo
echo -e "${BLUE}🌐 RECOMMENDED ACTIONS:${NC}"
if [ $FAILED_TESTS -eq 0 ]; then
    echo "• ✅ Website is production-ready"
    echo "• 🚀 Deploy to production environment"
    echo "• 📊 Monitor performance metrics"
elif [ $FAILED_TESTS -le 3 ]; then
    echo "• 🔧 Fix the $FAILED_TESTS failed endpoint(s)"
    echo "• ✅ Re-test after fixes"
    echo "• 🚀 Deploy once all tests pass"
else
    echo "• 🚨 Investigate major system issues"
    echo "• 🔧 Fix critical endpoints first"
    echo "• 📋 Review logs for error details"
fi

echo
echo -e "${BLUE}🚀 SYSTEM ACCESS POINTS:${NC}"
echo "• Backend API: $BASE_URL"
echo "• API Documentation: $BASE_URL/docs"
echo "• Frontend: $ACTIVE_FRONTEND"
echo "• Health Check: $BASE_URL/health"

# Cleanup
rm -f /tmp/response.json

if [ $success_rate -ge 85 ]; then
    exit 0
else
    exit 1
fi 