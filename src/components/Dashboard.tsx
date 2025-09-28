import React from 'react'
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  PlayCircle
} from 'lucide-react'

const Dashboard: React.FC = () => {
  // 模擬用戶數據
  const userStats = {
    totalQuestions: 1250,
    answeredQuestions: 342,
    correctAnswers: 278,
    averageScore: 81.2,
    studyTime: '24小時',
    streak: 7,
    rank: 15,
    totalUsers: 892
  }

  const recentProgress = [
    { category: '環境永續', progress: 85, questions: 45, correct: 38 },
    { category: '社會永續', progress: 72, questions: 38, correct: 27 },
    { category: '經濟永續', progress: 68, questions: 42, correct: 29 },
    { category: '治理永續', progress: 79, questions: 35, correct: 28 },
    { category: 'ESG 整合', progress: 63, questions: 28, correct: 18 }
  ]

  const achievements = [
    { title: '初學者', description: '完成第一次測驗', unlocked: true },
    { title: '持之以恆', description: '連續練習7天', unlocked: true },
    { title: '環保先鋒', description: '環境永續類別達到80%', unlocked: true },
    { title: '學霸', description: '單次測驗滿分', unlocked: false },
    { title: 'ESG專家', description: '所有類別達到90%', unlocked: false }
  ]

  return (
    <div className="space-y-8">
      {/* 歡迎區域 */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">歡迎回來！</h1>
            <p className="text-xl opacity-90">
              繼續您的永續發展學習之旅
            </p>
            <p className="text-sm opacity-75 mt-2">
              您已經連續學習 {userStats.streak} 天，保持這個節奏！
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn btn-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              開始練習
            </button>
            <button className="btn btn-outline-white">
              查看進度
            </button>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {userStats.answeredQuestions}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">已答題目</h3>
          <p className="text-xs text-gray-500 mt-1">
            共 {userStats.totalQuestions} 題
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {userStats.averageScore}%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">平均得分</h3>
          <p className="text-xs text-gray-500 mt-1">
            正確率 {Math.round((userStats.correctAnswers / userStats.answeredQuestions) * 100)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {userStats.studyTime}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">學習時間</h3>
          <p className="text-xs text-gray-500 mt-1">
            本週累計
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              #{userStats.rank}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">排名</h3>
          <p className="text-xs text-gray-500 mt-1">
            共 {userStats.totalUsers} 位學習者
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 學習進度 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">學習進度</h2>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-4">
            {recentProgress.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.correct}/{item.questions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {item.progress}% 完成
                  </span>
                  <span className="text-xs text-green-600">
                    +{Math.round((item.correct / item.questions) * 100)}% 正確率
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 成就系統 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">成就徽章</h2>
            <Award className="w-5 h-5 text-gray-500" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlocked
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked && (
                  <div className="text-yellow-500">
                    <Award className="w-5 h-5 fill-current" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">快速開始</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 text-left rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
            <div className="p-3 bg-green-100 rounded-lg">
              <PlayCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">隨機練習</h3>
              <p className="text-sm text-gray-600">混合各類別題目</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 text-left rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">弱項加強</h3>
              <p className="text-sm text-gray-600">針對薄弱環節</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 text-left rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">模擬考試</h3>
              <p className="text-sm text-gray-600">完整測驗體驗</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard