import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { User, Edit, Save, X, Camera } from 'lucide-react'

export default function ProfilePage() {
    const { profile, updateProfile } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        email: profile?.email || ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = async () => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const { error } = await updateProfile({
                full_name: formData.full_name
            })

            if (error) {
                setError('更新失敗：' + error.message)
            } else {
                setSuccess('個人資料已成功更新')
                setIsEditing(false)
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError('更新過程中發生錯誤')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            full_name: profile?.full_name || '',
            email: profile?.email || ''
        })
        setIsEditing(false)
        setError('')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* 頁面標題 */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">個人檔案</h1>
                <p className="text-gray-600">管理您的個人資訊和偏好設定</p>
            </div>

            {/* 個人資料卡片 */}
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center justify-between">
                        <h3 className="card-title flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            基本資料
                        </h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-outline flex items-center"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                編輯
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-content">
                    {/* 頭像區域 */}
                    <div className="flex items-center mb-6">
                        <div className="relative">
                            {profile?.avatar_url ? (
                                <img
                                    className="h-20 w-20 rounded-full object-cover"
                                    src={profile.avatar_url}
                                    alt={profile.full_name || '使用者'}
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border">
                                    <Camera className="h-4 w-4 text-gray-600" />
                                </button>
                            )}
                        </div>
                        <div className="ml-6">
                            <h4 className="text-xl font-semibold text-gray-900">
                                {profile?.full_name || '未設定姓名'}
                            </h4>
                            <p className="text-gray-600">{profile?.email}</p>
                            {profile?.role === 'admin' && (
                                <span className="inline-block mt-2 px-3 py-1 bg-primary text-white text-sm rounded-full">
                                    管理員
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 表單 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">姓名</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="input mt-1"
                                    placeholder="請輸入您的姓名"
                                />
                            ) : (
                                <p className="mt-1 text-gray-900">{profile?.full_name || '未設定'}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">電子信箱</label>
                            <p className="mt-1 text-gray-900">{profile?.email}</p>
                            <p className="text-sm text-gray-500">電子信箱無法修改</p>
                        </div>

                        <div>
                            <label className="label">會員類型</label>
                            <p className="mt-1 text-gray-900">
                                {profile?.role === 'admin' ? '管理員' : '一般會員'}
                            </p>
                        </div>

                        <div>
                            <label className="label">註冊時間</label>
                            <p className="mt-1 text-gray-900">
                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('zh-TW') : '未知'}
                            </p>
                        </div>
                    </div>

                    {/* 錯誤和成功訊息 */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                            {success}
                        </div>
                    )}

                    {/* 操作按鈕 */}
                    {isEditing && (
                        <div className="mt-6 flex items-center space-x-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="btn-primary flex items-center"
                            >
                                {loading ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                儲存
                            </button>
                            <button
                                onClick={handleCancel}
                                className="btn-outline flex items-center"
                            >
                                <X className="h-4 w-4 mr-2" />
                                取消
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 學習統計概覽 */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">學習概覽</h3>
                </div>
                <div className="card-content">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">160</p>
                            <p className="text-sm text-gray-600">總答題數</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">85%</p>
                            <p className="text-sm text-gray-600">正確率</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-purple-600">7</p>
                            <p className="text-sm text-gray-600">連續天數</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">24</p>
                            <p className="text-sm text-gray-600">排名</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 偏好設定 */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">偏好設定</h3>
                </div>
                <div className="card-content">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">電子郵件通知</h4>
                                <p className="text-sm text-gray-600">接收練習提醒和成績通知</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">練習提醒</h4>
                                <p className="text-sm text-gray-600">每日練習時間提醒</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">隱私模式</h4>
                                <p className="text-sm text-gray-600">在排行榜中隱藏姓名</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 帳戶安全 */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">帳戶安全</h3>
                </div>
                <div className="card-content">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">變更密碼</h4>
                                <p className="text-sm text-gray-600">定期更新密碼以保護帳戶安全</p>
                            </div>
                            <button className="btn-outline">
                                變更密碼
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">刪除帳戶</h4>
                                <p className="text-sm text-gray-600">永久刪除您的帳戶和所有資料</p>
                            </div>
                            <button className="btn-destructive">
                                刪除帳戶
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 