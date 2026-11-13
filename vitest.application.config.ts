import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: [],
    include: ["src/test/applicationSubmission.test.ts"],
  },
});