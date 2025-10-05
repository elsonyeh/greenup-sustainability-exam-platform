-- 修復排行榜表中的正確率計算
-- 在 Supabase Dashboard > SQL Editor 中執行

-- 1. 清空並重新計算 daily_rankings 表
-- 先備份現有資料（可選）
-- CREATE TABLE daily_rankings_backup AS SELECT * FROM daily_rankings;

-- 清空表
TRUNCATE TABLE daily_rankings;

-- 重新計算每日排行榜資料
INSERT INTO daily_rankings (user_id, date, questions_answered, correct_answers, accuracy_rate, total_time_seconds, score)
SELECT
    ps.user_id,
    DATE(ps.started_at) as date,
    COUNT(pa.id) as questions_answered,
    SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as correct_answers,
    CASE
        WHEN COUNT(pa.id) > 0 THEN
            CAST(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) AS DECIMAL) / CAST(COUNT(pa.id) AS DECIMAL)
        ELSE 0
    END as accuracy_rate,
    SUM(COALESCE(ps.duration_seconds, 0)) as total_time_seconds,
    SUM(CASE WHEN pa.is_correct THEN 10 ELSE 0 END) as score
FROM practice_sessions ps
LEFT JOIN practice_answers pa ON pa.session_id = ps.id
WHERE ps.completed = true
GROUP BY ps.user_id, DATE(ps.started_at)
ON CONFLICT (user_id, date)
DO UPDATE SET
    questions_answered = EXCLUDED.questions_answered,
    correct_answers = EXCLUDED.correct_answers,
    accuracy_rate = EXCLUDED.accuracy_rate,
    total_time_seconds = EXCLUDED.total_time_seconds,
    score = EXCLUDED.score,
    updated_at = NOW();

-- 2. 清空並重新計算 overall_rankings 表
TRUNCATE TABLE overall_rankings;

-- 重新計算總排行榜資料
INSERT INTO overall_rankings (
    user_id,
    total_questions_answered,
    total_correct_answers,
    overall_accuracy_rate,
    total_practice_time_seconds,
    total_score,
    ranking_position
)
WITH user_stats AS (
    SELECT
        ps.user_id,
        COUNT(pa.id) as total_questions,
        SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as total_correct,
        CASE
            WHEN COUNT(pa.id) > 0 THEN
                CAST(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) AS DECIMAL) / CAST(COUNT(pa.id) AS DECIMAL)
            ELSE 0
        END as accuracy,
        SUM(COALESCE(ps.duration_seconds, 0)) as total_time,
        SUM(CASE WHEN pa.is_correct THEN 10 ELSE 0 END) as score
    FROM practice_sessions ps
    LEFT JOIN practice_answers pa ON pa.session_id = ps.id
    WHERE ps.completed = true
    GROUP BY ps.user_id
)
SELECT
    user_id,
    total_questions as total_questions_answered,
    total_correct as total_correct_answers,
    accuracy as overall_accuracy_rate,
    total_time as total_practice_time_seconds,
    score as total_score,
    ROW_NUMBER() OVER (ORDER BY score DESC, total_questions DESC) as ranking_position
FROM user_stats
ON CONFLICT (user_id)
DO UPDATE SET
    total_questions_answered = EXCLUDED.total_questions_answered,
    total_correct_answers = EXCLUDED.total_correct_answers,
    overall_accuracy_rate = EXCLUDED.overall_accuracy_rate,
    total_practice_time_seconds = EXCLUDED.total_practice_time_seconds,
    total_score = EXCLUDED.total_score,
    ranking_position = EXCLUDED.ranking_position,
    last_updated = NOW();

-- 3. 驗證結果
SELECT 'Daily Rankings Sample:' as info;
SELECT
    user_id,
    date,
    questions_answered,
    correct_answers,
    accuracy_rate,
    ROUND(accuracy_rate * 100, 2) as accuracy_percentage,
    score
FROM daily_rankings
ORDER BY date DESC, score DESC
LIMIT 5;

SELECT 'Overall Rankings Sample:' as info;
SELECT
    user_id,
    total_questions_answered,
    total_correct_answers,
    overall_accuracy_rate,
    ROUND(overall_accuracy_rate * 100, 2) as accuracy_percentage,
    total_score,
    ranking_position
FROM overall_rankings
ORDER BY ranking_position
LIMIT 5;

SELECT 'Leaderboard tables fixed successfully!' as message;
