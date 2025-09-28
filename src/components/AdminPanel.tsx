import React, { useState } from 'react'
import {
  Users,
  BookOpen,
  Upload,
  Download,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Zap
} from 'lucide-react'
import AIFileComparison from './AIFileComparison'

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  // 模擬數據
  const stats = {
    totalUsers: 1523,
    activeUsers: 892,
    totalQuestions: 1250,
    pendingReview: 12,
    systemHealth: 98
  }

  const tabs = [
    { id: 'dashboard', label: '總覽', icon: BarChart3 },
    { id: 'users', label: '用戶管理', icon: Users },
    { id: 'questions', label: '題庫管理', icon: BookOpen },
    { id: 'import', label: 'AI 匯入工具', icon: Upload },
    { id: 'system', label: '系統設定', icon: Settings }
  ]

  const recentActivities = [
    { type: 'user_register', message: '新用戶註冊：user@example.com', time: '5分鐘前' },
    { type: 'question_added', message: '新增題目：環境永續分類', time: '15分鐘前' },
    { type: 'system_update', message: '系統自動備份完成', time: '1小時前' }
  ]

  const pendingQuestions = [
    {
      id: 1,
      question_text: '關於碳中和的敘述，下列何者正確？',
      category: '環境永續',
      submittedBy: 'AI Import',
      confidence: 95
    },
    {
      id: 2,
      question_text: 'ESG投資策略中，下列何者屬於社會面向？',
      category: '社會永續',
      submittedBy: 'AI Import',
      confidence: 88
    }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 系統統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總用戶數</p>
              <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">活躍用戶</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">題庫數量</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待審核</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingReview}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">系統健康度</p>
              <p className="text-2xl font-bold text-green-600">{stats.systemHealth}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近活動 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">最近活動</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'user_register' && <Users className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'question_added' && <BookOpen className="w-4 h-4 text-green-600" />}
                  {activity.type === 'system_update' && <Settings className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 待審核題目 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">待審核題目</h3>
          <div className="space-y-4">
            {pendingQuestions.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800 flex-1">
                    {question.question_text}
                  </p>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full ml-2">
                    {question.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    來源：{question.submittedBy} | 信心度：{question.confidence}%
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAIImportTool = () => (
    <AIFileComparison />
  )

  const renderAIImportToolOld = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">AI 智能題庫匯入工具</h3>
        <p className="text-gray-600 mb-6">
          使用 Google Gemini AI 智能解析 PDF 文件，自動提取和分類永續發展測驗題目
        </p>

        {/* 上傳區域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">上傳 PDF 文件</h4>
          <p className="text-gray-600 mb-4">
            支援永續發展基礎能力測驗的 PDF 格式文件
          </p>
          <button className="btn btn-primary">
            選擇文件
          </button>
        </div>

        {/* AI 處理選項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h4 className="font-medium text-gray-800">AI 自動分類</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              自動識別題目所屬的永續發展分類（環境、社會、經濟、治理）
            </p>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">啟用自動分類</span>
            </label>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h4 className="font-medium text-gray-800">AI 生成解析</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              為每個題目自動生成詳細的解析說明和學習重點
            </p>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">啟用解析生成</span>
            </label>
          </div>
        </div>

        {/* 匯入歷史 */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">最近匯入記錄</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">11303年度測驗題目.pdf</p>
                <p className="text-sm text-gray-600">匯入了 80 題，成功率 95%</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  已完成
                </span>
                <p className="text-xs text-gray-500 mt-1">2小時前</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">11302年度測驗題目.pdf</p>
                <p className="text-sm text-gray-600">匯入了 80 題，成功率 92%</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  已完成
                </span>
                <p className="text-xs text-gray-500 mt-1">昨天</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      case 'import':
        return renderAIImportTool()
      case 'users':
        return <div className="bg-white rounded-lg shadow-md p-6">用戶管理功能開發中...</div>
      case 'questions':
        return <div className="bg-white rounded-lg shadow-md p-6">題庫管理功能開發中...</div>
      case 'system':
        return <div className="bg-white rounded-lg shadow-md p-6">系統設定功能開發中...</div>
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">管理後台</h2>
        <p className="text-gray-600">GreenUP 平台管理與監控中心</p>
      </div>

      {/* 警告消息 */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <p className="text-orange-700 font-medium">
            注意：管理員權限功能，請謹慎操作
          </p>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel