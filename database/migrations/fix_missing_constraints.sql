-- 修復缺少的 UNIQUE 約束和 ON DELETE CASCADE

-- 1. 修復 user_favorites 表
-- 添加 UNIQUE 約束
ALTER TABLE public.user_favorites
ADD CONSTRAINT user_favorites_user_id_question_id_unique
UNIQUE (user_id, question_id);

-- 修改外鍵為 ON DELETE CASCADE
ALTER TABLE public.user_favorites
DROP CONSTRAINT IF EXISTS user_favorites_user_id_fkey,
ADD CONSTRAINT user_favorites_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_favorites
DROP CONSTRAINT IF EXISTS user_favorites_question_id_fkey,
ADD CONSTRAINT user_favorites_question_id_fkey
FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

-- 2. 修復 wrong_answers 表
-- 添加 UNIQUE 約束
ALTER TABLE public.wrong_answers
ADD CONSTRAINT wrong_answers_user_id_question_id_unique
UNIQUE (user_id, question_id);

-- 修改外鍵為 ON DELETE CASCADE
ALTER TABLE public.wrong_answers
DROP CONSTRAINT IF EXISTS wrong_answers_user_id_fkey,
ADD CONSTRAINT wrong_answers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.wrong_answers
DROP CONSTRAINT IF EXISTS wrong_answers_question_id_fkey,
ADD CONSTRAINT wrong_answers_question_id_fkey
FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

-- 3. 修復 daily_rankings 表
-- 添加 UNIQUE 約束
ALTER TABLE public.daily_rankings
ADD CONSTRAINT daily_rankings_user_id_date_unique
UNIQUE (user_id, date);

-- 修改外鍵為 ON DELETE CASCADE
ALTER TABLE public.daily_rankings
DROP CONSTRAINT IF EXISTS daily_rankings_user_id_fkey,
ADD CONSTRAINT daily_rankings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. 修復 questions 表
-- 添加 UNIQUE 約束
ALTER TABLE public.questions
ADD CONSTRAINT questions_exam_document_id_question_number_unique
UNIQUE (exam_document_id, question_number);

-- 修改外鍵為 ON DELETE CASCADE
ALTER TABLE public.questions
DROP CONSTRAINT IF EXISTS questions_exam_document_id_fkey,
ADD CONSTRAINT questions_exam_document_id_fkey
FOREIGN KEY (exam_document_id) REFERENCES public.exam_documents(id) ON DELETE CASCADE;

ALTER TABLE public.questions
DROP CONSTRAINT IF EXISTS questions_category_id_fkey,
ADD CONSTRAINT questions_category_id_fkey
FOREIGN KEY (category_id) REFERENCES public.question_categories(id);

-- 5. 修復 practice_sessions 表外鍵
ALTER TABLE public.practice_sessions
DROP CONSTRAINT IF EXISTS practice_sessions_user_id_fkey,
ADD CONSTRAINT practice_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. 修復 practice_answers 表外鍵
ALTER TABLE public.practice_answers
DROP CONSTRAINT IF EXISTS practice_answers_session_id_fkey,
ADD CONSTRAINT practice_answers_session_id_fkey
FOREIGN KEY (session_id) REFERENCES public.practice_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.practice_answers
DROP CONSTRAINT IF EXISTS practice_answers_question_id_fkey,
ADD CONSTRAINT practice_answers_question_id_fkey
FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

-- 註解：此遷移修復了資料庫中缺少的 UNIQUE 約束和 ON DELETE CASCADE