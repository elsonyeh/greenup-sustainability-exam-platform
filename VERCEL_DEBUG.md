# Vercel 部署問題診斷指南

## ✅ 確認問題：Vercel 環境變數未設置

**本機端狀態**：✅ 正常運行
- Supabase URL: `https://lgrzwboejekmiseudaxp.supabase.co`
- 環境變數已正確配置
- Session 成功載入

**Vercel 部署狀態**：❌ 無法載入（一直轉圈圈）
- 原因：環境變數未在 Vercel 設置

---

## 🚀 立即修復步驟（必須執行）

### 步驟 1: 在 Vercel 設置環境變數

1. 前往 **Vercel Dashboard**: https://vercel.com/dashboard
2. 選擇你的專案 `greenup-sustainability-exam-platfor-three`
3. 點擊 **Settings** 標籤
4. 在左側選單點擊 **Environment Variables**
5. 添加以下 **3個** 環境變數：

#### 必須添加的環境變數：

| 變數名稱 | 值 | 適用環境 |
|---------|-----|---------|
| `VITE_SUPABASE_URL` | `https://lgrzwboejekmiseudaxp.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxncnp3Ym9lamVrbWlzZXVkYXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTA2NjMsImV4cCI6MjA3MDcyNjY2M30.AVQxp1Xx-58IpyO7Cq3f3-m1_NedMMjgyl4iFWgPkU4` | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | `AIzaSyBPXxcWK6JOIGXG_LzCXv_sR5mEokFw5Zw` | Production, Preview, Development |

**⚠️ 重要提醒**：
- 變數名稱必須 **完全一致**（包括 `VITE_` 前綴）
- 每個變數都要勾選 **Production**、**Preview** 和 **Development**
- 不要有多餘的空格或換行

### 步驟 2: 重新部署

添加環境變數後：

**方法 1：在 Vercel Dashboard 重新部署**
1. 回到專案的 **Deployments** 標籤
2. 點擊最新部署旁的 **···** (三個點)
3. 選擇 **Redeploy**
4. 確認 **Use existing Build Cache** 不要勾選
5. 點擊 **Redeploy** 按鈕

**方法 2：推送新 commit**
```bash
git add .
git commit -m "fix: update vercel configuration"
git push
```

### 步驟 3: 驗證部署成功

重新部署完成後（約 1-2 分鐘）：

1. 打開你的 Vercel 網站：https://greenup-sustainability-exam-platfor-three.vercel.app
2. 按 F12 打開開發者工具
3. 查看 Console，應該看到：
   ```
   Supabase Config: {url: '✓ Set', key: '✓ Set', urlValue: 'https://lgrzwboejekmiseudaxp.supabase.co'}
   ```
4. 如果看到登入頁面，表示修復成功！

---

## 📋 已知的非關鍵錯誤（不影響主要功能）

以下錯誤是因為 Supabase 資料庫中缺少某些表格，**不會導致網站無法載入**：

### 1. 缺少的資料表

| 表格名稱 | 錯誤訊息 | 影響範圍 | 是否必須修復 |
|---------|---------|---------|-------------|
| `ai_generation_errors` | PGRST205 | 管理後台 - AI 錯誤記錄 | ❌ 否（功能性） |
| `email_notifications` | PGRST205 | 管理後台 - Email 統計 | ❌ 否（功能性） |

這些錯誤**只會在管理後台頁面出現**，不會影響：
- ✅ 登入/註冊
- ✅ 首頁載入
- ✅ 練習功能
- ✅ 統計頁面
- ✅ 排行榜
- ✅ 個人檔案
- ✅ 關於我們

### 2. 如何修復這些非關鍵錯誤（選擇性）

如果你想移除這些錯誤訊息，在 Supabase Dashboard 執行以下 SQL：

```sql
-- 創建 AI 錯誤記錄表
CREATE TABLE IF NOT EXISTS public.ai_generation_errors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.questions(id),
    error_message TEXT,
    error_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 創建 Email 通知表
CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status TEXT,
    email_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 啟用 RLS
ALTER TABLE public.ai_generation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- 添加管理員存取權限
CREATE POLICY "Allow admin access to ai_generation_errors"
ON public.ai_generation_errors
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Allow admin access to email_notifications"
ON public.email_notifications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
```

---

## 2. 檢查瀏覽器 Console 錯誤

如果 Vercel 網站仍然無法載入，在 Vercel 部署的網站上：
1. 打開瀏覽器開發者工具 (F12)
2. 查看 Console 標籤
3. 查找以下類型的錯誤：
   - Supabase connection errors
   - Authentication errors
   - CORS errors
   - Network errors

### 3. 檢查 Vercel 部署日誌

1. 前往 Vercel Dashboard
2. 選擇你的項目
3. 點擊最新的部署
4. 查看 "Build Logs" 和 "Runtime Logs"
5. 查找錯誤信息

### 4. 常見錯誤模式

#### 錯誤 1: "Invalid API credentials"
- **原因**: Supabase URL 或 ANON_KEY 未設置或錯誤
- **解決**: 檢查 Vercel 環境變數設置

#### 錯誤 2: "CORS policy blocked"
- **原因**: Supabase 未允許 Vercel 域名
- **解決**: 在 Supabase Dashboard > Authentication > URL Configuration 中添加你的 Vercel URL

#### 錯誤 3: 無限重新渲染
- **原因**: useEffect 依賴項設置不當
- **解決**: 已在 ProfilePage.tsx 中修復

### 5. 驗證步驟

```bash
# 1. 本地測試生產構建
npm run build
npm run preview

# 2. 檢查環境變數是否正確加載
# 在瀏覽器 Console 中執行：
console.log(import.meta.env.VITE_SUPABASE_URL)
# 應該顯示你的 Supabase URL，而不是 undefined
```

### 6. Supabase 配置檢查

在 Supabase Dashboard 中：

1. **Authentication > URL Configuration**
   - Site URL: `https://你的vercel域名.vercel.app`
   - Redirect URLs: 添加 `https://你的vercel域名.vercel.app/**`

2. **API > API Settings**
   - 確認 Project URL 和 API Keys 正確

3. **Database > Policies**
   - 檢查 RLS (Row Level Security) 策略是否正確設置
   - 確保匿名用戶可以訪問需要的數據

### 7. 快速診斷命令

在瀏覽器 Console 中執行以下命令來診斷問題：

```javascript
// 檢查環境變數
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// 檢查 Supabase 連接
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/')
  .then(r => console.log('Supabase connection:', r.status))
  .catch(e => console.error('Supabase connection error:', e))
```

### 8. 修復記錄

已修復的問題：
- ✅ ProfilePage useEffect 添加了 user?.id 檢查，避免不必要的 API 調用
- ✅ HomePage 添加了 fadeInUp 動畫
- ✅ 平均分數 icon 改為 Target，並移除背景色

待驗證：
- ⏳ Vercel 環境變數是否正確設置
- ⏳ Supabase URL 配置是否包含 Vercel 域名
- ⏳ 瀏覽器 Console 具體錯誤信息

## 下一步

1. **首要任務**: 檢查並設置 Vercel 環境變數
2. 重新部署並檢查瀏覽器 Console
3. 如果還有問題，提供具體的錯誤信息以便進一步診斷
