import React, { useState } from 'react'
import { Search, Filter, Plus, Edit, Trash2, BookOpen, Download, Upload } from 'lucide-react'

const QuestionBank: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 模擬題目資料
  const questions = [
    {
      id: 1,
      question_text: "若投資決策對於永續造成「主要不利衝擊」(PAIs)須加以揭露；這是屬於下列哪方面的資訊揭露？",
      category: "經濟永續",
      difficulty: 3,
      year: 2023,
      correct_answer: 2,
      options: ["永續性風險政策", "產品的獲利性揭露", "不利的永續性影響", "產品級別揭露"]
    },
    {
      id: 2,
      question_text: "我國推動上市櫃公司永續發展行動方案，擴大永續資訊揭露範圍，將自哪一年推動20億元以下的上市櫃公司編製永續報告書？",
      category: "治理永續",
      difficulty: 2,
      year: 2023,
      correct_answer: 3,
      options: ["2023年", "2024年", "2025年", "2026年"]
    }
  ]

  const categories = [
    { id: 'all', name: '全部分類', count: 1250 },
    { id: 'environmental', name: '環境永續', count: 320 },
    { id: 'social', name: '社會永續', count: 285 },
    { id: 'economic', name: '經濟永續', count: 410 },
    { id: 'governance', name: '治理永續', count: 235 }
  ]

  return (
    <div className="space-y-6">
      {/* 頂部操作區 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">題庫管理</h2>
          <p className="text-gray-600 mt-1">管理永續發展基礎能力測驗題庫</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn btn-outline flex items-center gap-2">
            <Download className="w-5 h-5" />
            匯出題庫
          </button>
          <button className="btn btn-outline flex items-center gap-2">
            <Upload className="w-5 h-5" />
            匯入題庫
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新增題目
          </button>
        </div>
      </div>

      {/* 搜索和篩選 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索題目內容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            <button className="btn btn-outline flex items-center gap-2">
              <Filter className="w-5 h-5" />
              進階篩選
            </button>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總題目數</p>
              <p className="text-2xl font-bold text-primary">1,250</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本月新增</p>
              <p className="text-2xl font-bold text-green-600">45</p>
            </div>
            <Plus className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待審核</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
            <Edit className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均難度</p>
              <p className="text-2xl font-bold text-blue-600">3.2</p>
            </div>
            <Filter className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* 題目列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">題目</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">分類</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">難度</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">年度</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-gray-800 font-medium line-clamp-2">
                        {question.question_text}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: {question.id}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {question.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < question.difficulty ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {question.year}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分頁 */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              顯示 1-10 筆，共 1,250 筆結果
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                上一頁
              </button>
              <button className="px-3 py-2 bg-primary text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                2
              </button>
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                3
              </button>
              <span className="px-3 py-2 text-gray-600">...</span>
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                125
              </button>
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                下一頁
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBank