import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Trophy, Medal, Award, Crown, Calendar, TrendingUp } from 'lucide-react'

// 模擬排行榜數據
const dailyLeaderboard = [
    { rank: 1, name: '學習達人', score: 145, accuracy: 98, questionsAnswered: 50, avatar: null },
    { rank: 2, name: '永續專家', score: 142, accuracy: 95, questionsAnswered: 48, avatar: null },
    { rank: 3, name: '綠色先鋒', score: 138, accuracy: 92, questionsAnswered: 45, avatar: null },
    { rank: 4, name: '環保戰士', score: 135, accuracy: 90, questionsAnswered: 43, avatar: null },
    { rank: 5, name: '可持續發展者', score: 132, accuracy: 88, questionsAnswered: 42, avatar: null },
    { rank: 6, name: '氣候行動家', score: 128, accuracy: 85, questionsAnswered: 40, avatar: null },
    { rank: 7, name: '生態守護者', score: 125, accuracy: 83, questionsAnswered: 38, avatar: null },
    { rank: 8, name: '您的暱稱', score: 122, accuracy: 81, questionsAnswered: 36, avatar: null, isCurrentUser: true }
]

const weeklyLeaderboard = [
    { rank: 1, name: '週冠軍', score: 985, accuracy: 96, questionsAnswered: 320, avatar: null },
    { rank: 2, name: '永續達人', score: 942, accuracy: 94, questionsAnswered: 305, avatar: null },
    { rank: 3, name: '學習之星', score: 898, accuracy: 92, questionsAnswered: 290, avatar: null },
    { rank: 4, name: '綠色學者', score: 876, accuracy: 89, questionsAnswered: 275, avatar: null },
    { rank: 5, name: '環境專家', score: 854, accuracy: 87, questionsAnswered: 260, avatar: null },
    { rank: 12, name: '您的暱稱', score: 756, accuracy: 78, questionsAnswered: 195, avatar: null, isCurrentUser: true }
]

export default function LeaderboardPage() {
    const { profile: _profile } = useAuth()
    const [activeTab, setActiveTab] = useState('daily')

    const tabs = [
        { id: 'daily', name: '每日排行', icon: Calendar },
        { id: 'weekly', name: '每週排行', icon: TrendingUp },
        { id: 'monthly', name: '每月排行', icon: Trophy }
    ]

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

    const currentData = activeTab === 'daily' ? dailyLeaderboard : weeklyLeaderboard

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">排行榜</h1>
                <p className="text-gray-600">與其他學習者競爭，激發學習動機</p>
            </div>

            {/* 標籤導航 */}
            <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2 rounded-md font-medium text-sm transition-colors flex items-center ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.name}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 頂部三名 */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                                            className="w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg"
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
            <div className="card max-w-4xl mx-auto">
                <div className="card-header">
                    <h3 className="card-title flex items-center">
                        <Trophy className="h-5 w-5 mr-2" />
                        完整排行榜
                    </h3>
                </div>
                <div className="card-content">
                    <div className="space-y-2">
                        {currentData.map((user, index) => (
                            <div
                                key={`${user.rank}-${index}`}
                                className={`leaderboard-item ${user.isCurrentUser ? 'bg-primary/5 border border-primary/20 rounded-lg' : ''
                                    }`}
                            >
                                <div className="flex items-center flex-1">
                                    {/* 排名 */}
                                    <div className={`rank-badge mr-4 ${getRankBadgeClass(user.rank)}`}>
                                        {user.rank}
                                    </div>

                                    {/* 頭像和姓名 */}
                                    <div className="flex items-center flex-1">
                                        {user.avatar ? (
                                            <img
                                                className="w-10 h-10 rounded-full mr-3"
                                                src={user.avatar}
                                                alt={user.name}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className={`font-medium ${user.isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                                                {user.name}
                                                {user.isCurrentUser && (
                                                    <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                                                        您
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {user.questionsAnswered} 題 · {user.accuracy}% 正確率
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 分數 */}
                                <div className="text-right">
                                    <p className={`text-xl font-bold ${user.isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                                        {user.score}
                                    </p>
                                    <p className="text-sm text-gray-600">分</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 激勵信息 */}
            <div className="bg-gradient-to-r from-primary/10 to-green-100 rounded-xl p-6 max-w-4xl mx-auto">
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