-- 創建自動更新排行榜的函數和觸發器

-- 1. 創建或替換更新 overall_rankings 的函數
CREATE OR REPLACE FUNCTION update_overall_rankings()
RETURNS TRIGGER AS $$
BEGIN
    -- 當練習會話完成時，更新或插入 overall_rankings
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        INSERT INTO public.overall_rankings (
            user_id,
            total_questions_answered,
            total_correct_answers,
            overall_accuracy_rate,
            total_practice_time_seconds,
            total_score,
            last_updated
        )
        SELECT
            NEW.user_id,
            -- 使用實際答題數（從 practice_answers 計算）
            COALESCE(COUNT(pa.id), 0) as total_questions,
            COALESCE(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END), 0) as total_correct,
            CASE
                WHEN COUNT(pa.id) > 0
                THEN CAST(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(pa.id)
                ELSE 0
            END as accuracy,
            COALESCE(SUM(ps.duration_seconds), 0) as total_time,
            COALESCE(SUM(CASE WHEN pa.is_correct THEN 5 ELSE 0 END), 0) as total_score,
            NOW()
        FROM public.practice_sessions ps
        LEFT JOIN public.practice_answers pa ON pa.session_id = ps.id
        WHERE ps.user_id = NEW.user_id
          AND ps.completed = TRUE
        GROUP BY ps.user_id
        ON CONFLICT (user_id) DO UPDATE SET
            total_questions_answered = EXCLUDED.total_questions_answered,
            total_correct_answers = EXCLUDED.total_correct_answers,
            overall_accuracy_rate = EXCLUDED.overall_accuracy_rate,
            total_practice_time_seconds = EXCLUDED.total_practice_time_seconds,
            total_score = EXCLUDED.total_score,
            last_updated = NOW();

        -- 更新排名位置
        WITH ranked_users AS (
            SELECT
                user_id,
                ROW_NUMBER() OVER (ORDER BY total_score DESC, overall_accuracy_rate DESC) as rank
            FROM public.overall_rankings
        )
        UPDATE public.overall_rankings
        SET ranking_position = ranked_users.rank
        FROM ranked_users
        WHERE overall_rankings.user_id = ranked_users.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 創建觸發器（如果不存在）
DROP TRIGGER IF EXISTS trigger_update_overall_rankings ON public.practice_sessions;

CREATE TRIGGER trigger_update_overall_rankings
    AFTER INSERT OR UPDATE OF completed ON public.practice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_overall_rankings();

-- 3. 創建或替換更新 daily_rankings 的函數
CREATE OR REPLACE FUNCTION update_daily_rankings()
RETURNS TRIGGER AS $$
DECLARE
    practice_date DATE;
BEGIN
    -- 當練習會話完成時，更新或插入 daily_rankings
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        practice_date := DATE(NEW.started_at);

        INSERT INTO public.daily_rankings (
            user_id,
            date,
            questions_answered,
            correct_answers,
            accuracy_rate,
            total_time_seconds,
            score,
            updated_at
        )
        SELECT
            NEW.user_id,
            practice_date,
            -- 使用實際答題數
            COALESCE(COUNT(pa.id), 0) as questions,
            COALESCE(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END), 0) as correct,
            CASE
                WHEN COUNT(pa.id) > 0
                THEN CAST(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(pa.id) * 100
                ELSE 0
            END as accuracy,
            COALESCE(SUM(ps.duration_seconds), 0) as total_time,
            COALESCE(SUM(CASE WHEN pa.is_correct THEN 5 ELSE 0 END), 0) as score,
            NOW()
        FROM public.practice_sessions ps
        LEFT JOIN public.practice_answers pa ON pa.session_id = ps.id
        WHERE ps.user_id = NEW.user_id
          AND DATE(ps.started_at) = practice_date
          AND ps.completed = TRUE
        GROUP BY ps.user_id
        ON CONFLICT (user_id, date) DO UPDATE SET
            questions_answered = EXCLUDED.questions_answered,
            correct_answers = EXCLUDED.correct_answers,
            accuracy_rate = EXCLUDED.accuracy_rate,
            total_time_seconds = EXCLUDED.total_time_seconds,
            score = EXCLUDED.score,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 創建 daily_rankings 觸發器
DROP TRIGGER IF EXISTS trigger_update_daily_rankings ON public.practice_sessions;

CREATE TRIGGER trigger_update_daily_rankings
    AFTER INSERT OR UPDATE OF completed ON public.practice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_rankings();

-- 5. 初始化現有數據的排名（執行一次）
-- 更新所有現有用戶的 overall_rankings
INSERT INTO public.overall_rankings (
    user_id,
    total_questions_answered,
    total_correct_answers,
    overall_accuracy_rate,
    total_practice_time_seconds,
    total_score,
    last_updated
)
SELECT
    ps.user_id,
    -- 使用實際答題數
    COALESCE(COUNT(pa.id), 0) as total_questions,
    COALESCE(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END), 0) as total_correct,
    CASE
        WHEN COUNT(pa.id) > 0
        THEN CAST(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(pa.id)
        ELSE 0
    END as accuracy,
    COALESCE(SUM(ps.duration_seconds), 0) as total_time,
    COALESCE(SUM(CASE WHEN pa.is_correct THEN 5 ELSE 0 END), 0) as total_score,
    NOW()
FROM public.practice_sessions ps
LEFT JOIN public.practice_answers pa ON pa.session_id = ps.id
WHERE ps.completed = TRUE
GROUP BY ps.user_id
ON CONFLICT (user_id) DO UPDATE SET
    total_questions_answered = EXCLUDED.total_questions_answered,
    total_correct_answers = EXCLUDED.total_correct_answers,
    overall_accuracy_rate = EXCLUDED.overall_accuracy_rate,
    total_practice_time_seconds = EXCLUDED.total_practice_time_seconds,
    total_score = EXCLUDED.total_score,
    last_updated = NOW();

-- 更新排名位置
WITH ranked_users AS (
    SELECT
        user_id,
        ROW_NUMBER() OVER (ORDER BY total_score DESC, overall_accuracy_rate DESC) as rank
    FROM public.overall_rankings
)
UPDATE public.overall_rankings
SET ranking_position = ranked_users.rank
FROM ranked_users
WHERE overall_rankings.user_id = ranked_users.user_id;

-- 註解：此遷移創建自動更新排行榜的觸發器，並初始化現有數據