-- Storage 配置遷移文件
-- 此文件用於為現有資料庫添加頭像上傳功能

-- =============================================
-- Storage Bucket 創建
-- =============================================

-- 檢查並創建 avatars bucket（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
    END IF;
END $$;

-- =============================================
-- Storage 策略設置
-- =============================================

-- 刪除可能存在的舊策略（如果存在）
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 頭像上傳政策：只允許認證用戶上傳自己的頭像
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = split_part(name, '-', 1)
  );

-- 頭像查看政策：所有人可以查看頭像
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 頭像更新政策：用戶可以更新自己的頭像
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = split_part(name, '-', 1)
  );

-- 頭像刪除政策：用戶可以刪除自己的頭像
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = split_part(name, '-', 1)
  );

-- =============================================
-- 確認操作
-- =============================================

-- 顯示創建結果
SELECT
    'Avatars bucket created successfully' as result,
    (SELECT count(*) FROM storage.buckets WHERE id = 'avatars') as bucket_count;

-- 顯示策略創建結果
SELECT
    'Storage policies created successfully' as result,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%avatar%') as policy_count;