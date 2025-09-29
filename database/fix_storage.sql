-- 快速修復頭像上傳問題的 SQL 腳本
-- 執行此腳本來修復目前遇到的 Storage 策略問題

-- 刪除所有現有的頭像相關策略
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- 創建簡化的頭像策略，暫時允許所有認證用戶上傳
CREATE POLICY "Authenticated users can upload to avatars bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- 允許所有人查看頭像
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 允許認證用戶更新 avatars bucket 中的文件
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- 允許認證用戶刪除 avatars bucket 中的文件
CREATE POLICY "Authenticated users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- 確認策略已創建
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%avatar%';