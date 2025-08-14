import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
    Upload,
    FileText,
    Users,
    Settings,
    BarChart3,
    Plus,
    Edit,
    Trash2,
    Download,
    RefreshCw,
    Brain,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'

export default function AdminPage() {
    const { isAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState('upload')
    const [uploading, setUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    if (!isAdmin) {
        return (
            <div className="text-center py-12">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">無權限存取</h2>
                <p className="text-gray-600">您沒有管理員權限，無法存取此頁面</p>
            </div>
        )
    }

    const tabs = [
        { id: 'upload', name: 'PDF 上傳', icon: Upload },
        { id: 'questions', name: '題目管理', icon: FileText },
        { id: 'users', name: '用戶管理', icon: Users },
        { id: 'analytics', name: '數據分析', icon: BarChart3 },
        { id: 'settings', name: '系統設定', icon: Settings }
    ]

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setSelectedFiles(files)
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return

        setUploading(true)
        // 這裡會實作實際的上傳邏輯
        setTimeout(() => {
            setUploading(false)
            setSelectedFiles([])
        }, 3000)
    }

    const renderUploadTab = () => (
        <div className="space-y-6">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        上傳歷屆試題 PDF
                    </h3>
                </div>
                <div className="card-content">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            拖放 PDF 檔案或點擊選擇
                        </h4>
                        <p className="text-gray-600 mb-4">
                            支援多檔案上傳，檔案大小不超過 50MB
                        </p>
                        <input
                            type="file"
                            multiple
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label
                            htmlFor="pdf-upload"
                            className="btn-primary cursor-pointer"
                        >
                            選擇檔案
                        </label>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-medium text-gray-900 mb-4">已選擇的檔案：</h4>
                            <div className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 text-red-500 mr-3" />
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex items-center space-x-4">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="btn-primary flex items-center"
                                >
                                    {uploading ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            處理中...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            開始上傳
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedFiles([])}
                                    className="btn-outline"
                                >
                                    清空列表
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">處理流程說明：</h4>
                        <ol className="list-decimal list-inside text-blue-800 space-y-1">
                            <li>上傳 PDF 檔案到系統</li>
                            <li>自動進行 OCR 文字識別</li>
                            <li>AI 解析題目結構和答案</li>
                            <li>人工審核並修正解析結果</li>
                            <li>將題目加入題庫</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* 處理歷史 */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">最近處理記錄</h3>
                </div>
                <div className="card-content">
                    <div className="space-y-3">
                        {[
                            { name: '永續發展基礎能力測驗試題11303.pdf', status: 'completed', questions: 50, time: '2024-01-15 14:30' },
                            { name: '永續發展基礎能力測驗試題11302.pdf', status: 'processing', questions: 45, time: '2024-01-15 13:20' },
                            { name: '永續發展基礎能力測驗試題11301.pdf', status: 'failed', questions: 0, time: '2024-01-15 12:10' }
                        ].map((record, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-3 ${record.status === 'completed' ? 'bg-green-500' :
                                            record.status === 'processing' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                        }`} />
                                    <div>
                                        <p className="font-medium">{record.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {record.status === 'completed' ? `已完成，解析 ${record.questions} 題` :
                                                record.status === 'processing' ? '處理中...' :
                                                    '處理失敗'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">{record.time}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {record.status === 'completed' && (
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        )}
                                        {record.status === 'failed' && (
                                            <button className="text-green-600 hover:text-green-800">
                                                <RefreshCw className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button className="text-red-600 hover:text-red-800">
                                            <Trash2 className="h-4 w-4" />
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

    const renderQuestionsTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">題目管理</h3>
                <div className="flex items-center space-x-4">
                    <button className="btn-outline flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        批量生成 AI 解答
                    </button>
                    <button className="btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        新增題目
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-content">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">題目編號</th>
                                    <th className="text-left py-3 px-4">題目內容</th>
                                    <th className="text-center py-3 px-4">類別</th>
                                    <th className="text-center py-3 px-4">難度</th>
                                    <th className="text-center py-3 px-4">AI 解答</th>
                                    <th className="text-center py-3 px-4">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 'Q001', content: '下列何者是聯合國永續發展目標...', category: '綜合應用', difficulty: 2, hasAI: true, reviewed: true },
                                    { id: 'Q002', content: '循環經濟的三大原則不包括...', category: '經濟永續', difficulty: 3, hasAI: true, reviewed: false },
                                    { id: 'Q003', content: '氣候變遷的主要成因包括...', category: '環境永續', difficulty: 2, hasAI: false, reviewed: false }
                                ].map((question, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono">{question.id}</td>
                                        <td className="py-3 px-4">
                                            <p className="truncate max-w-xs">{question.content}</p>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                {question.category}
                                            </span>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <div className="flex justify-center">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full mx-0.5 ${i < question.difficulty ? 'bg-yellow-400' : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            {question.hasAI ? (
                                                <div className="flex items-center justify-center">
                                                    <CheckCircle className={`h-4 w-4 ${question.reviewed ? 'text-green-500' : 'text-yellow-500'
                                                        }`} />
                                                    <span className="ml-1 text-sm">
                                                        {question.reviewed ? '已審核' : '待審核'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                    生成解答
                                                </button>
                                            )}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderUsersTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">用戶管理</h3>
                <button className="btn-primary flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    新增管理員
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stats-card">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">1,234</p>
                        <p className="text-sm text-gray-600">總用戶數</p>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">856</p>
                        <p className="text-sm text-gray-600">活躍用戶</p>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">5</p>
                        <p className="text-sm text-gray-600">管理員</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-content">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">用戶</th>
                                    <th className="text-center py-3 px-4">角色</th>
                                    <th className="text-center py-3 px-4">註冊時間</th>
                                    <th className="text-center py-3 px-4">答題數</th>
                                    <th className="text-center py-3 px-4">正確率</th>
                                    <th className="text-center py-3 px-4">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: '學習達人', email: 'user1@example.com', role: 'user', joinDate: '2024-01-01', questions: 456, accuracy: 92 },
                                    { name: '永續專家', email: 'user2@example.com', role: 'admin', joinDate: '2024-01-02', questions: 234, accuracy: 88 },
                                    { name: '綠色先鋒', email: 'user3@example.com', role: 'user', joinDate: '2024-01-03', questions: 189, accuracy: 85 }
                                ].map((user, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-sm ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role === 'admin' ? '管理員' : '用戶'}
                                            </span>
                                        </td>
                                        <td className="text-center py-3 px-4">{user.joinDate}</td>
                                        <td className="text-center py-3 px-4">{user.questions}</td>
                                        <td className="text-center py-3 px-4">{user.accuracy}%</td>
                                        <td className="text-center py-3 px-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-800">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">管理員後台</h1>
                <p className="text-gray-600">管理題庫、用戶和系統設定</p>
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
            <div>
                {activeTab === 'upload' && renderUploadTab()}
                {activeTab === 'questions' && renderQuestionsTab()}
                {activeTab === 'users' && renderUsersTab()}
                {activeTab === 'analytics' && (
                    <div className="text-center py-12">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">數據分析功能開發中...</p>
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="text-center py-12">
                        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">系統設定功能開發中...</p>
                    </div>
                )}
            </div>
        </div>
    )
} 