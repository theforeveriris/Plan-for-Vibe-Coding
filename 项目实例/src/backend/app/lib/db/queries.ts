// 基于文件系统的存储方案
import fs from 'fs'
import path from 'path'
import type { MiningTask, SpecialKey, PatternConfig } from '../pgp/types'

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 数据文件路径
const tasksFile = path.join(dataDir, 'tasks.json')
const keysFile = path.join(dataDir, 'keys.json')

// 初始化数据文件
function initDataFiles() {
  if (!fs.existsSync(tasksFile)) {
    fs.writeFileSync(tasksFile, JSON.stringify([]))
  }
  if (!fs.existsSync(keysFile)) {
    fs.writeFileSync(keysFile, JSON.stringify([]))
  }
}

// 读取数据
function readData<T>(filePath: string): T[] {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading data file:', error)
    return []
  }
}

// 写入数据
function writeData<T>(filePath: string, data: T[]) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing data file:', error)
  }
}

// 任务相关操作
export function createTask(task: Omit<MiningTask, 'id' | 'startedAt' | 'totalAttempts' | 'matchesFound'> & { id: string }) {
  initDataFiles()
  
  const tasks = readData<MiningTask>(tasksFile)
  const newTask: MiningTask = {
    ...task,
    startedAt: new Date(),
    totalAttempts: 0,
    matchesFound: 0,
  }
  
  tasks.push(newTask)
  writeData(tasksFile, tasks)
}

export function updateTaskProgress(taskId: string, attempts: number, matchesFound: number) {
  initDataFiles()
  
  const tasks = readData<MiningTask>(tasksFile)
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  
  if (taskIndex !== -1) {
    tasks[taskIndex].totalAttempts = attempts
    tasks[taskIndex].matchesFound = matchesFound
    writeData(tasksFile, tasks)
  }
}

export function stopTask(taskId: string) {
  initDataFiles()
  
  const tasks = readData<MiningTask>(tasksFile)
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  
  if (taskIndex !== -1) {
    tasks[taskIndex].status = 'stopped'
    tasks[taskIndex].stoppedAt = new Date()
    writeData(tasksFile, tasks)
  }
}

export function getTask(taskId: string): MiningTask | null {
  initDataFiles()
  
  const tasks = readData<MiningTask>(tasksFile)
  const task = tasks.find(t => t.id === taskId)
  return task || null
}

// 密钥相关操作
export function createSpecialKey(key: SpecialKey) {
  initDataFiles()
  
  const keys = readData<SpecialKey>(keysFile)
  keys.push(key)
  writeData(keysFile, keys)
}

export function getKeys(page: number = 1, pageSize: number = 10): { keys: SpecialKey[]; total: number } {
  initDataFiles()
  
  const allKeys = readData<SpecialKey>(keysFile)
  const total = allKeys.length
  
  // 按创建时间降序排序
  const sortedKeys = allKeys.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  
  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const keys = sortedKeys.slice(start, end)
  
  return { keys, total }
}

export function getKeysByTaskId(taskId: string): SpecialKey[] {
  initDataFiles()
  
  const keys = readData<SpecialKey>(keysFile)
  return keys.filter(k => k.taskId === taskId)
}

// 清除过期任务（可选）
export function cleanupOldTasks(days: number = 7) {
  initDataFiles()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const tasks = readData<MiningTask>(tasksFile)
  const filteredTasks = tasks.filter(task => {
    if (task.status === 'stopped' && task.stoppedAt) {
      return new Date(task.stoppedAt).getTime() >= cutoffDate.getTime()
    }
    return true
  })
  
  writeData(tasksFile, filteredTasks)
  console.log(`Cleaned up ${tasks.length - filteredTasks.length} old tasks`)
}