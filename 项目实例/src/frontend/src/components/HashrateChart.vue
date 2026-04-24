<template>
  <div>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useMinerStore } from '../stores/miner'

// 注册 Chart.js 组件
Chart.register(...registerables)

const chartRef = ref<HTMLCanvasElement>()
const chart = ref<Chart | null>(null)
const minerStore = useMinerStore()

onMounted(() => {
  if (chartRef.value) {
    const ctx = chartRef.value.getContext('2d')
    if (ctx) {
      chart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(60).fill(''),
          datasets: [{
            label: 'Hashrate (keys/s)',
            data: [...minerStore.hashrateHistory],
            borderColor: '#00f0ff',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: {
              display: false,
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          }
        }
      })
    }
  }
})

// 监听 hashrate 历史数据 - 使用浅监听避免无限递归
watch(
  () => minerStore.hashrateHistory,
  (newHistory) => {
    if (chart.value) {
      // 直接修改数据并调用 update('none') 避免动画
      chart.value.data.datasets[0].data = [...newHistory]
      chart.value.update('none')
    }
  },
  { deep: false }
)

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
    chart.value = null
  }
})
</script>
