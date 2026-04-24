<template>
  <div class="miner-control space-y-4">
    <!-- 规则选择 -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        筛选规则
      </label>
      <select 
        v-model="patternType" 
        class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-matrix-green"
      >
        <option value="consecutive">连续数字</option>
        <option value="repeating">重复数字</option>
        <option value="palindrome">回文数字</option>
        <option value="special_date">特殊日期</option>
        <option value="custom_regex">自定义正则</option>
        <option value="leading_zeros">前导零</option>
      </select>
    </div>

    <!-- 规则参数 -->
    <div v-if="patternType === 'consecutive' || patternType === 'repeating'">
      <label class="block text-sm font-medium text-gray-300 mb-2">
        最小长度
      </label>
      <input 
        v-model.number="patternConfig.minLength" 
        type="number" 
        min="3" 
        max="10" 
        class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-matrix-green"
      >
    </div>

    <div v-if="patternType === 'special_date' || patternType === 'custom_regex'">
      <label class="block text-sm font-medium text-gray-300 mb-2">
        {{ patternType === 'special_date' ? '日期模式 (YYYYMMDD)' : '正则表达式' }}
      </label>
      <input 
        v-model="patternConfig.pattern" 
        type="text" 
        class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-matrix-green"
        :placeholder="patternType === 'special_date' ? '例如: 19990101' : '例如: ^.*1337.*$'"
      >
    </div>

    <div v-if="patternType === 'leading_zeros'">
      <label class="block text-sm font-medium text-gray-300 mb-2">
        前导零数量
      </label>
      <input 
        v-model.number="patternConfig.zeroCount" 
        type="number" 
        min="3" 
        max="10" 
        class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-matrix-green"
      >
    </div>

    <!-- 线程数 -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        线程数: {{ threads }}
      </label>
      <input 
        v-model.number="threads" 
        type="range" 
        min="1" 
        max="8" 
        class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      >
    </div>

    <!-- 操作按钮 -->
    <div class="flex space-x-2">
      <button 
        v-if="!isRunning" 
        @click="startMining" 
        class="btn flex-1 bg-matrix-green text-black font-bold py-2 px-4 rounded hover:bg-matrix-green/80"
      >
        开始挖掘
      </button>
      <button 
        v-else 
        @click="stopMining" 
        class="btn flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
      >
        停止挖掘
      </button>
    </div>

    <!-- 任务状态 -->
    <div v-if="taskId" class="text-sm text-gray-400 mt-2">
      <p>任务 ID: {{ taskId }}</p>
      <p>状态: {{ isRunning ? '运行中' : '已停止' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMinerStore } from '../stores/miner'
import type { PatternType, StartMinerRequest } from '../types'

const minerStore = useMinerStore()

const patternType = ref<PatternType>('consecutive')
const patternConfig = ref({
  minLength: 5,
  pattern: '',
  zeroCount: 5,
})
const threads = ref(4)

const isRunning = computed(() => minerStore.isRunning)
const taskId = computed(() => minerStore.taskId)

async function startMining() {
  const request: StartMinerRequest = {
    patternType: patternType.value,
    patternConfig: patternConfig.value,
    threads: threads.value,
  }
  
  await minerStore.startMining(request)
}

async function stopMining() {
  await minerStore.stopMining()
}
</script>