import React from 'react'
import { TrendingUp, Target, Clock, Award, BarChart3, Calendar } from 'lucide-react'

const Statistics: React.FC = () => {
  // 模擬數據
  const stats = {
    totalQuestions: 1250,
    correctAnswers: 975,
    accuracyRate: 78,
    studyTime: 145,
    practiceSession: 23,
    rank: 12,
    streak: 7
  }

  const categoryStats = [
    { name: '環境永續', total: 320, correct: 256, accuracy: 80, color: 'bg-green-500' },
    { name: '社會永續', total: 285, correct: 211, accuracy: 74, color: 'bg-blue-500' },
    { name: '經濟永續', total: 410, correct: 336, accuracy: 82, color: 'bg-yellow-500' },
    { name: '治理永續', total: 235, correct: 172, accuracy: 73, color: 'bg-purple-500' }
  ]

  const weeklyProgress = [
    { day: '週一', questions: 45, accuracy: 78 },
    { day: '週二', questions: 52, accuracy: 81 },
    { day: '週三', questions: 38, accuracy: 75 },
    { day: '週四', questions: 61, accuracy: 84 },
    { day: '週五', questions: 47, accuracy: 79 },
    { day: '週六', questions: 33, accuracy: 77 },
    { day: '週日', questions: 29, accuracy: 72 }
  ]

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">學習統計</h2>
        <p className="text-gray-600">詳細分析您的學習進度和表現</p>
      </div>

      {/* 主要統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{stats.totalQuestions}</p>
              <p className="text-sm text-gray-600">累計答題</p>
            </div>
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            比上週 +15%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{stats.accuracyRate}%</p>
              <p className="text-sm text-gray-600">平均正確率</p>
            </div>
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            比上週 +3%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{stats.studyTime}h</p>
              <p className="text-sm text-gray-600">學習時數</p>
            </div>
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            比上週 +8h
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">#{stats.rank}</p>
              <p className="text-sm text-gray-600">排行榜</p>
            </div>
          </div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            上升 3 名
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 分類統計 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">各分類表現分析</h3>

          <div className="space-y-6">
            {categoryStats.map((category, index) => (
              <div key={index} className="">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${category.color} rounded-full`} />
                    <span className="font-medium text-gray-800">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-800">{category.accuracy}%</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({category.correct}/{category.total})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${category.color}`}
                        style={{ width: `${category.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 min-w-0 w-20">
                    {category.total} 題
                  </div>
                </div>

                {/* 推薦改善 */}
                {category.accuracy < 80 && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      💡 建議加強此分類的練習，推薦每日練習 5-10 題
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 學習建議 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 個人化學習建議</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 社會永續分類需要加強，建議每日練習 8-10 題</li>
              <li>• 保持環境永續的優勢，繼續維持高正確率</li>
              <li>• 建議增加治理永續的練習時間</li>
            </ul>
          </div>
        </div>

        {/* 週進度和其他統計 */}
        <div className="space-y-6">
          {/* 本週學習進度 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">本週學習進度</h3>

            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{day.day}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800">{day.questions}題</span>
                      <span className="text-xs text-gray-500 ml-2">{day.accuracy}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(day.questions / 70) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                🔥 本週已連續學習 {stats.streak} 天！
              </p>
            </div>
          </div>

          {/* 學習目標 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">月度目標進度</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">答題目標</span>
                  <span className="font-medium">1,250/1,500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: '83%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">正確率目標</span>
                  <span className="font-medium">78%/80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-secondary h-3 rounded-full" style={{ width: '97%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">學習天數</span>
                  <span className="font-medium">22/25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-primary-light h-3 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 最近成就 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">最近成就</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Award className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-800">七日連勝</p>
                  <p className="text-sm text-gray-600">連續7天完成練習</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Target className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">精準射手</p>
                  <p className="text-sm text-gray-600">單次練習正確率90%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">學習達人</p>
                  <p className="text-sm text-gray-600">累計學習100小時</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics