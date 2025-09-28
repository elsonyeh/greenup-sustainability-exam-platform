-- GreenUP 永續發展基礎能力測驗練習平台資料庫結構

-- 啟用 RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-token-with-at-least-32-characters-long';

-- 建立用戶配置表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看和更新自己的資料
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 管理員可以查看所有用戶
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 建立題目分類表
CREATE TABLE IF NOT EXISTS question_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入預設分類
INSERT INTO question_categories (id, name, description, icon, color) VALUES
    ('environmental', '環境永續', '環境保護、氣候變遷、資源管理相關議題', '🌱', 'bg-green-100 text-green-800'),
    ('social', '社會永續', '社會責任、勞工權益、社區發展相關議題', '👥', 'bg-blue-100 text-blue-800'),
    ('economic', '經濟永續', '永續金融、綠色投資、循環經濟相關議題', '💰', 'bg-yellow-100 text-yellow-800'),
    ('governance', '治理永續', '企業治理、透明度、風險管理相關議題', '🏛️', 'bg-purple-100 text-purple-800'),
    ('integrated', '綜合應用', '跨領域整合、案例分析、政策應用', '🎯', 'bg-red-100 text-red-800')
ON CONFLICT (id) DO NOTHING;

-- 建立題目表
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
    explanation TEXT,
    category TEXT REFERENCES question_categories(id),
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    tags TEXT[] DEFAULT '{}',
    year INTEGER,
    source TEXT DEFAULT 'manual',
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'archived')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN(tags);

-- 啟用 RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 所有用戶可以查看已發布的題目
CREATE POLICY "Anyone can view active questions" ON questions
    FOR SELECT USING (status = 'active');

-- 管理員可以管理所有題目
CREATE POLICY "Admins can manage all questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 建立練習會話表
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('random', 'category', 'wrong_questions', 'favorites')),
    category_id TEXT REFERENCES question_categories(id),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_type ON practice_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_start_time ON practice_sessions(start_time);

-- 啟用 RLS
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己的練習會話
CREATE POLICY "Users can view own sessions" ON practice_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON practice_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 建立答題記錄表
CREATE TABLE IF NOT EXISTS practice_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    user_answer INTEGER NOT NULL CHECK (user_answer >= 0 AND user_answer <= 3),
    is_correct BOOLEAN NOT NULL,
    answer_time INTEGER DEFAULT 0, -- 答題時間（秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_practice_answers_session ON practice_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_answers_question ON practice_answers(question_id);

-- 啟用 RLS
ALTER TABLE practice_answers ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己練習會話的答題記錄
CREATE POLICY "Users can view own answers" ON practice_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM practice_sessions
            WHERE id = practice_answers.session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own answers" ON practice_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_sessions
            WHERE id = practice_answers.session_id AND user_id = auth.uid()
        )
    );

