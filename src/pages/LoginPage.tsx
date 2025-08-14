import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Eye, EyeOff, Leaf } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await signIn(email, password)

            if (error) {
                setError(error.message || '登入失敗，請檢查您的帳號密碼')
            } else {
                navigate('/')
            }
        } catch (err) {
            setError('登入過程中發生錯誤，請稍後再試')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-6">
                        <Leaf className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        歡迎回來
                    </h2>
                    <p className="text-gray-600">
                        登入您的永續發展測驗平台帳戶
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    autoComplete="current-password"
                                    required
                                    className="input pr-10"
                                    placeholder="請輸入您的密碼"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                    </div>

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
                                    登入中...
                                </>
                            ) : (
                                '登入'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            還沒有帳戶？{' '}
                            <Link
                                to="/register"
                                className="font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                立即註冊
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>© 2024 永續發展能力測驗練習平台</p>
                    <p className="mt-1">致力於推廣永續發展教育</p>
                </div>
            </div>
        </div>
    )
} 