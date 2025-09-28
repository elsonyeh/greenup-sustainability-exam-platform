import { supabase } from './supabase'
import type {
  Question,
  QuestionOption,
  QuestionExplanation,
  Category,
  ImportLog,
  TestSession,
  UserAnswer,
  LearningStats
} from './supabase'

// 題目相關操作
export const questionService = {
  // 獲取所有題目
  async getQuestions(filters?: {
    category_id?: string
    difficulty_level?: number
    question_type?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('questions')
      .select(`
        *,
        category:categories(*),
        options:question_options(*),
        explanations:question_explanations(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters?.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level)
    }
    if (filters?.question_type) {
      query = query.eq('question_type', filters.question_type)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Question[]
  },

  // 創建題目
  async createQuestion(questionData: Omit<Question, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single()

    if (error) throw error
    return data as Question
  },

  // 創建題目選項
  async createQuestionOptions(questionId: string, options: Omit<QuestionOption, 'id' | 'question_id'>[]) {
    const optionsWithQuestionId = options.map(option => ({
      ...option,
      question_id: questionId
    }))

    const { data, error } = await supabase
      .from('question_options')
      .insert(optionsWithQuestionId)
      .select()

    if (error) throw error
    return data as QuestionOption[]
  },

  // 創建題目解析
  async createQuestionExplanation(explanationData: Omit<QuestionExplanation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('question_explanations')
      .insert(explanationData)
      .select()
      .single()

    if (error) throw error
    return data as QuestionExplanation
  },

  // 批量匯入題目
  async bulkImportQuestions(questions: Array<{
    question: Omit<Question, 'id' | 'created_at' | 'updated_at'>
    options: Omit<QuestionOption, 'id' | 'question_id'>[]
    explanation?: string
  }>) {
    const results = []

    for (const item of questions) {
      try {
        // 創建題目
        const question = await this.createQuestion(item.question)

        // 創建選項
        if (item.options.length > 0) {
          await this.createQuestionOptions(question.id, item.options)
        }

        // 創建解析
        if (item.explanation) {
          await this.createQuestionExplanation({
            question_id: question.id,
            explanation_text: item.explanation,
            explanation_type: 'imported'
          })
        }

        results.push({ success: true, question_id: question.id })
      } catch (error) {
        results.push({ success: false, error: (error as Error).message })
      }
    }

    return results
  }
}

// 分類相關操作
export const categoryService = {
  // 獲取所有分類
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (error) throw error
    return data as Category[]
  },

  // 創建分類
  async createCategory(categoryData: Omit<Category, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error
    return data as Category
  }
}

// 匯入記錄相關操作
export const importService = {
  // 創建匯入記錄
  async createImportLog(logData: Omit<ImportLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('import_logs')
      .insert(logData)
      .select()
      .single()

    if (error) throw error
    return data as ImportLog
  },

  // 更新匯入記錄
  async updateImportLog(id: string, updates: Partial<ImportLog>) {
    const { data, error } = await supabase
      .from('import_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as ImportLog
  },

  // 獲取匯入記錄
  async getImportLogs(limit = 50) {
    const { data, error } = await supabase
      .from('import_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as ImportLog[]
  }
}

// 測驗會話相關操作
export const sessionService = {
  // 創建測驗會話
  async createSession(sessionData: Omit<TestSession, 'id' | 'start_time'>) {
    const { data, error } = await supabase
      .from('test_sessions')
      .insert({
        ...sessionData,
        start_time: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as TestSession
  },

  // 更新測驗會話
  async updateSession(id: string, updates: Partial<TestSession>) {
    const { data, error } = await supabase
      .from('test_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TestSession
  },

  // 記錄用戶答案
  async recordAnswer(answerData: Omit<UserAnswer, 'id' | 'answered_at'>) {
    const { data, error } = await supabase
      .from('user_answers')
      .insert({
        ...answerData,
        answered_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as UserAnswer
  }
}

// 統計相關操作
export const statsService = {
  // 更新學習統計
  async updateLearningStats(userId: string, categoryId: string, isCorrect: boolean, timeSpent: number) {
    // 先檢查是否已有記錄
    const { data: existing } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single()

    if (existing) {
      // 更新現有記錄
      const newTotalAttempts = existing.total_attempts + 1
      const newCorrectAttempts = existing.correct_attempts + (isCorrect ? 1 : 0)
      const newTotalTime = existing.total_time_spent + timeSpent
      const newMasteryLevel = newCorrectAttempts / newTotalAttempts

      const { data, error } = await supabase
        .from('learning_stats')
        .update({
          total_attempts: newTotalAttempts,
          correct_attempts: newCorrectAttempts,
          total_time_spent: newTotalTime,
          mastery_level: newMasteryLevel,
          last_practice_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data as LearningStats
    } else {
      // 創建新記錄
      const { data, error } = await supabase
        .from('learning_stats')
        .insert({
          user_id: userId,
          category_id: categoryId,
          total_attempts: 1,
          correct_attempts: isCorrect ? 1 : 0,
          total_time_spent: timeSpent,
          mastery_level: isCorrect ? 1.0 : 0.0,
          last_practice_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data as LearningStats
    }
  },

  // 獲取用戶學習統計
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('learning_stats')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data as (LearningStats & { category: Category })[]
  }
}