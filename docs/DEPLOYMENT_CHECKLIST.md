# 🚀 Supabase 郵件認證部署檢查表

## ✅ 已完成的代碼更改

### 1. 認證回調處理器
- ✅ 創建 `AuthCallbackPage.tsx` 組件
- ✅ 添加認證回調路由 `/auth/callback`
- ✅ 處理各種認證類型 (signup, recovery, email_change)
- ✅ 優雅的用戶界面和自動重新導向

### 2. Supabase 客戶端配置
- ✅ 更新 `supabase.ts` 配置
- ✅ 根據環境動態設置重新導向 URL
- ✅ 添加環境變數 `VITE_SITE_URL`

### 3. 郵件模板
- ✅ 創建專業的 HTML 郵件模板
- ✅ 包含品牌設計和安全提醒
- ✅ 支援確認註冊、密碼重設、郵件變更

## 📋 Supabase Dashboard 配置清單

### 必須在 Supabase Dashboard 中手動執行：

#### 1. 基本 URL 設定
```
🎯 前往：Settings > General > Configuration

✅ Site URL:
https://greenup-sustainability-exam-platfor-three.vercel.app

✅ Redirect URLs (添加所有以下URL):
https://greenup-sustainability-exam-platfor-three.vercel.app/auth/callback
https://greenup-sustainability-exam-platfor-three.vercel.app/
https://greenup-sustainability-exam-platfor-three.vercel.app/reset-password
http://localhost:5173/auth/callback (開發環境)
http://localhost:5173/ (開發環境)
```

#### 2. 郵件模板配置
```
🎯 前往：Authentication > Templates

📧 Confirm signup:
   Subject: 確認您的帳戶 - 永續發展能力測驗平台
   Template: 使用 database/supabase_email_templates.sql 中的 HTML

🔑 Reset password:
   Subject: 重設您的密碼 - 永續發展能力測驗平台
   Template: 使用對應的 HTML 模板

📬 Change email address:
   Subject: 確認您的新電子郵件地址 - 永續發展能力測驗平台
   Template: 使用對應的 HTML 模板
```

## 🔧 部署前最終檢查

### 環境變數
```bash
# 確認 .env.local 包含：
VITE_SUPABASE_URL=https://lgrzwboejekmiseudaxp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=https://greenup-sustainability-exam-platfor-three.vercel.app
```

### Vercel 環境變數
```bash
# 在 Vercel Dashboard 設定：
VITE_SUPABASE_URL=https://lgrzwboejekmiseudaxp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=https://greenup-sustainability-exam-platfor-three.vercel.app
VITE_GEMINI_API_KEY=your_gemini_key
```

## 🧪 測試流程

### 1. 本地測試
```bash
npm run dev
# 測試註冊新用戶
# 檢查郵件收取
# 驗證認證回調
```

### 2. 生產環境測試
```bash
# 部署後測試：
1. 註冊新用戶帳戶
2. 檢查收到的確認郵件
3. 點擊確認連結
4. 驗證重新導向到正確的 URL
5. 測試密碼重設流程
```

## 📧 郵件模板預覽

### 確認註冊郵件
- ✅ 品牌 Logo 和顏色 (🌱 綠色主題)
- ✅ 清晰的確認按鈕
- ✅ 安全提醒區塊
- ✅ 備用連結顯示
- ✅ 功能介紹列表
- ✅ 聯繫資訊

### 設計特色
- 📱 響應式設計
- 🎨 符合永續發展主題
- 🔒 強調安全性
- 🌐 專業外觀

## ⚠️ 注意事項

### 安全考量
1. **連結有效期**: 確認郵件 24 小時，密碼重設 1 小時
2. **HTTPS**: 生產環境必須使用 HTTPS
3. **域名驗證**: 確保所有重新導向 URL 都在白名單中

### 常見問題
1. **郵件未收到**: 檢查垃圾郵件資料夾
2. **重新導向失敗**: 確認 URL 配置正確
3. **連結失效**: 檢查時間限制和使用次數

## 🔄 部署步驟

### 1. 推送代碼
```bash
git add .
git commit -m "feat: 更新 Supabase 郵件認證配置"
git push origin main
```

### 2. 設定 Vercel 環境變數
在 Vercel Dashboard 中設定所有必要的環境變數

### 3. 配置 Supabase Dashboard
按照上述檢查表完成所有 Supabase 設定

### 4. 測試部署
完成部署後進行完整的認證流程測試

## 📞 支援

如遇到問題，請檢查：
1. Supabase Dashboard 日誌
2. Vercel 部署日誌
3. 瀏覽器開發者工具網路分頁
4. 郵件服務狀態

---

完成所有檢查項目後，您的用戶將收到專業且安全的驗證郵件，並能順利完成帳戶確認流程！