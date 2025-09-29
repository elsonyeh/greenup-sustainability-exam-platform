-- 🚀 設置 elson921121@gmail.com 為管理員的最終 SQL 腳本
-- 請在 Supabase Dashboard 的 SQL Editor 中執行此腳本

-- 1️⃣ 首先檢查用戶是否存在於 auth.users
SELECT
    'auth.users' as table_name,
    id::text as user_id,
    email,
    created_at,
    email_confirmed_at as confirmed_at
FROM auth.users
WHERE email = 'elson921121@gmail.com';

-- 檢查用戶是否存在於 public.profiles
SELECT
    'public.profiles' as table_name,
    id::text as user_id,
    email,
    created_at,
    updated_at as confirmed_at
FROM public.profiles
WHERE email = 'elson921121@gmail.com';

-- 2️⃣ 更新現有用戶為管理員
UPDATE public.profiles
SET
    role = 'admin',
    updated_at = NOW()
WHERE email = 'elson921121@gmail.com';

-- 3️⃣ 如果用戶不存在於 profiles 表，從 auth.users 創建管理員 profile
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'elson921121@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

-- 4️⃣ 驗證設置結果
SELECT
    '✅ 設置結果驗證:' as status,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at
FROM public.profiles p
WHERE p.email = 'elson921121@gmail.com';

-- 5️⃣ 顯示所有管理員用戶
SELECT
    '📋 所有管理員用戶:' as status,
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at;

-- 6️⃣ 確認用戶權限
DO $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE email = 'elson921121@gmail.com';

    IF user_role = 'admin' THEN
        RAISE NOTICE '🎉 成功！用戶 elson921121@gmail.com 已設置為管理員';
    ELSIF user_role IS NOT NULL THEN
        RAISE NOTICE '⚠️  用戶存在但角色為: %', user_role;
    ELSE
        RAISE NOTICE '❌ 用戶不存在於 profiles 表中';
    END IF;
END $$;