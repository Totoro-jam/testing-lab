<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{ id: number }>()
const loading = ref(true)
const name = ref<string | null>(null)
const error = ref<string | null>(null)

// 注入式的 fetcher,测试时可以替换
const fetcher = (id: number): Promise<{ name: string }> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id < 0) reject(new Error('invalid'))
      else resolve({ name: `User${id}` })
    }, 30)
  })

watchEffect(async () => {
  loading.value = true
  error.value = null
  try {
    const u = await fetcher(props.id)
    name.value = u.name
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <p v-if="loading">loading...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <p v-else>{{ name }}</p>
  </div>
</template>
