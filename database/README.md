# 資料庫設置說明

## 文件說明

### 1. schema.sql
完整的資料庫架構文件，適用於全新資料庫的初始化。

### 2. storage_migration.sql
頭像上傳功能的遷移文件，適用於現有資料庫添加Storage功能。

## 使用方式

### 對於全新資料庫
執行 `schema.sql` 來創建完整的資料庫結構：

```sql
-- 在 Supabase SQL Editor 中執行
\i schema.sql
```

### 對於現有資料庫
如果您的資料庫已經存在（例如已經有 profiles 表），請使用遷移文件：

```sql
-- 在 Supabase SQL Editor 中執行
\i storage_migration.sql
```

## 頭像上傳功能設置

執行 `storage_migration.sql` 後，將會：

1. ✅ 創建 `avatars` storage bucket
2. ✅ 設置適當的存取策略：
   - 用戶只能上傳自己的頭像
   - 所有人可以查看頭像
   - 用戶可以更新/刪除自己的頭像

## 驗證設置

執行遷移後，您可以在 Supabase Dashboard 中確認：

1. **Storage > Buckets** - 確認 `avatars` bucket 已創建
2. **Storage > Policies** - 確認頭像相關策略已設置
3. **Database > Tables** - 確認 `profiles` 表包含 `avatar_url` 欄位

## 錯誤處理

### "relation already exists" 錯誤
如果遇到此錯誤，表示您正在嘗試重新創建已存在的表。請使用：
- 對於現有資料庫：執行 `storage_migration.sql`
- 對於全新環境：先清空資料庫再執行 `schema.sql`

### Storage 權限錯誤
確保您有足夠的權限操作 Storage buckets。在 Supabase 中需要：
- Project Owner 或 Admin 權限
- 啟用 Storage 功能

## 注意事項

1. 🔒 Storage 策略使用 Row Level Security (RLS)
2. 📁 頭像檔案將存儲在路徑 `avatars/{user_id}-{timestamp}.{ext}`
3. 🌐 Bucket 設為 public，但由策略控制存取權限
4. 📏 應用程式端限制檔案大小為 5MB