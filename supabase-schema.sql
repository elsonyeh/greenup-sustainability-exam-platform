-- 永續發展基礎能力測驗練習平台資料庫結構

-- 用戶表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 題目分類表
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 題目表
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  points INTEGER DEFAULT 1,
  time_limit INTEGER DEFAULT 60, -- 秒數
  tags TEXT[], -- PostgreSQL 陣列類型
  source_file TEXT, -- 原始檔案來源
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 選擇題選項表
CREATE TABLE IF NOT EXISTS question_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 題目解析表
CREATE TABLE IF NOT EXISTS question_explanations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  explanation_text TEXT NOT NULL,
  explanation_type VARCHAR(20) DEFAULT 'ai_generated' CHECK (explanation_type IN ('ai_generated', 'manual', 'imported')),
  source_reference TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 測驗會話表
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_name VARCHAR(200),
  session_type VARCHAR(20) DEFAULT 'practice' CHECK (session_type IN ('practice', 'mock_exam', 'formal_exam')),
  category_filter UUID[] DEFAULT '{}', -- 篩選的分類
  difficulty_filter INTEGER[] DEFAULT '{}', -- 篩選的難度
  total_questions INTEGER DEFAULT 0,
  answered_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused', 'abandoned'))
);

-- 用戶答題記錄表
CREATE TABLE IF NOT EXISTS user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  user_id UUID REFERENCES users(id),
  selected_option_id UUID REFERENCES question_options(id),
  user_answer_text TEXT, -- 填空題或問答題的答案
  is_correct BOOLEAN,
  time_spent INTEGER DEFAULT 0, -- 答題耗時(秒)
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 學習統計表
CREATE TABLE IF NOT EXISTS learning_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- 總學習時間(秒)
  last_practice_date TIMESTAMP WITH TIME ZONE,
  mastery_level DECIMAL(3,2) DEFAULT 0.00, -- 熟練度 0.00-1.00
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- 文件匯入記錄表
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER,
  questions_imported INTEGER DEFAULT 0,
  import_status VARCHAR(20) DEFAULT 'processing' CHECK (import_status IN ('processing', 'completed', 'failed', 'partial')),
  error_message TEXT,
  ai_analysis_result JSONB, -- AI 分析結果
  imported_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引提升查詢效能
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_answers_session ON user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_user ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_user ON learning_stats(user_id);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_learning_stats_updated_at
    BEFORE UPDATE ON learning_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入預設分類
INSERT INTO categories (name, description, icon, color, sort_order) VALUES
('環境永續', '環境保護、氣候變遷、資源管理等相關題目', '🌱', 'bg-green-100 text-green-800', 1),
('社會永續', '社會責任、人權、勞工權益等相關題目', '👥', 'bg-blue-100 text-blue-800', 2),
('經濟永續', '可持續經濟發展、綠色金融等相關題目', '💰', 'bg-yellow-100 text-yellow-800', 3),
('治理永續', '企業治理、透明度、道德經營等相關題目', '🏛️', 'bg-purple-100 text-purple-800', 4),
('ESG 整合', 'ESG 整體概念與實務應用題目', '🎯', 'bg-indigo-100 text-indigo-800', 5)
ON CONFLICT DO NOTHING;