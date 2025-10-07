#!/bin/bash

###############################################################################
# Local Performance & UI Testing Suite
###############################################################################
# 
# This script runs a complete local test suite including:
#   - Production build
#   - Lighthouse performance audit
#   - Playwright UI/performance tests
#   - Load testing with autocannon
#
# Usage:
#   bash tests/run-local-tests.sh
#
# Requirements:
#   - Node.js installed
#   - Dependencies installed (npm install)
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PREVIEW_PORT=4173
PREVIEW_URL="http://localhost:${PREVIEW_PORT}"
LIGHTHOUSE_REPORT="tests/lighthouse-report.html"
LIGHTHOUSE_JSON="tests/lighthouse-report.json"

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Local Performance & UI Testing Suite                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Step 1: Clean up any existing preview servers
echo -e "${YELLOW}🧹 Cleaning up existing servers...${NC}"
pkill -f "vite preview" || true
sleep 2

# Step 2: Build the application
echo -e "\n${BLUE}📦 Building production bundle...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Exiting.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Step 3: Start preview server in background
echo -e "\n${BLUE}🚀 Starting preview server on port ${PREVIEW_PORT}...${NC}"
npm run preview &
PREVIEW_PID=$!

echo -e "${CYAN}Preview server PID: ${PREVIEW_PID}${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    kill $PREVIEW_PID 2>/dev/null || true
    pkill -f "vite preview" || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Register cleanup function to run on script exit
trap cleanup EXIT INT TERM

# Step 4: Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s "$PREVIEW_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
    echo -n "."
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Server failed to start within 30 seconds${NC}"
    exit 1
fi

echo -e "\n"

# Step 5: Run Lighthouse audit
echo -e "${BLUE}🔍 Running Lighthouse performance audit...${NC}"
npx lighthouse "$PREVIEW_URL" \
    --output=html \
    --output=json \
    --output-path="$LIGHTHOUSE_REPORT" \
    --chrome-flags="--headless" \
    --quiet \
    --no-enable-error-reporting

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Lighthouse audit complete${NC}"
    echo -e "${CYAN}📄 Report saved to: ${LIGHTHOUSE_REPORT}${NC}"
else
    echo -e "${YELLOW}⚠️  Lighthouse audit encountered issues${NC}"
fi

# Step 6: Run Playwright tests
echo -e "\n${BLUE}🎭 Running Playwright tests...${NC}"
npx playwright test --reporter=list

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Playwright tests passed${NC}"
else
    echo -e "${RED}❌ Playwright tests failed${NC}"
fi

# Step 7: Run autocannon load test
echo -e "\n${BLUE}⚡ Running autocannon load test (10 seconds)...${NC}"
npx autocannon -d 10 -c 10 "$PREVIEW_URL" > tests/autocannon-results.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Load test complete${NC}"
else
    echo -e "${YELLOW}⚠️  Load test encountered issues${NC}"
fi

# Step 8: Display summary
echo -e "\n${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    TEST RESULTS SUMMARY                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Extract Lighthouse scores
if [ -f "$LIGHTHOUSE_JSON" ]; then
    echo -e "${BLUE}📊 Lighthouse Performance Scores:${NC}"
    
    # Extract scores using grep and basic text processing
    PERF_SCORE=$(grep -o '"performance":[0-9.]*' "$LIGHTHOUSE_JSON" | grep -o '[0-9.]*' | head -1)
    ACCESS_SCORE=$(grep -o '"accessibility":[0-9.]*' "$LIGHTHOUSE_JSON" | grep -o '[0-9.]*' | head -1)
    BEST_SCORE=$(grep -o '"best-practices":[0-9.]*' "$LIGHTHOUSE_JSON" | grep -o '[0-9.]*' | head -1)
    SEO_SCORE=$(grep -o '"seo":[0-9.]*' "$LIGHTHOUSE_JSON" | grep -o '[0-9.]*' | head -1)
    
    if [ ! -z "$PERF_SCORE" ]; then
        PERF_PERCENT=$(echo "$PERF_SCORE * 100" | bc -l | cut -d. -f1)
        echo -e "  ${GREEN}Performance:     ${PERF_PERCENT}%${NC}"
    fi
    
    if [ ! -z "$ACCESS_SCORE" ]; then
        ACCESS_PERCENT=$(echo "$ACCESS_SCORE * 100" | bc -l | cut -d. -f1)
        echo -e "  ${GREEN}Accessibility:   ${ACCESS_PERCENT}%${NC}"
    fi
    
    if [ ! -z "$BEST_SCORE" ]; then
        BEST_PERCENT=$(echo "$BEST_SCORE * 100" | bc -l | cut -d. -f1)
        echo -e "  ${GREEN}Best Practices:  ${BEST_PERCENT}%${NC}"
    fi
    
    if [ ! -z "$SEO_SCORE" ]; then
        SEO_PERCENT=$(echo "$SEO_SCORE * 100" | bc -l | cut -d. -f1)
        echo -e "  ${GREEN}SEO:             ${SEO_PERCENT}%${NC}"
    fi
    
    echo -e "\n${CYAN}📄 Full Lighthouse report: ${LIGHTHOUSE_REPORT}${NC}"
fi

# Display autocannon results
if [ -f "tests/autocannon-results.txt" ]; then
    echo -e "\n${BLUE}⚡ Load Test Results:${NC}"
    
    # Extract key metrics from autocannon output
    grep "Req/Sec" tests/autocannon-results.txt | head -1
    grep "Bytes/Sec" tests/autocannon-results.txt | head -1
    
    echo -e "\n${CYAN}📄 Full autocannon report: tests/autocannon-results.txt${NC}"
fi

# Playwright results are already displayed above

echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   TESTING COMPLETE! ✨                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

echo -e "${CYAN}💡 Tips:${NC}"
echo -e "  • Open ${LIGHTHOUSE_REPORT} in a browser for detailed insights"
echo -e "  • Check tests/autocannon-results.txt for full load test data"
echo -e "  • Run individual tests: npx playwright test --headed\n"

# Exit (cleanup will run automatically via trap)
exit 0

