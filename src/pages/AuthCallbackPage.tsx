import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface AuthCallbackStatus {
  type: 'loading' | 'success' | 'error' | 'info'
  title: string
  message: string
  redirectPath?: string
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<AuthCallbackStatus>({
    type: 'loading',
    title: '處理認證中...',
    message: '請稍候，我們正在處理您的認證請求'
  })

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 獲取 URL 參數
        const type = searchParams.get('type')
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // 檢查是否有錯誤
        if (error) {
          setStatus({
            type: 'error',
            title: '認證失敗',
            message: errorDescription || '認證過程中發生錯誤，請重試',
            redirectPath: '/login'
          })
          return
        }

        // 處理不同類型的認證回調
        switch (type) {
          case 'signup':
            // 用戶註冊確認
            if (accessToken && refreshToken) {
              // 設置會話
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })

              if (sessionError) {
                setStatus({
                  type: 'error',
                  title: '登入失敗',
                  message: '無法建立用戶會話，請重新登入',
                  redirectPath: '/login'
                })
                return
              }

              setStatus({
                type: 'success',
                title: '帳戶確認成功！',
                message: '歡迎加入永續發展能力測驗平台！您現在可以開始使用所有功能',
                redirectPath: '/'
              })
            } else {
              setStatus({
                type: 'success',
                title: '郵件確認成功',
                message: '您的郵件地址已確認，現在可以登入您的帳戶',
                redirectPath: '/login'
              })
            }
            break

          case 'recovery':
            // 密碼重設
            if (accessToken && refreshToken) {
              // 設置會話用於密碼重設
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })

              if (sessionError) {
                setStatus({
                  type: 'error',
                  title: '重設密碼失敗',
                  message: '無法驗證重設密碼請求，請重新申請',
                  redirectPath: '/login'
                })
                return
              }

              setStatus({
                type: 'info',
                title: '請設定新密碼',
                message: '請在下一個頁面設定您的新密碼',
                redirectPath: '/reset-password'
              })
            } else {
              setStatus({
                type: 'error',
                title: '重設密碼連結無效',
                message: '此重設密碼連結已過期或無效，請重新申請',
                redirectPath: '/login'
              })
            }
            break

          case 'email_change':
            // 郵件地址變更確認
            setStatus({
              type: 'success',
              title: '郵件地址更新成功',
              message: '您的新郵件地址已確認並更新',
              redirectPath: '/profile'
            })
            break

          default:
            // 一般登入或未知類型
            const { data, error: sessionError } = await supabase.auth.getSession()

            if (sessionError) {
              setStatus({
                type: 'error',
                title: '認證失敗',
                message: '無法獲取用戶會話，請重新登入',
                redirectPath: '/login'
              })
              return
            }

            if (data.session) {
              setStatus({
                type: 'success',
                title: '登入成功！',
                message: '歡迎回到永續發展能力測驗平台',
                redirectPath: '/'
              })
            } else {
              setStatus({
                type: 'info',
                title: '請登入您的帳戶',
                message: '認證已完成，請使用您的帳戶登入',
                redirectPath: '/login'
              })
            }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus({
          type: 'error',
          title: '發生未預期的錯誤',
          message: '處理認證時發生錯誤，請稍後再試',
          redirectPath: '/login'
        })
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  // 自動重新導向
  useEffect(() => {
    if (status.type !== 'loading' && status.redirectPath) {
      const timer = setTimeout(() => {
        navigate(status.redirectPath!)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  const getIcon = () => {
    switch (status.type) {
      case 'loading':
        return <LoadingSpinner size="lg" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'info':
        return <AlertTriangle className="h-16 w-16 text-blue-500" />
      default:
        return <LoadingSpinner size="lg" />
    }
  }

  const getColorClasses = () => {
    switch (status.type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className={`max-w-md w-full bg-white rounded-lg shadow-lg border-2 ${getColorClasses()} p-8 text-center`}>
        <div className="mb-6">
          {getIcon()}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {status.title}
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {status.message}
        </p>

        {status.type !== 'loading' && status.redirectPath && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p>3 秒後自動跳轉...</p>
            </div>

            <button
              onClick={() => navigate(status.redirectPath!)}
              className="w-full btn-primary"
            >
              立即跳轉
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full btn-outline"
            >
              返回首頁
            </button>
          </div>
        )}

        {status.type === 'loading' && (
          <div className="text-sm text-gray-500">
            <p>正在處理您的請求，請耐心等候...</p>
          </div>
        )}
      </div>
    </div>
  )
}