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
            { id: 'rules', label: '规则引擎' },
            { id: 'terminal', label: '实时终端' },
            { id: 'keys', label: '已发现的特殊密钥' }
          ]"
          default-tab="control"
          class="main-tab-container"
        >
          <template #default="{ activeTab }">
            <Transition name="fade" mode="out-in">
              <div v-if="activeTab === 'control'" class="tab-panel" key="control">
                <MinerControl />
              </div>
              <div v-else-if="activeTab === 'rules'" class="tab-panel" key="rules">
                <RuleGroupManager />
              </div>
              <div v-else-if="activeTab === 'terminal'" class="tab-panel" key="terminal">
                <MinerTerminal />
              </div>
              <div v-else-if="activeTab === 'keys'" class="tab-panel" key="keys">
                <div class="keys-list" v-if="minerStore.matches.length > 0">
                  <KeyCard
                    v-for="key in minerStore.matches"
                    :key="key.id"
                    :keyData="key"
                  />
                </div>
                <div v-else class="illustration-empty">
                  <div class="icon">🔍</div>
                  <div class="text">暂无特殊密钥</div>
                </div>
              </div>
            </Transition>
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
            <Transition name="fade" mode="out-in">
              <div v-if="activeTab === 'chart'" class="tab-panel" key="chart">
                <div class="chart-wrapper">
                  <HashrateChart />
                </div>
              </div>
              <div v-else-if="activeTab === 'monitor'" class="tab-panel" key="monitor">
                <StatsPanel mode="detailed" />
              </div>
            </Transition>
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
import RuleGroupManager from '../components/RuleGroupManager.vue'

const minerStore = useMinerStore()
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8f9fa;
  color: #333333;
  font-family: Georgia, 'Times New Roman', Times, serif;
}

@media (prefers-color-scheme: dark) {
  .dashboard {
    background: #1a1a1a;
    color: #f0f0f0;
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 12px;
  padding: 16px;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow: hidden;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.main-tab-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

@media (prefers-color-scheme: dark) {
  .main-tab-container {
    background: #2a2a2a;
    border: 1px solid #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .main-tab-container:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
}

.main-tab-container .tab-panel {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}

.top-tab-container {
  flex: 1;
  min-height: 0;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.top-tab-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

@media (prefers-color-scheme: dark) {
  .top-tab-container {
    background: #2a2a2a;
    border: 1px solid #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .top-tab-container:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
}

.tab-panel {
  height: 100%;
  overflow: hidden;
  padding: 12px;
}

.keys-list {
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.empty-state {
  color: #999999;
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .empty-state {
    color: #777777;
  }
}

.chart-wrapper {
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  .chart-wrapper {
    background: #222;
  }
}

/* 插画风格空状态 */
.illustration-empty {
  text-align: center;
  padding: 40px 20px;
}

.illustration-empty .icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.illustration-empty .text {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .illustration-empty .text {
    color: #777;
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
    height: 400px;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 12px;
    gap: 8px;
  }
  
  .main-tab-container .tab-panel,
  .tab-panel {
    padding: 8px;
  }
  
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
