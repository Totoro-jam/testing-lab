// pre-commit 时只对暂存区的文件跑
export default {
  '*.{ts,tsx,vue}': [
    'eslint --fix',
    // related 只跑跟改动文件相关的测试,几秒就行
    'vitest related --run',
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
}
