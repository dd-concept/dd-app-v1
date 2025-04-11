#!/bin/bash

# This script performs a direct deployment to GitHub Pages without relying on Git submodules
# It's specifically designed to work around the submodule issues in the repository

# Exit immediately if a command exits with a non-zero status
set -e

# Extract the repository name from environment variables or arguments
if [ -z "$1" ]; then
  # Use GitHub repository if run in GitHub Actions
  REPO_URL="https://github.com/${GITHUB_REPOSITORY}.git"
  GITHUB_TOKEN="$GITHUB_TOKEN"
else
  # Use provided repository URL if run locally
  REPO_URL="$1"
  # No token for local runs
fi

echo "Starting direct deployment to GitHub Pages..."

# Create a clean temporary directory
TEMP_DIR=$(mktemp -d)
echo "Working in temporary directory: $TEMP_DIR"

# Get the original directory
ORIGINAL_DIR=$(pwd)

# Clone only the main branch, no submodules
echo "Cloning main branch without submodules..."
git clone --depth 1 --branch main --no-checkout --no-local $REPO_URL $TEMP_DIR/repo
cd $TEMP_DIR/repo

# Checkout only the necessary files for build (exclude problematic directories)
git config core.sparseCheckout true
echo "/*" > .git/info/sparse-checkout
echo "!/reference_repo/" >> .git/info/sparse-checkout
echo "!/reference_shop/" >> .git/info/sparse-checkout
git checkout main

# Create empty .gitmodules file
echo "# This file intentionally left empty" > .gitmodules

# Install dependencies and build the project
echo "Installing dependencies..."
npm ci

echo "Building the project..."
npm run build

# Copy 404.html to dist if it exists
if [ -f "public/404.html" ]; then
  echo "Copying 404.html to dist..."
  cp public/404.html dist/
else
  echo "Creating default 404.html in dist..."
  echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Page Not Found</title><script>window.location.href='/';</script></head><body><p>Redirecting...</p></body></html>" > dist/404.html
fi

# Create a new repository in the dist directory for gh-pages
echo "Preparing GitHub Pages branch..."
cd dist
git init
git config user.name "GitHub Actions"
git config user.email "actions@github.com"

# Create a new orphan branch
git checkout --orphan gh-pages

# Add all files in dist
git add .

# Commit changes
echo "Committing files to gh-pages branch..."
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
echo "Pushing to gh-pages branch..."
if [ -n "$GITHUB_TOKEN" ]; then
  # GitHub Actions deployment with token
  REPO_URL_WITH_TOKEN="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
  git remote add origin $REPO_URL_WITH_TOKEN
else
  # Local deployment
  git remote add origin $REPO_URL
fi

git push -f origin gh-pages

echo "Deployment completed successfully!"

# Clean up
cd $ORIGINAL_DIR
rm -rf $TEMP_DIR

echo "Temporary files removed. All done!" 