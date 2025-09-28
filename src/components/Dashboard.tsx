import React from 'react'
import {
  PlayCircle,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
  Users,
  BarChart3
} from 'lucide-react'

const Dashboard: React.FC = () => {
  // 模擬數據
  const stats = {
    totalQuestions: 1250,
    completedSessions: 23,
    accuracyRate: 78,
    studyTime: 145,
    rank: 12,
    streak: 7
  }

  const categories = [
    {
      id: 'environmental',
      name: '環境永續',
      icon: '🌱',
      color: 'bg-green-100 text-green-800',
      progress: 75,
      questionCount: 320
    },
    {
      id: 'social',
      name: '社會永續',
      icon: '👥',
      color: 'bg-blue-100 text-blue-800',
      progress: 60,
      questionCount: 285
    },
    {
      id: 'economic',
      name: '經濟永續',
      icon: '💰',
      color: 'bg-yellow-100 text-yellow-800',
      progress: 85,
      questionCount: 410
    },
    {
      id: 'governance',
      name: '治理永續',
      icon: '🏛️',
      color: 'bg-purple-100 text-purple-800',
      progress: 70,
      questionCount: 235
    }
  ]

  const recentActivities = [
    { type: 'practice', category: '環境永續', score: 85, time: '2小時前' },
    { type: 'practice', category: '經濟永續', score: 92, time: '昨天' },
    { type: 'practice', category: '治理永續', score: 78, time: '2天前' }
  ]

  return (
    <div className="space-y-8">
      {/* 歡迎區域 */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">歡迎回到 GreenUP！</h2>
            <p className="text-green-100 text-lg">
              持續學習永續發展知識，為地球的未來貢獻一份力量
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn bg-white text-primary hover:bg-gray-50 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              開始練習
            </button>
            <button className="btn btn-outline border-white text-white hover:bg-white hover:text-primary flex items-center gap-2">
              <Target className="w-5 h-5" />
              設定目標
            </button>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">累計答題數</p>
              <p className="text-3xl font-bold text-primary">{stats.totalQuestions}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">正確率</p>
              <p className="text-3xl font-bold text-secondary">{stats.accuracyRate}%</p>
            </div>
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">學習時數</p>
              <p className="text-3xl font-bold text-primary">{stats.studyTime}h</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">排行榜</p>
              <p className="text-3xl font-bold text-primary">#{stats.rank}</p>
            </div>
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 學習進度 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">各類別學習進度</h3>
              <button className="text-primary hover:text-primary-dark transition-colors">
                查看詳細
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.questionCount} 題</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {category.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近活動 */}
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">最近練習記錄</h3>
              <button className="text-primary hover:text-primary-dark transition-colors">
                查看全部
              </button>
            </div>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{activity.category} 練習</p>
                      <p className="text-sm text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{activity.score}分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          {/* 學習目標 */}
          <div className="card bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-4">今日學習目標</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">答題數目標</span>
                  <span className="font-medium">45/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">學習時間</span>
                  <span className="font-medium">1.5/2.0h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 成就徽章 */}
          <div className="card bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-4">最新成就</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">七日連勝</p>
                  <p className="text-xs text-gray-600">連續7天完成練習</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">精準射手</p>
                  <p className="text-xs text-gray-600">正確率達90%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="card bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-4">快速開始</h3>
            <div className="space-y-3">
              <button className="w-full btn btn-primary flex items-center justify-center gap-2">
                <PlayCircle className="w-4 h-4" />
                隨機練習
              </button>
              <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                錯題複習
              </button>
              <button className="w-full btn btn-outline flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                查看統計
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard