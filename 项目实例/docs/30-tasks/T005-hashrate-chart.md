# T005: hashrate图表

## 元信息
- 状态：待开始 | 优先级：P1 | 故事点：3
- 负责人：Claude（编码）+ @developer（验收）
- 迭代：Sprint 2（2026-05-04 ~ 2026-05-17）
- 关联：US-002

## 目标
集成 Chart.js 实现实时 hashrate 折线图。

## 已完成 [DONE]
- [ ] （未开始）

## 进行中 [IN PROGRESS]
- [ ] （未开始）

## 待开始 [TODO]
- [ ] 安装 Chart.js 依赖
- [ ] 创建 HashrateChart.vue 组件
- [ ] 实现实时数据更新
- [ ] 美化图表样式

## 代码地图（Code Map）
/frontend/
|-- src/
|   |-- components/
|   |   |-- HashrateChart.vue   # hashrate图表组件

## 技术选型
- Chart.js 4.x
- vue-chartjs 5.x（Chart.js Vue封装）

## 图表配置
- 类型：折线图
- X轴：时间（最近60秒）
- Y轴：hashrate（keys/sec）
- 更新频率：每秒1次
- 样式：暗色主题，矩阵绿配色

## 依赖
- 依赖：T004 完成