import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: [],
    include: ['tests/selectedSecurityFixes.security.ts'],
  },
});