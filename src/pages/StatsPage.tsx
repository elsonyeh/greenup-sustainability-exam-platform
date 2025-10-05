import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts'
import {
    BarChart3,
    TrendingUp,
    BookOpen,
    CheckCircle,
    Clock,
    Activity,
    Target,
    Award
} from 'lucide-react'

interface UserStats {
    totalQuestions: number
    accuracy: number
    totalMinutes: number
    streak: number
    ranking: number
}

interface PracticeHistoryItem {
    date: string
    questions: number
    correct: number
    accuracy: number
}

interface PracticeSession {
    id: string
    started_at: string
    completed_at: string | null
    total_questions: number
    correct_answers: number
    duration_seconds: number | null
    session_type: string
}

// 動畫數字計數器組件
function AnimatedCounter({
    end,
    duration = 2000,
    suffix = '',
    delay = 0
}: {
    end: number
    duration?: number
    suffix?: string
    delay?: number
}) {
    const [count, setCount] = useState(0)
    const countRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const startTime = Date.now() + delay
        const endTime = startTime + duration

        const updateCount = () => {
            const now = Date.now()
            if (now < startTime) {
                requestAnimationFrame(updateCount)
                return
            }

            if (now >= endTime) {
                setCount(end)
                return
            }

            const progress = (now - startTime) / duration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(end * easeOutQuart))
            requestAnimationFrame(updateCount)
        }

        updateCount()
    }, [end, duration, delay])

    return <span ref={countRef}>{count}{suffix}</span>
}

