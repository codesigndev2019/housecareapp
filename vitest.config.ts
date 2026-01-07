/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    testTimeout: 10000,      // 10 segundos máximo por test
    hookTimeout: 10000,      // 10 segundos para beforeEach/afterEach
    teardownTimeout: 5000,   // 5 segundos para cleanup
    pool: 'threads',         // Usar threads para paralelizar
    poolOptions: {
      threads: {
        singleThread: false  // Permitir múltiples threads
      }
    },
    reporters: ['verbose']   // Mejor output en CI
  }
}); 