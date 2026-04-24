<template>
  <div class="dashboard">
    <!-- 主内容区 -->
    <div class="dashboard-content">
      <!-- 左侧面板：控制面板/实时终端/已发现密钥 -->
      <div class="left-panel">
        <!-- 控制面板 + 实时终端 + 已发现密钥（Tab切换） -->
        <TabContainer
          :tabs="[
            { id: 'control', label: '控制面板' },
            { id: 'terminal', label: '实时终端' },
            { id: 'keys', label: '已发现的特殊密钥' }
          ]"
          default-tab="control"
          class="main-tab-container"
        >
          <template #default="{ activeTab }">
            <div v-show="activeTab === 'control'" class="tab-panel">
              <MinerControl />
            </div>
            <div v-show="activeTab === 'terminal'" class="tab-panel">
              <MinerTerminal />
            </div>
            <div v-show="activeTab === 'keys'" class="tab-panel">
              <div class="keys-list" v-if="minerStore.matches.length > 0">
                <KeyCard
                  v-for="key in minerStore.matches"
                  :key="key.id"
                  :keyData="key"
                />
              </div>
              <div v-else class="empty-state">
                暂无特殊密钥
              </div>
            </div>
          </template>
        </TabContainer>
      </div>

      <!-- 右侧面板：StatsPanel + Hashrate 趋势/监控 -->
      <div class="right-panel">
        <!-- 统计面板 -->
        <StatsPanel />

        <!-- Hashrate 趋势 + 监控（Tab切换） -->
        <TabContainer
          :tabs="[
            { id: 'chart', label: 'Hashrate 趋势' },
            { id: 'monitor', label: 'Hashrate 监控' }
          ]"
          default-tab="chart"
          class="top-tab-container"
        >
          <template #default="{ activeTab }">
            <div v-show="activeTab === 'chart'" class="tab-panel">
              <div class="chart-wrapper">
                <HashrateChart />
              </div>
            </div>
            <div v-show="activeTab === 'monitor'" class="tab-panel">
              <StatsPanel mode="detailed" />
            </div>
          </template>
        </TabContainer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMinerStore } from '../stores/miner'
import StatsPanel from '../components/StatsPanel.vue'
import MinerControl from '../components/MinerControl.vue'
import MinerTerminal from '../components/MinerTerminal.vue'
import HashrateChart from '../components/HashrateChart.vue'
import KeyCard from '../components/KeyCard.vue'
import TabContainer from '../components/TabContainer.vue'

const minerStore = useMinerStore()
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.right-panel > :nth-child(1) {
  flex-shrink: 0;
}

.right-panel > :nth-child(2) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.main-tab-container {
  flex: 1;
  min-height: 0;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.main-tab-container .tab-panel {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
}

.top-tab-container {
  flex: 1;
  min-height: 0;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.tab-panel {
  height: 100%;
  overflow: hidden;
  padding: 20px;
}

.keys-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.keys-list::-webkit-scrollbar {
  width: 6px;
}

.keys-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 3px;
}

.keys-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.keys-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.empty-state {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 60px 0;
  font-size: 14px;
}

.chart-wrapper {
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
    min-height: 100vh;
  }
  
  .left-panel,
  .right-panel {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
    gap: 16px;
  }
  
  .main-tab-container .tab-panel,
  .tab-panel {
    padding: 16px;
  }
}
</style>
