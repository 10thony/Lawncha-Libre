import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
// Use a static `defineConfig({ plugins: [...] })` shape so Cloudflare Wrangler
// can detect and optionally extend the config (CI / non-interactive deploy).
const injectPreviewDev: Plugin = {
  name: "inject-preview-dev",
  apply: "serve",
  transform(code: string, id: string) {
    if (id.includes("main.tsx")) {
      return {
        code: `${code}

/* Added by Vite plugin inject-preview-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
        `,
        map: null,
      };
    }
    return null;
  },
};

export default defineConfig({
  plugins: [react(), injectPreviewDev],
  server: {
    proxy: {
      // Proxy API requests in dev to Convex HTTP router
      "/api/uploadthing": {
        target: "http://localhost:3210",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
