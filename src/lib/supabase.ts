import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 資料庫型別定義
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  sort_order: number
  created_at: string
}

export interface Question {
  id: string
  category_id?: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay'
  difficulty_level: number
  points: number
  time_limit: number
  tags?: string[]
  source_file?: string
  created_by?: string
  created_at: string
  updated_at: string
  category?: Category
  options?: QuestionOption[]
  explanations?: QuestionExplanation[]
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  explanation?: string
  sort_order: number
}

export interface QuestionExplanation {
  id: string
  question_id: string
  explanation_text: string
  explanation_type: 'ai_generated' | 'manual' | 'imported'
  source_reference?: string
  created_by?: string
  created_at: string
}

export interface TestSession {
  id: string
  user_id: string
  session_name?: string
  session_type: 'practice' | 'mock_exam' | 'formal_exam'
  category_filter?: string[]
  difficulty_filter?: number[]
  total_questions: number
  answered_questions: number
  correct_answers: number
  total_score: number
  max_score: number
  start_time: string
  end_time?: string
  status: 'in_progress' | 'completed' | 'paused' | 'abandoned'
}

export interface UserAnswer {
  id: string
  session_id: string
  question_id: string
  user_id: string
  selected_option_id?: string
  user_answer_text?: string
  is_correct?: boolean
  time_spent: number
  answered_at: string
}

export interface LearningStats {
  id: string
  user_id: string
  category_id: string
  total_attempts: number
  correct_attempts: number
  total_time_spent: number
  last_practice_date?: string
  mastery_level: number
  created_at: string
  updated_at: string
}

export interface ImportLog {
  id: string
  file_name: string
  file_type: string
  file_size?: number
  questions_imported: number
  import_status: 'processing' | 'completed' | 'failed' | 'partial'
  error_message?: string
  ai_analysis_result?: any
  imported_by?: string
  created_at: string
}