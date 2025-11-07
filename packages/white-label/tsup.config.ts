import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/admin-app/index.ts", "src/web-app/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  // Ensure proper CommonJS output
  cjsInterop: true,
});
