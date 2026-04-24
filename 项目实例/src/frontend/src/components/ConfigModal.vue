<template>
  <div class="config-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full">
      <h3 class="text-xl font-semibold mb-4 text-cyan-400">后端服务配置</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            后端服务 URL
          </label>
          <div class="relative">
            <input
              v-model="backendUrl"
              type="text"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-matrix-green"
              placeholder="http://localhost:3000"
            />
            <button
              @click="resetToDefault"
              class="absolute right-2 top-2 text-xs text-gray-400 hover:text-white"
            >
              重置默认
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            输入后端服务的完整 URL，包括协议和端口
          </p>
        </div>
        
        <div v-if="status" :class="['text-sm', status.type === 'success' ? 'text-green-400' : 'text-red-400']">
          {{ status.message }}
        </div>
        
        <div class="flex space-x-2">
          <button
            @click="saveConfig"
            class="btn flex-1 bg-matrix-green text-black font-bold py-2 px-4 rounded hover:bg-matrix-green/80"
          >
            保存配置
          </button>
          <button
            @click="closeModal"
            class="btn flex-1 bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', url: string): void
}>()

const backendUrl = ref('')
const status = ref<{ type: 'success' | 'error'; message: string } | null>(null)

onMounted(() => {
  // 从 localStorage 加载配置
  const savedUrl = localStorage.getItem('backendUrl')
  backendUrl.value = savedUrl || 'http://localhost:3000'
})

function resetToDefault() {
  backendUrl.value = 'http://localhost:3000'
}

function saveConfig() {
  // 简单的 URL 验证
  try {
    new URL(backendUrl.value)
    localStorage.setItem('backendUrl', backendUrl.value)
    status.value = { type: 'success', message: '配置保存成功！' }
    
    // 延迟关闭并触发保存事件
    setTimeout(() => {
      emit('save', backendUrl.value)
      closeModal()
    }, 1000)
  } catch (error) {
    status.value = { type: 'error', message: 'URL 格式不正确，请检查输入' }
  }
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
.config-modal {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>