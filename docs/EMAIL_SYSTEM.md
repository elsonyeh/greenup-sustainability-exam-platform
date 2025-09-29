# 郵件系統使用指南

## 概述

永續發展能力測驗平台集成了完整的郵件通知系統，支持用戶歡迎郵件、學習提醒、成就通知和管理員警報等功能。

## 功能特性

### 📧 郵件模板系統
- **歡迎郵件**: 新用戶註冊時自動發送
- **學習提醒**: 提醒用戶保持學習習慣
- **成就通知**: 當用戶達成特定成就時發送
- **週報**: 定期發送學習進度報告
- **管理員警報**: 系統異常時通知管理員

### 🎨 動態模板變量
每個郵件模板支持動態變量替換：
- `{{userName}}` - 用戶姓名
- `{{platformUrl}}` - 平台網址
- `{{streakDays}}` - 連續學習天數
- `{{accuracy}}` - 正確率
- 更多變量...

### 📊 郵件統計
- 總發送數量
- 今日發送統計
- 發送狀態追蹤（待發送、已發送、失敗）
- 郵件服務健康狀態監控

## 配置設定

### 1. 環境變量配置

在 `.env.local` 文件中添加以下配置：

```env
# 郵件服務配置
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password
VITE_SMTP_FROM_NAME=永續發展能力測驗平台
VITE_SMTP_FROM_EMAIL=noreply@yourdomain.com
```

### 2. Gmail 配置示例

如果使用 Gmail SMTP 服務：

1. 啟用兩步驟驗證
2. 生成應用程式密碼
3. 使用應用程式密碼作為 `VITE_SMTP_PASS`

```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-gmail@gmail.com
VITE_SMTP_PASS=your-16-digit-app-password
```

### 3. 其他 SMTP 服務

#### SendGrid
```env
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
VITE_SMTP_USER=apikey
VITE_SMTP_PASS=your_sendgrid_api_key
```

#### AWS SES
```env
VITE_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_aws_access_key
VITE_SMTP_PASS=your_aws_secret_key
```

## 數據庫結構

### email_notifications 表

執行 `database/email_notifications.sql` 創建必要的數據庫表：

```sql
-- 郵件通知表
CREATE TABLE public.email_notifications (
    id UUID PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 系統監控

### 郵件服務狀態

在管理員後台可以監控：

1. **服務狀態**:
   - 🟢 正常運行: 郵件配置完整且服務可用
   - 🟡 未配置: 缺少必要的環境變量
   - 🔴 服務失敗: SMTP 連接失敗或其他錯誤

2. **發送統計**:
   - 總郵件數量
   - 今日發送數量
   - 待發送/已發送/失敗統計

### 測試功能

在管理員後台 → 系統設定 → 安全設定中：

- **測試郵件服務**: 發送測試郵件驗證配置
- **發送測試警報**: 模擬系統警報通知

## API 使用方法

### 發送歡迎郵件

```typescript
import { sendWelcomeEmail } from '../lib/emailService'

// 新用戶註冊後調用
await sendWelcomeEmail(user.email, user.full_name)
```

### 發送學習提醒

```typescript
import { sendStreakReminder } from '../lib/emailService'

// 檢查用戶學習狀態後調用
await sendStreakReminder(user.email, user.full_name, streakDays)
```

### 發送成就通知

```typescript
import { sendAchievementEmail } from '../lib/emailService'

const stats = {
    totalQuestions: 150,
    accuracy: 85,
    studyDays: 30
}

await sendAchievementEmail(
    user.email,
    user.full_name,
    "學習達人",
    stats
)
```

### 發送管理員警報

```typescript
import { sendAdminAlert } from '../lib/emailService'

await sendAdminAlert(
    "資料庫連接異常",
    "error",
    "無法連接到主資料庫，請立即檢查",
    "檢查資料庫服務狀態並重啟相關服務"
)
```

## 最佳實踐

### 1. 郵件內容設計
- 保持簡潔明瞭
- 使用友好的語調
- 包含明確的行動呼籲
- 提供取消訂閱選項

### 2. 發送頻率控制
- 避免頻繁發送打擾用戶
- 實施發送頻率限制
- 允許用戶自定義通知偏好

### 3. 錯誤處理
- 記錄發送失敗的郵件
- 實施重試機制
- 監控發送成功率

### 4. 隱私保護
- 遵守 GDPR 和其他隱私法規
- 提供明確的隱私政策
- 允許用戶控制通知設定

## 故障排除

### 常見問題

1. **郵件無法發送**
   - 檢查 SMTP 配置是否正確
   - 確認網絡連接正常
   - 驗證郵件服務商設定

2. **Gmail 認證失敗**
   - 確保啟用兩步驟驗證
   - 使用應用程式密碼而非帳戶密碼
   - 檢查帳戶安全設定

3. **郵件進入垃圾箱**
   - 配置 SPF、DKIM、DMARC 記錄
   - 使用認證的發送網域
   - 改善郵件內容品質

### 日誌查看

在管理員後台可以查看：
- 郵件發送記錄
- 錯誤訊息
- 系統監控日誌

## 性能優化

1. **批量發送**: 對於大量用戶通知，使用批量發送
2. **佇列處理**: 實施郵件佇列系統
3. **模板快取**: 快取編譯後的郵件模板
4. **發送限制**: 遵守 SMTP 服務的發送限制

## 安全考量

1. **憑證保護**: 安全存儲 SMTP 憑證
2. **內容過濾**: 防止郵件內容注入攻擊
3. **頻率限制**: 防止郵件濫用
4. **日誌審計**: 記錄所有郵件操作

## 後續擴展

- 支援更多郵件服務提供商
- 實施郵件模板編輯器
- 添加用戶通知偏好設定
- 整合推送通知服務
- 支援多語言郵件模板

---

需要更多幫助？請查看 [API 文檔](./API_REFERENCE.md) 或聯繫技術支援團隊。