import React, { useState } from 'react'
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react'

const QuestionBank: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // 模擬題目數據
  const categories = [
    { id: 'all', name: '全部分類', count: 1250 },
    { id: 'environment', name: '環境永續', count: 350 },
    { id: 'social', name: '社會永續', count: 280 },
    { id: 'economic', name: '經濟永續', count: 310 },
    { id: 'governance', name: '治理永續', count: 220 },
    { id: 'esg', name: 'ESG 整合', count: 90 }
  ]

  const questions = [
    {
      id: 1,
      question: '關於碳中和的敘述，下列何者正確？',
      category: '環境永續',
      difficulty: 2,
      type: 'multiple_choice',
      options: [
        '碳中和是指完全不產生任何碳排放',
        '透過碳抵消機制達到淨零碳排放',
        '只要使用再生能源就能達到碳中和',
        '碳中和等同於零碳排放'
      ],
      correct_answer: 1,
      tags: ['碳中和', '氣候變遷', '碳抵消'],
      created_at: '2024-01-15',
      attempts: 342,
      success_rate: 78
    },
    {
      id: 2,
      question: 'ESG 投資策略中，下列何者屬於社會面向 (S) 的考量？',
      category: '社會永續',
      difficulty: 1,
      type: 'multiple_choice',
      options: [
        '公司治理結構',
        '員工多元化政策',
        '溫室氣體排放',
        '財務透明度'
      ],
      correct_answer: 1,
      tags: ['ESG', '社會責任', '多元化'],
      created_at: '2024-01-14',
      attempts: 289,
      success_rate: 85
    },
    {
      id: 3,
      question: '循環經濟的核心原則不包括下列何者？',
      category: '經濟永續',
      difficulty: 3,
      type: 'multiple_choice',
      options: [
        '減少資源消耗',
        '重複使用材料',
        '線性生產模式',
        '回收再利用'
      ],
      correct_answer: 2,
      tags: ['循環經濟', '資源管理', '永續發展'],
      created_at: '2024-01-13',
      attempts: 195,
      success_rate: 65
    }
  ]

  const getDifficultyLabel = (level: number) => {
    const labels = ['', '基礎', '中等', '進階', '困難', '專家']
    return labels[level] || '未知'
  }

  const getDifficultyColor = (level: number) => {
    const colors = ['', 'text-green-600 bg-green-100', 'text-blue-600 bg-blue-100', 'text-orange-600 bg-orange-100', 'text-red-600 bg-red-100', 'text-purple-600 bg-purple-100']
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || question.category === categories.find(c => c.id === selectedCategory)?.name
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty.toString() === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  return (
    <div className="space-y-6">
      {/* 頂部操作區 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">題庫管理</h2>
          <p className="text-gray-600">瀏覽和管理永續發展基礎能力測驗題庫</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增題目
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">1,250</p>
              <p className="text-sm text-gray-600">總題目數</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">1,185</p>
              <p className="text-sm text-gray-600">已審核</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">65</p>
              <p className="text-sm text-gray-600">待審核</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">78%</p>
              <p className="text-sm text-gray-600">平均正確率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜尋題目內容或標籤..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          <select
            className="input"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="all">所有難度</option>
            <option value="1">基礎</option>
            <option value="2">中等</option>
            <option value="3">進階</option>
            <option value="4">困難</option>
            <option value="5">專家</option>
          </select>
        </div>
      </div>

      {/* 題目列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              題目列表 ({filteredQuestions.length} 題)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              已套用篩選條件
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {question.category}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {question.type === 'multiple_choice' ? '選擇題' : '其他'}
                    </span>
                  </div>

                  <h4 className="text-lg font-medium text-gray-800 mb-3">
                    {question.question}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border text-sm ${
                          index === question.correct_answer
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>{' '}
                        {option}
                        {index === question.correct_answer && (
                          <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {question.created_at}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {question.attempts} 次作答
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {question.success_rate}% 正確率
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="btn btn-outline btn-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    編輯
                  </button>
                  <button className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">找不到符合條件的題目</h3>
            <p className="text-gray-500">請調整搜尋條件或篩選設定</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionBank