import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { User, Edit, Save, X, Camera } from 'lucide-react'

interface UserStats {
    totalQuestions: number
    accuracy: number
    consecutiveDays: number
    ranking: number
}

export default function ProfilePage() {
    const { profile, updateProfile, changePassword, deleteAccount, user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [statsLoading, setStatsLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [userStats, setUserStats] = useState<UserStats>({
        totalQuestions: 0,
        accuracy: 0,
        consecutiveDays: 0,
        ranking: 0
    })
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        email: profile?.email || ''
    })
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        practiceReminders: true,
        privacyMode: false
    })
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [avatarUploading, setAvatarUploading] = useState(false)

    // 獲取用戶統計數據
    const fetchUserStats = async () => {
        if (!user?.id) return

        try {
            setStatsLoading(true)

            // 獲取整體排名數據
            const { data: overallRankingData } = await supabase
                .from('overall_rankings')
                .select('*')
                .eq('user_id', user.id)
                .limit(1)

            const overallRanking = overallRankingData?.[0] || null

            // 獲取連續練習天數
            const { data: recentSessions } = await supabase
                .from('practice_sessions')
                .select('started_at')
                .eq('user_id', user.id)
                .eq('completed', true)
                .order('started_at', { ascending: false })
                .limit(30)

            // 計算連續天數
            let consecutiveDays = 0
            if (recentSessions && recentSessions.length > 0) {
                // 獲取所有練習的日期（只保留日期部分，忽略時間）
                const dates = recentSessions.map(session => {
                    const date = new Date(session.started_at)
                    // 將日期標準化為 YYYY-MM-DD 格式，避免時區問題
                    return date.toISOString().split('T')[0]
                })

                // 去重並排序（降序，最新的日期在前）
                const uniqueDates = [...new Set(dates)].sort((a, b) => {
                    return new Date(b).getTime() - new Date(a).getTime()
                })

                // 從今天開始往回檢查
                const today = new Date()
                const todayStr = today.toISOString().split('T')[0]

                // 如果最近的練習日期不是今天也不是昨天，連續天數為 0
                const mostRecentDate = uniqueDates[0]
                const mostRecentDateObj = new Date(mostRecentDate)
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)
                const yesterdayStr = yesterday.toISOString().split('T')[0]

                // 檢查最近一次練習是今天或昨天
                if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
                    consecutiveDays = 0
                } else {
                    // 從最近的練習日期開始往回檢查連續性
                    let checkDate = new Date(mostRecentDate)

                    for (let i = 0; i < uniqueDates.length; i++) {
                        const currentDateStr = checkDate.toISOString().split('T')[0]

                        if (uniqueDates[i] === currentDateStr) {
                            consecutiveDays++
                            // 往前一天
                            checkDate.setDate(checkDate.getDate() - 1)
                        } else {
                            // 日期不連續，停止計算
                            break
                        }
                    }
                }
            }

            setUserStats({
                totalQuestions: overallRanking?.total_questions_answered || 0,
                accuracy: Math.round((overallRanking?.overall_accuracy_rate || 0) * 100),
                consecutiveDays,
                ranking: overallRanking?.ranking_position || 0
            })

        } catch (error) {
            console.error('Error fetching user stats:', error)
        } finally {
            setStatsLoading(false)
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchUserStats()
        }
    }, [user?.id])

    // 同步 profile 數據到 formData 和 preferences
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || ''
            })

            // 載入偏好設定
            // 這些欄位可能不在型別宣告內，使用斷言讀取
            const p: any = profile
            setPreferences({
                emailNotifications: p.email_notifications ?? true,
                practiceReminders: p.practice_reminders ?? true,
                privacyMode: p.privacy_mode ?? false
            })
        }
    }, [profile])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handlePreferenceChange = async (preferenceKey: keyof typeof preferences) => {
        const newValue = !preferences[preferenceKey]

        // 立即更新 UI
        setPreferences(prev => ({
            ...prev,
            [preferenceKey]: newValue
        }))

        // 儲存到資料庫
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    [preferenceKey === 'emailNotifications' ? 'email_notifications' :
                        preferenceKey === 'practiceReminders' ? 'practice_reminders' :
                            'privacy_mode']: newValue,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id)

            if (error) {
                console.error('Error updating preference:', error)
                // 回滾 UI 更新
                setPreferences(prev => ({
                    ...prev,
                    [preferenceKey]: !newValue
                }))
                setError('偏好設定更新失敗')
                setTimeout(() => setError(''), 3000)
            } else {
                setSuccess('偏好設定已更新')
                setTimeout(() => setSuccess(''), 2000)
            }
        } catch (err) {
            console.error('Error saving preference:', err)
            // 回滾 UI 更新
            setPreferences(prev => ({
                ...prev,
                [preferenceKey]: !newValue
            }))
            setError('偏好設定更新失敗')
            setTimeout(() => setError(''), 3000)
        }
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

    const handlePasswordChange = async () => {
        setPasswordError('')

        if (!newPassword || newPassword.length < 6) {
            setPasswordError('密碼至少需要 6 個字元')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('密碼確認不一致')
            return
        }

        setLoading(true)
        try {
            const { error } = await changePassword(newPassword)
            if (error) {
                setPasswordError('密碼變更失敗：' + error.message)
            } else {
                setSuccess('密碼已成功變更')
                setShowPasswordModal(false)
                setNewPassword('')
                setConfirmPassword('')
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setPasswordError('密碼變更過程中發生錯誤')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setLoading(true)
        try {
            const { error } = await deleteAccount()
            if (error) {
                setError('帳戶刪除失敗：' + error.message)
            } else {
                // 帳戶刪除成功，用戶會被自動登出
                setSuccess('帳戶已成功刪除')
            }
        } catch (err) {
            setError('帳戶刪除過程中發生錯誤')
        } finally {
            setLoading(false)
            setShowDeleteModal(false)
        }
    }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !user) return

        // 檢查文件類型
        if (!file.type.startsWith('image/')) {
            setError('請選擇圖片文件')
            return
        }

        // 檢查文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('圖片大小不能超過 5MB')
            return
        }

        setAvatarUploading(true)
        setError('')

        try {
            // 刪除舊頭像（如果存在）
            if (profile?.avatar_url) {
                const oldFileName = profile.avatar_url.split('/').pop()
                if (oldFileName) {
                    await supabase.storage
                        .from('avatars')
                        .remove([oldFileName])
                }
            }

            // 生成唯一文件名
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`

            // 上傳到 Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                throw uploadError
            }

            // 獲取公共 URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // 更新用戶資料中的頭像 URL
            const { error: updateError } = await updateProfile({
                avatar_url: publicUrl
            })

            if (updateError) {
                // 如果資料庫更新失敗，刪除剛上傳的文件
                await supabase.storage
                    .from('avatars')
                    .remove([fileName])
                throw updateError
            }

            setSuccess('頭像已成功更新')
            setTimeout(() => setSuccess(''), 3000)

        } catch (error: any) {
            console.error('Avatar upload error:', error)
            setError('頭像上傳失敗：' + (error.message || '未知錯誤'))
        } finally {
            setAvatarUploading(false)
        }
    }

    return (
        <div className="space-y-6">
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
                                    className="h-20 w-20 rounded-full object-cover border-4 border-gray-100"
                                    src={profile.avatar_url}
                                    alt={profile.full_name || '使用者'}
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center border-4 border-gray-100 shadow-lg">
                                    <span className="text-2xl font-bold text-white">
                                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                        id="avatar-upload"
                                        disabled={avatarUploading}
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        {avatarUploading ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <Camera className="h-4 w-4 text-gray-600" />
                                        )}
                                    </label>
                                </>
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
                            <label htmlFor="full_name" className="label">姓名</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    id="full_name"
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
                            <label htmlFor="email" className="label">電子信箱</label>
                            <p id="email" className="mt-1 text-gray-900">{profile?.email}</p>
                            <p className="text-sm text-gray-500">電子信箱無法修改</p>
                        </div>

                        <div>
                            <label htmlFor="user_role" className="label">會員類型</label>
                            <p id="user_role" className="mt-1 text-gray-900">
                                {profile?.role === 'admin' ? '管理員' : '一般會員'}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="created_date" className="label">註冊時間</label>
                            <p id="created_date" className="mt-1 text-gray-900">
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
                    {statsLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{userStats.totalQuestions}</p>
                                <p className="text-sm text-gray-600">總答題數</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-600">{userStats.accuracy}%</p>
                                <p className="text-sm text-gray-600">正確率</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600">{userStats.consecutiveDays}</p>
                                <p className="text-sm text-gray-600">連續天數</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-orange-600">
                                    {userStats.ranking > 0 ? userStats.ranking : '-'}
                                </p>
                                <p className="text-sm text-gray-600">排名</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 偏好設定 */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">偏好設定</h3>
                </div>
                <div className="card-content">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 id="email-notifications-label" className="font-medium text-gray-900">電子郵件通知</h4>
                                <p className="text-sm text-gray-600">接收練習提醒和成績通知</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="email-notifications"
                                    name="email-notifications"
                                    className="sr-only"
                                    checked={preferences.emailNotifications}
                                    onChange={() => handlePreferenceChange('emailNotifications')}
                                    aria-labelledby="email-notifications-label"
                                />
                                <div className={`w-11 h-6 rounded-full transition-all duration-300 ease-in-out focus-within:ring-4 focus-within:ring-green-500/20 ${preferences.emailNotifications
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                    }`}>
                                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${preferences.emailNotifications
                                            ? 'translate-x-5'
                                            : 'translate-x-0.5'
                                        } mt-0.5`}>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 id="practice-reminders-label" className="font-medium text-gray-900">練習提醒</h4>
                                <p className="text-sm text-gray-600">每日練習時間提醒</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="practice-reminders"
                                    name="practice-reminders"
                                    className="sr-only"
                                    checked={preferences.practiceReminders}
                                    onChange={() => handlePreferenceChange('practiceReminders')}
                                    aria-labelledby="practice-reminders-label"
                                />
                                <div className={`w-11 h-6 rounded-full transition-all duration-300 ease-in-out focus-within:ring-4 focus-within:ring-green-500/20 ${preferences.practiceReminders
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                    }`}>
                                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${preferences.practiceReminders
                                            ? 'translate-x-5'
                                            : 'translate-x-0.5'
                                        } mt-0.5`}>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 id="privacy-mode-label" className="font-medium text-gray-900">隱私模式</h4>
                                <p className="text-sm text-gray-600">在排行榜中隱藏姓名</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="privacy-mode"
                                    name="privacy-mode"
                                    className="sr-only"
                                    checked={preferences.privacyMode}
                                    onChange={() => handlePreferenceChange('privacyMode')}
                                    aria-labelledby="privacy-mode-label"
                                />
                                <div className={`w-11 h-6 rounded-full transition-all duration-300 ease-in-out focus-within:ring-4 focus-within:ring-green-500/20 ${preferences.privacyMode
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                    }`}>
                                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${preferences.privacyMode
                                            ? 'translate-x-5'
                                            : 'translate-x-0.5'
                                        } mt-0.5`}>
                                    </div>
                                </div>
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
                            <button
                                className="btn-outline"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                變更密碼
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">刪除帳戶</h4>
                                <p className="text-sm text-gray-600">永久刪除您的帳戶和所有資料</p>
                            </div>
                            <button
                                className="btn-destructive"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                刪除帳戶
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 變更密碼模態框 */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">變更密碼</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="new-password" className="label">新密碼</label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        className="input mt-1"
                                        placeholder="至少 6 個字元"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="label">確認新密碼</label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        className="input mt-1"
                                        placeholder="請再次輸入新密碼"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                {passwordError && (
                                    <div className="text-red-600 text-sm">
                                        {passwordError}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    className="btn-outline"
                                    onClick={() => {
                                        setShowPasswordModal(false)
                                        setNewPassword('')
                                        setConfirmPassword('')
                                        setPasswordError('')
                                    }}
                                    disabled={loading}
                                >
                                    取消
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handlePasswordChange}
                                    disabled={loading}
                                >
                                    {loading ? '變更中...' : '確認變更'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 刪除帳戶確認模態框 */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除帳戶</h3>

                            <div className="mb-6">
                                <p className="text-gray-600 mb-2">
                                    您即將永久刪除您的帳戶和所有相關資料，包括：
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                    <li>個人檔案資訊</li>
                                    <li>練習記錄和成績</li>
                                    <li>排行榜資料</li>
                                    <li>所有學習統計</li>
                                </ul>
                                <p className="text-red-600 font-medium mt-4">
                                    此操作無法復原，請謹慎考慮！
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    className="btn-outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                >
                                    取消
                                </button>
                                <button
                                    className="btn-destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                >
                                    {loading ? '刪除中...' : '確認刪除'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 