// 統計卡片組件
function StatCard({
    title,
    value,
    suffix = '',
    icon: Icon,
    colorClass,
    delay = 0,
    trend
}: {
    title: string
    value: number
    suffix?: string
    icon: any
    colorClass: string
    delay?: number
    trend?: { value: number; isPositive: boolean }
}) {
    return (
        <div className={`group relative overflow-hidden rounded-xl border-0 bg-gradient-to-br shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${colorClass}`}>
            {/* 背景裝飾 */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <Icon className="w-full h-full" />
            </div>

            {/* 主要內容 */}
            <div className="relative p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-3xl font-bold text-gray-900">
                                <AnimatedCounter end={value} suffix={suffix} delay={delay} />
                            </p>
                            {trend && (
                                <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                                    trend.isPositive
                                        ? 'text-green-700 bg-green-100'
                                        : 'text-red-700 bg-red-100'
                                }`}>
                                    <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                                    {Math.abs(trend.value)}%
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm`}>
                        <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                </div>
            </div>

            {/* 底部裝飾線 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
        </div>
    )
}

export default function StatsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [userStats, setUserStats] = useState<UserStats>({
        totalQuestions: 0,
        accuracy: 0,
        totalMinutes: 0,
        streak: 0,
        ranking: 0
    })
    const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([])
    const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([])
    const [showAllSessions, setShowAllSessions] = useState(false)

    const fetchUserStats = async () => {
        if (!user?.id) return

        try {
            setLoading(true)

            // 獲取整體統計
            const { data: overallRankingData } = await supabase
                .from('overall_rankings')
                .select('*')
                .eq('user_id', user.id)
                .limit(1)

            const overallRanking = overallRankingData?.[0] || null

            // 獲取練習記錄
            const { data: sessions } = await supabase
                .from('practice_sessions')
                .select('id, started_at, completed_at, total_questions, correct_answers, duration_seconds, session_type')
                .eq('user_id', user.id)
                .eq('completed', true)
                .order('started_at', { ascending: false })
                .limit(50)

            // 保存最近練習會話
            setRecentSessions(sessions || [])

            // 處理練習歷史 (最近7天)
            const last7Days = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]

                const dayData = sessions?.filter(session =>
                    session.started_at.split('T')[0] === dateStr
                ) || []

                const totalQuestions = dayData.reduce((sum, session) => sum + session.total_questions, 0)
                const totalCorrect = dayData.reduce((sum, session) => sum + session.correct_answers, 0)

                last7Days.push({
                    date: `${date.getMonth() + 1}/${date.getDate()}`,
                    questions: totalQuestions,
                    correct: totalCorrect,
                    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
                })
            }

            // 計算連續天數
            let consecutiveDays = 0
            if (sessions && sessions.length > 0) {
                const today = new Date()
                const dates = sessions.map(session => {
                    const date = new Date(session.started_at)
                    return date.toDateString()
                })
                const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

                for (let i = 0; i < uniqueDates.length; i++) {
                    const checkDate = new Date(today)
                    checkDate.setDate(today.getDate() - i)
                    if (uniqueDates[i] === checkDate.toDateString()) {
                        consecutiveDays++
                    } else {
                        break
                    }
                }
            }

            setPracticeHistory(last7Days)
            setUserStats({
                totalQuestions: overallRanking?.total_questions_answered || 0,
                accuracy: Math.round((overallRanking?.overall_accuracy_rate || 0) * 100),
                totalMinutes: Math.round((overallRanking?.total_practice_time_seconds || 0) / 60),
                streak: consecutiveDays,
                ranking: overallRanking?.ranking_position || 0
            })

        } catch (error) {
            console.error('Error fetching user stats:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserStats()
    }, [user?.id])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">學習統計</h1>
                <p className="text-gray-600">追蹤您的學習進度和表現</p>
            </div>

            {/* 優化後的統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="總答題數"
                    value={userStats.totalQuestions}
                    icon={BookOpen}
                    colorClass="from-blue-50 to-blue-100 border border-blue-200"
                    delay={0}
                />

                <StatCard
                    title="正確率"
                    value={userStats.accuracy}
                    suffix="%"
                    icon={Target}
                    colorClass="from-green-50 to-green-100 border border-green-200"
                    delay={200}
                    trend={userStats.accuracy >= 80 ? { value: 5, isPositive: true } : undefined}
                />

                <StatCard
                    title="學習時間"
                    value={Math.floor(userStats.totalMinutes / 60)}
                    suffix="小時"
                    icon={Clock}
                    colorClass="from-purple-50 to-purple-100 border border-purple-200"
                    delay={400}
                />

                <StatCard
                    title="連續天數"
                    value={userStats.streak}
                    suffix="天"
                    icon={Award}
                    colorClass="from-orange-50 to-orange-100 border border-orange-200"
                    delay={600}
                    trend={userStats.streak > 0 ? { value: userStats.streak * 2, isPositive: true } : undefined}
                />
            </div>

            {/* 學習趨勢圖表區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最近一週練習趨勢 */}
                <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">最近一週練習趨勢</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">追蹤您的正確率變化</p>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={practiceHistory}>
                                    <defs>
                                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        fill="#6b7280"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        fill="#6b7280"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="accuracy"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        fill="url(#accuracyGradient)"
                                        name="正確率(%)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 每日答題數量 */}
                <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                        <div className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">每日答題數量</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">查看您的學習活躍度</p>
                    </div>
                    <div className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={practiceHistory}>
                                    <defs>
                                        <linearGradient id="questionsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        fill="#6b7280"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        fill="#6b7280"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="questions"
                                        fill="url(#questionsGradient)"
                                        name="答題數"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* 學習建議與激勵 */}
            {userStats.totalQuestions === 0 ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 overflow-hidden">
                    <div className="text-center py-16 px-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full"></div>
                            </div>
                            <BarChart3 className="relative h-16 w-16 text-indigo-600 mx-auto mb-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">開始您的學習之旅</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            目前還沒有練習記錄，開始第一次練習來追蹤您的學習進度！
                        </p>
                        <a href="/practice" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                            <BookOpen className="w-5 h-5 mr-2" />
                            開始練習
                        </a>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">個人化學習建議</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">根據您的學習表現提供專屬建議</p>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-4">
                            {userStats.accuracy < 70 && (
                                <div className="group p-5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Target className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-orange-900 mb-2">提高正確率</h4>
                                            <p className="text-orange-800 text-sm leading-relaxed">
                                                建議複習錯題，加強基礎知識理解。建立錯題本，定期回顧。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {userStats.streak === 0 && (
                                <div className="group p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Activity className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900 mb-2">建立學習習慣</h4>
                                            <p className="text-blue-800 text-sm leading-relaxed">
                                                每日堅持練習，即使只是10分鐘也能培養良好的學習習慣。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {userStats.accuracy >= 85 && (
                                <div className="group p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Award className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-900 mb-2">表現優秀！</h4>
                                            <p className="text-green-800 text-sm leading-relaxed">
                                                您的正確率很高，建議挑戰更難的題目以持續進步。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {userStats.streak >= 7 && (
                                <div className="group p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Award className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-purple-900 mb-2">連續學習達人！</h4>
                                            <p className="text-purple-800 text-sm leading-relaxed">
                                                恭喜您已連續學習{userStats.streak}天，堅持就是勝利！
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 最近練習記錄 */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mt-6">
                        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                最近練習記錄
                                <span className="ml-auto text-sm font-normal opacity-90">
                                    共 {recentSessions.length} 次練習
                                </span>
                            </h3>
                        </div>

                        <div className="p-6">
                            {recentSessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">還沒有練習記錄，開始第一次練習吧！</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentSessions.slice(0, showAllSessions ? recentSessions.length : 10).map((session, index) => {
                                        const accuracy = session.total_questions > 0
                                            ? Math.round((session.correct_answers / session.total_questions) * 100)
                                            : 0
                                        const duration = session.duration_seconds
                                            ? Math.floor(session.duration_seconds / 60)
                                            : 0
                                        const sessionTypeLabel =
                                            session.session_type === 'wrong_questions' ? '錯題練習' :
                                            session.session_type === 'favorites' ? '收藏練習' :
                                            session.session_type === 'category' ? '分類練習' :
                                            '隨機練習'

                                        return (
                                            <div
                                                key={session.id}
                                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                                            >
                                                {/* 序號 */}
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                                                    <span className="text-white font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                </div>

                                                {/* 練習資訊 */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold text-gray-900">
                                                            {new Date(session.started_at).toLocaleDateString('zh-TW', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                            {sessionTypeLabel}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Target className="w-3.5 h-3.5" />
                                                            {session.correct_answers}/{session.total_questions} 題
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            {accuracy}%
                                                        </span>
                                                        {duration > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {duration} 分鐘
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 正確率徽章 */}
                                                <div className="flex-shrink-0">
                                                    <div className={`px-3 py-1.5 rounded-lg ${
                                                        accuracy >= 80 ? 'bg-green-100 text-green-700' :
                                                        accuracy >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        <p className="text-lg font-bold">{accuracy}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* 顯示更多按鈕 */}
                            {recentSessions.length > 10 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setShowAllSessions(!showAllSessions)}
                                        className="btn-outline flex items-center gap-2 mx-auto"
                                    >
                                        {showAllSessions ? (
                                            <>
                                                <TrendingUp className="w-4 h-4 rotate-180" />
                                                顯示較少
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="w-4 h-4" />
                                                顯示全部 ({recentSessions.length} 筆)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}