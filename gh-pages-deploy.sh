#!/bin/bash

# Build the app
echo "Building app..."
npm run build


# Modify index.html
echo "Enhancing index.html..."
cp dist/index.html dist/index.original.html

sed -i "" "s/<head>/<head>\n<script src=\"https:\/\/telegram.org\/js\/telegram-web-app.js\"><\/script>\n<script src=\"debug.js\"><\/script>\n<script src=\"gh-pages-debug.js\"><\/script>\n<script src=\"redirect-handler.js\"><\/script>/g" dist/index.html


# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."
npm run deploy

echo "Deployment complete!"

