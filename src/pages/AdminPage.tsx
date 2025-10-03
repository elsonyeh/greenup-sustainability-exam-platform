import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../lib/supabase'
import { getSystemStatus, getSystemMetrics, getStorageMetrics, SystemStatus, SystemMetrics } from '../lib/systemMonitor'
import { checkEmailConfiguration, testEmailService, getEmailStats, sendAdminAlert } from '../lib/emailService'
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
    TrendingUp,
    TrendingDown,
    Activity,
    Calendar,
    Database,
    Clock,
    Target,
    AlertTriangle,
    Shield,
    Bell,
    Globe,
    Key,
    Save
    // AlertCircle
} from 'lucide-react'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from 'recharts'

// 介面定義
interface ExamDocument {
    id: string
    title: string
    year: number
    session: number
    file_url: string
    processing_status: 'pending' | 'processing' | 'completed' | 'failed'
    created_at: string
    updated_at: string
}

interface Question {
    id: string
    exam_document_id: string | null
    question_number: number
    question_text: string
    option_a: string | null
    option_b: string | null
    option_c: string | null
    option_d: string | null
    correct_answer: 'A' | 'B' | 'C' | 'D'
    explanation: string | null
    ai_generated_explanation: string | null
    ai_explanation_reviewed: boolean
    difficulty_level: number
    categories: { name: string } | null
}

interface UserProfile {
    id: string
    email: string
    full_name: string | null
    role: 'admin' | 'user'
    created_at: string
}

interface UserStats {
    totalUsers: number
    activeUsers: number
    adminUsers: number
}

interface PlatformStats {
    totalQuestions: number
    totalSessions: number
    avgAccuracy: number
    totalPracticeHours: number
    questionsAnsweredToday: number
    activeUsersToday: number
}

interface CategoryStats {
    id: string
    name: string
    questionCount: number
    totalAnswered: number
    averageAccuracy: number
}

interface DailyActivity {
    date: string
    newUsers: number
    totalSessions: number
    questionsAnswered: number
    avgAccuracy: number
}

interface AIError {
    id: string
    question_id: string | null
    error_type: string
    error_message: string
    error_details: any
    resolved: boolean
    created_at: string
    questions?: {
        question_text: string
        question_number: number
    }
}

