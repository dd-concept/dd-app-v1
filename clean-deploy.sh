#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting clean deployment process for GitHub Pages...${NC}"

# Make sure .gitmodules exists and is empty to prevent Git from looking for missing submodules
echo -e "${YELLOW}Ensuring .gitmodules file is properly set up...${NC}"
echo "# This file intentionally left empty" > .gitmodules
echo "# It is used to override any automatic submodule detection by Git" >> .gitmodules
echo "# Deployment issues were previously caused by directories being mistakenly treated as submodules" >> .gitmodules

# Remove problematic reference directories that are causing submodule errors
echo -e "${YELLOW}Removing problematic reference directories...${NC}"
rm -rf reference_repo reference_shop

# Step 1: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Step 2: Build the app
echo -e "${YELLOW}Building the app...${NC}"
npm run build

# Step 3: Make sure the 404.html is copied to dist
echo -e "${YELLOW}Copying 404.html to dist folder...${NC}"
cp public/404.html dist/

# Step 4: Clean deploy using gh-pages with specific options
echo -e "${YELLOW}Deploying to GitHub Pages with clean options...${NC}"
npx gh-pages -d dist -b gh-pages -m "Deploy to GitHub Pages [clean]" --add -t

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Your site should be available at https://d4nes1337.github.io/dd-app-v1/${NC}" 