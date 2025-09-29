-- 郵件通知系統表結構
-- 在 Supabase Dashboard 的 SQL Editor 中執行

-- 創建郵件通知表
CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建系統設定表
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建系統監控日誌表
CREATE TABLE IF NOT EXISTS public.system_monitor_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'error')),
    metrics JSONB,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_monitor_logs ENABLE ROW LEVEL SECURITY;

-- 郵件通知權限策略（只有管理員可以查看）
CREATE POLICY "Only admins can view email notifications" ON public.email_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 系統設定權限策略（只有管理員可以查看和修改）
CREATE POLICY "Only admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 系統監控日誌權限策略（只有管理員可以查看）
CREATE POLICY "Only admins can view monitor logs" ON public.system_monitor_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 創建索引
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX idx_email_notifications_created_at ON public.email_notifications(created_at);
CREATE INDEX idx_system_settings_key ON public.system_settings(key);
CREATE INDEX idx_system_monitor_logs_service ON public.system_monitor_logs(service_name);
CREATE INDEX idx_system_monitor_logs_created_at ON public.system_monitor_logs(created_at);

-- 添加觸發器自動更新 updated_at
CREATE TRIGGER update_email_notifications_updated_at
    BEFORE UPDATE ON public.email_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默認系統設定
INSERT INTO public.system_settings (key, value, description) VALUES
    ('platform_name', '"永續發展基礎能力測驗平台"', '平台名稱'),
    ('allow_registration', 'true', '是否允許用戶註冊'),
    ('max_questions_per_session', '50', '每次練習最大題目數'),
    ('session_time_limit', '60', '練習時間限制（分鐘）'),
    ('enable_email_notifications', 'true', '是否啟用郵件通知'),
    ('maintenance_mode', 'false', '維護模式'),
    ('ai_explanation_enabled', 'true', 'AI解答功能'),
    ('auto_backup_enabled', 'true', '自動備份'),
    ('backup_frequency', '"daily"', '備份頻率'),
    ('data_retention_days', '365', '數據保留天數'),
    ('smtp_host', '""', 'SMTP主機'),
    ('smtp_port', '587', 'SMTP端口'),
    ('smtp_user', '""', 'SMTP用戶名'),
    ('admin_email', '"admin@example.com"', '管理員郵箱')
ON CONFLICT (key) DO NOTHING;

-- 創建函數來記錄系統監控數據
CREATE OR REPLACE FUNCTION log_system_status(
    p_service_name TEXT,
    p_status TEXT,
    p_metrics JSONB DEFAULT NULL,
    p_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_monitor_logs (service_name, status, metrics, message)
    VALUES (p_service_name, p_status, p_metrics, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建函數來獲取系統設定
CREATE OR REPLACE FUNCTION get_system_setting(setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM public.system_settings
    WHERE key = setting_key;

    RETURN COALESCE(setting_value, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 創建函數來更新系統設定
CREATE OR REPLACE FUNCTION update_system_setting(
    setting_key TEXT,
    setting_value JSONB,
    user_id UUID
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_settings (key, value, updated_by)
    VALUES (setting_key, setting_value, user_id)
    ON CONFLICT (key)
    DO UPDATE SET
        value = EXCLUDED.value,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 驗證設置
SELECT 'Email notifications table created' as status;
SELECT 'System settings table created' as status;
SELECT 'System monitor logs table created' as status;
SELECT 'Default settings inserted' as status;