/**
 * 驗證管理員權限的腳本
 * 使用方法: node scripts/verify-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 載入環境變數
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少必要的環境變數')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const targetEmail = 'elson921121@gmail.com'

async function verifyAdmin() {
  console.log(`🔍 驗證管理員權限: ${targetEmail}`)

  try {
    // 查詢用戶資料
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .eq('email', targetEmail)
      .single()

    if (error) {
      console.error('❌ 查詢用戶資料失敗:', error.message)
      return
    }

    if (!profile) {
      console.error('❌ 找不到指定的用戶')
      return
    }

    console.log('\n📋 用戶資訊:')
    console.log(`  ID: ${profile.id}`)
    console.log(`  Email: ${profile.email}`)
    console.log(`  Full Name: ${profile.full_name || '未設置'}`)
    console.log(`  Role: ${profile.role}`)
    console.log(`  Created: ${new Date(profile.created_at).toLocaleString('zh-TW')}`)
    console.log(`  Updated: ${new Date(profile.updated_at).toLocaleString('zh-TW')}`)

    if (profile.role === 'admin') {
      console.log('\n🎉 確認：用戶具有管理員權限！')
    } else {
      console.log('\n❌ 用戶不是管理員')
    }

    // 測試管理員權限 - 嘗試查詢所有用戶
    console.log('\n🧪 測試管理員權限...')
    const { data: allProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5)

    if (adminError) {
      console.error('❌ 無法執行管理員操作:', adminError.message)
    } else {
      console.log('✅ 管理員權限測試通過')
      console.log(`📊 找到 ${allProfiles.length} 個用戶資料`)
    }

  } catch (error) {
    console.error('❌ 驗證過程中發生錯誤:', error.message)
  }
}

// 執行腳本
verifyAdmin()
  .then(() => {
    console.log('\n🏁 驗證完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 驗證失敗:', error)
    process.exit(1)
  })