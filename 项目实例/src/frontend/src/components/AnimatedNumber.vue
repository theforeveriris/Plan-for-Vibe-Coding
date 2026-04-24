<template>
  <span class="animated-number">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  value: number
  decimals?: number
  duration?: number
}>()

const displayValue = ref('0')
let animationFrame: number | null = null

function animateNumber(target: number, duration: number = 1000) {
  const start = parseFloat(displayValue.value.replace(/,/g, '')) || 0
  const startTime = performance.now()
  const decimals = props.decimals || 0

  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用 easeOutQuart 缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 4)
    const current = start + (target - start) * easeProgress
    
    if (decimals > 0) {
      displayValue.value = current.toFixed(decimals)
    } else {
      displayValue.value = Math.floor(current).toLocaleString()
    }
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(update)
    }
  }
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(update)
}

watch(() => props.value, (newValue) => {
  animateNumber(newValue, props.duration || 800)
}, { immediate: true })

onMounted(() => {
  animateNumber(props.value, props.duration || 800)
})
</script>

<style scoped>
.animated-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
</style>
