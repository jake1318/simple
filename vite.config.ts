import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // Allow Vite to look for next available port
    host: true, // Listen on all local IPs
    open: true, // Open browser automatically
  },
  build: {
    outDir: "dist", // Specify the output directory
    sourcemap: true, // Generate sourcemaps for better debugging
    minify: "esbuild", // Use esbuild for minification (faster than terser)
    target: "esnext", // Target modern browsers
  },
});
