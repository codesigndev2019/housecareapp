/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    testTimeout: 10000,      // 10 seconds max per test
    hookTimeout: 10000,      // 10 seconds for beforeEach/afterEach
    teardownTimeout: 5000,   // 5 seconds for cleanup
    pool: 'threads',         // Use threads for parallelization
    poolOptions: {
      threads: {
        singleThread: false  // Allow multiple threads
      }
    },
    reporters: ['verbose']   // Better output in CI
  }
});