import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from './supabase'
import { sendAdminAlert } from './emailService'

// 初始化 Gemini 客戶端
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 1000,
  }
})

interface Question {
  id: string
  question_text: string
  option_a: string | null
  option_b: string | null
  option_c: string | null
  option_d: string | null
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation?: string | null
}

interface AIExplanationRequest {
  question: Question
  context?: string
  language?: 'zh-TW' | 'zh-CN' | 'en'
}

interface AIExplanationResponse {
  explanation: string
  confidence: number
  keyPoints: string[]
  relatedConcepts: string[]
}

// 錯誤記錄到資料庫
async function logAIError(
  questionId: string,
  errorType: string,
  errorMessage: string,
  errorDetails?: any
): Promise<void> {
  try {
    await supabase.from('ai_generation_errors').insert({
      question_id: questionId,
      error_type: errorType,
      error_message: errorMessage,
      error_details: errorDetails ? JSON.stringify(errorDetails) : null,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log AI error:', error)
  }
}

// 發送嚴重錯誤警報給管理員
async function sendCriticalErrorAlert(
  errorType: string,
  errorCount: number,
  errorMessage: string
): Promise<void> {
  try {
    await sendAdminAlert(
      `AI 解析服務異常 - ${errorType}`,
      'error',
      `檢測到 AI 解析服務出現嚴重錯誤：\n\n錯誤類型：${errorType}\n錯誤訊息：${errorMessage}\n影響題目數：${errorCount}`,
      '請檢查：\n1. Gemini API 金鑰是否有效\n2. API 配額是否充足\n3. 網路連線是否正常\n4. 題目內容是否觸發安全過濾器'
    )
  } catch (error) {
    console.error('Failed to send critical error alert:', error)
  }
}

// 生成 AI 解答
export async function generateAIExplanation({
  question,
  context = '',
  language = 'zh-TW'
}: AIExplanationRequest): Promise<AIExplanationResponse> {
  try {
    const prompt = createExplanationPrompt(question, context, language)

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    // 嘗試解析 JSON 回應
    let parsedResponse: AIExplanationResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (parseError) {
      // JSON 解析失敗，記錄錯誤
      await logAIError(
        question.id,
        'JSON_PARSE_ERROR',
        'AI 回應無法解析為 JSON 格式',
        { responseText: responseText.substring(0, 500) }
      )

      // 創建一個默認回應
      parsedResponse = {
        explanation: responseText,
        confidence: 0.8,
        keyPoints: ['由 AI 生成的解答'],
        relatedConcepts: ['永續發展', '環境保護']
      }
    }

    return parsedResponse

  } catch (error: any) {
    // 記錄錯誤到資料庫
    const errorType = error?.message?.includes('API_KEY_INVALID') ? 'API_KEY_INVALID' :
                      error?.message?.includes('QUOTA_EXCEEDED') ? 'QUOTA_EXCEEDED' :
                      error?.message?.includes('RATE_LIMIT_EXCEEDED') ? 'RATE_LIMIT_EXCEEDED' :
                      error?.message?.includes('SAFETY') ? 'SAFETY_FILTER' :
                      'UNKNOWN_ERROR'

    await logAIError(
      question.id,
      errorType,
      error?.message || '未知錯誤',
      { stack: error?.stack }
    )

    console.error('Error generating AI explanation:', error)
    throw new Error('無法生成 AI 解答，請稍後再試')
  }
}

// 批量生成解答
export async function generateBatchExplanations(
  questions: Question[],
  context = '',
  language: 'zh-TW' | 'zh-CN' | 'en' = 'zh-TW'
): Promise<{ [questionId: string]: AIExplanationResponse }> {
  try {
    const results: { [questionId: string]: AIExplanationResponse } = {}
    let errorCount = 0
    let lastErrorType = ''
    let lastErrorMessage = ''

    // 分批處理，避免API限制
    const batchSize = 3 // Gemini 限制較嚴格，減少批次大小
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize)

      const batchPromises = batch.map(async (question) => {
        try {
          const explanation = await generateAIExplanation({
            question,
            context,
            language
          })
          return { questionId: question.id, explanation }
        } catch (error: any) {
          console.error(`Failed to generate explanation for question ${question.id}:`, error)
          errorCount++
          lastErrorType = error?.message || 'UNKNOWN_ERROR'
          lastErrorMessage = error?.message || '未知錯誤'
          return null
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results[result.value.questionId] = result.value.explanation
        }
      })

      // 延遲，避免觸發API限制
      if (i + batchSize < questions.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 增加延遲時間
      }
    }

    // 如果錯誤數量超過總數的 20%，發送警報給管理員
    if (errorCount > questions.length * 0.2 && errorCount >= 3) {
      await sendCriticalErrorAlert(lastErrorType, errorCount, lastErrorMessage)
    }

    return results
  } catch (error) {
    console.error('Error in batch explanation generation:', error)
    throw error
  }
}

