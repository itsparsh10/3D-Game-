import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    watch: { ignored: ["**/output/**", "**/tests/**", "**/*.md"] },
    proxy: {
      "/api": "http://127.0.0.1:4174",
      "/media": "http://127.0.0.1:4174",
    },
    host: true,
  },
});
