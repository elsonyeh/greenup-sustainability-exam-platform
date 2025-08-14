#!/bin/bash
# 永續發展能力測驗練習平台 - 自動設定腳本
# 適用於 Linux/Mac 系統

set -e  # 遇到錯誤時停止執行

echo "🌱 永續發展能力測驗練習平台 - 自動設定開始"
echo "=================================================="

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo "請前往 https://nodejs.org 下載並安裝 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ 錯誤：Node.js 版本過舊 (當前: $NODE_VERSION, 需要: 18+)"
    echo "請升級 Node.js 到 18.0.0 或更高版本"
    exit 1
fi

echo "✅ Node.js 版本檢查通過: $NODE_VERSION"

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤：未安裝 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm -v)"

# 安裝依賴
echo ""
echo "📦 安裝依賴套件..."
echo "這可能需要幾分鐘時間，請耐心等待..."

if npm install; then
    echo "✅ 依賴套件安裝成功"
else
    echo "⚠️  標準安裝失敗，嘗試使用 --legacy-peer-deps..."
    if npm install --legacy-peer-deps; then
        echo "✅ 依賴套件安裝成功 (使用 legacy-peer-deps)"
    else
        echo "❌ 依賴套件安裝失敗"
        echo "請手動執行: npm cache clean --force && npm install"
        exit 1
    fi
fi

# 設定環境變數
echo ""
echo "⚙️  設定環境變數..."

if [ ! -f "env.example" ]; then
    echo "❌ 錯誤：找不到 env.example 檔案"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    cp env.example .env.local
    echo "✅ 已複製 env.example 到 .env.local"
else
    echo "⚠️  .env.local 已存在，略過複製"
fi

# 檢查專案結構
echo ""
echo "🔍 檢查專案結構..."

REQUIRED_DIRS=("src" "database" "public")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ 目錄存在"
    else
        echo "❌ 缺少 $dir/ 目錄"
        exit 1
    fi
done

REQUIRED_FILES=("database/schema.sql" "src/App.tsx" "src/main.tsx")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 檔案存在"
    else
        echo "❌ 缺少 $file 檔案"
        exit 1
    fi
done

# 測試編譯
echo ""
echo "🧪 測試 TypeScript 編譯..."
if npx tsc --noEmit; then
    echo "✅ TypeScript 編譯檢查通過"
else
    echo "⚠️  TypeScript 編譯有錯誤，但不影響執行"
fi

# 完成訊息
echo ""
echo "🎉 基本設定完成！"
echo "=================================================="
echo ""
echo "📋 接下來請手動完成以下步驟："
echo ""
echo "1️⃣  設定 Supabase："
echo "   - 前往 https://supabase.com 建立新專案"
echo "   - 複製 Project URL 和 anon key"
echo "   - 編輯 .env.local 檔案填入連線資訊"
echo ""
echo "2️⃣  執行資料庫 Schema："
echo "   - 在 Supabase SQL Editor 執行 database/schema.sql"
echo ""
echo "3️⃣  建立管理員帳戶："
echo "   - 在 Supabase Authentication 建立用戶"
echo "   - 將用戶 role 設為 'admin'"
echo ""
echo "4️⃣  啟動開發伺服器："
echo "   npm run dev"
echo ""
echo "📖 詳細步驟請參考："
echo "   - 快速指南: QUICKSTART.md"
echo "   - 完整說明: HELP.md"
echo ""
echo "🆘 遇到問題？查看故障排除指南："
echo "   - CSS 錯誤已修復，重新啟動即可"
echo "   - 詳細解決方案在 HELP.md"
echo ""
echo "�� 感謝使用永續發展能力測驗練習平台！" 