// 創建解答提示詞
function createExplanationPrompt(
  question: Question,
  context: string,
  language: 'zh-TW' | 'zh-CN' | 'en'
): string {
  const options = [
    question.option_a && `A. ${question.option_a}`,
    question.option_b && `B. ${question.option_b}`,
    question.option_c && `C. ${question.option_c}`,
    question.option_d && `D. ${question.option_d}`
  ].filter(Boolean).join('\n')

  const correctOptionText = question[`option_${question.correct_answer.toLowerCase()}` as keyof Question] as string

  const prompts = {
    'zh-TW': `你是一位永續發展領域的專家教師，專門為永續發展基礎能力測驗提供詳細的解答說明。

請為以下永續發展能力測驗題目提供詳細解答：

題目：${question.question_text}

選項：
${options}

正確答案：${question.correct_answer}. ${correctOptionText}

${context ? `相關背景：${context}` : ''}

請以JSON格式回應，包含以下欄位：
{
  "explanation": "詳細解答說明 (200-400字)",
  "confidence": 信心度數字 (0-1之間),
  "keyPoints": ["關鍵要點1", "關鍵要點2", "關鍵要點3"],
  "relatedConcepts": ["相關概念1", "相關概念2", "相關概念3"]
}

解答要求：
1. 說明為什麼正確答案是正確的
2. 解釋其他選項為什麼不正確
3. 提供相關的永續發展概念背景
4. 使用繁體中文回應
5. 確保回應是有效的JSON格式`,

    'zh-CN': `你是一位可持续发展领域的专家教师，专门为可持续发展基础能力测验提供详细的解答说明。

请为以下可持续发展能力测验题目提供详细解答：

题目：${question.question_text}

选项：
${options}

正确答案：${question.correct_answer}. ${correctOptionText}

${context ? `相关背景：${context}` : ''}

请以JSON格式回应，包含以下字段：
{
  "explanation": "详细解答说明 (200-400字)",
  "confidence": 信心度数字 (0-1之间),
  "keyPoints": ["关键要点1", "关键要点2", "关键要点3"],
  "relatedConcepts": ["相关概念1", "相关概念2", "相关概念3"]
}

解答要求：
1. 说明为什么正确答案是正确的
2. 解释其他选项为什么不正确
3. 提供相关的可持续发展概念背景
4. 使用简体中文回应
5. 确保回应是有效的JSON格式`,

    'en': `You are an expert teacher in sustainable development, specializing in providing detailed explanations for sustainability competency assessments.

Please provide a detailed explanation for the following sustainability competency exam question:

Question: ${question.question_text}

Options:
${options}

Correct Answer: ${question.correct_answer}. ${correctOptionText}

${context ? `Background Context: ${context}` : ''}

Please respond in JSON format with the following structure:
{
  "explanation": "Detailed explanation (200-400 words)",
  "confidence": confidence_number (between 0-1),
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "relatedConcepts": ["concept 1", "concept 2", "concept 3"]
}

Requirements:
1. Explain why the correct answer is right
2. Explain why other options are incorrect
3. Provide relevant sustainable development background
4. Respond in English
5. Ensure the response is valid JSON format`
  }

  return prompts[language]
}

// 驗證 Gemini API 配置
export function validateGeminiConfig(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  return !!apiKey && apiKey.startsWith('AIza')
}

// 測試 API 連接
export async function testGeminiConnection(): Promise<boolean> {
  try {
    if (!validateGeminiConfig()) {
      return false
    }

    const result = await model.generateContent('Test connection')
    const response = await result.response
    response.text() // 確保能獲取回應

    return true
  } catch (error) {
    console.error('Gemini connection test failed:', error)
    return false
  }
}

// 錯誤處理輔助函數
export function handleGeminiError(error: any): string {
  if (error?.message?.includes('API_KEY_INVALID')) {
    return 'API 金鑰無效，請檢查 Gemini API 配置'
  }

  if (error?.message?.includes('QUOTA_EXCEEDED')) {
    return 'API 配額不足，請檢查您的 Google Cloud 帳戶'
  }

  if (error?.message?.includes('RATE_LIMIT_EXCEEDED')) {
    return 'API 呼叫過於頻繁，請稍後再試'
  }

  if (error?.message?.includes('SAFETY')) {
    return '內容觸發安全過濾器，請調整題目內容'
  }

  return '生成 AI 解答時發生錯誤，請稍後再試'
}

// 為了保持向後兼容性，保留原有的函數名稱作為別名
export const validateOpenAIConfig = validateGeminiConfig
export const testOpenAIConnection = testGeminiConnection
export const handleOpenAIError = handleGeminiError