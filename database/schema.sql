-- Supabase 永續發展能力測驗平台資料庫架構

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 注意：Supabase 會自動處理 JWT 設定，無需手動配置

-- =============================================
-- 使用者相關表格
-- =============================================

-- 使用者基本資料表（擴展 auth.users）
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 使用者權限策略
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- 試題相關表格
-- =============================================

-- 試題類別表
CREATE TABLE public.question_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 歷屆試題文件表
CREATE TABLE public.exam_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  session INTEGER NOT NULL, -- 第幾次考試 (01, 02, 03)
  file_url TEXT NOT NULL,
  file_size INTEGER,
  upload_by UUID REFERENCES public.profiles(id),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ocr_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 題目表
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exam_document_id UUID REFERENCES public.exam_documents(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.question_categories(id),
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  ai_generated_explanation TEXT,
  ai_explanation_reviewed BOOLEAN DEFAULT FALSE,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  tags TEXT[], -- PostgreSQL 陣列，存放標籤
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_document_id, question_number)
);

-- =============================================
-- 練習相關表格
-- =============================================

-- 練習會話表
CREATE TABLE public.practice_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'random' CHECK (session_type IN ('random', 'category', 'wrong_questions', 'favorites')),
  category_id UUID REFERENCES public.question_categories(id),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER
);

-- 練習答題記錄表
CREATE TABLE public.practice_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer TEXT CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  answer_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用者收藏題目表
CREATE TABLE public.user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 錯題記錄表
CREATE TABLE public.wrong_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  wrong_count INTEGER DEFAULT 1,
  last_wrong_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mastered BOOLEAN DEFAULT FALSE, -- 是否已掌握
  UNIQUE(user_id, question_id)
);

-- =============================================
-- 排行榜相關表格
-- =============================================

-- 每日排行榜記錄
CREATE TABLE public.daily_rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
  total_time_seconds INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0, -- 計算得分
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 總排行榜記錄
CREATE TABLE public.overall_rankings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  overall_accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
  total_practice_time_seconds INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  ranking_position INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 索引優化
-- =============================================

-- 練習會話相關索引
CREATE INDEX idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_completed ON public.practice_sessions(completed);
CREATE INDEX idx_practice_answers_session_id ON public.practice_answers(session_id);
CREATE INDEX idx_practice_answers_question_id ON public.practice_answers(question_id);

-- 題目相關索引
CREATE INDEX idx_questions_category_id ON public.questions(category_id);
CREATE INDEX idx_questions_exam_document_id ON public.questions(exam_document_id);
CREATE INDEX idx_questions_tags ON public.questions USING GIN(tags);

-- 收藏和錯題索引
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_wrong_answers_user_id ON public.wrong_answers(user_id);
CREATE INDEX idx_wrong_answers_mastered ON public.wrong_answers(mastered);

-- 排行榜索引
CREATE INDEX idx_daily_rankings_date ON public.daily_rankings(date);
CREATE INDEX idx_daily_rankings_score ON public.daily_rankings(score DESC);
CREATE INDEX idx_overall_rankings_score ON public.overall_rankings(total_score DESC);

-- =============================================
-- RLS 政策設定
-- =============================================

-- 啟用所有表格的 RLS
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wrong_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overall_rankings ENABLE ROW LEVEL SECURITY;

-- 題目類別政策（所有人可讀）
CREATE POLICY "Question categories are viewable by everyone" ON public.question_categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify question categories" ON public.question_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 試題文件政策
CREATE POLICY "Exam documents are viewable by everyone" ON public.exam_documents
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify exam documents" ON public.exam_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 題目政策
CREATE POLICY "Questions are viewable by everyone" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 練習會話政策（使用者只能存取自己的記錄）
CREATE POLICY "Users can view own practice sessions" ON public.practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own practice sessions" ON public.practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice sessions" ON public.practice_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 練習答題記錄政策
CREATE POLICY "Users can view own practice answers" ON public.practice_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.practice_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own practice answers" ON public.practice_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.practice_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- 收藏題目政策
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- 錯題記錄政策
CREATE POLICY "Users can manage own wrong answers" ON public.wrong_answers
  FOR ALL USING (auth.uid() = user_id);

-- 排行榜政策
CREATE POLICY "Daily rankings are viewable by everyone" ON public.daily_rankings
  FOR SELECT USING (true);

CREATE POLICY "Users can update own daily rankings" ON public.daily_rankings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Overall rankings are viewable by everyone" ON public.overall_rankings
  FOR SELECT USING (true);

CREATE POLICY "Users can update own overall rankings" ON public.overall_rankings
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 觸發函數和自動更新
-- =============================================

-- 更新 updated_at 時間戳的函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表格添加自動更新觸發器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_documents_updated_at BEFORE UPDATE ON public.exam_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 自動創建使用者檔案的函數
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 當新使用者註冊時自動創建檔案
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 初始資料
-- =============================================

-- 插入基本題目類別
INSERT INTO public.question_categories (name, description) VALUES
('環境永續', '環境保護、氣候變遷、資源管理等相關題目'),
('社會永續', '社會責任、勞工權益、社區發展等相關題目'),
('經濟永續', '永續金融、綠色投資、循環經濟等相關題目'),
('治理永續', '企業治理、透明度、風險管理等相關題目'),
('綜合應用', '跨領域整合、案例分析等綜合性題目');

-- 創建管理員使用者（需要手動設定）
-- 注意：實際部署時需要透過 Supabase Auth 介面或程式創建第一個管理員

-- =============================================
-- Storage 配置
-- =============================================

-- 創建 avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 頭像上傳政策：只允許認證用戶上傳自己的頭像
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 頭像查看政策：所有人可以查看頭像
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 頭像更新政策：用戶可以更新自己的頭像
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 頭像刪除政策：用戶可以刪除自己的頭像
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  ); 