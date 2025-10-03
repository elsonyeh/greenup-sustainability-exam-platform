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
        let timeoutId: NodeJS.Timeout

        // 快速初始化 - 先設置監聽器
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return
            setSession(session)
            if (timeoutId) clearTimeout(timeoutId)
            setLoading(false)
        })

        // 設置超時保護 - 縮短為 2 秒，更快顯示登入頁面
        timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.info('Session check timeout - showing login page')
                setSession(null)
                setLoading(false)
            }
        }, 2000)

        // 嘗試取得初始 session
        supabase.auth.getSession()
            .then(({ data: { session }, error }) => {
                if (!mounted) return

                if (error) {
                    console.error('Error getting session:', error)
                }

                setSession(session)
                setLoading(false)
                clearTimeout(timeoutId)
            })
            .catch((error) => {
                if (!mounted) return

                console.error('Failed to get session:', error)
                setSession(null)
                setLoading(false)
                clearTimeout(timeoutId)
            })

        return () => {
            mounted = false
            subscription.unsubscribe()
            if (timeoutId) clearTimeout(timeoutId)
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