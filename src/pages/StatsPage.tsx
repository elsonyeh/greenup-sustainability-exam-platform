import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts'
import {
    BarChart3,
    TrendingUp,
    Target,
    Calendar,
    BookOpen,
    CheckCircle,
    Clock,
    Trophy,
    Activity
} from 'lucide-react'

// 模擬統計數據
const practiceHistory = [
    { date: '12/01', questions: 15, correct: 12, accuracy: 80 },
    { date: '12/02', questions: 20, correct: 16, accuracy: 80 },
    { date: '12/03', questions: 25, correct: 22, accuracy: 88 },
    { date: '12/04', questions: 18, correct: 15, accuracy: 83 },
    { date: '12/05', questions: 30, correct: 27, accuracy: 90 },
    { date: '12/06', questions: 22, correct: 19, accuracy: 86 },
    { date: '12/07', questions: 28, correct: 25, accuracy: 89 }
]

const categoryStats = [
    { name: '環境永續', total: 45, correct: 38, accuracy: 84 },
    { name: '社會永續', total: 32, correct: 29, accuracy: 91 },
    { name: '經濟永續', total: 28, correct: 22, accuracy: 79 },
    { name: '治理永續', total: 35, correct: 31, accuracy: 89 },
    { name: '綜合應用', total: 20, correct: 16, accuracy: 80 }
]

const difficultyStats = [
    { name: '簡單', value: 45, color: '#22c55e' },
    { name: '中等', value: 35, color: '#f59e0b' },
    { name: '困難', value: 20, color: '#ef4444' }
]

const weeklyProgress = [
    { week: '第1週', totalTime: 120, questionsAnswered: 85, accuracy: 78 },
    { week: '第2週', totalTime: 150, questionsAnswered: 102, accuracy: 82 },
    { week: '第3週', totalTime: 180, questionsAnswered: 128, accuracy: 85 },
    { week: '第4週', totalTime: 200, questionsAnswered: 145, accuracy: 87 }
]

export default function StatsPage() {
    const { profile } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')

    const overallStats = {
        totalQuestions: 160,
        correctAnswers: 136,
        accuracy: 85,
        totalTime: 650, // 分鐘
        streak: 7, // 連續天數
        rank: 24
    }

    const tabs = [
        { id: 'overview', name: '總覽', icon: BarChart3 },
        { id: 'progress', name: '學習進度', icon: TrendingUp },
        { id: 'categories', name: '主題分析', icon: Target },
        { id: 'history', name: '練習歷史', icon: Calendar }
    ]

    const renderOverview = () => (
        <div className="space-y-6">
            {/* 總體統計卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stats-card primary">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">總答題數</p>
                            <p className="text-3xl font-bold text-primary">{overallStats.totalQuestions}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                </div>

                <div className="stats-card success">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">正確率</p>
                            <p className="text-3xl font-bold text-green-600">{overallStats.accuracy}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="stats-card secondary">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">學習時間</p>
                            <p className="text-3xl font-bold text-blue-600">{Math.floor(overallStats.totalTime / 60)}小時</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="stats-card warning">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">連續天數</p>
                            <p className="text-3xl font-bold text-orange-600">{overallStats.streak}天</p>
                        </div>
                        <Activity className="h-8 w-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* 最近一週練習趨勢 */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">最近一週練習趨勢</h3>
                </div>
                <div className="card-content">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={practiceHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#22c55e"
                                    fill="#22c55e"
                                    fillOpacity={0.3}
                                    name="正確率 (%)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 主題分佈 */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">主題正確率</h3>
                    </div>
                    <div className="card-content">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="accuracy" fill="#22c55e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">難度分佈</h3>
                    </div>
                    <div className="card-content">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={difficultyStats}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`}
                                    >
                                        {difficultyStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderProgress = () => (
        <div className="space-y-6">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">每週學習進度</h3>
                </div>
                <div className="card-content">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyProgress}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="questionsAnswered" fill="#3b82f6" name="答題數" />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    name="正確率 (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">學習目標達成情況</h3>
                    </div>
                    <div className="card-content">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">每日練習目標 (20題)</span>
                                    <span className="text-sm text-primary">18/20 完成</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-primary h-3 rounded-full" style={{ width: '90%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">週練習目標 (140題)</span>
                                    <span className="text-sm text-green-600">145/140 完成</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">正確率目標 (85%)</span>
                                    <span className="text-sm text-green-600">85% 達成</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">成就徽章</h3>
                    </div>
                    <div className="card-content">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Trophy className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-xs text-gray-600">連續練習</p>
                                <p className="text-xs font-semibold">7天</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-xs text-gray-600">精準答題</p>
                                <p className="text-xs font-semibold">85%+</p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-xs text-gray-600">學習達人</p>
                                <p className="text-xs font-semibold">160題</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderCategories = () => (
        <div className="space-y-6">
            <div className="grid gap-6">
                {categoryStats.map((category, index) => (
                    <div key={index} className="card">
                        <div className="card-content">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{category.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${category.accuracy >= 90 ? 'bg-green-100 text-green-800' :
                                        category.accuracy >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {category.accuracy}% 正確率
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{category.total}</p>
                                    <p className="text-sm text-gray-600">總題數</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{category.correct}</p>
                                    <p className="text-sm text-gray-600">答對數</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{category.total - category.correct}</p>
                                    <p className="text-sm text-gray-600">答錯數</p>
                                </div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${category.accuracy}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderHistory = () => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">練習歷史記錄</h3>
            </div>
            <div className="card-content">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4">日期</th>
                                <th className="text-center py-3 px-4">題數</th>
                                <th className="text-center py-3 px-4">答對</th>
                                <th className="text-center py-3 px-4">正確率</th>
                                <th className="text-center py-3 px-4">用時</th>
                            </tr>
                        </thead>
                        <tbody>
                            {practiceHistory.reverse().map((record, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">{record.date}</td>
                                    <td className="text-center py-3 px-4">{record.questions}</td>
                                    <td className="text-center py-3 px-4">{record.correct}</td>
                                    <td className="text-center py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-sm ${record.accuracy >= 90 ? 'bg-green-100 text-green-800' :
                                                record.accuracy >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {record.accuracy}%
                                        </span>
                                    </td>
                                    <td className="text-center py-3 px-4">25分鐘</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">學習統計</h1>
                <p className="text-gray-600">追蹤您的學習進度，分析強弱項目</p>
            </div>

            {/* 標籤導航 */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.name}
                                </div>
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* 標籤內容 */}
            <div className="min-h-screen">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'progress' && renderProgress()}
                {activeTab === 'categories' && renderCategories()}
                {activeTab === 'history' && renderHistory()}
            </div>
        </div>
    )
} 