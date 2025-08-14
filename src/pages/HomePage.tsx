import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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

export default function HomePage() {
    const { profile } = useAuth()

    const features = [
        {
            icon: BookOpen,
            title: '智慧練習',
            description: '根據您的學習進度推薦合適的題目，提升學習效率',
            color: 'bg-blue-500'
        },
        {
            icon: BarChart3,
            title: '詳細統計',
            description: '追蹤您的學習進度，分析強弱項目',
            color: 'bg-green-500'
        },
        {
            icon: Trophy,
            title: '排行榜',
            description: '與其他學習者競爭，激發學習動機',
            color: 'bg-yellow-500'
        },
        {
            icon: Target,
            title: '錯題複習',
            description: '針對性複習錯題，確實掌握知識要點',
            color: 'bg-red-500'
        }
    ]

    const quickStats = [
        {
            label: '總題數',
            value: '1,200+',
            icon: BookOpen,
            color: 'text-blue-600'
        },
        {
            label: '活躍用戶',
            value: '500+',
            icon: Users,
            color: 'text-green-600'
        },
        {
            label: '完成率',
            value: '85%',
            icon: CheckCircle,
            color: 'text-purple-600'
        },
        {
            label: '平均分數',
            value: '78分',
            icon: TrendingUp,
            color: 'text-orange-600'
        }
    ]

    return (
        <div className="space-y-8">
            {/* 歡迎區塊 */}
            <div className="bg-gradient-to-r from-primary to-green-600 rounded-xl p-8 text-white">
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        歡迎回來，{profile?.full_name || '學習者'}！
                    </h1>
                    <p className="text-lg md:text-xl text-green-100 mb-6">
                        繼續您的永續發展學習之旅，掌握環境、社會和經濟永續的核心知識
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/practice"
                            className="btn bg-white text-primary hover:bg-gray-100 transition-colors inline-flex items-center"
                        >
                            開始練習
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            to="/stats"
                            className="btn border border-white text-white hover:bg-white hover:text-primary transition-colors"
                        >
                            查看統計
                        </Link>
                    </div>
                </div>
            </div>

            {/* 快速統計 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="stats-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <Icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 功能特色 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">平台特色</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div key={index} className="card hover:shadow-lg transition-shadow">
                                <div className="card-content">
                                    <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
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
                        <div className="space-y-4">
                            {/* 這裡將來會顯示實際的練習記錄 */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">環境永續主題</p>
                                    <p className="text-sm text-gray-600">15 題 · 正確率 85%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">2 小時前</p>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span className="text-sm">85分</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">社會永續主題</p>
                                    <p className="text-sm text-gray-600">20 題 · 正確率 92%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">昨天</p>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span className="text-sm">92分</span>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                        <div className="space-y-4">
                            {/* 這裡將來會顯示實際的排行榜數據 */}
                            {[
                                { name: '學習達人', score: '985分', rank: 1 },
                                { name: '永續專家', score: '942分', rank: 2 },
                                { name: '綠色先鋒', score: '898分', rank: 3 },
                                { name: profile?.full_name || '您', score: '756分', rank: 8, isCurrentUser: true }
                            ].map((user, index) => (
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