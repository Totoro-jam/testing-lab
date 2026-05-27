import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',  // 模拟浏览器 DOM
    setupFiles: ['./tests/setup.ts'],
  },
})
