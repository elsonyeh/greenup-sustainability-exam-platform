import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Eye, EyeOff, Leaf, Check } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('請輸入您的姓名')
            return false
        }

        if (!formData.email.trim()) {
            setError('請輸入電子信箱')
            return false
        }

        if (formData.password.length < 6) {
            setError('密碼至少需要 6 個字元')
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            setError('密碼確認不一致')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            const { error } = await signUp(formData.email, formData.password, formData.fullName)

            if (error) {
                setError(error.message || '註冊失敗，請稍後再試')
            } else {
                setSuccess(true)
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
            }
        } catch (err) {
            setError('註冊過程中發生錯誤，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <div className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                        <Check className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        註冊成功！
                    </h2>
                    <p className="text-gray-600 mb-6">
                        歡迎加入永續發展測驗平台！請檢查您的電子信箱以驗證帳戶。
                    </p>
                    <p className="text-sm text-gray-500">
                        即將轉至登入頁面...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-6">
                        <Leaf className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        加入我們
                    </h2>
                    <p className="text-gray-600">
                        創建您的永續發展測驗平台帳戶
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="label">
                                姓名
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                className="input mt-1"
                                placeholder="請輸入您的姓名"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label">
                                電子信箱
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input mt-1"
                                placeholder="請輸入您的電子信箱"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                密碼
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    className="input pr-10"
                                    placeholder="至少 6 個字元"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="label">
                                確認密碼
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    className="input pr-10"
                                    placeholder="請再次輸入密碼"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 密碼強度指示器 */}
                    {formData.password && (
                        <div className="space-y-2">
                            <div className="text-sm text-gray-600">密碼強度：</div>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4].map((level) => {
                                    let strength = 0
                                    if (formData.password.length >= 6) strength++
                                    if (/[A-Z]/.test(formData.password)) strength++
                                    if (/[0-9]/.test(formData.password)) strength++
                                    if (/[^A-Za-z0-9]/.test(formData.password)) strength++

                                    return (
                                        <div
                                            key={level}
                                            className={`h-2 w-full rounded ${level <= strength
                                                    ? strength <= 1
                                                        ? 'bg-red-400'
                                                        : strength <= 2
                                                            ? 'bg-yellow-400'
                                                            : strength <= 3
                                                                ? 'bg-blue-400'
                                                                : 'bg-green-400'
                                                    : 'bg-gray-200'
                                                }`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex justify-center items-center"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    註冊中...
                                </>
                            ) : (
                                '註冊帳戶'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            已經有帳戶？{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                立即登入
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>註冊即表示您同意我們的服務條款和隱私政策</p>
                </div>
            </div>
        </div>
    )
} 