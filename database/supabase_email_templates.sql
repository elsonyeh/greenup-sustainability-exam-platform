-- Supabase 郵件模板配置
-- 這些設定需要在 Supabase Dashboard 中進行配置

-- 注意：這些 SQL 指令不能直接在 SQL Editor 中執行，
-- 需要在 Supabase Dashboard 的 A'uthentication > Templates 中手動配置

-- 確認郵件模板 (Confirm signup)
-- 在 Supabase Dashboard > Authentication > Templates > Confirm signup 中使用以下模板：

/*
主題：確認您的帳戶 - 永續發展能力測驗平台

內容：
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>帳戶確認</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .content {
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .btn:hover {
            background-color: #059669;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .security-note {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .link-container {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌱 永續發展能力測驗平台</div>
            <div class="subtitle">Sustainability Competency Assessment Platform</div>
        </div>

        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">歡迎加入我們！</h2>

            <p>親愛的用戶，</p>

            <p>感謝您註冊永續發展能力測驗平台！為了確保您的帳戶安全，請點擊下方按鈕確認您的電子郵件地址：</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="btn">確認我的帳戶</a>
            </div>

            <div class="security-note">
                <strong>🔒 安全提醒：</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>此確認連結將在 24 小時後失效</li>
                    <li>如果您沒有註冊此帳戶，請忽略此郵件</li>
                    <li>請勿將此連結分享給他人</li>
                </ul>
            </div>

            <p>如果上方按鈕無法點擊，請複製以下連結到您的瀏覽器：</p>
            <div class="link-container">
                {{ .ConfirmationURL }}
            </div>

            <p>確認帳戶後，您將可以：</p>
            <ul style="color: #374151; padding-left: 20px;">
                <li>🎯 參與永續發展能力測驗練習</li>
                <li>📊 追蹤個人學習進度和成績</li>
                <li>🏆 查看排行榜和成就系統</li>
                <li>🤖 獲得 AI 智能解答和建議</li>
                <li>📚 建立個人錯題庫和收藏</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>永續發展能力測驗平台</strong></p>
            <p>致力於推廣永續發展教育，培養未來永續人才</p>
            <p style="margin-top: 15px;">
                如有任何問題，請聯繫我們：
                <a href="mailto:support@greenup.com" style="color: #10b981;">support@greenup.com</a>
            </p>
            <p style="margin-top: 10px; color: #999;">
                此郵件由系統自動發送，請勿回覆
            </p>
        </div>
    </div>
</body>
</html>
*/

-- 重設密碼郵件模板 (Reset password)
-- 在 Supabase Dashboard > Authentication > Templates > Reset password 中使用以下模板：

/*
主題：重設您的密碼 - 永續發展能力測驗平台

內容：
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>重設密碼</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #f59e0b;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .content {
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #f59e0b;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .btn:hover {
            background-color: #d97706;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .link-container {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔒 永續發展能力測驗平台</div>
            <div class="subtitle">Sustainability Competency Assessment Platform</div>
        </div>

        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">重設您的密碼</h2>

            <p>親愛的用戶，</p>

            <p>我們收到了重設您帳戶密碼的請求。請點擊下方按鈕來設定新密碼：</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="btn">重設密碼</a>
            </div>

            <div class="security-note">
                <strong>🛡️ 安全提醒：</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>此重設連結將在 1 小時後失效</li>
                    <li>如果您沒有要求重設密碼，請忽略此郵件</li>
                    <li>建議使用包含大小寫字母、數字和符號的強密碼</li>
                    <li>請勿將此連結分享給他人</li>
                </ul>
            </div>

            <p>如果上方按鈕無法點擊，請複製以下連結到您的瀏覽器：</p>
            <div class="link-container">
                {{ .ConfirmationURL }}
            </div>

            <p>如果您沒有要求重設密碼，您的帳戶仍然是安全的，您可以忽略此郵件。</p>
        </div>

        <div class="footer">
            <p><strong>永續發展能力測驗平台</strong></p>
            <p>保護您的帳戶安全是我們的首要任務</p>
            <p style="margin-top: 15px;">
                如有任何問題，請聯繫我們：
                <a href="mailto:support@greenup.com" style="color: #f59e0b;">support@greenup.com</a>
            </p>
            <p style="margin-top: 10px; color: #999;">
                此郵件由系統自動發送，請勿回覆
            </p>
        </div>
    </div>
</body>
</html>
*/

-- 郵件變更確認模板 (Change email address)
-- 在 Supabase Dashboard > Authentication > Templates > Change email address 中使用以下模板：

/*
主題：確認您的新電子郵件地址 - 永續發展能力測驗平台

內容：
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>確認電子郵件變更</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .content {
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .btn:hover {
            background-color: #2563eb;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .security-note {
            background-color: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .link-container {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📧 永續發展能力測驗平台</div>
            <div class="subtitle">Sustainability Competency Assessment Platform</div>
        </div>

        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">確認電子郵件變更</h2>

            <p>親愛的用戶，</p>

            <p>我們收到了變更您帳戶電子郵件地址的請求。請點擊下方按鈕確認這個新的電子郵件地址：</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="btn">確認新郵件地址</a>
            </div>

            <div class="security-note">
                <strong>🔐 安全提醒：</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>此確認連結將在 24 小時後失效</li>
                    <li>確認後，您的舊郵件地址將不再有效</li>
                    <li>如果您沒有要求變更郵件，請立即聯繫我們</li>
                    <li>請勿將此連結分享給他人</li>
                </ul>
            </div>

            <p>如果上方按鈕無法點擊，請複製以下連結到您的瀏覽器：</p>
            <div class="link-container">
                {{ .ConfirmationURL }}
            </div>

            <p>確認新郵件地址後，所有後續的通知都將發送到這個新地址。</p>
        </div>

        <div class="footer">
            <p><strong>永續發展能力測驗平台</strong></p>
            <p>保持您的聯繫資訊更新和安全</p>
            <p style="margin-top: 15px;">
                如有任何問題，請聯繫我們：
                <a href="mailto:support@greenup.com" style="color: #3b82f6;">support@greenup.com</a>
            </p>
            <p style="margin-top: 10px; color: #999;">
                此郵件由系統自動發送，請勿回覆
            </p>
        </div>
    </div>
</body>
</html>
*/