export default function AdminPage() {
    const { isAdmin } = useAuth()
    const [activeTab, setActiveTab] = useState('upload')
    const [uploading, setUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    // 資料狀態
    const [loading, setLoading] = useState(false)
    const [examDocuments, setExamDocuments] = useState<ExamDocument[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [users, setUsers] = useState<UserProfile[]>([])
    const [userStats, setUserStats] = useState<UserStats>({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0
    })
    const [platformStats, setPlatformStats] = useState<PlatformStats>({
        totalQuestions: 0,
        totalSessions: 0,
        avgAccuracy: 0,
        totalPracticeHours: 0,
        questionsAnsweredToday: 0,
        activeUsersToday: 0
    })
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
    const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [aiErrors, setAiErrors] = useState<AIError[]>([])
    const [aiErrorStats, setAiErrorStats] = useState({
        total: 0,
        unresolved: 0,
        byType: {} as Record<string, number>
    })

    // 系統設定狀態
    const [systemSettings, setSystemSettings] = useState({
        platformName: '永續發展基礎能力測驗平台',
        allowRegistration: true,
        maxQuestionsPerSession: 50,
        sessionTimeLimit: 60, // 分鐘
        enableEmailNotifications: true,
        maintenanceMode: false,
        aiExplanationEnabled: true,
        autoBackupEnabled: true,
        backupFrequency: 'daily', // 'daily', 'weekly', 'monthly'
        dataRetentionDays: 365
    })
    const [saving, setSaving] = useState(false)
    const [settingsChanged, setSettingsChanged] = useState(false)

    // 系統監控狀態
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        database: 'healthy',
        aiService: 'healthy',
        storage: 'healthy',
        emailService: 'warning'
    })
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
        cpuUsage: 0,
        memoryUsage: 0,
        storageUsage: 0,
        dbConnections: 0,
        responseTime: 0
    })
    const [emailStats, setEmailStats] = useState({
        total: 0,
        todayTotal: 0,
        pending: 0,
        sent: 0,
        failed: 0
    })
    const [loadingStatus, setLoadingStatus] = useState(false)

    // 資料庫連接函數
    const fetchExamDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('exam_documents')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            setExamDocuments(data || [])
        } catch (error) {
            console.error('Error fetching exam documents:', error)
        }
    }

    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select(`
                    *,
                    categories:question_categories(name)
                `)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            setQuestions(data || [])
        } catch (error) {
            console.error('Error fetching questions:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, role, created_at')
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const fetchUserStats = async () => {
        try {
            const { data: allUsers, error: usersError } = await supabase
                .from('profiles')
                .select('role, created_at')

            if (usersError) throw usersError

            const totalUsers = allUsers?.length || 0
            const adminUsers = allUsers?.filter(user => user.role === 'admin').length || 0

            // 計算活躍用戶（最近30天有練習記錄的用戶）
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: activeSessions, error: sessionsError } = await supabase
                .from('practice_sessions')
                .select('user_id')
                .gte('started_at', thirtyDaysAgo.toISOString())

            if (sessionsError) throw sessionsError

            const activeUserIds = new Set(activeSessions?.map(session => session.user_id) || [])
            const activeUsers = activeUserIds.size

            setUserStats({ totalUsers, activeUsers, adminUsers })
        } catch (error) {
            console.error('Error fetching user stats:', error)
        }
    }

    const fetchPlatformStats = async () => {
        try {
            // 獲取總題目數
            const { count: totalQuestions } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })

            // 獲取總練習會話數
            const { count: totalSessions } = await supabase
                .from('practice_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('completed', true)

            // 獲取總練習時間和平均正確率
            const { data: sessionStats } = await supabase
                .from('practice_sessions')
                .select('duration_seconds, correct_answers, total_questions')
                .eq('completed', true)

            const totalSeconds = sessionStats?.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) || 0
            const totalPracticeHours = Math.round(totalSeconds / 3600)

            const totalAnswered = sessionStats?.reduce((sum, session) => sum + session.total_questions, 0) || 0
            const totalCorrect = sessionStats?.reduce((sum, session) => sum + session.correct_answers, 0) || 0
            const avgAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

            // 獲取今日數據
            const today = new Date().toISOString().split('T')[0]

            const { data: todaySessions } = await supabase
                .from('practice_sessions')
                .select('user_id, total_questions')
                .gte('started_at', today + 'T00:00:00')
                .lt('started_at', today + 'T23:59:59')

            const questionsAnsweredToday = todaySessions?.reduce((sum, session) => sum + session.total_questions, 0) || 0
            const activeUsersToday = new Set(todaySessions?.map(session => session.user_id) || []).size

            setPlatformStats({
                totalQuestions: totalQuestions || 0,
                totalSessions: totalSessions || 0,
                avgAccuracy,
                totalPracticeHours,
                questionsAnsweredToday,
                activeUsersToday
            })
        } catch (error) {
            console.error('Error fetching platform stats:', error)
        }
    }

    const fetchCategoryStats = async () => {
        try {
            const { data: categories } = await supabase
                .from('question_categories')
                .select(`
                    id,
                    name,
                    questions:questions(count)
                `)

            const categoryStatsData: CategoryStats[] = []

            for (const category of categories || []) {
                // 獲取該類別的總答題數和正確率
                const { data: answers } = await supabase
                    .from('practice_answers')
                    .select('is_correct')
                    .in('question_id', await supabase
                        .from('questions')
                        .select('id')
                        .eq('category_id', category.id)
                        .then(result => result.data?.map(q => q.id) || [])
                    )

                const totalAnswered = answers?.length || 0
                const correctAnswers = answers?.filter(answer => answer.is_correct).length || 0
                const averageAccuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

                categoryStatsData.push({
                    id: category.id,
                    name: category.name,
                    questionCount: category.questions?.length || 0,
                    totalAnswered,
                    averageAccuracy
                })
            }

            setCategoryStats(categoryStatsData)
        } catch (error) {
            console.error('Error fetching category stats:', error)
        }
    }

    const fetchDailyActivity = async () => {
        try {
            const last7Days = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]

                // 獲取當日新用戶
                const { count: newUsers } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', dateStr + 'T00:00:00')
                    .lt('created_at', dateStr + 'T23:59:59')

                // 獲取當日練習會話
                const { data: sessions } = await supabase
                    .from('practice_sessions')
                    .select('total_questions, correct_answers')
                    .gte('started_at', dateStr + 'T00:00:00')
                    .lt('started_at', dateStr + 'T23:59:59')
                    .eq('completed', true)

                const totalSessions = sessions?.length || 0
                const questionsAnswered = sessions?.reduce((sum, session) => sum + session.total_questions, 0) || 0
                const correctAnswers = sessions?.reduce((sum, session) => sum + session.correct_answers, 0) || 0
                const avgAccuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0

                last7Days.push({
                    date: `${date.getMonth() + 1}/${date.getDate()}`,
                    newUsers: newUsers || 0,
                    totalSessions,
                    questionsAnswered,
                    avgAccuracy
                })
            }

            setDailyActivity(last7Days)
        } catch (error) {
            console.error('Error fetching daily activity:', error)
        }
    }

    const fetchAIErrors = async () => {
        try {
            const { data: errors, error } = await supabase
                .from('ai_generation_errors')
                .select(`
                    *,
                    questions:question_id (
                        question_text,
                        question_number
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(50)

            // 如果表格不存在 (PGRST205)，靜默處理
            if (error) {
                if (error.code === 'PGRST205') {
                    console.info('ai_generation_errors table not found - skipping')
                    setAiErrors([])
                    setAiErrorStats({ total: 0, unresolved: 0, byType: {} })
                    return
                }
                throw error
            }

            setAiErrors(errors || [])

            // 計算統計資訊
            const total = errors?.length || 0
            const unresolved = errors?.filter(e => !e.resolved).length || 0
            const byType = errors?.reduce((acc, err) => {
                acc[err.error_type] = (acc[err.error_type] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            setAiErrorStats({ total, unresolved, byType })
        } catch (error) {
            console.error('Error fetching AI errors:', error)
        }
    }

    const markErrorAsResolved = async (errorId: string) => {
        try {
            const { error } = await supabase
                .from('ai_generation_errors')
                .update({
                    resolved: true,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', errorId)

            if (error) throw error

            // 重新載入錯誤列表
            await fetchAIErrors()
        } catch (error) {
            console.error('Error marking error as resolved:', error)
            alert('標記為已解決失敗')
        }
    }

    // 獲取系統狀態和指標
    const fetchSystemStatus = async () => {
        try {
            const [status, metrics, emailStats] = await Promise.all([
                getSystemStatus(),
                getSystemMetrics(),
                getEmailStats()
            ])

            setSystemStatus(status)
            setSystemMetrics(metrics)
            setEmailStats(emailStats)
        } catch (error) {
            console.error('Error fetching system status:', error)
        }
    }

    // 測試郵件服務
    const handleTestEmail = async () => {
        setLoadingStatus(true)
        try {
            const result = await testEmailService()
            alert(result.message)

            // 刷新系統狀態
            await fetchSystemStatus()
        } catch (error) {
            alert('郵件測試失敗')
        } finally {
            setLoadingStatus(false)
        }
    }

    // 發送測試警報
    const handleSendTestAlert = async () => {
        setLoadingStatus(true)
        try {
            const success = await sendAdminAlert(
                '系統測試',
                'info',
                '這是一個測試警報，用於驗證郵件通知系統是否正常工作。',
                '無需採取任何行動，這只是一個測試。'
            )

            if (success) {
                alert('警報郵件已發送')
                await fetchSystemStatus()
            } else {
                alert('警報發送失敗')
            }
        } catch (error) {
            alert('警報發送失敗')
        } finally {
            setLoadingStatus(false)
        }
    }

    const loadData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchExamDocuments(),
                fetchQuestions(),
                fetchUsers(),
                fetchUserStats(),
                fetchPlatformStats(),
                fetchCategoryStats(),
                fetchDailyActivity(),
                fetchSystemStatus(),
                fetchAIErrors()
            ])
        } finally {
            setLoading(false)
        }
    }

    const refreshAnalytics = async () => {
        setRefreshing(true)
        try {
            await Promise.all([
                fetchUserStats(),
                fetchPlatformStats(),
                fetchCategoryStats(),
                fetchDailyActivity()
            ])
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            loadData()
        }
    }, [isAdmin])

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
        { id: 'ai-errors', name: 'AI 錯誤記錄', icon: AlertTriangle, badge: aiErrorStats.unresolved },
        { id: 'settings', name: '系統設定', icon: Settings }
    ]

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setSelectedFiles(files)
    }

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return

        setUploading(true)
        try {
            for (const file of selectedFiles) {
                // 上傳檔案到 Supabase Storage
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `exam-documents/${fileName}`

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, file)

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    continue
                }

                // 創建資料庫記錄
                const { error: dbError } = await supabase
                    .from('exam_documents')
                    .insert({
                        title: file.name,
                        year: new Date().getFullYear(),
                        session: 1,
                        file_url: uploadData.path,
                        file_size: file.size,
                        processing_status: 'pending'
                    })

                if (dbError) {
                    console.error('Database error:', dbError)
                }
            }

            // 重新載入資料
            await fetchExamDocuments()
            setSelectedFiles([])
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
        }
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
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : examDocuments.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">尚無處理記錄</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {examDocuments.map((record) => {
                                const questionCount = questions.filter(q => q.exam_document_id === record.id).length
                                return (
                                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${record.processing_status === 'completed' ? 'bg-green-500' :
                                                    record.processing_status === 'processing' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                }`} />
                                            <div>
                                                <p className="font-medium">{record.title}</p>
                                                <p className="text-sm text-gray-600">
                                                    {record.processing_status === 'completed' ? `已完成，解析 ${questionCount} 題` :
                                                        record.processing_status === 'processing' ? '處理中...' :
                                                            record.processing_status === 'pending' ? '待處理' :
                                                            '處理失敗'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                {new Date(record.created_at).toLocaleString('zh-TW')}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {record.processing_status === 'completed' && (
                                                    <button className="text-blue-600 hover:text-blue-800">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {record.processing_status === 'failed' && (
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
                                )
                            })}
                        </div>
                    )}
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <LoadingSpinner size="md" />
                                        </td>
                                    </tr>
                                ) : questions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600">尚無題目資料</p>
                                        </td>
                                    </tr>
                                ) : (
                                    questions.map((question, index) => (
                                        <tr key={question.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono">Q{String(question.question_number).padStart(3, '0')}</td>
                                            <td className="py-3 px-4">
                                                <p className="truncate max-w-xs">{question.question_text}</p>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                    {question.categories?.name || '未分類'}
                                                </span>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex justify-center">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-2 h-2 rounded-full mx-0.5 ${i < question.difficulty_level ? 'bg-yellow-400' : 'bg-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                {question.ai_generated_explanation ? (
                                                    <div className="flex items-center justify-center">
                                                        <CheckCircle className={`h-4 w-4 ${question.ai_explanation_reviewed ? 'text-green-500' : 'text-yellow-500'
                                                            }`} />
                                                        <span className="ml-1 text-sm">
                                                            {question.ai_explanation_reviewed ? '已審核' : '待審核'}
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
                                    ))
                                )}
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
                        {loading ? (
                            <LoadingSpinner size="sm" className="mx-auto" />
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-blue-600">{userStats.totalUsers}</p>
                                <p className="text-sm text-gray-600">總用戶數</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="stats-card">
                    <div className="text-center">
                        {loading ? (
                            <LoadingSpinner size="sm" className="mx-auto" />
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-green-600">{userStats.activeUsers}</p>
                                <p className="text-sm text-gray-600">活躍用戶</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="stats-card">
                    <div className="text-center">
                        {loading ? (
                            <LoadingSpinner size="sm" className="mx-auto" />
                        ) : (
                            <>
                                <p className="text-3xl font-bold text-purple-600">{userStats.adminUsers}</p>
                                <p className="text-sm text-gray-600">管理員</p>
                            </>
                        )}
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <LoadingSpinner size="md" />
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600">尚無用戶資料</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium">{user.full_name || '未設置姓名'}</p>
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
                                            <td className="text-center py-3 px-4">
                                                {new Date(user.created_at).toLocaleDateString('zh-TW')}
                                            </td>
                                            <td className="text-center py-3 px-4">-</td>
                                            <td className="text-center py-3 px-4">-</td>
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderAnalyticsTab = () => {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">數據分析</h3>
                    <button
                        onClick={refreshAnalytics}
                        disabled={refreshing}
                        className="btn-outline flex items-center"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        刷新數據
                    </button>
                </div>

                {/* 平台總覽統計 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">總題目數</p>
                                <p className="text-2xl font-bold">{platformStats.totalQuestions}</p>
                            </div>
                            <Database className="h-8 w-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">總練習次數</p>
                                <p className="text-2xl font-bold">{platformStats.totalSessions}</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">平均正確率</p>
                                <p className="text-2xl font-bold">{platformStats.avgAccuracy}%</p>
                            </div>
                            <Target className="h-8 w-8 text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">總學習時間</p>
                                <p className="text-2xl font-bold">{platformStats.totalPracticeHours}</p>
                                <p className="text-orange-100 text-xs">小時</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-100 text-sm">今日答題</p>
                                <p className="text-2xl font-bold">{platformStats.questionsAnsweredToday}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-cyan-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-pink-100 text-sm">今日活躍用戶</p>
                                <p className="text-2xl font-bold">{platformStats.activeUsersToday}</p>
                            </div>
                            <Users className="h-8 w-8 text-pink-200" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 每日活動趋勢 */}
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title flex items-center">
                                <TrendingUp className="h-5 w-5 mr-2" />
                                最近7天活動趋勢
                            </h4>
                        </div>
                        <div className="card-content">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyActivity}>
                                        <defs>
                                            <linearGradient id="questionsGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="questionsAnswered"
                                            stroke="#3b82f6"
                                            fill="url(#questionsGradient)"
                                            name="答題數"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 類別表現分析 */}
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2" />
                                類別表現分析
                            </h4>
                        </div>
                        <div className="card-content">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="averageAccuracy" fill="#10b981" name="平均正確率(%)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 用戶成長趋勢 */}
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                用戶成長趋勢
                            </h4>
                        </div>
                        <div className="card-content">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyActivity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="newUsers"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            name="新用戶數"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 正確率變化 */}
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title flex items-center">
                                <Target className="h-5 w-5 mr-2" />
                                正確率變化
                            </h4>
                        </div>
                        <div className="card-content">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyActivity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="avgAccuracy"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="平均正確率(%)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 詳細統計表 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">類別詳細統計</h4>
                    </div>
                    <div className="card-content">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">類別名稱</th>
                                        <th className="text-center py-3 px-4">題目數量</th>
                                        <th className="text-center py-3 px-4">總答題次數</th>
                                        <th className="text-center py-3 px-4">平均正確率</th>
                                        <th className="text-center py-3 px-4">狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryStats.map((category, index) => (
                                        <tr key={category.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{category.name}</td>
                                            <td className="text-center py-3 px-4">{category.questionCount}</td>
                                            <td className="text-center py-3 px-4">{category.totalAnswered}</td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span className={`font-medium ${
                                                        category.averageAccuracy >= 80 ? 'text-green-600' :
                                                        category.averageAccuracy >= 60 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {category.averageAccuracy}%
                                                    </span>
                                                    {category.averageAccuracy >= 80 ? (
                                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                                    ) : category.averageAccuracy < 60 ? (
                                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    category.averageAccuracy >= 80 ? 'bg-green-100 text-green-800' :
                                                    category.averageAccuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {category.averageAccuracy >= 80 ? '優秀' :
                                                     category.averageAccuracy >= 60 ? '良好' : '需改進'}
                                                </span>
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
    }

    const handleSettingChange = (key: string, value: any) => {
        setSystemSettings(prev => ({
            ...prev,
            [key]: value
        }))
        setSettingsChanged(true)
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            // 這裡應該調用 API 保存設定到數據庫
            // 暫時模擬保存
            await new Promise(resolve => setTimeout(resolve, 1000))

            setSettingsChanged(false)
            // 顯示成功訊息
        } catch (error) {
            console.error('Error saving settings:', error)
            // 顯示錯誤訊息
        } finally {
            setSaving(false)
        }
    }

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">系統設定</h3>
                <button
                    onClick={saveSettings}
                    disabled={!settingsChanged || saving}
                    className={`btn-primary flex items-center ${
                        !settingsChanged ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {saving ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            保存中...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            保存設定
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 基本設定 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            基本設定
                        </h4>
                    </div>
                    <div className="card-content space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                平台名稱
                            </label>
                            <input
                                type="text"
                                value={systemSettings.platformName}
                                onChange={(e) => handleSettingChange('platformName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                每次練習最大題目數
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="100"
                                value={systemSettings.maxQuestionsPerSession}
                                onChange={(e) => handleSettingChange('maxQuestionsPerSession', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                練習時間限制（分鐘）
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="180"
                                value={systemSettings.sessionTimeLimit}
                                onChange={(e) => handleSettingChange('sessionTimeLimit', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                數據保留天數
                            </label>
                            <select
                                value={systemSettings.dataRetentionDays}
                                onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value={90}>90 天</option>
                                <option value={180}>180 天</option>
                                <option value={365}>1 年</option>
                                <option value={730}>2 年</option>
                                <option value={-1}>永久保留</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 功能控制 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            功能控制
                        </h4>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    允許用戶註冊
                                </label>
                                <p className="text-sm text-gray-500">控制新用戶是否可以註冊</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('allowRegistration', !systemSettings.allowRegistration)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    systemSettings.allowRegistration ? 'bg-primary' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        systemSettings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    AI 解答功能
                                </label>
                                <p className="text-sm text-gray-500">啟用 AI 自動生成解答</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('aiExplanationEnabled', !systemSettings.aiExplanationEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    systemSettings.aiExplanationEnabled ? 'bg-primary' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        systemSettings.aiExplanationEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    郵件通知
                                </label>
                                <p className="text-sm text-gray-500">發送系統通知和提醒郵件</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('enableEmailNotifications', !systemSettings.enableEmailNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    systemSettings.enableEmailNotifications ? 'bg-primary' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        systemSettings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    自動備份
                                </label>
                                <p className="text-sm text-gray-500">定期自動備份數據</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('autoBackupEnabled', !systemSettings.autoBackupEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    systemSettings.autoBackupEnabled ? 'bg-primary' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        systemSettings.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {systemSettings.autoBackupEnabled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    備份頻率
                                </label>
                                <select
                                    value={systemSettings.backupFrequency}
                                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="daily">每日</option>
                                    <option value="weekly">每週</option>
                                    <option value="monthly">每月</option>
                                </select>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t pt-4">
                            <div>
                                <label className="text-sm font-medium text-red-700">
                                    維護模式
                                </label>
                                <p className="text-sm text-red-500">暫停平台服務進行維護</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('maintenanceMode', !systemSettings.maintenanceMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 系統狀態 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            系統狀態
                        </h4>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* 數據庫狀態 */}
                            <div className={`p-4 rounded-lg ${
                                systemStatus.database === 'healthy' ? 'bg-green-50' :
                                systemStatus.database === 'warning' ? 'bg-yellow-50' :
                                'bg-red-50'
                            }`}>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        systemStatus.database === 'healthy' ? 'bg-green-500' :
                                        systemStatus.database === 'warning' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}></div>
                                    <span className={`text-sm font-medium ${
                                        systemStatus.database === 'healthy' ? 'text-green-700' :
                                        systemStatus.database === 'warning' ? 'text-yellow-700' :
                                        'text-red-700'
                                    }`}>數據庫</span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                    systemStatus.database === 'healthy' ? 'text-green-600' :
                                    systemStatus.database === 'warning' ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {systemStatus.database === 'healthy' ? '正常運行' :
                                     systemStatus.database === 'warning' ? '緩慢響應' :
                                     '連接失敗'}
                                </p>
                            </div>

                            {/* AI 服務狀態 */}
                            <div className={`p-4 rounded-lg ${
                                systemStatus.aiService === 'healthy' ? 'bg-green-50' :
                                systemStatus.aiService === 'warning' ? 'bg-yellow-50' :
                                'bg-red-50'
                            }`}>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        systemStatus.aiService === 'healthy' ? 'bg-green-500' :
                                        systemStatus.aiService === 'warning' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}></div>
                                    <span className={`text-sm font-medium ${
                                        systemStatus.aiService === 'healthy' ? 'text-green-700' :
                                        systemStatus.aiService === 'warning' ? 'text-yellow-700' :
                                        'text-red-700'
                                    }`}>AI 服務</span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                    systemStatus.aiService === 'healthy' ? 'text-green-600' :
                                    systemStatus.aiService === 'warning' ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {systemStatus.aiService === 'healthy' ? '正常運行' :
                                     systemStatus.aiService === 'warning' ? '限速中' :
                                     '服務不可用'}
                                </p>
                            </div>

                            {/* 存儲服務狀態 */}
                            <div className={`p-4 rounded-lg ${
                                systemStatus.storage === 'healthy' ? 'bg-green-50' :
                                systemStatus.storage === 'warning' ? 'bg-yellow-50' :
                                'bg-red-50'
                            }`}>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        systemStatus.storage === 'healthy' ? 'bg-green-500' :
                                        systemStatus.storage === 'warning' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}></div>
                                    <span className={`text-sm font-medium ${
                                        systemStatus.storage === 'healthy' ? 'text-green-700' :
                                        systemStatus.storage === 'warning' ? 'text-yellow-700' :
                                        'text-red-700'
                                    }`}>文件存儲</span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                    systemStatus.storage === 'healthy' ? 'text-green-600' :
                                    systemStatus.storage === 'warning' ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {systemStatus.storage === 'healthy' ? '正常運行' :
                                     systemStatus.storage === 'warning' ? '容量不足' :
                                     '存儲失敗'}
                                </p>
                            </div>

                            {/* 郵件服務狀態 */}
                            <div className={`p-4 rounded-lg ${
                                systemStatus.emailService === 'healthy' ? 'bg-green-50' :
                                systemStatus.emailService === 'warning' ? 'bg-yellow-50' :
                                'bg-red-50'
                            }`}>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        systemStatus.emailService === 'healthy' ? 'bg-green-500' :
                                        systemStatus.emailService === 'warning' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}></div>
                                    <span className={`text-sm font-medium ${
                                        systemStatus.emailService === 'healthy' ? 'text-green-700' :
                                        systemStatus.emailService === 'warning' ? 'text-yellow-700' :
                                        'text-red-700'
                                    }`}>郵件服務</span>
                                </div>
                                <p className={`text-sm mt-1 ${
                                    systemStatus.emailService === 'healthy' ? 'text-green-600' :
                                    systemStatus.emailService === 'warning' ? 'text-yellow-600' :
                                    'text-red-600'
                                }`}>
                                    {systemStatus.emailService === 'healthy' ? '正常運行' :
                                     systemStatus.emailService === 'warning' ? '未配置' :
                                     '服務失敗'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h5 className="font-medium text-gray-900 mb-2">系統資源使用情況</h5>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>CPU 使用率</span>
                                        <span>{systemMetrics.cpuUsage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div
                                            className={`h-2 rounded-full ${
                                                systemMetrics.cpuUsage > 80 ? 'bg-red-500' :
                                                systemMetrics.cpuUsage > 60 ? 'bg-orange-500' :
                                                'bg-blue-500'
                                            }`}
                                            style={{ width: `${systemMetrics.cpuUsage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>記憶體使用率</span>
                                        <span>{systemMetrics.memoryUsage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div
                                            className={`h-2 rounded-full ${
                                                systemMetrics.memoryUsage > 85 ? 'bg-red-500' :
                                                systemMetrics.memoryUsage > 70 ? 'bg-orange-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${systemMetrics.memoryUsage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>儲存空間使用率</span>
                                        <span>{systemMetrics.storageUsage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div
                                            className={`h-2 rounded-full ${
                                                systemMetrics.storageUsage > 90 ? 'bg-red-500' :
                                                systemMetrics.storageUsage > 75 ? 'bg-orange-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${systemMetrics.storageUsage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>數據庫連接數</span>
                                        <span>{systemMetrics.dbConnections}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>響應時間</span>
                                        <span>{systemMetrics.responseTime}ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 郵件統計 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title flex items-center">
                            <Bell className="h-5 w-5 mr-2" />
                            郵件服務統計
                        </h4>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{emailStats.total}</p>
                                    <p className="text-sm text-blue-700">總郵件數</p>
                                </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{emailStats.sent}</p>
                                    <p className="text-sm text-green-700">已發送</p>
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{emailStats.pending}</p>
                                    <p className="text-sm text-yellow-700">待發送</p>
                                </div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{emailStats.failed}</p>
                                    <p className="text-sm text-red-700">發送失敗</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-600 mb-2">今日郵件数量：{emailStats.todayTotal}</p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={fetchSystemStatus}
                                    disabled={loadingStatus}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    刷新統計
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 安全設定 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            安全設定
                        </h4>
                    </div>
                    <div className="card-content space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                                <div>
                                    <h5 className="font-medium text-yellow-800">安全建議</h5>
                                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                        <li>• 定期更新管理員密碼</li>
                                        <li>• 啟用雙因子認證</li>
                                        <li>• 定期檢查系統日誌</li>
                                        <li>• 保持系統組件更新</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleTestEmail}
                                disabled={loadingStatus}
                                className="w-full btn-outline flex items-center justify-center"
                            >
                                {loadingStatus ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : (
                                    <Bell className="h-4 w-4 mr-2" />
                                )}
                                測試郵件服務
                            </button>

                            <button
                                onClick={handleSendTestAlert}
                                disabled={loadingStatus}
                                className="w-full btn-outline flex items-center justify-center"
                            >
                                {loadingStatus ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                )}
                                發送測試警報
                            </button>

                            <button className="w-full btn-outline flex items-center justify-center">
                                <Key className="h-4 w-4 mr-2" />
                                重設 API 金鑰
                            </button>

                            <button className="w-full btn-outline flex items-center justify-center">
                                <Download className="h-4 w-4 mr-2" />
                                下載系統日誌
                            </button>

                            <button className="w-full btn-outline flex items-center justify-center">
                                <Database className="h-4 w-4 mr-2" />
                                立即備份數據
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 保存提示 */}
            {settingsChanged && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
                    <p className="text-sm">您有未保存的變更</p>
                </div>
            )}
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
                                    {tab.badge && tab.badge > 0 && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                            {tab.badge}
                                        </span>
                                    )}
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
                {activeTab === 'analytics' && renderAnalyticsTab()}
                {activeTab === 'ai-errors' && renderAIErrorsTab()}
                {activeTab === 'settings' && renderSettingsTab()}
            </div>
        </div>
    )

    function renderAIErrorsTab() {
        const getErrorTypeLabel = (type: string) => {
            const labels: Record<string, string> = {
                'API_KEY_INVALID': 'API 金鑰無效',
                'QUOTA_EXCEEDED': 'API 配額不足',
                'RATE_LIMIT_EXCEEDED': 'API 呼叫頻繁',
                'SAFETY_FILTER': '安全過濾器',
                'JSON_PARSE_ERROR': 'JSON 解析錯誤',
                'UNKNOWN_ERROR': '未知錯誤'
            }
            return labels[type] || type
        }

        const getErrorTypeColor = (type: string) => {
            const colors: Record<string, string> = {
                'API_KEY_INVALID': 'bg-red-100 text-red-800',
                'QUOTA_EXCEEDED': 'bg-orange-100 text-orange-800',
                'RATE_LIMIT_EXCEEDED': 'bg-yellow-100 text-yellow-800',
                'SAFETY_FILTER': 'bg-purple-100 text-purple-800',
                'JSON_PARSE_ERROR': 'bg-blue-100 text-blue-800',
                'UNKNOWN_ERROR': 'bg-gray-100 text-gray-800'
            }
            return colors[type] || 'bg-gray-100 text-gray-800'
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">AI 生成錯誤記錄</h3>
                    <button
                        onClick={fetchAIErrors}
                        className="btn-outline flex items-center"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        刷新列表
                    </button>
                </div>

                {/* 錯誤統計 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">總錯誤數</p>
                                <p className="text-2xl font-bold">{aiErrorStats.total}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">待處理</p>
                                <p className="text-2xl font-bold">{aiErrorStats.unresolved}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-yellow-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">已解決</p>
                                <p className="text-2xl font-bold">{aiErrorStats.total - aiErrorStats.unresolved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-200" />
                        </div>
                    </div>
                </div>

                {/* 按錯誤類型統計 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">錯誤類型分布</h4>
                    </div>
                    <div className="card-content">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(aiErrorStats.byType).map(([type, count]) => (
                                <div key={type} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getErrorTypeColor(type)}`}>
                                            {getErrorTypeLabel(type)}
                                        </span>
                                        <span className="text-lg font-bold text-gray-700">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 錯誤列表 */}
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">錯誤詳細列表</h4>
                    </div>
                    <div className="card-content">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : aiErrors.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <p className="text-gray-600">太棒了！目前沒有 AI 生成錯誤</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {aiErrors.map((error) => (
                                    <div
                                        key={error.id}
                                        className={`border rounded-lg p-4 ${
                                            error.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getErrorTypeColor(error.error_type)}`}>
                                                        {getErrorTypeLabel(error.error_type)}
                                                    </span>
                                                    {error.resolved ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                            已解決
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                                                            待處理
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(error.created_at).toLocaleString('zh-TW')}
                                                    </span>
                                                </div>

                                                {error.questions && (
                                                    <div className="mb-2">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            題目 #{error.questions.question_number}:
                                                        </span>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {error.questions.question_text}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mb-2">
                                                    <span className="text-sm font-medium text-gray-700">錯誤訊息:</span>
                                                    <p className="text-sm text-red-600 mt-1">{error.error_message}</p>
                                                </div>

                                                {error.error_details && (
                                                    <details className="text-xs text-gray-500 mt-2">
                                                        <summary className="cursor-pointer hover:text-gray-700">
                                                            詳細資訊
                                                        </summary>
                                                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                                                            {JSON.stringify(
                                                                typeof error.error_details === 'string'
                                                                    ? JSON.parse(error.error_details)
                                                                    : error.error_details,
                                                                null,
                                                                2
                                                            )}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                {!error.resolved && (
                                                    <button
                                                        onClick={() => markErrorAsResolved(error.id)}
                                                        className="btn-primary text-sm flex items-center"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        標記為已解決
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
} 