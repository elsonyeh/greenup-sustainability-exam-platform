@echo off
chcp 65001 >nul
:: 永續發展能力測驗練習平台 - Windows 自動設定腳本

echo 🌱 永續發展能力測驗練習平台 - 自動設定開始
echo ==================================================

:: 檢查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未安裝 Node.js
    echo 請前往 https://nodejs.org 下載並安裝 Node.js 18+
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js 版本檢查通過: %NODE_VERSION%

:: 檢查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未安裝 npm
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm 版本: %NPM_VERSION%

:: 安裝依賴
echo.
echo 📦 安裝依賴套件...
echo 這可能需要幾分鐘時間，請耐心等待...

npm install
if %errorlevel% neq 0 (
    echo ⚠️  標準安裝失敗，嘗試使用 --legacy-peer-deps...
    npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ 依賴套件安裝失敗
        echo 請手動執行: npm cache clean --force ^& npm install
        pause
        exit /b 1
    ) else (
        echo ✅ 依賴套件安裝成功 (使用 legacy-peer-deps)
    )
) else (
    echo ✅ 依賴套件安裝成功
)

:: 設定環境變數
echo.
echo ⚙️  設定環境變數...

if not exist "env.example" (
    echo ❌ 錯誤：找不到 env.example 檔案
    pause
    exit /b 1
)

if not exist ".env.local" (
    copy env.example .env.local >nul
    echo ✅ 已複製 env.example 到 .env.local
) else (
    echo ⚠️  .env.local 已存在，略過複製
)

:: 檢查專案結構
echo.
echo 🔍 檢查專案結構...

if exist "src\" (
    echo ✅ src\ 目錄存在
) else (
    echo ❌ 缺少 src\ 目錄
    pause
    exit /b 1
)

if exist "database\" (
    echo ✅ database\ 目錄存在
) else (
    echo ❌ 缺少 database\ 目錄
    pause
    exit /b 1
)

if exist "public\" (
    echo ✅ public\ 目錄存在
) else (
    echo ❌ 缺少 public\ 目錄
    pause
    exit /b 1
)

if exist "database\schema.sql" (
    echo ✅ database\schema.sql 檔案存在
) else (
    echo ❌ 缺少 database\schema.sql 檔案
    pause
    exit /b 1
)

if exist "src\App.tsx" (
    echo ✅ src\App.tsx 檔案存在
) else (
    echo ❌ 缺少 src\App.tsx 檔案
    pause
    exit /b 1
)

if exist "src\main.tsx" (
    echo ✅ src\main.tsx 檔案存在
) else (
    echo ❌ 缺少 src\main.tsx 檔案
    pause
    exit /b 1
)

:: 測試編譯
echo.
echo 🧪 測試 TypeScript 編譯...
npx tsc --noEmit >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ TypeScript 編譯檢查通過
) else (
    echo ⚠️  TypeScript 編譯有錯誤，但不影響執行
)

:: 完成訊息
echo.
echo 🎉 基本設定完成！
echo ==================================================
echo.
echo 📋 接下來請手動完成以下步驟：
echo.
echo 1️⃣  設定 Supabase：
echo    - 前往 https://supabase.com 建立新專案
echo    - 複製 Project URL 和 anon key
echo    - 編輯 .env.local 檔案填入連線資訊
echo.
echo 2️⃣  執行資料庫 Schema：
echo    - 在 Supabase SQL Editor 執行 database/schema.sql
echo.
echo 3️⃣  建立管理員帳戶：
echo    - 在 Supabase Authentication 建立用戶
echo    - 將用戶 role 設為 'admin'
echo.
echo 4️⃣  啟動開發伺服器：
echo    npm run dev
echo.
echo 📖 詳細步驟請參考：
echo    - 快速指南: QUICKSTART.md
echo    - 完整說明: HELP.md
echo.
echo 🆘 遇到問題？查看故障排除指南：
echo    - CSS 錯誤已修復，重新啟動即可
echo    - 詳細解決方案在 HELP.md
echo.
echo 🌱 感謝使用永續發展能力測驗練習平台！
echo.
pause 