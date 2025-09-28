import React, { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Clock,
  BookOpen,
  CheckCircle
} from 'lucide-react'

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month')

  // 模擬統計數據
  const overallStats = {
    totalQuestions: 342,
    correctAnswers: 278,
    accuracy: 81.2,
    studyTime: 24.5,
    streak: 7,
    avgSessionTime: 18,
    improvement: 12.5
  }

  const categoryStats = [
    {
      category: '環境永續',
      totalQuestions: 85,
      correctAnswers: 72,
      accuracy: 84.7,
      trend: '+5.2%',
      color: 'bg-green-500'
    },
    {
      category: '社會永續',
      totalQuestions: 72,
      correctAnswers: 58,
      accuracy: 80.6,
      trend: '+3.1%',
      color: 'bg-blue-500'
    },
    {
      category: '經濟永續',
      totalQuestions: 68,
      correctAnswers: 52,
      accuracy: 76.5,
      trend: '+8.3%',
      color: 'bg-yellow-500'
    },
    {
      category: '治理永續',
      totalQuestions: 79,
      correctAnswers: 65,
      accuracy: 82.3,
      trend: '+2.7%',
      color: 'bg-purple-500'
    },
    {
      category: 'ESG 整合',
      totalQuestions: 38,
      correctAnswers: 31,
      accuracy: 81.6,
      trend: '+15.4%',
      color: 'bg-indigo-500'
    }
  ]

  const weeklyProgress = [
    { day: '週一', questions: 12, correct: 10, accuracy: 83 },
    { day: '週二', questions: 15, correct: 13, accuracy: 87 },
    { day: '週三', questions: 8, correct: 6, accuracy: 75 },
    { day: '週四', questions: 18, correct: 15, accuracy: 83 },
    { day: '週五', questions: 22, correct: 19, accuracy: 86 },
    { day: '週六', questions: 25, correct: 21, accuracy: 84 },
    { day: '週日', questions: 20, correct: 17, accuracy: 85 }
  ]

  const achievements = [
    { title: '完美一週', description: '連續7天練習', date: '2024-01-20', type: 'streak' },
    { title: '環保達人', description: '環境永續達到85%', date: '2024-01-18', type: 'category' },
    { title: '進步神速', description: '本週提升15%', date: '2024-01-15', type: 'improvement' }
  ]

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">學習統計</h2>
        <p className="text-gray-600">追蹤您的學習進度和表現</p>
      </div>

      {/* 時間範圍選擇 */}
      <div className="flex gap-2">
        {['week', 'month', 'quarter', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {range === 'week' && '本週'}
            {range === 'month' && '本月'}
            {range === 'quarter' && '本季'}
            {range === 'year' && '本年'}
          </button>
        ))}
      </div>

      {/* 總體統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              +{overallStats.improvement}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {overallStats.totalQuestions}
          </h3>
          <p className="text-gray-600 text-sm">總答題數</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              +5.2%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {overallStats.accuracy}%
          </h3>
          <p className="text-gray-600 text-sm">整體正確率</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              +2.1h
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {overallStats.studyTime}h
          </h3>
          <p className="text-gray-600 text-sm">學習時間</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">
              持續中
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {overallStats.streak}
          </h3>
          <p className="text-gray-600 text-sm">連續學習天數</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 分類統計 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">分類表現</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-4">
            {categoryStats.map((stat, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <span className="font-medium text-gray-800">{stat.category}</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">題目數</p>
                    <p className="font-semibold text-gray-800">{stat.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">正確數</p>
                    <p className="font-semibold text-gray-800">{stat.correctAnswers}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">正確率</p>
                    <p className="font-semibold text-gray-800">{stat.accuracy}%</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stat.color}`}
                      style={{ width: `${stat.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 週學習進度 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">本週進度</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-3">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-600 font-medium">
                  {day.day}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">
                      {day.correct}/{day.questions} 題
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {day.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${day.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">本週平均正確率</span>
              <span className="font-bold text-primary">
                {Math.round(weeklyProgress.reduce((acc, day) => acc + day.accuracy, 0) / weeklyProgress.length)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近成就 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">最近成就</h3>
          <Award className="w-5 h-5 text-gray-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {achievement.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 學習建議 */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">學習建議</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• 您的環境永續表現優異，建議加強經濟永續相關知識</p>
              <p>• 保持每日練習習慣，目前連續 {overallStats.streak} 天表現很棒！</p>
              <p>• 建議增加ESG整合類題目練習，提升綜合應用能力</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics