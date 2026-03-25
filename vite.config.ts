import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solid from "vite-plugin-solid";

const projectRoot = resolve(__dirname, "axinite");

export default defineConfig({
  root: projectRoot,
  publicDir: resolve(projectRoot, "public"),
  plugins: [
    solid(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      includeAssets: ["assets/icons/axinite32.ico"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,webmanifest,ftl}"],
        navigateFallback: "/index.html",
      },
      manifest: {
        name: "Axinite",
        short_name: "Axinite",
        description:
          "Axinite single-page preview shell with localisation and feature flags.",
        theme_color: "#0b1116",
        background_color: "#0b1116",
        display: "standalone",
        lang: "en-GB",
        start_url: "/chat",
        icons: [
          {
            src: "/assets/icons/axinite32.ico",
            sizes: "32x32",
            type: "image/x-icon",
          },
        ],
      },
    }),
  ],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 4173,
    host: "0.0.0.0",
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "axinite/src"),
    },
  },
});
