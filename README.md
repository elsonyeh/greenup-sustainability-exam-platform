# 永續發展能力測驗練習平台

一個基於 React + Vite + Supabase 構建的永續發展能力測驗練習平台，提供 PDF 題庫上傳、AI 自動解答、統計分析、排行榜等功能。

## 🌟 主要功能

### 📚 題庫管理

- **PDF 自動解析**：上傳歷屆試題 PDF，自動進行 OCR 文字識別
- **AI 解答生成**：整合 OpenAI API，自動生成詳細解答說明
- **人工審核**：支援管理員審核和編輯 AI 生成的解答
- **分類管理**：按主題分類管理題目（環境、社會、經濟、治理永續等）

### 🎯 練習功能

- **智慧練習**：根據學習進度推薦合適題目
- **多種模式**：隨機練習、主題練習、錯題複習、收藏複習
- **即時反饋**：答題後立即顯示正確答案和詳細解析
- **進度追蹤**：記錄答題時間、正確率等詳細統計

### 📊 數據分析

- **學習統計**：詳細的個人學習進度和成績分析
- **視覺化圖表**：使用 Recharts 呈現學習趨勢和主題分佈
- **錯題分析**：針對性分析錯誤題目，提供改進建議
- **目標設定**：設定學習目標並追蹤達成情況

### 🏆 社交功能

- **排行榜系統**：每日、每週、每月排行榜
- **成就徽章**：學習成就和里程碑記錄
- **收藏分享**：收藏重要題目，建立個人題庫

### 👨‍💼 管理後台

- **用戶管理**：管理用戶帳戶和權限
- **題庫管理**：新增、編輯、刪除題目
- **數據監控**：平台使用情況和統計分析
- **系統設定**：平台配置和參數調整

## 🛠️ 技術架構

### 前端技術

- **React 18**: 使用最新的 React 功能和 Hooks
- **TypeScript**: 提供型別安全和更好的開發體驗
- **Vite**: 快速的建置工具和開發伺服器
- **Tailwind CSS**: 實用性優先的 CSS 框架
- **React Router**: 客戶端路由管理
- **React Query**: 數據獲取和狀態管理
- **Recharts**: 數據視覺化圖表庫
- **Lucide React**: 現代化的圖標庫

### 後端服務

- **Supabase**:
  - PostgreSQL 數據庫
  - 即時訂閱
  - 用戶認證和授權
  - Row Level Security (RLS)
  - 檔案儲存

### AI 和處理

- **Gemini API**: 自動解答生成
- **PDF.js**: PDF 檔案解析和渲染
- **Tesseract.js**: OCR 文字識別
- **自然語言處理**: 智慧題目解析和分類

### 部署和維運

- **Vercel**: 前端部署和 CDN
- **GitHub**: 版本控制和 CI/CD
- **環境變數管理**: 安全的配置管理

## 📦 安裝和設定

### 1. 克隆專案

```bash
git clone https://github.com/your-username/sustainability-exam-platform.git
cd sustainability-exam-platform
```

### 2. 安裝依賴 ⭐

```bash
# 推薦使用 npm
npm install

# 如果遇到問題，可以嘗試
npm install --legacy-peer-deps

# 或清除快取後重新安裝
npm cache clean --force
npm install
```

### 3. 環境變數設定

複製 `env.example` 為 `.env.local` 並填入相關配置：

```bash
# Linux/Mac
cp env.example .env.local

# Windows
copy env.example .env.local
```

在 `.env.local` 中設定：

```env
# Supabase 配置（必填）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI 配置（選填）
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# 應用配置（選填）
VITE_APP_TITLE=永續發展能力測驗練習平台
VITE_APP_DESCRIPTION=提供永續發展能力測驗練習、題庫管理、AI解答生成等功能的平台
```

### 4. 資料庫設定 ⭐

#### 4.1 建立 Supabase 專案
1. 前往 [Supabase](https://supabase.com) 註冊並建立新專案
2. 等待專案建立完成（約 2-3 分鐘）

#### 4.2 取得連線資訊
1. 在 Supabase 控制台 → Settings → API
2. 複製 Project URL 和 anon public key 到 `.env.local`

#### 4.3 執行 Schema
1. 在 Supabase 控制台 → SQL Editor
2. 複製 `database/schema.sql` 全部內容並執行

#### 4.4 建立管理員帳戶
1. Authentication → Users → Add user
2. Table Editor → profiles → 將新用戶的 role 改為 'admin'

### 5. 啟動開發伺服器

```bash
npm run dev
```

成功啟動後，前往 `http://localhost:5173` 查看應用程式。

> 📖 **遇到問題？** 請查看 [HELP.md](HELP.md) 獲得詳細的故障排除指南。

## 📁 專案結構

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
│   ├── RegisterPage.tsx # 註冊頁
│   ├── PracticePage.tsx # 練習頁
│   ├── StatsPage.tsx   # 統計頁
│   ├── LeaderboardPage.tsx # 排行榜
│   ├── ProfilePage.tsx # 個人檔案
│   └── AdminPage.tsx   # 管理後台
├── App.tsx             # 主應用組件
├── main.tsx           # 應用入口
└── index.css          # 全域樣式

database/
└── schema.sql         # 資料庫結構定義

題庫與答案/             # 範例題庫檔案
├── 永續發展基礎能力測驗試題11302.pdf
├── 永續發展基礎能力測驗答案11302.pdf
├── 永續發展基礎能力測驗試題11303.pdf
└── 永續發展基礎能力測驗答案11303.pdf
```

## 🚀 部署指南

### Vercel 部署

1. **連結 GitHub 倉庫**

   - 在 Vercel 控制台中匯入您的 GitHub 倉庫
   - 選擇 Vite 框架預設

2. **設定環境變數**

   - 在 Vercel 專案設定中添加環境變數：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_OPENAI_API_KEY`

3. **部署**
   - Vercel 將自動檢測 Vite 配置並進行部署
   - 每次推送到 main 分支時自動重新部署

### 手動部署

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

## 🔧 開發工具

### 程式碼品質

```bash
# ESLint 檢查
npm run lint

# 型別檢查
npx tsc --noEmit
```

### 開發指令

```bash
# 開發模式
npm run dev

# 建置
npm run build

# 預覽建置結果
npm run preview
```

## 📋 資料庫結構

### 主要資料表

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

詳細結構請參考 `database/schema.sql`。

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權條款

此專案使用 MIT 授權條款。詳細內容請參考 [LICENSE](LICENSE) 檔案。

## 👥 開發團隊

- **專案負責人**: [您的姓名]
- **前端開發**: React, TypeScript, Tailwind CSS
- **後端服務**: Supabase, PostgreSQL
- **AI 整合**: OpenAI GPT-4
- **部署維運**: Vercel, GitHub Actions

## 📞 聯絡資訊

如有任何問題或建議，歡迎聯絡：

- Email: your-email@example.com
- GitHub Issues: [專案議題頁面](https://github.com/your-username/sustainability-exam-platform/issues)

## 🙏 致謝

感謝所有為永續發展教育做出貢獻的開發者和使用者。讓我們一起為建設更永續的未來而努力！

---

**永續發展能力測驗練習平台** - 致力於推廣永續發展教育 🌱
