-- 建立 AI 生成錯誤記錄表
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
CREATE INDEX idx_ai_errors_question_id ON ai_generation_errors(question_id);
CREATE INDEX idx_ai_errors_created_at ON ai_generation_errors(created_at DESC);
CREATE INDEX idx_ai_errors_error_type ON ai_generation_errors(error_type);
CREATE INDEX idx_ai_errors_resolved ON ai_generation_errors(resolved);

-- 啟用 Row Level Security
ALTER TABLE ai_generation_errors ENABLE ROW LEVEL SECURITY;

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

-- 建立視圖：錯誤統計
CREATE OR REPLACE VIEW ai_error_statistics AS
SELECT
  error_type,
  COUNT(*) as error_count,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count,
  MAX(created_at) as last_occurred_at
FROM ai_generation_errors
GROUP BY error_type
ORDER BY error_count DESC;

-- 註解
COMMENT ON TABLE ai_generation_errors IS 'AI 解析生成錯誤記錄表';
COMMENT ON COLUMN ai_generation_errors.question_id IS '關聯的題目 ID';
COMMENT ON COLUMN ai_generation_errors.error_type IS '錯誤類型 (API_KEY_INVALID, QUOTA_EXCEEDED, RATE_LIMIT_EXCEEDED, SAFETY_FILTER, JSON_PARSE_ERROR, UNKNOWN_ERROR)';
COMMENT ON COLUMN ai_generation_errors.error_message IS '錯誤訊息';
COMMENT ON COLUMN ai_generation_errors.error_details IS '詳細錯誤資訊 (JSON 格式)';
COMMENT ON COLUMN ai_generation_errors.resolved IS '是否已解決';
COMMENT ON COLUMN ai_generation_errors.resolved_at IS '解決時間';
COMMENT ON COLUMN ai_generation_errors.resolved_by IS '解決者 (管理員 ID)';
