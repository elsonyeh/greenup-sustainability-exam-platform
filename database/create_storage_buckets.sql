-- 創建 documents bucket 用於存放上傳的 PDF 文件
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,  -- 設為私有，只有管理員可以上傳
    52428800,  -- 50MB 限制
    ARRAY['application/pdf']  -- 只允許 PDF 文件
)
ON CONFLICT (id) DO NOTHING;

-- 設置 documents bucket 的存取策略
-- 管理員可以上傳文件
CREATE POLICY "Admins can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 管理員可以查看文件
CREATE POLICY "Admins can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 管理員可以更新文件
CREATE POLICY "Admins can update documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 管理員可以刪除文件
CREATE POLICY "Admins can delete documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );