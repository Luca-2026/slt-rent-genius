import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Build-time image compression — runs only on `vite build`.
    // Source files are NOT modified; only the dist/ output is compressed.
    mode !== "development" &&
      ViteImageOptimizer({
        png: { quality: 80 },
        jpeg: { quality: 78, mozjpeg: true },
        jpg: { quality: 78, mozjpeg: true },
        webp: { quality: 75, lossless: false },
        avif: { quality: 65 },
        svg: {
          multipass: true,
          plugins: [
            {
              name: "preset-default",
              params: { overrides: { removeViewBox: false } },
            },
          ],
        },
        includePublic: true,
        logStats: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
