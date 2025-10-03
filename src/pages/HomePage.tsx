import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
    BookOpen,
    BarChart3,
    Trophy,
    Target,
    Clock,
    Star,
    ArrowRight,
    TrendingUp,
    Users,
    CheckCircle
} from 'lucide-react'

interface RecentSession {
    id: string
    session_type: string
    category_name: string
    total_questions: number
    correct_answers: number
    accuracy: number
    score: number
    completed_at: string
}

interface QuickStat {
    label: string
    value: string
    icon: any
    color: string
}

interface LeaderboardPreview {
    name: string
    score: string
    rank: number
    isCurrentUser?: boolean
}

export default function HomePage() {
    const { profile, user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
    const [quickStats, setQuickStats] = useState<QuickStat[]>([])
    const [leaderboardPreview, setLeaderboardPreview] = useState<LeaderboardPreview[]>([])

    // 獲取快速統計數據
    const fetchQuickStats = async () => {
        try {
            // 獲取總題數
            const { count: totalQuestions } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })

            // 獲取個人活躍度 (最近7天的學習天數)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            let userActiveDays = 0
            if (user?.id) {
                const { data: userSessions } = await supabase
                    .from('practice_sessions')
                    .select('started_at')
                    .eq('user_id', user.id)
                    .gte('started_at', sevenDaysAgo.toISOString())
                    .eq('completed', true)

                // 計算唯一的學習天數
                const uniqueDays = new Set(
                    userSessions?.map(session =>
                        new Date(session.started_at).toDateString()
                    ) || []
                )
                userActiveDays = uniqueDays.size
            }

            // 獲取整體完成率
            const { data: allSessions } = await supabase
                .from('practice_sessions')
                .select('completed')

            const completedSessions = allSessions?.filter(session => session.completed).length || 0
            const totalSessions = allSessions?.length || 1
            const completionRate = Math.round((completedSessions / totalSessions) * 100)

            // 獲取平均分數
            const { data: completedSessionsWithScore } = await supabase
                .from('practice_sessions')
                .select('total_questions, correct_answers')
                .eq('completed', true)

            let averageScore = 0
            if (completedSessionsWithScore && completedSessionsWithScore.length > 0) {
                const totalScore = completedSessionsWithScore.reduce((sum, session) => {
                    const sessionScore = Math.round((session.correct_answers / session.total_questions) * 100)
                    return sum + sessionScore
                }, 0)
                averageScore = Math.round(totalScore / completedSessionsWithScore.length)
            }

            setQuickStats([
                {
                    label: '總題數',
                    value: `${totalQuestions || 0}`,
                    icon: BookOpen,
                    color: 'text-blue-600'
                },
                {
                    label: '近7日活躍',
                    value: `${userActiveDays}/7天`,
                    icon: Users,
                    color: 'text-green-600'
                },
                {
                    label: '完成率',
                    value: `${completionRate}%`,
                    icon: CheckCircle,
                    color: 'text-purple-600'
                },
                {
                    label: '平均分數',
                    value: `${averageScore}分`,
                    icon: Target,
                    color: 'text-orange-600'
                }
            ])

        } catch (error) {
            console.error('Error fetching quick stats:', error)
            // 設置默認值
            setQuickStats([
                { label: '總題數', value: '0', icon: BookOpen, color: 'text-blue-600' },
                { label: '近7日活躍', value: '0/7天', icon: Users, color: 'text-green-600' },
                { label: '完成率', value: '0%', icon: CheckCircle, color: 'text-purple-600' },
                { label: '平均分數', value: '0分', icon: Target, color: 'text-orange-600' }
            ])
        }
    }

    // 獲取最近練習記錄
    const fetchRecentSessions = async () => {
        if (!user?.id) return

        try {
            const { data: sessions, error } = await supabase
                .from('practice_sessions')
                .select(`
                    id,
                    session_type,
                    total_questions,
                    correct_answers,
                    completed_at,
                    question_categories(name)
                `)
                .eq('user_id', user.id)
                .eq('completed', true)
                .order('completed_at', { ascending: false })
                .limit(3)

            if (error) throw error

            const formattedSessions: RecentSession[] = sessions?.map(session => ({
                id: session.id,
                session_type: session.session_type,
                category_name: (session.question_categories as any)?.name || '綜合練習',
                total_questions: session.total_questions,
                correct_answers: session.correct_answers,
                accuracy: Math.round((session.correct_answers / session.total_questions) * 100),
                score: session.correct_answers * 5, // 假設每題5分
                completed_at: session.completed_at
            })) || []

            setRecentSessions(formattedSessions)
        } catch (error) {
            console.error('Error fetching recent sessions:', error)
            setRecentSessions([])
        }
    }

    // 獲取排行榜預覽
    const fetchLeaderboardPreview = async () => {
        try {
            const { data: rankings, error } = await supabase
                .from('overall_rankings')
                .select(`
                    user_id,
                    total_score,
                    ranking_position,
                    profiles!inner(full_name)
                `)
                .order('total_score', { ascending: false })
                .limit(3)

            if (error) throw error

            const preview: LeaderboardPreview[] = rankings?.map((ranking, index) => ({
                name: (ranking.profiles as any).full_name || '匿名用戶',
                score: `${ranking.total_score}分`,
                rank: index + 1,
                isCurrentUser: ranking.user_id === user?.id
            })) || []

            // 如果當前用戶不在前3名，添加當前用戶的排名
            if (user?.id && !preview.some(p => p.isCurrentUser)) {
                const { data: userRankingData } = await supabase
                    .from('overall_rankings')
                    .select('total_score, ranking_position')
                    .eq('user_id', user.id)
                    .limit(1)

                const userRanking = userRankingData?.[0]
                if (userRanking) {
                    preview.push({
                        name: profile?.full_name || '您',
                        score: `${userRanking.total_score}分`,
                        rank: userRanking.ranking_position || 0,
                        isCurrentUser: true
                    })
                }
            }

            setLeaderboardPreview(preview)
        } catch (error) {
            console.error('Error fetching leaderboard preview:', error)
            setLeaderboardPreview([])
        }
    }

    // 獲取所有數據
    const fetchAllData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchQuickStats(),
                fetchRecentSessions(),
                fetchLeaderboardPreview()
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [user?.id])

    return (
        <div className="space-y-8">
            {/* Hero 區塊 */}
            <div className="relative overflow-hidden">
                {/* 內容 */}
                <div className="relative z-10 p-8 md:p-12 lg:p-16">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center px-5 py-3 bg-white/80 backdrop-blur-sm text-primary border border-primary/30 text-sm font-semibold mb-8 shadow-lg rounded-2xl">
                            <Star className="h-4 w-4 mr-2 text-primary" />
                            永續發展能力測驗平台
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            <span className="text-gray-800">歡迎回來，</span>
                            <span className="block text-primary font-black">
                                {profile?.full_name || '學習者'}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl">
                            探索永續發展的核心理念，掌握
                            <span className="text-primary font-bold"> ESG </span>
                            知識體系，為建設更美好的未來做好準備
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link
                                to="/practice"
                                className="group relative inline-flex items-center justify-center px-8 py-4 md:px-12 md:py-5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white font-bold text-base md:text-lg rounded-2xl overflow-hidden hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_20px_60px_-10px_rgba(59,130,246,0.7)]"
                            >
                                {/* Floating particles effect */}
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    <div className="absolute w-32 h-32 bg-white/10 rounded-full -top-16 -left-16 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="absolute w-24 h-24 bg-white/5 rounded-full -bottom-12 -right-12 group-hover:scale-125 transition-transform duration-500"></div>
                                    <div className="absolute w-16 h-16 bg-white/10 rounded-full top-1/2 left-1/4 group-hover:translate-x-4 group-hover:-translate-y-2 transition-transform duration-600"></div>
                                </div>

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                                {/* Content */}
                                <div className="relative z-10 flex items-center">
                                    <div className="mr-3 md:mr-4 p-2 md:p-3 bg-white/15 rounded-xl backdrop-blur-sm group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300">
                                        <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <span className="font-bold">開始練習</span>
                                    <div className="ml-3 md:ml-4 p-1.5 md:p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-all duration-300">
                                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>

                                {/* Border highlight */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
                            </Link>

                            <Link
                                to="/stats"
                                className="group relative inline-flex items-center justify-center px-8 py-4 md:px-12 md:py-5 bg-white/90 backdrop-blur-lg border-2 border-gray-200/80 text-slate-700 font-bold text-base md:text-lg rounded-2xl overflow-hidden hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_50px_-8px_rgba(0,0,0,0.18)]"
                            >
                                {/* Ripple effect */}
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    <div className="absolute w-0 h-0 bg-gradient-to-r from-slate-100 to-gray-100 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:w-96 group-hover:h-96 transition-all duration-500 opacity-50"></div>
                                </div>

                                {/* Subtle gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                                {/* Content */}
                                <div className="relative z-10 flex items-center">
                                    <div className="mr-3 md:mr-4 p-2 md:p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 group-hover:scale-110 transition-all duration-300">
                                        <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                                    </div>
                                    <span className="font-bold">查看統計</span>
                                    <div className="ml-3 md:ml-4 p-1.5 md:p-2 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-all duration-300">
                                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-slate-600 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>

                                {/* Border highlight */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-gray-200/80 group-hover:border-gray-300 transition-colors duration-300"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 快速統計 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">{stat.value}</p>
                                </div>
                                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform">
                                    <Icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </div>
                            {/* 裝飾性漸層邊框 */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        </div>
                    )
                })}
            </div>

            {/* 最近活動 */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            最近練習
                        </h3>
                    </div>
                    <div className="card-content">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : recentSessions.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">尚無練習記錄</p>
                                <Link to="/practice" className="text-primary hover:underline">
                                    開始第一次練習
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSessions.map((session) => {
                                    const timeAgo = new Date(session.completed_at).toLocaleDateString('zh-TW')
                                    return (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{session.category_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {session.total_questions} 題 · 正確率 {session.accuracy}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{timeAgo}</p>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    <span className="text-sm">{session.score}分</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <div className="mt-6">
                            <Link
                                to="/stats"
                                className="btn-outline w-full flex items-center justify-center"
                            >
                                查看完整記錄
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title flex items-center">
                            <Trophy className="h-5 w-5 mr-2" />
                            本週排行榜
                        </h3>
                    </div>
                    <div className="card-content">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : leaderboardPreview.length === 0 ? (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">暫無排行榜數據</p>
                                <Link to="/leaderboard" className="text-primary hover:underline">
                                    查看完整排行榜
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaderboardPreview.map((user, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`rank-badge mr-3 ${user.rank === 1 ? 'gold' :
                                                    user.rank === 2 ? 'silver' :
                                                        user.rank === 3 ? 'bronze' : 'default'
                                                }`}>
                                                {user.rank}
                                            </div>
                                            <div>
                                                <p className={`font-medium ${user.isCurrentUser ? 'text-primary' : ''}`}>
                                                    {user.name}
                                                    {user.isCurrentUser && ' (您)'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-semibold ${user.isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                                            {user.score}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            <Link
                                to="/leaderboard"
                                className="btn-outline w-full flex items-center justify-center"
                            >
                                查看完整排行榜
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 學習建議 */}
            <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    💡 今日學習建議
                </h3>
                <div className="space-y-3">
                    <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <p className="text-blue-800">建議複習「氣候變遷」相關題目，您的正確率還有提升空間</p>
                    </div>
                    <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <p className="text-blue-800">嘗試挑戰「企業治理」主題，擴展您的知識領域</p>
                    </div>
                    <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <p className="text-blue-800">每日練習 20 題，保持學習連續性</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 