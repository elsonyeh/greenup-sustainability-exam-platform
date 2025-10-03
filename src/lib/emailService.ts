// 郵件服務
import { supabase } from './supabase'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
}

export interface EmailNotification {
  id: string
  recipient: string
  subject: string
  content: string
  status: 'pending' | 'sent' | 'failed'
  sentAt?: string
  createdAt: string
}

// 預定義的郵件模板
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: '歡迎郵件',
    subject: '歡迎加入永續發展能力測驗平台',
    content: `
親愛的 {{userName}}，

歡迎加入永續發展能力測驗平台！

我們很高興您選擇我們的平台來提升您的永續發展知識。在這裡，您可以：

• 練習各種永續發展相關題目
• 查看詳細的解答說明
• 追蹤您的學習進度
• 與其他學習者競爭排名

開始您的學習之旅：
{{platformUrl}}/practice

如有任何問題，請隨時聯繫我們。

祝您學習愉快！
永續發展能力測驗平台團隊
    `,
    variables: ['userName', 'platformUrl']
  },
  {
    id: 'streak_reminder',
    name: '學習提醒',
    subject: '別忘了今天的學習！',
    content: `
親愛的 {{userName}}，

您已經連續學習 {{streakDays}} 天了，真是太棒了！

但我們注意到您今天還沒有進行練習。保持學習習慣對提升您的永續發展知識很重要。

立即開始今天的練習：
{{practiceUrl}}

繼續保持您的學習紀錄！

永續發展能力測驗平台團隊
    `,
    variables: ['userName', 'streakDays', 'practiceUrl']
  },
  {
    id: 'achievement',
    name: '成就通知',
    subject: '恭喜！您獲得了新成就',
    content: `
親愛的 {{userName}}，

恭喜您獲得新成就：{{achievementName}}！

您的努力得到了回報：
• 總答題數：{{totalQuestions}}
• 正確率：{{accuracy}}%
• 學習天數：{{studyDays}}

繼續保持優秀的表現！

查看您的完整統計：
{{statsUrl}}

永續發展能力測驗平台團隊
    `,
    variables: ['userName', 'achievementName', 'totalQuestions', 'accuracy', 'studyDays', 'statsUrl']
  },
  {
    id: 'weekly_report',
    name: '週報',
    subject: '您本週的學習報告',
    content: `
親愛的 {{userName}}，

這是您本週的學習報告：

📊 本週統計：
• 練習次數：{{weeklySessions}}
• 答題總數：{{weeklyQuestions}}
• 平均正確率：{{weeklyAccuracy}}%
• 學習時間：{{weeklyHours}} 小時

🏆 表現亮點：
{{highlights}}

📈 改進建議：
{{suggestions}}

繼續您的學習旅程：
{{practiceUrl}}

永續發展能力測驗平台團隊
    `,
    variables: ['userName', 'weeklySessions', 'weeklyQuestions', 'weeklyAccuracy', 'weeklyHours', 'highlights', 'suggestions', 'practiceUrl']
  },
  {
    id: 'admin_alert',
    name: '管理員警報',
    subject: '系統警報：{{alertType}}',
    content: `
管理員您好，

系統檢測到以下警報：

警報類型：{{alertType}}
警報級別：{{alertLevel}}
發生時間：{{alertTime}}
詳細信息：{{alertDetails}}

建議採取的行動：
{{recommendedActions}}

請及時處理此警報。

系統監控
    `,
    variables: ['alertType', 'alertLevel', 'alertTime', 'alertDetails', 'recommendedActions']
  }
]

// 渲染郵件模板
export function renderEmailTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string; content: string } {
  let subject = template.subject
  let content = template.content

  // 替換模板變量
  template.variables.forEach(variable => {
    const value = variables[variable] || `[${variable}]`
    const regex = new RegExp(`{{${variable}}}`, 'g')
    subject = subject.replace(regex, value)
    content = content.replace(regex, value)
  })

  return { subject, content }
}

// 發送歡迎郵件
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const template = EMAIL_TEMPLATES.find(t => t.id === 'welcome')
  if (!template) return false

  const { subject, content } = renderEmailTemplate(template, {
    userName,
    platformUrl: window.location.origin
  })

  return await sendEmail(userEmail, subject, content)
}

// 發送學習提醒
export async function sendStreakReminder(userEmail: string, userName: string, streakDays: number): Promise<boolean> {
  const template = EMAIL_TEMPLATES.find(t => t.id === 'streak_reminder')
  if (!template) return false

  const { subject, content } = renderEmailTemplate(template, {
    userName,
    streakDays: streakDays.toString(),
    practiceUrl: `${window.location.origin}/practice`
  })

  return await sendEmail(userEmail, subject, content)
}

