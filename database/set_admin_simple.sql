-- 🚀 簡潔版：設置 elson921121@gmail.com 為管理員
-- 在 Supabase Dashboard 的 SQL Editor 中執行

-- 步驟 1: 檢查用戶是否存在
SELECT 'Auth 用戶檢查:' as info, id, email, created_at
FROM auth.users
WHERE email = 'elson921121@gmail.com';

SELECT 'Profile 用戶檢查:' as info, id, email, role, created_at
FROM public.profiles
WHERE email = 'elson921121@gmail.com';

-- 步驟 2: 直接更新用戶為管理員
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'elson921121@gmail.com';

-- 步驟 3: 如果用戶不存在於 profiles，從 auth.users 創建
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '管理員'),
    'admin',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'elson921121@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.email = au.email
  );

-- 步驟 4: 驗證結果
SELECT
    '✅ 最終結果:' as status,
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM public.profiles
WHERE email = 'elson921121@gmail.com';

-- 步驟 5: 顯示所有管理員
SELECT
    '👑 所有管理員:' as info,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at;