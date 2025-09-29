import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 重新導向URL配置
export const getRedirectUrl = () => {
  return import.meta.env.PROD
    ? 'https://greenup-sustainability-exam-platfor-three.vercel.app/auth/callback'
    : 'http://localhost:5173/auth/callback'
}

// 型別定義
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user'
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user'
        }
      }
      question_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      exam_documents: {
        Row: {
          id: string
          title: string
          year: number
          session: number
          file_url: string
          file_size: number | null
          upload_by: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          year: number
          session: number
          file_url: string
          file_size?: number | null
          upload_by?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_text?: string | null
        }
        Update: {
          id?: string
          title?: string
          year?: number
          session?: number
          file_url?: string
          file_size?: number | null
          upload_by?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          ocr_text?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          exam_document_id: string | null
          category_id: string | null
          question_number: number
          question_text: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          correct_answer: 'A' | 'B' | 'C' | 'D'
          explanation: string | null
          ai_generated_explanation: string | null
          ai_explanation_reviewed: boolean
          difficulty_level: number
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_document_id?: string | null
          category_id?: string | null
          question_number: number
          question_text: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          correct_answer: 'A' | 'B' | 'C' | 'D'
          explanation?: string | null
          ai_generated_explanation?: string | null
          ai_explanation_reviewed?: boolean
          difficulty_level?: number
          tags?: string[] | null
        }
        Update: {
          id?: string
          exam_document_id?: string | null
          category_id?: string | null
          question_number?: number
          question_text?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          correct_answer?: 'A' | 'B' | 'C' | 'D'
          explanation?: string | null
          ai_generated_explanation?: string | null
          ai_explanation_reviewed?: boolean
          difficulty_level?: number
          tags?: string[] | null
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: 'random' | 'category' | 'wrong_questions' | 'favorites'
          category_id: string | null
          total_questions: number
          correct_answers: number
          completed: boolean
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
        }
        Insert: {
          id?: string
          user_id: string
          session_type?: 'random' | 'category' | 'wrong_questions' | 'favorites'
          category_id?: string | null
          total_questions?: number
          correct_answers?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: 'random' | 'category' | 'wrong_questions' | 'favorites'
          category_id?: string | null
          total_questions?: number
          correct_answers?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
        }
      }
      practice_answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          user_answer: 'A' | 'B' | 'C' | 'D' | null
          is_correct: boolean
          answer_time_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          user_answer?: 'A' | 'B' | 'C' | 'D' | null
          is_correct: boolean
          answer_time_seconds?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          user_answer?: 'A' | 'B' | 'C' | 'D' | null
          is_correct?: boolean
          answer_time_seconds?: number | null
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          question_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
        }
      }
      wrong_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          wrong_count: number
          last_wrong_at: string
          mastered: boolean
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          wrong_count?: number
          last_wrong_at?: string
          mastered?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          wrong_count?: number
          last_wrong_at?: string
          mastered?: boolean
        }
      }
      daily_rankings: {
        Row: {
          id: string
          user_id: string
          date: string
          questions_answered: number
          correct_answers: number
          accuracy_rate: number
          total_time_seconds: number
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          questions_answered?: number
          correct_answers?: number
          accuracy_rate?: number
          total_time_seconds?: number
          score?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          questions_answered?: number
          correct_answers?: number
          accuracy_rate?: number
          total_time_seconds?: number
          score?: number
        }
      }
      overall_rankings: {
        Row: {
          user_id: string
          total_questions_answered: number
          total_correct_answers: number
          overall_accuracy_rate: number
          total_practice_time_seconds: number
          total_score: number
          ranking_position: number | null
          last_updated: string
        }
        Insert: {
          user_id: string
          total_questions_answered?: number
          total_correct_answers?: number
          overall_accuracy_rate?: number
          total_practice_time_seconds?: number
          total_score?: number
          ranking_position?: number | null
        }
        Update: {
          user_id?: string
          total_questions_answered?: number
          total_correct_answers?: number
          overall_accuracy_rate?: number
          total_practice_time_seconds?: number
          total_score?: number
          ranking_position?: number | null
        }
      }
    }
  }
} 