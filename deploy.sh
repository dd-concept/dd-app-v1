#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process for Telegram Mini App...${NC}"

# Step 1: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Check if crypto-js is installed
if ! npm list crypto-js > /dev/null 2>&1; then
  echo -e "${YELLOW}Installing crypto-js for initData validation...${NC}"
  npm install crypto-js @types/crypto-js
fi

# Step 2: Build the app
echo -e "${YELLOW}Building the app...${NC}"
npm run build

# Step 3: Deploy to GitHub Pages
echo -e "${YELLOW}Deploying to GitHub Pages...${NC}"
npm run deploy

# Step 4: Start the Telegram bot and API server
echo -e "${YELLOW}Starting Telegram bot and API server...${NC}"
cd telegram_bot

# Check if the combined.js file exists
if [ -f "combined.js" ]; then
  # Kill any existing node processes
  echo -e "${YELLOW}Stopping any existing bot processes...${NC}"
  pkill -f "node.*combined.js" || true
  
  # Start the combined bot and API server
  echo -e "${GREEN}Starting combined bot and API server...${NC}"
  node combined.js &
  
  echo -e "${GREEN}Deployment complete! Bot and API server are running.${NC}"
  echo -e "${GREEN}Your Mini App should now be properly configured.${NC}"
else
  echo -e "${RED}Error: combined.js file not found in telegram_bot directory.${NC}"
  echo -e "${RED}Please make sure the file exists before running this script.${NC}"
  exit 1
fi 