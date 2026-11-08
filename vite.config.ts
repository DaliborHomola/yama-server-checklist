import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins, loadEnv } from "vite-plus";
import { nitro } from "nitro/vite";
import { viteWczLayout } from "wcz-layout/vite";

export default defineConfig({
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  test: {
    include: ["tests/{unit,integration}/**/*.test.{ts,tsx}"],
    env: loadEnv("test", process.cwd(), ""),
    setupFiles: ["src/env.ts"],
  },
  plugins: lazyPlugins(() => [
    tanstackStart({
      router: {
        quoteStyle: "double",
        semicolons: true,
      },
    }),
    !process.env.VITEST && nitro(),
    viteReact({ compiler: true }),
    viteWczLayout(),
  ]),
});
