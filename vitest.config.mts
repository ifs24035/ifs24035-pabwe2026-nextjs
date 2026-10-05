import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "node:fs";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Vitest menyimpan berkas lock laporan cakupan di folder Temp sistem
// (os.tmpdir()). Pada sebagian lingkungan Windows, pembuatan berkas di folder
// tersebut ditolak sehingga `bun run test:coverage` gagal dengan pesan:
//   EPERM: operation not permitted, open '...\vitest-coverage-<hash>.lock'
// Berkas sementara karena itu dialihkan ke folder lokal proyek yang selalu
// dapat ditulis (dan sudah diabaikan oleh .gitignore).
const localTempDir = path.resolve(rootDir, "./.vitest-tmp");
fs.mkdirSync(localTempDir, { recursive: true });
process.env.TEMP = localTempDir;
process.env.TMP = localTempDir;
process.env.TMPDIR = localTempDir;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "node_modules/**",
        "src/app/**",
        "src/components/Providers.tsx",
        "src/setupTests.ts",
        "src/lib/config.ts",
        "src/types/**",
        "src/hooks/redux.ts",
        "src/server.ts",
        "scripts/**",
        "vitest.config.mts",
        "next.config.ts",
        "postcss.config.mjs",
        "eslint.config.mjs",
        ".next/**",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});