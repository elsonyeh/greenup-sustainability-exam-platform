# 🚀 快速啟動指南

> 5 分鐘內啟動永續發展能力測驗練習平台

## 📋 前置需求

- Node.js 18+
- Git

## 🏃‍♂️ 快速步驟

### 1️⃣ 克隆專案

```bash
git clone https://github.com/your-username/sustainability-exam-platform.git
cd sustainability-exam-platform
```

### 2️⃣ 安裝依賴

```bash
npm install
```

### 3️⃣ 設定環境變數

```bash
# 複製環境變數範本
cp env.example .env.local

# Windows 使用者
copy env.example .env.local
```

### 4️⃣ 設定 Supabase

1. **建立 Supabase 專案**

   - 前往 https://supabase.com
   - 點擊 "New Project"
   - 選擇區域：Asia Northeast (Tokyo)

2. **取得連線資訊**

   - Settings → API
   - 複製 "Project URL" 和 "anon public key"

3. **編輯 .env.local**

   ```env
   VITE_SUPABASE_URL=你的_project_url
   VITE_SUPABASE_ANON_KEY=你的_anon_key
   ```

4. **執行資料庫 Schema**

   - SQL Editor → New query
   - 複製 `database/schema.sql` 全部內容
   - 點擊 "Run"

5. **建立管理員帳戶**
   - Authentication → Users → Add user
   - 輸入 email 和密碼
   - Table Editor → profiles → 找到新用戶
   - 將 `role` 欄位改為 `admin`

### 5️⃣ 啟動應用

```bash
npm run dev
```

開啟 http://localhost:5173 🎉

## ⚡ 一鍵設定腳本（進階用戶）

```bash
#!/bin/bash
# setup.sh - 自動設定腳本

echo "🚀 啟動永續發展測驗平台設定..."

# 安裝依賴
echo "📦 安裝依賴套件..."
npm install

# 複製環境變數
echo "⚙️ 設定環境變數..."
cp env.example .env.local

echo "✅ 基本設定完成！"
echo "🔧 請手動完成以下步驟："
echo "1. 編輯 .env.local 檔案"
echo "2. 設定 Supabase 專案"
echo "3. 執行 npm run dev"

echo "📖 詳細步驟請參考 HELP.md"
```

## 🆘 常見問題

### CSS 錯誤：border-border 不存在

**解決：** 已修復，重新啟動即可

```bash
npm run dev
```

### 安裝失敗

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Supabase 連線失敗

- 檢查 URL 和 API Key 是否正確
- 確認已執行 schema.sql
- 檢查網路連線

## 📖 完整文檔

- **安裝指南：** [README.md](README.md)
- **詳細說明：** [HELP.md](HELP.md)
- **故障排除：** [HELP.md#故障排除](HELP.md#故障排除)

---

🌱 **永續發展能力測驗練習平台** - 讓學習更有效率！
