import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

const config = {
  plugins: [
    react(),
    tsconfigPaths({
      projects: [path.resolve(__dirname, "tsconfig.json")],
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    globals: true,
    clearMocks: true,
  },
} satisfies import("vite").UserConfig & {
  test: {
    environment: string;
    setupFiles: string;
    globals: boolean;
    clearMocks: boolean;
  };
};

export default defineConfig(config);
