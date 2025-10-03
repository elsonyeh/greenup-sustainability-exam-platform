import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 載入 .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPracticeData() {
    console.log('=== 檢查練習數據 ===\n');

    try {
        // 1. 檢查練習會話
        console.log('1. 練習會話記錄：');
        const { data: sessions, error: sessionsError } = await supabase
            .from('practice_sessions')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(5);

        if (sessionsError) throw sessionsError;

        console.log(`   總數: ${sessions?.length || 0}`);
        sessions?.forEach((session, index) => {
            console.log(`   ${index + 1}. ID: ${session.id}`);
            console.log(`      題目數: ${session.total_questions}`);
            console.log(`      答對數: ${session.correct_answers}`);
            console.log(`      完成: ${session.completed}`);
            console.log(`      時長: ${session.duration_seconds}秒`);
            console.log(`      開始時間: ${new Date(session.started_at).toLocaleString('zh-TW')}`);
            console.log('');
        });

        // 2. 檢查答題記錄
        console.log('\n2. 答題記錄：');
        const { data: answers, error: answersError } = await supabase
            .from('practice_answers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (answersError) throw answersError;

        console.log(`   總數: ${answers?.length || 0}`);
        if (answers && answers.length > 0) {
            console.log(`   最新 10 筆答案：`);
            answers.forEach((answer, index) => {
                console.log(`   ${index + 1}. 會話ID: ${answer.session_id.substring(0, 8)}...`);
                console.log(`      題目ID: ${answer.question_id.substring(0, 8)}...`);
                console.log(`      答案: ${answer.user_answer} (${answer.is_correct ? '✓ 正確' : '✗ 錯誤'})`);
            });
        }

        // 3. 檢查收藏題目
        console.log('\n3. 收藏題目：');
        const { data: favorites, error: favoritesError } = await supabase
            .from('user_favorites')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (favoritesError) throw favoritesError;

        console.log(`   總數: ${favorites?.length || 0}`);

        // 4. 檢查錯題記錄
        console.log('\n4. 錯題記錄：');
        const { data: wrongAnswers, error: wrongAnswersError } = await supabase
            .from('wrong_answers')
            .select('*')
            .order('last_wrong_at', { ascending: false })
            .limit(5);

        if (wrongAnswersError) throw wrongAnswersError;

        console.log(`   總數: ${wrongAnswers?.length || 0}`);
        wrongAnswers?.forEach((wrong, index) => {
            console.log(`   ${index + 1}. 題目ID: ${wrong.question_id.substring(0, 8)}...`);
            console.log(`      錯誤次數: ${wrong.wrong_count}`);
            console.log(`      已掌握: ${wrong.mastered ? '是' : '否'}`);
        });

        // 5. 檢查最新的完整練習記錄
        console.log('\n5. 最新練習完整記錄：');
        const { data: latestSession, error: latestError } = await supabase
            .from('practice_sessions')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

        if (latestError) {
            console.log('   無練習記錄');
        } else if (latestSession) {
            console.log(`   會話ID: ${latestSession.id}`);

            const { data: sessionAnswers, error: sessionAnswersError } = await supabase
                .from('practice_answers')
                .select('*')
                .eq('session_id', latestSession.id);

            if (!sessionAnswersError && sessionAnswers) {
                console.log(`   答題記錄數: ${sessionAnswers.length}`);
                const correctCount = sessionAnswers.filter(a => a.is_correct).length;
                console.log(`   答對數: ${correctCount}`);
                console.log(`   答錯數: ${sessionAnswers.length - correctCount}`);
            }
        }

    } catch (error) {
        console.error('檢查數據時發生錯誤:', error);
    }
}

checkPracticeData()
    .then(() => {
        console.log('\n=== 檢查完成 ===');
        process.exit(0);
    })
    .catch((error) => {
        console.error('執行失敗:', error);
        process.exit(1);
    });