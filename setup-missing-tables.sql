-- 執行這個 SQL 腳本來創建缺少的資料庫表
-- 在 Supabase Dashboard > SQL Editor 中執行

-- 1. 建立 AI 生成錯誤記錄表
CREATE TABLE IF NOT EXISTS ai_generation_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_ai_errors_question_id ON ai_generation_errors(question_id);
CREATE INDEX IF NOT EXISTS idx_ai_errors_created_at ON ai_generation_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_errors_error_type ON ai_generation_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_ai_errors_resolved ON ai_generation_errors(resolved);

-- 啟用 Row Level Security
ALTER TABLE ai_generation_errors ENABLE ROW LEVEL SECURITY;

-- 刪除舊的 policy（如果存在）
DROP POLICY IF EXISTS "只有管理員可以查看 AI 錯誤記錄" ON ai_generation_errors;
DROP POLICY IF EXISTS "系統可以插入 AI 錯誤記錄" ON ai_generation_errors;
DROP POLICY IF EXISTS "只有管理員可以更新 AI 錯誤記錄" ON ai_generation_errors;

-- 只有管理員可以查看錯誤記錄
CREATE POLICY "只有管理員可以查看 AI 錯誤記錄" ON ai_generation_errors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 系統可以插入錯誤記錄（不需要認證）
CREATE POLICY "系統可以插入 AI 錯誤記錄" ON ai_generation_errors
  FOR INSERT
  WITH CHECK (true);

-- 只有管理員可以更新錯誤記錄（標記為已解決）
CREATE POLICY "只有管理員可以更新 AI 錯誤記錄" ON ai_generation_errors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 2. 建立郵件通知表
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at DESC);

-- 啟用 Row Level Security
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- 刪除舊的 policy（如果存在）
DROP POLICY IF EXISTS "只有管理員可以查看郵件通知" ON email_notifications;
DROP POLICY IF EXISTS "系統可以插入郵件通知" ON email_notifications;

-- 只有管理員可以查看
CREATE POLICY "只有管理員可以查看郵件通知" ON email_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 系統可以插入郵件通知
CREATE POLICY "系統可以插入郵件通知" ON email_notifications
  FOR INSERT
  WITH CHECK (true);

-- 完成
SELECT 'Tables created successfully!' as message;
