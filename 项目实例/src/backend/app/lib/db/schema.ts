// 数据库初始化（文件系统版本）
import fs from 'fs'
import path from 'path'

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('Data directory created:', dataDir)
}

// 数据文件路径
const tasksFile = path.join(dataDir, 'tasks.json')
const keysFile = path.join(dataDir, 'keys.json')

// 初始化数据文件
export function initDatabase() {
  // 初始化任务文件
  if (!fs.existsSync(tasksFile)) {
    fs.writeFileSync(tasksFile, JSON.stringify([]))
    console.log('Tasks file initialized:', tasksFile)
  }
  
  // 初始化密钥文件
  if (!fs.existsSync(keysFile)) {
    fs.writeFileSync(keysFile, JSON.stringify([]))
    console.log('Keys file initialized:', keysFile)
  }
  
  console.log('Database initialized successfully (file system version)')
}

// 导出空对象，保持接口兼容
export const db = {}