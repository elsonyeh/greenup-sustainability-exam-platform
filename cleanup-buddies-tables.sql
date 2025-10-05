-- 刪除不需要的 buddies 相關表
-- 在 Supabase Dashboard > SQL Editor 中執行

-- 刪除 buddies_votes 表（先刪除，因為可能有外鍵依賴）
DROP TABLE IF EXISTS buddies_votes CASCADE;

-- 刪除 buddies_rooms 表
DROP TABLE IF EXISTS buddies_rooms CASCADE;

-- 完成
SELECT 'Buddies tables dropped successfully!' as message;
