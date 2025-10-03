-- 為 questions 表新增年份和場次欄位，方便直接查詢
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS session INTEGER;

-- 建立索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_questions_year_session ON public.questions(year, session);

-- 更新現有資料：從 exam_documents 同步年份和場次資訊
UPDATE public.questions q
SET year = ed.year, session = ed.session
FROM public.exam_documents ed
WHERE q.exam_document_id = ed.id
  AND q.year IS NULL;

-- 註解：此遷移允許 questions 表直接記錄年份和場次
-- 這樣可以在不需要 JOIN exam_documents 的情況下篩選題目