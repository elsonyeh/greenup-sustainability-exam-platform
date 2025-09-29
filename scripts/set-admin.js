/**
 * 設置用戶為管理員的腳本
 * 使用方法: node scripts/set-admin.js
 *
 * 注意：由於 RLS 限制，這個腳本需要以下方式之一來執行：
 * 1. 使用 Supabase Service Role Key
 * 2. 直接在 Supabase SQL Editor 中執行 SQL
 * 3. 臨時關閉 RLS 後執行
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 載入環境變數
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少必要的環境變數:')
  console.error('  - VITE_SUPABASE_URL')
  console.error('  - VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const targetEmail = 'elson921121@gmail.com'

async function setUserAsAdmin() {
  console.log(`🔍 正在查找用戶: ${targetEmail}`)
  console.log('\n⚠️  注意：由於數據庫安全策略限制，此腳本可能無法直接修改用戶角色。')
  console.log('如果遇到權限錯誤，請使用以下 SQL 語句在 Supabase Dashboard 的 SQL Editor 中執行：')
  console.log('\n' + '='.repeat(60))
  console.log(`-- 設置 ${targetEmail} 為管理員`)
  console.log(`UPDATE public.profiles`)
  console.log(`SET role = 'admin', updated_at = NOW()`)
  console.log(`WHERE email = '${targetEmail}';`)
  console.log('')
  console.log(`-- 如果用戶不存在於 profiles 表，先從 auth.users 創建`)
  console.log(`INSERT INTO public.profiles (id, email, role, created_at, updated_at)`)
  console.log(`SELECT`)
  console.log(`    au.id,`)
  console.log(`    au.email,`)
  console.log(`    'admin',`)
  console.log(`    NOW(),`)
  console.log(`    NOW()`)
  console.log(`FROM auth.users au`)
  console.log(`WHERE au.email = '${targetEmail}'`)
  console.log(`  AND NOT EXISTS (`)
  console.log(`    SELECT 1 FROM public.profiles p WHERE p.id = au.id`)
  console.log(`  );`)
  console.log('')
  console.log(`-- 驗證設置結果`)
  console.log(`SELECT p.id, p.email, p.full_name, p.role, p.created_at, p.updated_at`)
  console.log(`FROM public.profiles p`)
  console.log(`WHERE p.email = '${targetEmail}';`)
  console.log('='.repeat(60) + '\n')

  try {
    // 嘗試查詢用戶是否存在
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', targetEmail)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ 查詢用戶資料時發生錯誤:', profileError.message)
      return
    }

    if (existingProfile) {
      console.log(`✅ 找到用戶 profile: ${existingProfile.id}`)
      console.log(`📋 當前角色: ${existingProfile.role}`)

      if (existingProfile.role === 'admin') {
        console.log('🎉 用戶已經是管理員了！')
        return
      }

      // 嘗試更新角色（可能會因為 RLS 而失敗）
      console.log('📝 嘗試更新用戶角色為管理員...')

      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('email', targetEmail)
        .select()

      if (error) {
        console.error('❌ 更新用戶角色失敗:', error.message)
        console.log('\n💡 建議解決方案：')
        console.log('1. 登入 Supabase Dashboard')
        console.log('2. 前往 SQL Editor')
        console.log('3. 執行上面提供的 SQL 語句')
        return
      }

      console.log('✅ 成功更新用戶角色為管理員')
    } else {
      console.log('❌ 用戶不存在於 profiles 表中')
      console.log('💡 請確認用戶已經註冊並至少登入過一次')
      console.log('💡 或者使用上面提供的 SQL 語句手動創建管理員 profile')
    }

  } catch (error) {
    console.error('❌ 執行過程中發生未預期的錯誤:', error.message)
    console.log('\n💡 建議使用 Supabase Dashboard 的 SQL Editor 來執行管理員設置')
  }
}

// 執行腳本
setUserAsAdmin()
  .then(() => {
    console.log('\n🏁 腳本執行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 腳本執行失敗:', error)
    process.exit(1)
  })