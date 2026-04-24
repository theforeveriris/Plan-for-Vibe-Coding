<template>
  <div class="dashboard">
    <!-- 主内容区 -->
    <div class="dashboard-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 统计面板 -->
        <StatsPanel />

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

      <!-- 右侧面板 -->
      <div class="right-panel">
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  padding: 24px;
  height: calc(100vh - 80px);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.left-panel > :nth-child(1) {
  flex-shrink: 0;
}

.left-panel > :nth-child(2) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.main-tab-container {
  flex: 1;
  min-height: 0;
}

.main-tab-container .tab-panel {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.top-tab-container {
  flex: 1;
  min-height: 0;
}

.tab-panel {
  height: 100%;
  overflow: hidden;
}

.keys-list {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 40px 0;
}

.chart-wrapper {
  height: 100%;
  position: relative;
}
</style>
