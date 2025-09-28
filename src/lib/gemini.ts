import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.REACT_APP_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Gemini AI 題庫處理 Prompt
export const QUESTION_EXTRACTION_PROMPT = `
你是一個專業的永續發展基礎能力測驗題庫處理專家。請分析PDF文件中的測驗題目，並將其轉換為結構化的JSON格式。

請遵循以下格式要求：
1. 每個題目必須包含：
   - question_text: 題目完整文字
   - options: 4個選項的陣列 (不包含編號)
   - correct_answer: 正確答案編號 (0-3)
   - explanation: 詳細解析說明
   - category: 題目分類 (環境永續/社會永續/經濟永續/治理永續/綜合應用)
   - difficulty: 難度等級 (1-5)
   - tags: 相關標籤陣列
   - year: 考試年度

2. 分類標準：
   - 環境永續: 氣候變遷、碳排放、能源、環境保護等
   - 社會永續: 社會責任、人權、勞工權益、社區發展等
   - 經濟永續: 永續金融、綠色投資、ESG投資等
   - 治理永續: 公司治理、風險管理、透明度、法規遵循等
   - 綜合應用: 跨領域整合、案例分析、政策應用等

3. 難度評估：
   - 1: 基礎概念、定義題
   - 2: 基本理解、簡單應用
   - 3: 中等應用、分析比較
   - 4: 複雜應用、綜合判斷
   - 5: 高階分析、專業判斷

請分析題目內容並輸出完整的JSON格式資料。確保每個題目都有詳細且準確的解析說明。
`

export const QUESTION_ANALYSIS_PROMPT = `
作為永續發展專家，請為這個題目提供詳細的解析說明：

題目: {question}
選項: {options}
正確答案: {correct_answer}

請提供：
1. 為什麼這個選項是正確的
2. 其他選項為什麼不正確
3. 相關的永續發展概念說明
4. 實務應用或案例
5. 延伸學習建議

請用繁體中文回答，內容要專業且易懂。
`

export async function extractQuestionsFromText(text: string): Promise<any[]> {
  try {
    const prompt = `${QUESTION_EXTRACTION_PROMPT}\n\n請分析以下文字內容：\n\n${text}`
    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()

    // 嘗試解析 JSON
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('無法解析 AI 回應為 JSON 格式')
  } catch (error) {
    console.error('AI 題目提取失敗:', error)
    throw error
  }
}

export async function generateQuestionExplanation(
  question: string,
  options: string[],
  correctAnswer: number
): Promise<string> {
  try {
    const prompt = QUESTION_ANALYSIS_PROMPT
      .replace('{question}', question)
      .replace('{options}', options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n'))
      .replace('{correct_answer}', `${correctAnswer + 1}. ${options[correctAnswer]}`)

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('AI 解析生成失敗:', error)
    throw error
  }
}

// 檔案比對和分析 Prompt
export const FILE_COMPARISON_PROMPT = `
你是一個專業的永續發展基礎能力測驗檔案分析專家。請分析並比對題目檔案與答案檔案的內容。

請執行以下任務：
1. 比對題目檔案與答案檔案，確保每個題目都有對應的答案
2. 驗證答案的正確性和完整性
3. 分析題目的品質和分佈
4. 識別可能的錯誤或不一致之處
5. 生成詳細的匯入報告

請按照以下格式回應：
{
  "comparison_result": {
    "total_questions_found": 數量,
    "matched_questions": 數量,
    "unmatched_questions": 數量,
    "duplicate_questions": 數量,
    "invalid_questions": 數量
  },
  "quality_analysis": {
    "category_distribution": {分類分佈統計},
    "difficulty_distribution": {難度分佈統計},
    "average_quality_score": 評分 (1-10)
  },
  "issues_found": [
    {
      "type": "問題類型",
      "description": "問題描述",
      "question_number": "題號",
      "severity": "high/medium/low"
    }
  ],
  "recommendations": ["建議1", "建議2", "..."],
  "processed_questions": [
    {
      "question_text": "題目內容",
      "options": ["選項1", "選項2", "選項3", "選項4"],
      "correct_answer": 正確答案索引,
      "explanation": "詳細解析",
      "category": "分類",
      "difficulty_level": 難度等級,
      "tags": ["標籤1", "標籤2"],
      "quality_score": 品質評分
    }
  ]
}

請仔細分析內容並提供準確的結果。
`

export async function compareQuestionAndAnswerFiles(
  questionFileContent: string,
  answerFileContent: string
): Promise<{
  comparison_result: any
  quality_analysis: any
  issues_found: any[]
  recommendations: string[]
  processed_questions: any[]
}> {
  try {
    const prompt = `${FILE_COMPARISON_PROMPT}

題目檔案內容：
${questionFileContent}

答案檔案內容：
${answerFileContent}

請分析比對上述兩個檔案的內容。`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()

    // 嘗試解析 JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('無法解析 AI 回應為 JSON 格式')
  } catch (error) {
    console.error('AI 檔案比對失敗:', error)
    throw error
  }
}

// 批量生成解析
export async function batchGenerateExplanations(
  questions: Array<{
    question_text: string
    options: string[]
    correct_answer: number
  }>
): Promise<string[]> {
  const explanations = []

  for (const question of questions) {
    try {
      const explanation = await generateQuestionExplanation(
        question.question_text,
        question.options,
        question.correct_answer
      )
      explanations.push(explanation)

      // 避免 API 限制，添加延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('批量生成解析失敗:', error)
      explanations.push('解析生成失敗，請稍後重試。')
    }
  }

  return explanations
}

// 智能題目分類
export const SMART_CATEGORIZATION_PROMPT = `
作為永續發展專家，請為以下題目進行智能分類和標籤：

題目: {question_text}

請分析題目內容並提供：
1. 主要分類 (環境永續/社會永續/經濟永續/治理永續/ESG整合)
2. 子分類 (更具體的領域)
3. 相關標籤 (3-5個關鍵詞)
4. 建議難度等級 (1-5)
5. 學習目標對應

請以JSON格式回應：
{
  "primary_category": "主要分類",
  "sub_category": "子分類",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "difficulty_level": 難度等級,
  "learning_objectives": ["學習目標1", "學習目標2"]
}
`

export async function smartCategorizeQuestion(questionText: string): Promise<{
  primary_category: string
  sub_category: string
  tags: string[]
  difficulty_level: number
  learning_objectives: string[]
}> {
  try {
    const prompt = SMART_CATEGORIZATION_PROMPT.replace('{question_text}', questionText)

    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('無法解析 AI 回應為 JSON 格式')
  } catch (error) {
    console.error('AI 智能分類失敗:', error)
    throw error
  }
}