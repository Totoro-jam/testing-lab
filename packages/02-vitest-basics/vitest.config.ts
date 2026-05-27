import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // globals=true 让 describe/it/expect 不需要 import,贴近 jest 体验
    // 建议项目里写 false 强制 import,这里开 true 是为了演示两种风格
    globals: true,
    environment: 'node', // 这章不涉及 DOM,所以是 node
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
})
