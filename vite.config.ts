import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// Injects <link rel="preload" as="image" fetchpriority="high"> for the LCP
// hero image (hero-krefeld) into index.html AFTER the build, so the browser
// preload-scanner discovers it before any JS runs. Helmet-based preloads
// were too late (they only render after React hydration).
function heroImagePreloadPlugin(): Plugin {
  return {
    name: "hero-image-preload",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const heroAsset = Object.values(bundle).find((a: any) => {
          const name: string = a.name || a.fileName || "";
          return /hero-krefeld/i.test(name) && /\.(jpe?g|webp|avif|png)$/i.test(name);
        }) as { fileName: string } | undefined;
        if (!heroAsset) return html;
        const tag = `<link rel="preload" as="image" href="/${heroAsset.fileName}" fetchpriority="high">`;
        return html.replace("</head>", `    ${tag}\n  </head>`);
      },
    },
  };
}

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
            } as never,
          ],
        },
    mode !== "development" && heroImagePreloadPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
