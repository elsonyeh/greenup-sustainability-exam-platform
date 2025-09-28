# GreenUP 平台部署指南

## Vercel 部署步驟

### 1. 安裝 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登入 Vercel
```bash
vercel login
```

### 3. 初次部署
```bash
vercel --prod
```

### 4. 設定環境變數

在 Vercel Dashboard 中設定以下環境變數：

#### Production 環境變數：
- `REACT_APP_SUPABASE_URL`: https://lgrzwboejekmiseudaxp.supabase.co
- `REACT_APP_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxncnp3Ym9lamVrbWlzZXVkYXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTA2NjMsImV4cCI6MjA3MDcyNjY2M30.AVQxp1Xx-58IpyO7Cq3f3-m1_NedMMjgyl4iFWgPkU4
- `REACT_APP_GEMINI_API_KEY`: AIzaSyBPXxcWK6JOIGXG_LzCXv_sR5mEokFw5Zw

### 5. 自動部署設定

在 Vercel 中連接 GitHub 儲存庫實現自動部署：
1. 進入 Vercel Dashboard
2. 選擇 "Import Project"
3. 連接 GitHub 並選擇專案儲存庫
4. 設定建置命令: `npm run build`
5. 設定輸出目錄: `build`

### 6. 域名設定

可在 Vercel Dashboard 中設定自訂域名：
- 建議域名: greenup-platform.vercel.app
- 或使用自訂域名

## Supabase 資料庫初始化

在部署前確保 Supabase 資料庫已正確設定：

### 1. 執行資料庫 Schema
在 Supabase SQL Editor 中執行 `supabase-schema.sql` 檔案

### 2. 設定 RLS (Row Level Security)
```sql
-- 啟用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- 基本權限設定
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public questions read" ON questions FOR SELECT TO anon;
```

### 3. 設定儲存庫 (Storage)
如需檔案上傳功能，在 Supabase 中建立儲存庫：
- 建立 bucket: `question-files`
- 設定權限允許檔案上傳

## 本地開發

### 環境變數設定
複製 `.env.local.example` 為 `.env.local` 並填入相關資訊

### 啟動開發伺服器
```bash
npm install
npm start
```

## 建置和測試

### 建置生產版本
```bash
npm run build
```

### 測試建置版本
```bash
npx serve -s build
```

## 功能檢查清單

部署完成後檢查以下功能：
- [ ] 儀表板載入正常
- [ ] 題庫管理功能
- [ ] AI 檔案比對功能
- [ ] 練習模式
- [ ] 統計分析
- [ ] 管理員面板
- [ ] 檔案上傳功能
- [ ] 資料庫連接正常

## 監控和維護

### 性能監控
- 使用 Vercel Analytics 監控效能
- 設定 Uptime 監控

### 備份策略
- Supabase 自動備份
- 定期匯出重要資料

### 更新部署
```bash
git push origin main  # 自動觸發 Vercel 部署
```

## 故障排除

### 常見問題
1. **環境變數未設定**: 檢查 Vercel 環境變數配置
2. **資料庫連接失敗**: 檢查 Supabase 設定和網路連接
3. **AI 功能異常**: 檢查 Gemini API Key 是否有效
4. **檔案上傳失敗**: 檢查 Supabase Storage 設定

### 日誌查看
- Vercel Dashboard > Project > Functions > Logs
- Supabase Dashboard > Logs

## 安全注意事項

1. **API Key 保護**: 確保所有 API Key 都透過環境變數設定
2. **HTTPS**: Vercel 自動提供 HTTPS
3. **CORS 設定**: 確保 Supabase CORS 設定正確
4. **用戶認證**: 實作完整的用戶認證系統
5. **資料驗證**: 前端和後端都要進行資料驗證