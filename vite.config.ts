import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Plugin } from "vite";

// Custom plugin to ensure HTML is properly processed
const ensureHTMLProcessing: Plugin = {
  name: 'ensure-html-processing',
  transformIndexHtml: {
    enforce: 'post',
    transform(html, ctx) {
      console.log('Transforming index.html...');
      
      // Ensure the main entry is added if it was missing
      if (!html.includes('type="module"')) {
        console.log('Adding main entry point...');
        return html.replace(
          '</body>',
          '  <script type="module" src="./src/main.tsx"></script>\n</body>'
        );
      }
      
      return html;
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/dd-app-v1/", // Base path for GitHub Pages
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ensureHTMLProcessing,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure sourcemaps are generated for easier debugging
    sourcemap: true,
  },
}));
