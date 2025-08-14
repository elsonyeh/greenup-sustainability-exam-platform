import OpenAI from 'openai'

// 初始化 OpenAI 客戶端
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 注意：生產環境建議在後端處理
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

// 生成 AI 解答
export async function generateAIExplanation({
  question,
  context = '',
  language = 'zh-TW'
}: AIExplanationRequest): Promise<AIExplanationResponse> {
  try {
    const prompt = createExplanationPrompt(question, context, language)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(language)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const parsedResponse = JSON.parse(response) as AIExplanationResponse
    return parsedResponse

  } catch (error) {
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
    
    // 分批處理，避免API限制
    const batchSize = 5
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
        } catch (error) {
          console.error(`Failed to generate explanation for question ${question.id}:`, error)
          return null
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results[result.value.questionId] = result.value.explanation
        }
      })

      // 短暫延遲，避免觸發API限制
      if (i + batchSize < questions.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
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
    'zh-TW': `請為以下永續發展能力測驗題目提供詳細解答：

題目：${question.question_text}

選項：
${options}

正確答案：${question.correct_answer}. ${correctOptionText}

${context ? `相關背景：${context}` : ''}

請以JSON格式回應，包含以下欄位：
- explanation: 詳細解答說明 (200-400字)
- confidence: 信心度 (0-1之間的數字)
- keyPoints: 關鍵要點陣列 (3-5個要點)
- relatedConcepts: 相關概念陣列 (3-5個概念)

解答應該：
1. 說明為什麼正確答案是正確的
2. 解釋其他選項為什麼不正確
3. 提供相關的永續發展概念背景
4. 使用繁體中文回應`,

    'zh-CN': `请为以下可持续发展能力测验题目提供详细解答：

题目：${question.question_text}

选项：
${options}

正确答案：${question.correct_answer}. ${correctOptionText}

${context ? `相关背景：${context}` : ''}

请以JSON格式回应，包含以下字段：
- explanation: 详细解答说明 (200-400字)
- confidence: 信心度 (0-1之间的数字)  
- keyPoints: 关键要点数组 (3-5个要点)
- relatedConcepts: 相关概念数组 (3-5个概念)

解答应该：
1. 说明为什么正确答案是正确的
2. 解释其他选项为什么不正确
3. 提供相关的可持续发展概念背景
4. 使用简体中文回应`,

    'en': `Please provide a detailed explanation for the following sustainability competency exam question:

Question: ${question.question_text}

Options:
${options}

Correct Answer: ${question.correct_answer}. ${correctOptionText}

${context ? `Background Context: ${context}` : ''}

Please respond in JSON format with the following fields:
- explanation: Detailed explanation (200-400 words)
- confidence: Confidence level (number between 0-1)
- keyPoints: Array of key points (3-5 points)
- relatedConcepts: Array of related concepts (3-5 concepts)

The explanation should:
1. Explain why the correct answer is right
2. Explain why other options are incorrect
3. Provide relevant sustainable development background
4. Respond in English`
  }

  return prompts[language]
}

// 系統提示詞
function getSystemPrompt(language: 'zh-TW' | 'zh-CN' | 'en'): string {
  const prompts = {
    'zh-TW': `你是一位永續發展領域的專家教師，專門為永續發展基礎能力測驗提供詳細的解答說明。

你的職責包括：
- 提供準確、清晰的題目解答
- 解釋永續發展相關概念和原理
- 幫助學習者理解環境、社會、經濟和治理永續的各個面向
- 使用繁體中文進行說明

請確保你的解答：
- 基於正確的永續發展知識
- 適合初學者理解
- 包含實際案例或應用
- 格式清晰且有邏輯性`,

    'zh-CN': `你是一位可持续发展领域的专家教师，专门为可持续发展基础能力测验提供详细的解答说明。

你的职责包括：
- 提供准确、清晰的题目解答
- 解释可持续发展相关概念和原理
- 帮助学习者理解环境、社会、经济和治理可持续的各个方面
- 使用简体中文进行说明

请确保你的解答：
- 基于正确的可持续发展知识
- 适合初学者理解
- 包含实际案例或应用
- 格式清晰且有逻辑性`,

    'en': `You are an expert teacher in sustainable development, specializing in providing detailed explanations for sustainability competency assessments.

Your responsibilities include:
- Providing accurate, clear explanations for questions
- Explaining sustainability-related concepts and principles
- Helping learners understand environmental, social, economic, and governance aspects of sustainability
- Communicating in clear English

Please ensure your explanations:
- Are based on accurate sustainability knowledge
- Are suitable for beginners to understand
- Include practical examples or applications
- Are well-formatted and logical`
  }

  return prompts[language]
}

// 驗證 OpenAI API 配置
export function validateOpenAIConfig(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  return !!apiKey && apiKey.startsWith('sk-')
}

// 測試 API 連接
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    if (!validateOpenAIConfig()) {
      return false
    }

    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5
    })

    return true
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
    return false
  }
}

// 錯誤處理輔助函數
export function handleOpenAIError(error: any): string {
  if (error?.code === 'insufficient_quota') {
    return 'API 配額不足，請檢查您的 OpenAI 帳戶'
  }
  
  if (error?.code === 'invalid_api_key') {
    return 'API 金鑰無效，請檢查配置'
  }
  
  if (error?.code === 'rate_limit_exceeded') {
    return 'API 呼叫過於頻繁，請稍後再試'
  }

  return '生成 AI 解答時發生錯誤，請稍後再試'
} 