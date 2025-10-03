import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'

// 頁面組件 (先建立基本結構)
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PracticePage from './pages/PracticePage'
import StatsPage from './pages/StatsPage'
import AdminPage from './pages/AdminPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import DiagnosticPage from './pages/DiagnosticPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { AuthProvider } from './contexts/AuthContext'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

function App() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        // 設置超時保護 - 延長為 5 秒，給 Supabase 更多時間回應
        const timeout = setTimeout(() => {
            if (mounted) {
                console.info('Session loading timeout - continuing without authentication')
                setLoading(false)
            }
        }, 5000)

        // 取得初始 session
        supabase.auth.getSession()
            .then(({ data: { session }, error }) => {
                if (!mounted) return

                if (error) {
                    console.error('Error getting session:', error)
                    // 即使有錯誤也繼續，讓使用者可以登入
                }
                setSession(session)
                setLoading(false)
                clearTimeout(timeout)
            })
            .catch((error) => {
                if (!mounted) return

                console.error('Failed to get session:', error)
                setLoading(false)
                clearTimeout(timeout)
            })

        // 監聽認證狀態變化
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return

            setSession(session)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <AuthProvider>
            <Routes>
                {/* 公開路由 */}
                <Route path="/login" element={
                    session ? <Navigate to="/" replace /> : <LoginPage />
                } />
                <Route path="/register" element={
                    session ? <Navigate to="/" replace /> : <RegisterPage />
                } />

                {/* 診斷頁面 - 公開路由 */}
                <Route path="/diagnostic" element={<DiagnosticPage />} />

                {/* 認證回調路由 */}
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* 需要認證的路由 */}
                <Route path="/" element={
                    session ? <Layout /> : <Navigate to="/login" replace />
                }>
                    <Route index element={<HomePage />} />
                    <Route path="practice" element={<PracticePage />} />
                    <Route path="practice/:sessionId" element={<PracticePage />} />
                    <Route path="stats" element={<StatsPage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="admin" element={<AdminPage />} />
                </Route>

                {/* 404 頁面 */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                            <p className="text-gray-600 mb-8">找不到您要的頁面</p>
                            <a href="/" className="btn-primary">回到首頁</a>
                        </div>
                    </div>
                } />
            </Routes>
        </AuthProvider>
    )
}

export default App 