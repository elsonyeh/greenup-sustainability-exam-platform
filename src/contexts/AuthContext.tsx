import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
    changePassword: (newPassword: string) => Promise<{ error: any }>
    deleteAccount: () => Promise<{ error: any }>
    handleAuthError: (error: any) => Promise<boolean>
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 取得初始認證狀態
        const getInitialAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error getting session:', error)
                    // 如果是 refresh token 錯誤，清除本地 session
                    if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
                        await supabase.auth.signOut()
                        setSession(null)
                        setUser(null)
                        setProfile(null)
                        return
                    }
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (error) {
                console.error('Error getting initial auth state:', error)
                // 任何獲取 session 的錯誤都清除認證狀態
                await supabase.auth.signOut()
                setSession(null)
                setUser(null)
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }

        getInitialAuth()

        // 監聽認證狀態變化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session)

                // 處理認證錯誤事件
                if (event === 'TOKEN_REFRESHED' && !session) {
                    console.log('Token refresh failed, signing out')
                    await supabase.auth.signOut()
                }

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    // 取得使用者資料
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
                // 檢查是否為認證錯誤
                if (await handleAuthError(error)) {
                    return
                }
                return
            }

            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
            await handleAuthError(error)
        }
    }

    // 註冊
    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            return { error }
        } catch (error) {
            return { error }
        }
    }

    // 登入
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            return { error }
        } catch (error) {
            return { error }
        }
    }

    // 登出
    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            setSession(null)
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    // 處理認證錯誤
    const handleAuthError = async (error: any) => {
        if (error?.message?.includes('Invalid Refresh Token') ||
            error?.message?.includes('Refresh Token Not Found') ||
            error?.message?.includes('JWT expired') ||
            error?.code === 'invalid_jwt') {
            console.log('Authentication error detected, signing out:', error.message)
            await signOut()
            return true
        }
        return false
    }

    // 更新使用者資料
    const updateProfile = async (updates: Partial<Profile>) => {
        try {
            if (!user) {
                return { error: new Error('No user logged in') }
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (!error) {
                setProfile(prev => prev ? { ...prev, ...updates } : null)
            }

            return { error }
        } catch (error) {
            return { error }
        }
    }

    // 變更密碼
    const changePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })
            return { error }
        } catch (error) {
            return { error }
        }
    }

    // 刪除帳戶
    const deleteAccount = async () => {
        try {
            if (!user) {
                return { error: new Error('No user logged in') }
            }

            // 刪除所有相關資料
            await supabase.from('practice_sessions').delete().eq('user_id', user.id)
            await supabase.from('overall_rankings').delete().eq('user_id', user.id)
            await supabase.from('daily_rankings').delete().eq('user_id', user.id)
            await supabase.from('profiles').delete().eq('id', user.id)

            // 刪除 Supabase Auth 使用者
            const { error } = await supabase.rpc('delete_user')

            if (!error) {
                // 登出並清理狀態
                await signOut()
            }

            return { error }
        } catch (error) {
            return { error }
        }
    }

    // 檢查是否為管理員
    const isAdmin = profile?.role === 'admin'

    const value: AuthContextType = {
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        changePassword,
        deleteAccount,
        handleAuthError,
        isAdmin,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 