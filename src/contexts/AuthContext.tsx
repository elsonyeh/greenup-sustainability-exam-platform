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
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (error) {
                console.error('Error getting initial auth state:', error)
            } finally {
                setLoading(false)
            }
        }

        getInitialAuth()

        // 監聽認證狀態變化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
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
                return
            }

            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
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