// 發送成就通知
export async function sendAchievementEmail(
  userEmail: string,
  userName: string,
  achievementName: string,
  stats: { totalQuestions: number; accuracy: number; studyDays: number }
): Promise<boolean> {
  const template = EMAIL_TEMPLATES.find(t => t.id === 'achievement')
  if (!template) return false

  const { subject, content } = renderEmailTemplate(template, {
    userName,
    achievementName,
    totalQuestions: stats.totalQuestions.toString(),
    accuracy: stats.accuracy.toString(),
    studyDays: stats.studyDays.toString(),
    statsUrl: `${window.location.origin}/stats`
  })

  return await sendEmail(userEmail, subject, content)
}

// 發送管理員警報
export async function sendAdminAlert(
  alertType: string,
  alertLevel: 'info' | 'warning' | 'error',
  alertDetails: string,
  recommendedActions: string
): Promise<boolean> {
  // 獲取管理員郵件地址
  const { data: admins } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin')

  if (!admins || admins.length === 0) return false

  const template = EMAIL_TEMPLATES.find(t => t.id === 'admin_alert')
  if (!template) return false

  const { subject, content } = renderEmailTemplate(template, {
    alertType,
    alertLevel,
    alertTime: new Date().toLocaleString('zh-TW'),
    alertDetails,
    recommendedActions
  })

  // 發送給所有管理員
  const results = await Promise.all(
    admins.map(admin => sendEmail(admin.email, subject, content))
  )

  return results.some(result => result)
}

// 基礎郵件發送函數
export async function sendEmail(to: string, subject: string, content: string): Promise<boolean> {
  try {
    // 在實際應用中，這裡應該調用後端API發送郵件
    // 這裡我們模擬郵件發送並記錄到數據庫

    // 將郵件記錄存儲到數據庫
    const { error } = await supabase
      .from('email_notifications')
      .insert({
        recipient: to,
        subject,
        content,
        status: 'pending'
      })

    if (error) {
      console.error('Failed to record email:', error)
      return false
    }

    // 模擬郵件發送（實際應該調用SMTP服務）
    console.log(`郵件發送模擬：
收件人: ${to}
主題: ${subject}
內容預覽: ${content.substring(0, 100)}...`)

    // 在實際應用中，這裡會有真實的SMTP發送邏輯
    // 例如使用 nodemailer、SendGrid、AWS SES 等服務

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// 檢查郵件服務配置
export function checkEmailConfiguration(): {
  configured: boolean
  missingConfig: string[]
} {
  const requiredConfig = [
    'VITE_SMTP_HOST',
    'VITE_SMTP_PORT',
    'VITE_SMTP_USER',
    'VITE_SMTP_PASS'
  ]

  const missingConfig = requiredConfig.filter(key => !import.meta.env[key])

  return {
    configured: missingConfig.length === 0,
    missingConfig
  }
}

// 測試郵件發送
export async function testEmailService(): Promise<{ success: boolean; message: string }> {
  try {
    const config = checkEmailConfiguration()

    if (!config.configured) {
      return {
        success: false,
        message: `郵件服務未完整配置，缺少: ${config.missingConfig.join(', ')}`
      }
    }

    // 發送測試郵件
    const testSuccess = await sendEmail(
      'admin@example.com',
      '郵件服務測試',
      '這是一封測試郵件，用於驗證郵件服務是否正常工作。'
    )

    if (testSuccess) {
      return {
        success: true,
        message: '郵件服務測試成功'
      }
    } else {
      return {
        success: false,
        message: '郵件發送失敗'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `郵件服務測試失敗: ${error}`
    }
  }
}

// 獲取郵件發送統計
export async function getEmailStats() {
  try {
    const { data, error } = await supabase
      .from('email_notifications')
      .select('status, created_at')

    // 如果表格不存在 (PGRST205)，靜默返回空統計
    if (error) {
      if (error.code === 'PGRST205') {
        console.info('email_notifications table not found - returning empty stats')
        return {
          total: 0,
          todayTotal: 0,
          pending: 0,
          sent: 0,
          failed: 0
        }
      }
      throw error
    }

    const today = new Date().toISOString().split('T')[0]
    const todayEmails = data?.filter(email =>
      email.created_at.startsWith(today)
    ) || []

    const stats = {
      total: data?.length || 0,
      todayTotal: todayEmails.length,
      pending: data?.filter(email => email.status === 'pending').length || 0,
      sent: data?.filter(email => email.status === 'sent').length || 0,
      failed: data?.filter(email => email.status === 'failed').length || 0
    }

    return stats
  } catch (error) {
    console.error('Failed to get email stats:', error)
    return {
      total: 0,
      todayTotal: 0,
      pending: 0,
      sent: 0,
      failed: 0
    }
  }
}