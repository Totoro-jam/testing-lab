import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',  // 默认推荐;istanbul 见 README
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/types.ts'],
      thresholds: {
        // 推荐:在 CI 上加阈值,跌破则失败
        // lines: 80,
        // functions: 80,
        // branches: 75,
        // statements: 80,
      },
    },
  },
})
