import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Strip Vite client in dev to avoid WebSocket + "Maximum call stack size exceeded". */
function stripViteClientPlugin() {
  return {
    name: "strip-vite-client",
    enforce: "pre",
    transform(code, id) {
      if (!id || id.includes("node_modules")) return null;
      if (code.includes("/@vite/client") || code.includes("vite/client")) {
        const stripped = code
          .replace(/import\s+["']\/@vite\/client["']\s*;?\s*/g, "")
          .replace(/import\s+["'][^"']*vite\/client[^"']*["']\s*;?\s*/g, "");
        if (stripped !== code) return { code: stripped, map: null };
      }
      return null;
    },
    configureServer(server) {
      const stripClient = (req, res, next) => {
        const origEnd = res.end;
        const chunks = [];
        const u = req.url?.split("?")[0] || "";
        if (u !== "/" && u !== "/index.html") return next();
        res.write = function (chunk, ...args) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        };
        res.end = function (chunk, ...args) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          let body = Buffer.concat(chunks).toString("utf8");
          if (body && (body.includes("vite/client") || body.includes("@vite/client"))) {
            body = body.replace(
              /<script[^>]*\ssrc=["'][^"']*vite\/client[^"']*["'][^>]*>\s*<\/script>\s*/gi,
              ""
            );
            body = body.replace(
              /<script[^>]*\ssrc=["'][^"']*@vite\/client[^"']*["'][^>]*>\s*<\/script>\s*/gi,
              ""
            );
            res.setHeader("Content-Length", Buffer.byteLength(body, "utf8"));
            origEnd.call(res, body, ...args);
          } else {
            const out = Buffer.concat(chunks);
            if (out.length) res.setHeader("Content-Length", out.length);
            origEnd.call(res, out, ...args);
          }
        };
        next();
      };
      server.middlewares.stack.unshift({ route: "", handle: stripClient });
    },
  };
}

/** Serve manifest.json with correct PWA MIME type so audits don't fail. */
function manifestMimePlugin() {
  return {
    name: "manifest-mime",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] === "/manifest.json") {
          res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
        }
        next();
      });
    },
  };
}

export default defineConfig(async ({ mode }) => {
  const { default: react } = await import("@vitejs/plugin-react");
  const plugins = [react(), manifestMimePlugin()];
  if (mode === "development") {
    plugins.push(stripViteClientPlugin());
  }
  // Disabled: causes "Maximum call stack size exceeded" when Vite connects.
  // if (mode === "development") {
  //   const { componentTagger } = await import("lovable-tagger");
  //   plugins.push(componentTagger());
  // }
  return {
    base: "/",
    server: {
      host: "0.0.0.0",
      port: 5174,
      hmr: false,
    },
    esbuild: {
      keepNames: true,
      target: "es2015",
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/features": path.resolve(__dirname, "./src/features"),
        "@/shared": path.resolve(__dirname, "./src/shared"),
        "@/pages": path.resolve(__dirname, "./src/pages"),
        "@/config": path.resolve(__dirname, "./src/config"),
      },
      dedupe: ["react", "react-dom", "lodash"],
    },
    build: {
      target: "es2015",
      minify: "esbuild",
      chunkSizeWarningLimit: 16000,
      sourcemap: false,
      modulePreload: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          format: "es",
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
          manualChunks: (id) => {
            if (id.includes("node_modules")) return "vendor";
          },
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
  };
});
