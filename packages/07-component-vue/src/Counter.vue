<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ initial?: number }>()
const emit = defineEmits<{ (e: 'change', n: number): void }>()

const count = ref(props.initial ?? 0)

function inc() {
  count.value++
  emit('change', count.value)
}

function dec() {
  count.value--
  emit('change', count.value)
}
</script>

<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="inc" aria-label="+">+</button>
    <button @click="dec" aria-label="-">-</button>
  </div>
</template>
