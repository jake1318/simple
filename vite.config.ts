import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { networkInterfaces } from "os";
import detect from "detect-port";

// Function to get the next available port
async function getPort(startPort: number): Promise<number> {
  const port = await detect(startPort);
  return port;
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const port = await getPort(3000);

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: false, // Allow Vite to look for next available port
      host: true, // Listen on all local IPs
      open: true, // Open browser automatically
    },
  };
});
