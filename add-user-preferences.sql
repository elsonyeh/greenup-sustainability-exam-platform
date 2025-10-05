-- 添加用戶偏好設定欄位到 profiles 表
-- 在 Supabase Dashboard > SQL Editor 中執行

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS practice_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_mode BOOLEAN DEFAULT false;

-- 為現有用戶設定默認值
UPDATE profiles
SET
  email_notifications = COALESCE(email_notifications, true),
  practice_reminders = COALESCE(practice_reminders, true),
  privacy_mode = COALESCE(privacy_mode, false)
WHERE email_notifications IS NULL
   OR practice_reminders IS NULL
   OR privacy_mode IS NULL;

-- 添加註解
COMMENT ON COLUMN profiles.email_notifications IS '是否接收電子郵件通知';
COMMENT ON COLUMN profiles.practice_reminders IS '是否接收練習提醒';
COMMENT ON COLUMN profiles.privacy_mode IS '是否在排行榜中隱藏姓名';

SELECT 'User preferences columns added successfully!' as message;
