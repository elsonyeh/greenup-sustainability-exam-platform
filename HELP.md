# 永續發展能力測驗練習平台 - 幫助文檔

## 📖 目錄

1. [快速開始](#快速開始)
2. [詳細安裝步驟](#詳細安裝步驟)
3. [環境變數設定](#環境變數設定)
4. [資料庫設定](#資料庫設定)
5. [常見問題與解決方案](#常見問題與解決方案)
6. [開發指南](#開發指南)
7. [部署指南](#部署指南)
8. [故障排除](#故障排除)

## 🚀 快速開始

### 前置需求

在開始之前，請確保您的系統已安裝：

- **Node.js** (版本 18.0.0 或更高)
- **npm** (版本 9.0.0 或更高) 或 **yarn**
- **Git**
- **現代瀏覽器** (Chrome, Firefox, Safari, Edge)

### 檢查版本

```bash
node --version    # 應該顯示 v18.0.0 或更高
npm --version     # 應該顯示 9.0.0 或更高
git --version     # 確認 Git 已安裝
```

## 📋 詳細安裝步驟

### 步驟 1：克隆專案

```bash
# 從 GitHub 克隆專案
git clone https://github.com/your-username/sustainability-exam-platform.git

# 進入專案目錄
cd sustainability-exam-platform
```

### 步驟 2：安裝依賴套件 ⭐

這是關鍵步驟！請依照以下步驟執行：

```bash
# 方法一：使用 npm（推薦）
npm install

# 方法二：使用 yarn（如果您偏好 yarn）
yarn install

# 方法三：如果遇到權限問題（Windows）
npm install --legacy-peer-deps

# 方法四：清除快取後重新安裝
npm cache clean --force
npm install
```

#### 常見安裝問題：

**問題 1：權限錯誤（Windows）**

```bash
# 解決方案：以管理員身份執行 PowerShell
npm install --legacy-peer-deps
```

**問題 2：網路連線問題**

```bash
# 使用淘寶鏡像源
npm install --registry https://registry.npmmirror.com
```

**問題 3：套件版本衝突**

```bash
# 刪除 node_modules 和 package-lock.json 重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 步驟 3：環境變數設定

```bash
# 複製範例環境變數檔案
cp env.example .env.local

# 在 Windows 使用
copy env.example .env.local
```

編輯 `.env.local` 檔案：

```env
# Supabase 配置（必填）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI 配置（選填，用於 AI 解答功能）
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# 應用配置（選填）
VITE_APP_TITLE=永續發展能力測驗練習平台
VITE_APP_DESCRIPTION=提供永續發展能力測驗練習、題庫管理、AI解答生成等功能的平台
```

### 步驟 4：資料庫設定 ⭐

這是另一個關鍵步驟！請按順序執行：

#### 4.1 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com)
2. 註冊帳戶並登入
3. 點擊「New Project」建立新專案
4. 選擇組織、輸入專案名稱和密碼
5. 選擇區域（建議選擇 Asia Northeast (Tokyo)）
6. 等待專案建立完成（約 2-3 分鐘）

#### 4.2 取得 Supabase 連線資訊

1. 在 Supabase 控制台，點擊「Settings」→「API」
2. 複製以下資訊到您的 `.env.local`：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** 中的 **anon public** → `VITE_SUPABASE_ANON_KEY`

#### 4.3 執行資料庫 Schema

1. 在 Supabase 控制台，點擊「SQL Editor」
2. 點擊「New query」
3. 複製 `database/schema.sql` 的所有內容
4. 貼上到查詢編輯器中
5. 點擊「Run」執行（這會建立所有必要的資料表和政策）

#### 4.4 建立第一個管理員帳戶

1. 在 Supabase 控制台，點擊「Authentication」→「Users」
2. 點擊「Add user」
3. 輸入管理員 email 和密碼
4. 建立用戶後，到「Table Editor」→「profiles」
5. 找到剛建立的用戶，將 `role` 欄位改為 `admin`

#### 4.5 驗證資料庫設定

```bash
# 執行此指令檢查連線
npm run dev
```

如果看到登入頁面且沒有錯誤，表示資料庫設定成功！

### 步驟 5：啟動開發伺服器

```bash
# 啟動開發伺服器
npm run dev

# 或使用 yarn
yarn dev
```

成功啟動後，您應該看到：

```
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

打開瀏覽器前往 `http://localhost:5173` 即可看到應用程式！

## 🛠️ 環境變數設定

### 必填變數

| 變數名稱                 | 說明              | 範例                         |
| ------------------------ | ----------------- | ---------------------------- |
| `VITE_SUPABASE_URL`      | Supabase 專案 URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | `eyJhbGci...`                |

### 選填變數

| 變數名稱               | 說明                            | 範例               |
| ---------------------- | ------------------------------- | ------------------ |
| `VITE_OPENAI_API_KEY`  | OpenAI API 金鑰（用於 AI 解答） | `sk-...`           |
| `VITE_APP_TITLE`       | 應用程式標題                    | `永續發展測驗平台` |
| `VITE_APP_DESCRIPTION` | 應用程式描述                    | `學習永續發展知識` |

## 🗄️ 資料庫設定

### Schema 說明

我們的資料庫包含以下主要資料表：

1. **profiles** - 使用者資料
2. **question_categories** - 題目分類
3. **exam_documents** - 試題文件
4. **questions** - 題目內容
5. **practice_sessions** - 練習會話
6. **practice_answers** - 答題記錄
7. **user_favorites** - 收藏題目
8. **wrong_answers** - 錯題記錄
9. **daily_rankings** - 每日排行
10. **overall_rankings** - 總排行

### RLS (Row Level Security) 政策

我們的資料庫使用 RLS 確保資料安全：

- 使用者只能存取自己的練習記錄
- 題目對所有人可見
- 管理員可以管理所有資料
- 排行榜對所有人可見

## ❓ 常見問題與解決方案

### CSS 錯誤：`border-border` class does not exist

**錯誤訊息：**

```
[plugin:vite:css] [postcss] The `border-border` class does not exist
```

**解決方案：**
這個問題已經在最新版本中修復。如果您仍然遇到此問題：

1. 確保您的 `src/index.css` 是最新版本
2. 重新啟動開發伺服器：

```bash
# 停止伺服器 (Ctrl+C)
# 然後重新啟動
npm run dev
```

### 依賴套件安裝失敗

**解決方案：**

```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

### Supabase 連線失敗

**檢查清單：**

- [ ] 確認 `.env.local` 檔案存在且有正確的變數
- [ ] 確認 Supabase URL 和 API Key 正確
- [ ] 確認已執行 `database/schema.sql`
- [ ] 檢查網路連線

**測試連線：**

```bash
# 檢查環境變數
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### OpenAI API 相關問題

**問題：AI 解答功能無法使用**

**解決方案：**

1. 確認已設定 `VITE_OPENAI_API_KEY`
2. 檢查 API Key 是否有效
3. 檢查 OpenAI 帳戶餘額

**注意：** OpenAI API Key 在瀏覽器中會暴露，這僅適用於開發環境。生產環境建議透過後端 API 呼叫。

### 權限錯誤

**問題：無法存取管理員功能**

**解決方案：**

1. 確認使用者的 `role` 欄位設為 `admin`
2. 重新登入應用程式
3. 檢查 RLS 政策是否正確

## 🔧 開發指南

### 可用指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 執行 ESLint 檢查
npm run lint
```

### 專案結構

```
src/
├── components/          # 共用組件
│   ├── ui/             # 基礎 UI 組件
│   └── Layout.tsx      # 版面配置組件
├── contexts/           # React Context
│   └── AuthContext.tsx # 認證狀態管理
├── lib/                # 工具庫
│   ├── supabase.ts     # Supabase 客戶端
│   ├── openai.ts       # OpenAI API 整合
│   └── pdfOcr.ts       # PDF OCR 處理
├── pages/              # 頁面組件
│   ├── HomePage.tsx    # 首頁
│   ├── LoginPage.tsx   # 登入頁
│   ├── PracticePage.tsx # 練習頁
│   └── ...
├── App.tsx             # 主應用組件
├── main.tsx           # 應用入口
└── index.css          # 全域樣式
```

### 新增功能

1. **新增頁面：** 在 `src/pages/` 建立新組件
2. **新增路由：** 在 `src/App.tsx` 中註冊路由
3. **新增 API：** 在 `src/lib/` 中建立相關模組
4. **新增樣式：** 在 `src/index.css` 中定義

## 🚀 部署指南

### Vercel 部署（推薦）

1. **連結 GitHub 倉庫**

   ```bash
   # 推送程式碼到 GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **在 Vercel 建立專案**

   - 前往 [Vercel](https://vercel.com)
   - 點擊「New Project」
   - 選擇您的 GitHub 倉庫
   - 框架會自動偵測為「Vite」

3. **設定環境變數**
   在 Vercel 專案設定中新增：

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`（選填）

4. **部署**
   Vercel 會自動部署，通常需要 2-3 分鐘

### 其他平台部署

**Netlify：**

```bash
npm run build
# 上傳 dist/ 資料夾到 Netlify
```

**GitHub Pages：**

```bash
npm run build
# 設定 GitHub Actions 自動部署
```

## 🛠️ 故障排除

### 常見錯誤代碼

#### ERR_MODULE_NOT_FOUND

```bash
# 重新安裝依賴
npm install
```

#### EADDRINUSE

```bash
# 連接埠被佔用，使用其他連接埠
npm run dev -- --port 3001
```

#### Build 失敗

```bash
# 檢查 TypeScript 錯誤
npx tsc --noEmit

# 修復後重新建置
npm run build
```

### 效能問題

**首次載入緩慢：**

- 檢查網路連線
- 確認 CDN 資源正常載入
- 使用 `npm run build` 建置優化版本

**記憶體不足：**

```bash
# 增加 Node.js 記憶體限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 瀏覽器相容性

**支援的瀏覽器：**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**不支援的功能：**

- Internet Explorer（任何版本）
- Chrome < 90

## 📞 取得幫助

如果您遇到任何問題：

1. **檢查這份文檔** - 大多數問題都有解決方案
2. **查看 GitHub Issues** - 可能有其他人遇到相同問題
3. **建立新的 Issue** - 詳細描述問題和環境
4. **聯絡開發團隊** - your-email@example.com

## 🎯 下一步

完成設定後，建議您：

1. **熟悉介面** - 瀏覽各個功能頁面
2. **測試功能** - 進行練習、查看統計
3. **上傳題庫** - 使用管理員功能上傳 PDF
4. **自訂設定** - 根據需求調整配置

感謝您使用永續發展能力測驗練習平台！🌱
