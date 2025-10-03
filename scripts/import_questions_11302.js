import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 載入 .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase 連線設定
// 優先使用 SERVICE_ROLE_KEY（繞過 RLS），否則使用 ANON_KEY
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('錯誤：缺少 Supabase 連線資訊');
  console.error('請在 .env.local 設定 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CSV 檔案路徑
const CSV_FILE_PATH = 'd:\\中山永續金融科技\\永續發展基礎能力測驗練習\\greenup\\題庫與答案\\永續發展基礎能力測驗11302_qbank.csv';

// 考試資訊
const EXAM_INFO = {
  year: 113,
  session: 2,
  title: '永續發展基礎能力測驗 113年第2場'
};

/**
 * 將答案數字轉換為字母
 */
function convertAnswerToLetter(answerNum) {
  const answerMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

  // 處理 "2或3" 這種情況，取第一個答案
  if (answerNum.includes('或')) {
    const firstAnswer = answerNum.split('或')[0];
    return answerMap[firstAnswer] || 'A';
  }

  return answerMap[answerNum] || 'A';
}

/**
 * 主要匯入函數
 */
async function importQuestions() {
  try {
    console.log('開始匯入題目...');
    console.log(`考試資訊: ${EXAM_INFO.year}年第${EXAM_INFO.session}場\n`);

    // 1. 讀取 CSV 檔案
    console.log('讀取 CSV 檔案...');
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');

    // 移除 BOM 標記
    const cleanContent = fileContent.replace(/^\uFEFF/, '');

    // 解析 CSV
    const records = parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`成功讀取 ${records.length} 題\n`);

    // 2. 創建或獲取 exam_document
    console.log('創建考試文件記錄...');
    const { data: examDoc, error: examDocError } = await supabase
      .from('exam_documents')
      .insert({
        title: EXAM_INFO.title,
        year: EXAM_INFO.year,
        session: EXAM_INFO.session,
        file_url: CSV_FILE_PATH,
        processing_status: 'completed'
      })
      .select()
      .single();

    if (examDocError) {
      console.error('創建考試文件失敗:', examDocError);
      throw examDocError;
    }

    console.log(`考試文件已創建，ID: ${examDoc.id}\n`);

    // 3. 匯入題目
    console.log('開始匯入題目...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        const questionData = {
          exam_document_id: examDoc.id,
          year: EXAM_INFO.year,
          session: EXAM_INFO.session,
          question_number: parseInt(record['題號']),
          question_text: record['題目'],
          option_a: record['選項1'],
          option_b: record['選項2'],
          option_c: record['選項3'],
          option_d: record['選項4'],
          correct_answer: convertAnswerToLetter(record['答案']),
          difficulty_level: 1,
          tags: []
        };

        const { error: insertError } = await supabase
          .from('questions')
          .insert(questionData);

        if (insertError) {
          errorCount++;
          errors.push({
            questionNumber: record['題號'],
            error: insertError.message
          });
          console.error(`✗ 題號 ${record['題號']} 匯入失敗:`, insertError.message);
        } else {
          successCount++;
          console.log(`✓ 題號 ${record['題號']} 匯入成功`);
        }
      } catch (err) {
        errorCount++;
        errors.push({
          questionNumber: record['題號'],
          error: err.message
        });
        console.error(`✗ 題號 ${record['題號']} 處理錯誤:`, err.message);
      }
    }

    // 4. 輸出結果統計
    console.log('\n========================================');
    console.log('匯入完成！');
    console.log('========================================');
    console.log(`總題數: ${records.length}`);
    console.log(`成功: ${successCount}`);
    console.log(`失敗: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n失敗的題目：');
      errors.forEach(err => {
        console.log(`  題號 ${err.questionNumber}: ${err.error}`);
      });
    }

    // 5. 驗證匯入結果
    console.log('\n驗證匯入結果...');
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_document_id', examDoc.id);

    if (countError) {
      console.error('驗證失敗:', countError);
    } else {
      console.log(`資料庫中該場次題目數量: ${count}`);
    }

  } catch (error) {
    console.error('匯入過程發生錯誤:', error);
    process.exit(1);
  }
}

// 執行匯入
importQuestions()
  .then(() => {
    console.log('\n腳本執行完畢');
    process.exit(0);
  })
  .catch((error) => {
    console.error('執行失敗:', error);
    process.exit(1);
  });
