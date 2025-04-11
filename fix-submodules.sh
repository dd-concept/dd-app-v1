#!/bin/bash

# Script to fix Git submodule issues
echo "Fixing Git submodule issues..."

# Check if reference_repo or reference_shop exist and remove them
if [ -d "reference_repo" ]; then
  echo "Removing reference_repo directory..."
  rm -rf reference_repo
fi

if [ -d "reference_shop" ]; then
  echo "Removing reference_shop directory..."
  rm -rf reference_shop
fi

# Clean up any submodule listings in .git/config
echo "Cleaning up Git config..."
if [ -f ".git/config" ]; then
  # Create a backup of the original config
  cp .git/config .git/config.bak
  # Remove any submodule sections from config
  grep -v "\[submodule" .git/config.bak > .git/config
fi

# Ensure .gitmodules is empty or contains just comments
echo "Ensuring .gitmodules is clean..."
echo "# This file intentionally left empty" > .gitmodules
echo "# It is used to override any automatic submodule detection by Git" >> .gitmodules
echo "# Deployment issues were previously caused by directories being mistakenly treated as submodules" >> .gitmodules

# Clean up any submodule directories in .git/modules
echo "Cleaning up Git modules directory..."
if [ -d ".git/modules" ]; then
  rm -rf .git/modules/*
fi

echo "Git submodule issues fixed successfully." 