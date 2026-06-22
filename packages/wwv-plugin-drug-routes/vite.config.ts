import { defineConfig } from "vite";
import { wwvPluginGlobals } from "@worldwideview/wwv-plugin-sdk";

/**
 * Builds the plugin into a single ES module (`dist/frontend.mjs`) loaded by the host
 * via `manifest.entry`. React, Cesium and the SDK are externalized to
 * `globalThis.__WWV_HOST__` by `wwvPluginGlobals()`, so the output has no bare imports.
 * The curated GeoJSON is inlined via `?raw`, keeping the plugin a single self-contained
 * file (no separate asset to load — the same rationale as inlined CSS).
 */
export default defineConfig({
    plugins: [wwvPluginGlobals()],
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: () => "frontend.mjs",
        },
        rollupOptions: {
            output: { codeSplitting: false },
        },
        target: "esnext",
        minify: false,
        emptyOutDir: true,
    },
});
