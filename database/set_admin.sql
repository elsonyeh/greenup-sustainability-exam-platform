-- 設置管理員權限的 SQL 腳本
-- 將 elson921121@gmail.com 用戶設為管理員

-- 方法 1: 如果用戶已經存在於 profiles 表中，直接更新 role
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'elson921121@gmail.com';

-- 方法 2: 如果用戶不存在於 profiles 表中，需要先從 auth.users 找到對應的 ID
-- 然後插入到 profiles 表中並設為管理員
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT
    au.id,
    au.email,
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'elson921121@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

-- 驗證管理員權限設置是否成功
SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at,
    au.created_at as auth_created_at
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'elson921121@gmail.com';

-- 顯示確認信息
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'elson921121@gmail.com' AND role = 'admin') THEN
        RAISE NOTICE '✅ 用戶 elson921121@gmail.com 已成功設置為管理員';
    ELSE
        RAISE NOTICE '❌ 用戶 elson921121@gmail.com 不存在或設置失敗，請檢查用戶是否已註冊';
    END IF;
END $$;