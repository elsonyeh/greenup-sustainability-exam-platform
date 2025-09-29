# Supabase 郵件模板配置指南

## 📋 配置目標

將 Supabase 的驗證郵件確認網址更改為：
`https://greenup-sustainability-exam-platfor-three.vercel.app/`

## 🛠 配置步驟

### 1. 登入 Supabase Dashboard

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目：`lgrzwboejekmiseudaxp`

### 2. 配置站點 URL

1. 在左側菜單選擇 **Settings** > **General**
2. 找到 **Configuration** 區段
3. 更新以下設定：

```
Site URL: https://greenup-sustainability-exam-platfor-three.vercel.app/
```

### 3. 配置重新導向 URL

1. 在 **Settings** > **General** 中找到 **Redirect URLs**
2. 添加以下 URL：

```
https://greenup-sustainability-exam-platfor-three.vercel.app/auth/callback
https://greenup-sustainability-exam-platfor-three.vercel.app/reset-password
https://greenup-sustainability-exam-platfor-three.vercel.app/
```

### 4. 配置郵件模板

#### 步驟 1：進入 Authentication 設定
1. 在左側菜單選擇 **Authentication** > **Templates**

#### 步驟 2：配置確認註冊郵件 (Confirm signup)

1. 點擊 **Confirm signup** 分頁
2. 將 **Subject** 欄位設為：
   ```
   確認您的帳戶 - 永續發展能力測驗平台
   ```

3. 將 **Message (HTML)** 欄位內容替換為 `database/supabase_email_templates.sql` 文件中的 HTML 模板

#### 步驟 3：配置重設密碼郵件 (Reset password)

1. 點擊 **Reset password** 分頁
2. 將 **Subject** 欄位設為：
   ```
   重設您的密碼 - 永續發展能力測驗平台
   ```

3. 將 **Message (HTML)** 欄位內容替換為對應的 HTML 模板

#### 步驟 4：配置郵件變更確認 (Change email address)

1. 點擊 **Change email address** 分頁
2. 將 **Subject** 欄位設為：
   ```
   確認您的新電子郵件地址 - 永續發展能力測驗平台
   ```

3. 將 **Message (HTML)** 欄位內容替換為對應的 HTML 模板

### 5. 配置 SMTP 設定（可選）

如果您想使用自定義 SMTP 服務而非 Supabase 內建的郵件服務：

1. 在 **Settings** > **Authentication** 中找到 **SMTP Settings**
2. 啟用 **Enable custom SMTP**
3. 填入您的 SMTP 配置：

```
Sender name: 永續發展能力測驗平台
Sender email: noreply@greenup.com
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
```

## 🔧 環境變數配置

確保您的 `.env.local` 文件包含正確的設定：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://lgrzwboejekmiseudaxp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxncnp3Ym9lamVrbWlzZXVkYXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTA2NjMsImV4cCI6MjA3MDcyNjY2M30.AVQxp1Xx-58IpyO7Cq3f3-m1_NedMMjgyl4iFWgPkU4

# 站點配置
VITE_SITE_URL=https://greenup-sustainability-exam-platfor-three.vercel.app
```

## 📱 驗證流程處理

### 1. 創建認證回調處理器

在您的 React 應用中創建認證處理頁面：

```typescript
// src/pages/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=auth_callback_failed')
          return
        }

        if (data.session) {
          // 用戶已成功登入
          navigate('/')
        } else {
          // 檢查是否為確認註冊
          const type = searchParams.get('type')
          if (type === 'signup') {
            navigate('/login?message=email_confirmed')
          } else {
            navigate('/login')
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        navigate('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>處理認證中...</p>
      </div>
    </div>
  )
}
```

### 2. 添加路由配置

確保在您的路由配置中包含認證回調路由：

```typescript
// src/App.tsx 或路由配置文件
import AuthCallback from './pages/AuthCallback'

// 在路由配置中添加
<Route path="/auth/callback" element={<AuthCallback />} />
```

### 3. 更新 Supabase 客戶端配置

確保您的 Supabase 客戶端配置正確：

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: 'https://greenup-sustainability-exam-platfor-three.vercel.app/auth/callback'
  }
})
```

## 🧪 測試驗證流程

### 1. 測試用戶註冊

1. 在您的應用中註冊新用戶
2. 檢查收到的確認郵件
3. 點擊確認連結
4. 驗證是否正確重新導向到您的應用

### 2. 測試密碼重設

1. 在登入頁面點擊「忘記密碼」
2. 輸入註冊的郵件地址
3. 檢查收到的重設密碼郵件
4. 點擊重設連結
5. 設定新密碼並驗證

### 3. 測試郵件變更

1. 在用戶設定中變更郵件地址
2. 檢查新郵件地址收到的確認郵件
3. 點擊確認連結
4. 驗證郵件地址已更新

## 🎨 郵件模板特色

### 設計特點
- 🌱 符合永續發展主題的綠色設計
- 📱 響應式設計，支援各種設備
- 🔒 明確的安全提醒和說明
- 🎯 清晰的操作指示

### 包含元素
- 品牌 Logo 和顏色
- 安全提醒區塊
- 備用連結顯示
- 聯繫資訊
- 功能介紹列表

## 🔍 故障排除

### 常見問題

1. **確認連結無效**
   - 檢查 Site URL 配置是否正確
   - 確認 Redirect URLs 是否包含所有必要的路徑

2. **郵件未收到**
   - 檢查垃圾郵件資料夾
   - 驗證 SMTP 設定（如果使用自定義 SMTP）
   - 確認 Supabase 項目的郵件配額

3. **重新導向失敗**
   - 檢查 `auth/callback` 路由是否正確設定
   - 驗證 `AuthCallback` 組件邏輯

### 調試技巧

1. 在瀏覽器開發者工具中檢查網路請求
2. 查看 Supabase Dashboard 的日誌
3. 在認證回調中添加 console.log 來追蹤狀態

## 📚 相關文檔

- [Supabase Auth 官方文檔](https://supabase.com/docs/guides/auth)
- [郵件模板自定義指南](https://supabase.com/docs/guides/auth/auth-email-templates)
- [認證重新導向設定](https://supabase.com/docs/guides/auth/auth-redirect-urls)

---

完成以上配置後，您的用戶將收到專業且符合品牌風格的驗證郵件，並且所有確認連結都會正確導向您的生產環境應用！