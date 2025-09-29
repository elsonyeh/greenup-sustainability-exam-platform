// 系統監控工具
import { supabase } from './supabase'

export interface SystemStatus {
  database: 'healthy' | 'warning' | 'error'
  aiService: 'healthy' | 'warning' | 'error'
  storage: 'healthy' | 'warning' | 'error'
  emailService: 'healthy' | 'warning' | 'error'
}

export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  storageUsage: number
  dbConnections: number
  responseTime: number
}

// 檢查數據庫連接狀態
export async function checkDatabaseHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    const startTime = Date.now()

    // 簡單的數據庫查詢測試
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      console.error('Database health check failed:', error)
      return 'error'
    }

    // 響應時間超過2秒為警告
    if (responseTime > 2000) {
      return 'warning'
    }

    return 'healthy'
  } catch (error) {
    console.error('Database connection failed:', error)
    return 'error'
  }
}

// 檢查AI服務狀態
export async function checkAIServiceHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
      return 'error'
    }

    // 簡單的API可用性測試
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // 5秒超時
    })

    if (response.ok) {
      return 'healthy'
    } else if (response.status === 429) {
      return 'warning' // 請求過多
    } else {
      return 'error'
    }
  } catch (error) {
    console.error('AI service health check failed:', error)
    return 'error'
  }
}

// 檢查存儲服務狀態
export async function checkStorageHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    // 測試存儲訪問
    const { data, error } = await supabase.storage
      .from('documents')
      .list('', {
        limit: 1
      })

    if (error) {
      console.error('Storage health check failed:', error)
      return 'error'
    }

    return 'healthy'
  } catch (error) {
    console.error('Storage connection failed:', error)
    return 'error'
  }
}

// 檢查郵件服務狀態
export async function checkEmailServiceHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    // 檢查是否有郵件配置
    const emailConfig = {
      smtpHost: import.meta.env.VITE_SMTP_HOST,
      smtpPort: import.meta.env.VITE_SMTP_PORT,
      smtpUser: import.meta.env.VITE_SMTP_USER,
      smtpPass: import.meta.env.VITE_SMTP_PASS,
    }

    // 如果沒有配置郵件服務，返回警告
    if (!emailConfig.smtpHost || !emailConfig.smtpUser) {
      return 'warning'
    }

    // 這裡應該實際測試SMTP連接，但在前端我們只能檢查配置
    return 'healthy'
  } catch (error) {
    console.error('Email service health check failed:', error)
    return 'error'
  }
}

// 獲取系統狀態
export async function getSystemStatus(): Promise<SystemStatus> {
  const [database, aiService, storage, emailService] = await Promise.all([
    checkDatabaseHealth(),
    checkAIServiceHealth(),
    checkStorageHealth(),
    checkEmailServiceHealth()
  ])

  return {
    database,
    aiService,
    storage,
    emailService
  }
}

// 模擬系統指標（實際應用中應該從後端API獲取）
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    // 獲取數據庫相關指標
    const startTime = Date.now()
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    const dbResponseTime = Date.now() - startTime

    // 模擬系統指標（實際部署時應該從系統監控API獲取真實數據）
    return {
      cpuUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
      memoryUsage: Math.floor(Math.random() * 20) + 50, // 50-70%
      storageUsage: Math.floor(Math.random() * 15) + 70, // 70-85%
      dbConnections: Math.floor(Math.random() * 10) + 5, // 5-15
      responseTime: dbResponseTime
    }
  } catch (error) {
    console.error('Failed to get system metrics:', error)
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      storageUsage: 0,
      dbConnections: 0,
      responseTime: 0
    }
  }
}

// 獲取數據庫大小和存儲使用情況
export async function getStorageMetrics() {
  try {
    // 獲取各表的記錄數量
    const [
      { count: profilesCount },
      { count: questionsCount },
      { count: sessionsCount },
      { count: documentsCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('practice_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('exam_documents').select('*', { count: 'exact', head: true })
    ])

    // 估算數據庫大小（每條記錄約1KB）
    const totalRecords = (profilesCount || 0) + (questionsCount || 0) + (sessionsCount || 0) + (documentsCount || 0)
    const estimatedDbSize = totalRecords * 1024 // bytes

    return {
      totalRecords,
      estimatedDbSize,
      profilesCount: profilesCount || 0,
      questionsCount: questionsCount || 0,
      sessionsCount: sessionsCount || 0,
      documentsCount: documentsCount || 0
    }
  } catch (error) {
    console.error('Failed to get storage metrics:', error)
    return {
      totalRecords: 0,
      estimatedDbSize: 0,
      profilesCount: 0,
      questionsCount: 0,
      sessionsCount: 0,
      documentsCount: 0
    }
  }
}