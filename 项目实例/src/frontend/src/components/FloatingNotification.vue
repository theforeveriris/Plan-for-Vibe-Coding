<template>
  <Transition name="slide-in">
    <div v-if="visible" class="floating-notification" :class="type">
      <div class="notification-content">
        <span class="notification-icon">{{ icon }}</span>
        <span class="notification-message">{{ message }}</span>
      </div>
      <button class="notification-close" @click="close">×</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)

const icon = computed(() => {
  switch (props.type) {
    case 'success': return '✓'
    case 'warning': return '⚠'
    case 'error': return '✕'
    default: return 'ℹ'
  }
})

function close() {
  visible.value = false
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  visible.value = true
  if (props.duration !== 0) {
    setTimeout(close, props.duration || 3000)
  }
})
</script>

<style scoped>
.floating-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 400px;
}

@media (prefers-color-scheme: dark) {
  .floating-notification {
    background: #2a2a2a;
    border-color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.floating-notification.success {
  border-left: 4px solid #16a34a;
}

.floating-notification.warning {
  border-left: 4px solid #f59e0b;
}

.floating-notification.error {
  border-left: 4px solid #dc2626;
}

.floating-notification.info {
  border-left: 4px solid #9333ea;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.notification-icon {
  font-size: 16px;
  font-weight: 700;
}

.notification-message {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .notification-message {
    color: #f0f0f0;
  }
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .notification-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f0f0f0;
  }
}

/* 滑入动画 */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.3s ease;
}

.slide-in-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
