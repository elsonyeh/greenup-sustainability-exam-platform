import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Trophy, Medal, Award, Crown, Calendar, TrendingUp, BookOpen, Target } from 'lucide-react'

interface LeaderboardUser {
    rank: number
    user_id: string
    name: string
    score: number
    accuracy: number
    questionsAnswered: number
    avatar: string | null
    isCurrentUser?: boolean
}

export default function LeaderboardPage() {
    const { profile, user } = useAuth()
    const [activeTab, setActiveTab] = useState('daily')
    const [loading, setLoading] = useState(true)
    const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardUser[]>([])
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardUser[]>([])
    const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardUser[]>([])

    const tabs = [
        { id: 'daily', name: '每日排行', icon: Calendar },
        { id: 'weekly', name: '每週排行', icon: TrendingUp },
        { id: 'monthly', name: '每月排行', icon: Trophy }
    ]

    // 獲取每日排行榜
    const fetchDailyLeaderboard = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]

            const { data: rankings, error } = await supabase
                .from('daily_rankings')
                .select(`
                    user_id,
                    questions_answered,
                    correct_answers,
                    accuracy_rate,
                    score,
                    profiles!inner(full_name, avatar_url)
                `)
                .eq('date', today)
                .order('score', { ascending: false })
                .limit(50)

            if (error) throw error

            const leaderboard: LeaderboardUser[] = rankings?.map((ranking, index) => {
                // 如果 accuracy_rate 小於 1，表示是小數格式（0.75），需要乘以 100
                // 如果大於等於 1，表示已經是百分比格式（75），不需要再乘以 100
                const accuracyValue = ranking.accuracy_rate < 1
                    ? Math.round(ranking.accuracy_rate * 100)
                    : Math.round(ranking.accuracy_rate)

                return {
                    rank: index + 1,
                    user_id: ranking.user_id,
                    name: (ranking.profiles as any).full_name || '匿名用戶',
                    score: ranking.score,
                    accuracy: accuracyValue,
                    questionsAnswered: ranking.questions_answered,
                    avatar: (ranking.profiles as any).avatar_url,
                    isCurrentUser: ranking.user_id === user?.id
                }
            }) || []

            setDailyLeaderboard(leaderboard)
        } catch (error) {
            console.error('Error fetching daily leaderboard:', error)
            setDailyLeaderboard([])
        }
    }

    // 獲取週排行榜
    const fetchWeeklyLeaderboard = async () => {
        try {
            const today = new Date()
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
            const startDate = startOfWeek.toISOString().split('T')[0]

            const { data: rankings, error } = await supabase
                .from('daily_rankings')
                .select(`
                    user_id,
                    questions_answered,
                    correct_answers,
                    score,
                    profiles!inner(full_name, avatar_url)
                `)
                .gte('date', startDate)
                .order('user_id')

            if (error) throw error

            // 按用戶聚合週數據
            const userWeeklyStats = new Map()
            rankings?.forEach(ranking => {
                if (!userWeeklyStats.has(ranking.user_id)) {
                    userWeeklyStats.set(ranking.user_id, {
                        user_id: ranking.user_id,
                        name: (ranking.profiles as any).full_name || '匿名用戶',
                        avatar: (ranking.profiles as any).avatar_url,
                        totalQuestions: 0,
                        totalCorrect: 0,
                        totalScore: 0
                    })
                }
                const stats = userWeeklyStats.get(ranking.user_id)
                stats.totalQuestions += ranking.questions_answered
                stats.totalCorrect += ranking.correct_answers
                stats.totalScore += ranking.score
            })

            const leaderboard: LeaderboardUser[] = Array.from(userWeeklyStats.values())
                .map(stats => ({
                    user_id: stats.user_id,
                    name: stats.name,
                    score: stats.totalScore,
                    accuracy: stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0,
                    questionsAnswered: stats.totalQuestions,
                    avatar: stats.avatar,
                    isCurrentUser: stats.user_id === user?.id,
                    rank: 0
                }))
                .sort((a, b) => b.score - a.score)
                .map((user, index) => ({ ...user, rank: index + 1 }))
                .slice(0, 50)

            setWeeklyLeaderboard(leaderboard)
        } catch (error) {
            console.error('Error fetching weekly leaderboard:', error)
            setWeeklyLeaderboard([])
        }
    }

    // 獲取月排行榜
    const fetchMonthlyLeaderboard = async () => {
        try {
            const { data: rankings, error } = await supabase
                .from('overall_rankings')
                .select(`
                    user_id,
                    total_questions_answered,
                    total_correct_answers,
                    overall_accuracy_rate,
                    total_score,
                    ranking_position,
                    profiles!inner(full_name, avatar_url)
                `)
                .order('total_score', { ascending: false })
                .limit(50)

            if (error) throw error

            const leaderboard: LeaderboardUser[] = rankings?.map((ranking, index) => {
                // 如果 overall_accuracy_rate 小於 1，表示是小數格式（0.75），需要乘以 100
                // 如果大於等於 1，表示已經是百分比格式（75），不需要再乘以 100
                const accuracyValue = ranking.overall_accuracy_rate < 1
                    ? Math.round(ranking.overall_accuracy_rate * 100)
                    : Math.round(ranking.overall_accuracy_rate)

                return {
                    rank: index + 1,
                    user_id: ranking.user_id,
                    name: (ranking.profiles as any).full_name || '匿名用戶',
                    score: ranking.total_score,
                    accuracy: accuracyValue,
                    questionsAnswered: ranking.total_questions_answered,
                    avatar: (ranking.profiles as any).avatar_url,
                    isCurrentUser: ranking.user_id === user?.id
                }
            }) || []

            setMonthlyLeaderboard(leaderboard)
        } catch (error) {
            console.error('Error fetching monthly leaderboard:', error)
            setMonthlyLeaderboard([])
        }
    }

    // 獲取所有排行榜數據
    const fetchLeaderboards = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchDailyLeaderboard(),
                fetchWeeklyLeaderboard(),
                fetchMonthlyLeaderboard()
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaderboards()
    }, [user?.id])

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
        if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />
        return null
    }

    const getRankBadgeClass = (rank: number) => {
        if (rank === 1) return 'gold'
        if (rank === 2) return 'silver'
        if (rank === 3) return 'bronze'
        return 'default'
    }

    const getCurrentData = () => {
        switch (activeTab) {
            case 'daily':
                return dailyLeaderboard
            case 'weekly':
                return weeklyLeaderboard
            case 'monthly':
                return monthlyLeaderboard
            default:
                return dailyLeaderboard
        }
    }

    const currentData = getCurrentData()

    return (
        <div className="space-y-6">
            {/* 頁面標題和日期尺度選擇 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">排行榜</h1>
                    <p className="text-gray-600">與其他學習者競爭，激發學習動機</p>
                </div>

                {/* 日期尺度選擇移至右上角 */}
                <div className="flex justify-center sm:justify-end">
                    <div className="bg-gray-50 border border-gray-200 p-1 rounded-lg inline-flex shadow-sm">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-white text-primary shadow-md border border-primary/20 transform scale-[0.98]'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 mr-1 sm:mr-1.5" />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                    <span className="sm:hidden text-xs font-semibold">
                                        {tab.id === 'daily' ? '日' : tab.id === 'weekly' ? '週' : '月'}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 頂部三名 */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : currentData.length === 0 ? (
                <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暫無排行榜數據</h3>
                    <p className="text-gray-600">開始練習，成為第一名！</p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-3 gap-6">
                        {currentData.slice(0, 3).map((user, index) => {
                    const actualRank = user.rank
                    return (
                        <div
                            key={user.rank}
                            className={`card text-center relative ${actualRank === 1 ? 'border-yellow-200 bg-gradient-to-b from-yellow-50 to-white' :
                                    actualRank === 2 ? 'border-gray-200 bg-gradient-to-b from-gray-50 to-white' :
                                        'border-orange-200 bg-gradient-to-b from-orange-50 to-white'
                                } ${index === 1 ? 'md:-mt-4' : ''}`}
                        >
                            <div className="card-content">
                                {/* 排名圖標 */}
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    {getRankIcon(actualRank)}
                                </div>

                                {/* 頭像 */}
                                <div className="mt-4 mb-4">
                                    {user.avatar ? (
                                        <img
                                            className="w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                    ) : (
                                        <div className={`w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-xl ${actualRank === 1 ? 'bg-yellow-500' :
                                                actualRank === 2 ? 'bg-gray-400' :
                                                    'bg-orange-600'
                                            }`}>
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* 用戶信息 */}
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{user.name}</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-3xl font-bold text-primary">{user.score}</p>
                                        <p className="text-sm text-gray-600">總分</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-semibold text-green-600">{user.accuracy}%</p>
                                            <p className="text-gray-600">正確率</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-600">{user.questionsAnswered}</p>
                                            <p className="text-gray-600">題數</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                </div>

                {/* 完整排行榜 */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
                    {/* 排行榜標題 */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-5">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <Trophy className="h-6 w-6 mr-3" />
                            完整排行榜
                            <span className="ml-auto text-sm font-normal opacity-90">
                                共 {currentData.length} 位學習者
                            </span>
                        </h3>
                    </div>

                    {/* 排行榜列表 */}
                    <div className="divide-y divide-gray-100">
                        {currentData.map((user, index) => (
                            <div
                                key={`${user.rank}-${index}`}
                                className={`px-6 py-4 transition-all duration-200 hover:bg-gray-50 ${
                                    user.isCurrentUser
                                        ? 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-l-4 border-blue-500'
                                        : user.rank <= 3
                                            ? 'bg-gradient-to-r from-gray-50/50 to-white'
                                            : ''
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* 排名徽章 */}
                                    <div className="flex-shrink-0">
                                        {user.rank <= 3 ? (
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                                user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                                user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                'bg-gradient-to-br from-orange-400 to-orange-600'
                                            }`}>
                                                <span className="text-white font-bold text-lg">
                                                    {user.rank}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                                user.isCurrentUser
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                    : 'bg-gray-100 border-gray-300 text-gray-700'
                                            }`}>
                                                <span className="font-bold text-lg">
                                                    {user.rank}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 用戶資訊 */}
                                    <div className="flex items-center flex-1 min-w-0 gap-3">
                                        {/* 頭像 */}
                                        {user.avatar ? (
                                            <img
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                                src={user.avatar}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        {/* 姓名和統計 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`font-bold text-base truncate ${
                                                    user.isCurrentUser ? 'text-blue-700' : 'text-gray-900'
                                                }`}>
                                                    {user.name}
                                                </p>
                                                {user.isCurrentUser && (
                                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                                                        你
                                                    </span>
                                                )}
                                                {user.rank === 1 && !user.isCurrentUser && (
                                                    <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {user.questionsAnswered} 題
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Target className="w-3.5 h-3.5" />
                                                    {user.accuracy}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 分數 */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className={`text-2xl font-black ${
                                            user.isCurrentUser ? 'text-blue-600' :
                                            user.rank <= 3 ? 'text-gray-900' :
                                            'text-gray-700'
                                        }`}>
                                            {user.score}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium">分數</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                </>
            )}

            {/* 激勵信息 */}
            <div className="bg-gradient-to-r from-primary/10 to-green-100 rounded-xl p-6">
                <div className="text-center">
                    <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        繼續努力，提升排名！
                    </h3>
                    <p className="text-gray-600 mb-4">
                        每日堅持練習，提高答題正確率，就能在排行榜上獲得更好的名次
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="bg-white rounded-lg p-4">
                            <Medal className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-900">多做練習</p>
                            <p className="text-sm text-gray-600">增加答題數量</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-900">提高正確率</p>
                            <p className="text-sm text-gray-600">仔細思考每道題</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-900">持續學習</p>
                            <p className="text-sm text-gray-600">保持學習連續性</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 