-- 建立用戶收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    question_id UUID REFERENCES questions(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_question ON user_favorites(question_id);

-- 啟用 RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 用戶只能管理自己的收藏
CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 建立錯題記錄表
CREATE TABLE IF NOT EXISTS wrong_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    question_id UUID REFERENCES questions(id) NOT NULL,
    wrong_count INTEGER DEFAULT 1,
    last_wrong_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mastered BOOLEAN DEFAULT FALSE,
    mastered_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, question_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_wrong_answers_user ON wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_question ON wrong_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_mastered ON wrong_answers(mastered);

-- 啟用 RLS
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己的錯題記錄
CREATE POLICY "Users can view own wrong answers" ON wrong_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wrong answers" ON wrong_answers
    FOR ALL USING (auth.uid() = user_id);

-- 建立每日排行榜表
CREATE TABLE IF NOT EXISTS daily_rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    study_time INTEGER DEFAULT 0, -- 學習時間（分鐘）
    score INTEGER DEFAULT 0,
    rank INTEGER,
    UNIQUE(user_id, date)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_daily_rankings_date ON daily_rankings(date);
CREATE INDEX IF NOT EXISTS idx_daily_rankings_rank ON daily_rankings(rank);
CREATE INDEX IF NOT EXISTS idx_daily_rankings_score ON daily_rankings(score);

-- 啟用 RLS
ALTER TABLE daily_rankings ENABLE ROW LEVEL SECURITY;

-- 所有用戶可以查看排行榜
CREATE POLICY "Anyone can view daily rankings" ON daily_rankings
    FOR SELECT USING (true);

-- 建立總體排行榜表
CREATE TABLE IF NOT EXISTS overall_rankings (
    user_id UUID REFERENCES profiles(id) PRIMARY KEY,
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    overall_accuracy_rate DECIMAL(5,2) DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    rank INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_overall_rankings_rank ON overall_rankings(rank);
CREATE INDEX IF NOT EXISTS idx_overall_rankings_score ON overall_rankings(total_score);

-- 啟用 RLS
ALTER TABLE overall_rankings ENABLE ROW LEVEL SECURITY;

-- 所有用戶可以查看總體排行榜
CREATE POLICY "Anyone can view overall rankings" ON overall_rankings
    FOR SELECT USING (true);

-- 建立考試文件表（用於存儲上傳的 PDF 文件信息）
CREATE TABLE IF NOT EXISTS exam_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER,
    file_url TEXT,
    file_size INTEGER,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    extracted_text TEXT,
    questions_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_exam_documents_year ON exam_documents(year);
CREATE INDEX IF NOT EXISTS idx_exam_documents_status ON exam_documents(processing_status);

-- 啟用 RLS
ALTER TABLE exam_documents ENABLE ROW LEVEL SECURITY;

-- 管理員可以管理所有文件
CREATE POLICY "Admins can manage exam documents" ON exam_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 所有用戶可以查看已完成處理的文件
CREATE POLICY "Anyone can view completed documents" ON exam_documents
    FOR SELECT USING (processing_status = 'completed');

-- 建立觸發器函數來自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表建立觸發器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_documents_updated_at ON exam_documents;
CREATE TRIGGER update_exam_documents_updated_at
    BEFORE UPDATE ON exam_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 建立函數來自動建立用戶配置
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 建立觸發器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 建立函數來計算每日排行榜
CREATE OR REPLACE FUNCTION update_daily_rankings()
RETURNS void AS $$
BEGIN
    -- 更新今日的排行榜數據
    INSERT INTO daily_rankings (user_id, date, questions_answered, correct_answers, accuracy_rate, score)
    SELECT
        ps.user_id,
        CURRENT_DATE,
        COUNT(pa.id) as questions_answered,
        COUNT(CASE WHEN pa.is_correct THEN 1 END) as correct_answers,
        CASE
            WHEN COUNT(pa.id) > 0 THEN
                ROUND((COUNT(CASE WHEN pa.is_correct THEN 1 END)::DECIMAL / COUNT(pa.id)) * 100, 2)
            ELSE 0
        END as accuracy_rate,
        (COUNT(CASE WHEN pa.is_correct THEN 1 END) * 10) +
        (CASE
            WHEN COUNT(pa.id) > 0 THEN
                ROUND((COUNT(CASE WHEN pa.is_correct THEN 1 END)::DECIMAL / COUNT(pa.id)) * 100, 2)
            ELSE 0
        END * 2) as score
    FROM practice_sessions ps
    JOIN practice_answers pa ON ps.id = pa.session_id
    WHERE DATE(ps.start_time) = CURRENT_DATE
    GROUP BY ps.user_id
    ON CONFLICT (user_id, date) DO UPDATE SET
        questions_answered = EXCLUDED.questions_answered,
        correct_answers = EXCLUDED.correct_answers,
        accuracy_rate = EXCLUDED.accuracy_rate,
        score = EXCLUDED.score;

    -- 更新排名
    WITH ranked_scores AS (
        SELECT
            user_id,
            ROW_NUMBER() OVER (ORDER BY score DESC, accuracy_rate DESC, questions_answered DESC) as new_rank
        FROM daily_rankings
        WHERE date = CURRENT_DATE
    )
    UPDATE daily_rankings
    SET rank = ranked_scores.new_rank
    FROM ranked_scores
    WHERE daily_rankings.user_id = ranked_scores.user_id
    AND daily_rankings.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 建立函數來更新總體排行榜
CREATE OR REPLACE FUNCTION update_overall_rankings()
RETURNS void AS $$
BEGIN
    -- 更新總體排行榜數據
    INSERT INTO overall_rankings (user_id, total_questions_answered, total_correct_answers, overall_accuracy_rate, total_score)
    SELECT
        ps.user_id,
        COUNT(pa.id) as total_questions_answered,
        COUNT(CASE WHEN pa.is_correct THEN 1 END) as total_correct_answers,
        CASE
            WHEN COUNT(pa.id) > 0 THEN
                ROUND((COUNT(CASE WHEN pa.is_correct THEN 1 END)::DECIMAL / COUNT(pa.id)) * 100, 2)
            ELSE 0
        END as overall_accuracy_rate,
        (COUNT(CASE WHEN pa.is_correct THEN 1 END) * 10) +
        (CASE
            WHEN COUNT(pa.id) > 0 THEN
                ROUND((COUNT(CASE WHEN pa.is_correct THEN 1 END)::DECIMAL / COUNT(pa.id)) * 100, 2)
            ELSE 0
        END * 2) as total_score
    FROM practice_sessions ps
    JOIN practice_answers pa ON ps.id = pa.session_id
    GROUP BY ps.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_questions_answered = EXCLUDED.total_questions_answered,
        total_correct_answers = EXCLUDED.total_correct_answers,
        overall_accuracy_rate = EXCLUDED.overall_accuracy_rate,
        total_score = EXCLUDED.total_score,
        last_updated = NOW();

    -- 更新排名
    WITH ranked_scores AS (
        SELECT
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_score DESC, overall_accuracy_rate DESC, total_questions_answered DESC) as new_rank
        FROM overall_rankings
    )
    UPDATE overall_rankings
    SET rank = ranked_scores.new_rank
    FROM ranked_scores
    WHERE overall_rankings.user_id = ranked_scores.user_id;
END;
$$ LANGUAGE plpgsql;