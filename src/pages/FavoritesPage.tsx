import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Heart, BookOpen, PlayCircle, Trash2, Star } from 'lucide-react'

interface FavoriteQuestion {
    id: string
    question_id: string
    created_at: string
    question: {
        id: string
        question_text: string
        option_a: string | null
        option_b: string | null
        option_c: string | null
        option_d: string | null
        correct_answer: 'A' | 'B' | 'C' | 'D'
        difficulty_level: number
        question_categories: {
            name: string
        } | null
    }
}

export default function FavoritesPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [favoriteQuestions, setFavoriteQuestions] = useState<FavoriteQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [startingPractice, setStartingPractice] = useState(false)

    useEffect(() => {
        fetchFavoriteQuestions()
    }, [user])

    const fetchFavoriteQuestions = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('user_favorites')
                .select(`
                    id,
                    question_id,
                    created_at,
                    question:questions(
                        id,
                        question_text,
                        option_a,
                        option_b,
                        option_c,
                        option_d,
                        correct_answer,
                        difficulty_level,
                        question_categories(name)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            setFavoriteQuestions(data || [])
        } catch (err) {
            console.error('Error fetching favorite questions:', err)
            setError('載入收藏題目失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFavorite = async (favoriteId: string) => {
        if (!confirm('確定要從收藏中移除這道題目嗎？')) return

        try {
            const { error: deleteError } = await supabase
                .from('user_favorites')
                .delete()
                .eq('id', favoriteId)

            if (deleteError) throw deleteError

            // 更新本地狀態
            setFavoriteQuestions(prev => prev.filter(fq => fq.id !== favoriteId))
        } catch (err) {
            console.error('Error removing favorite:', err)
            alert('移除收藏失敗')
        }
    }

    const handleStartPractice = async () => {
        if (!user || favoriteQuestions.length === 0) return

        try {
            setStartingPractice(true)

            // 創建練習會話
            const { data: sessionData, error: sessionError } = await supabase
                .from('practice_sessions')
                .insert({
                    user_id: user.id,
                    session_type: 'favorites',
                    total_questions: favoriteQuestions.length,
                    completed: false
                })
                .select()
                .single()

            if (sessionError) throw sessionError

            // 導航到練習頁面
            navigate(`/practice/${sessionData.id}`)
        } catch (err) {
            console.error('Error starting practice:', err)
            alert('開始練習失敗')
        } finally {
            setStartingPractice(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 頁面標題 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Heart className="w-10 h-10 text-pink-600 fill-current" />
                        收藏題庫
                    </h1>
                    <p className="text-gray-600">複習你的收藏題目，加強重點學習</p>
                </div>

                {/* 統計卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">總收藏數</p>
                                <p className="text-3xl font-bold text-pink-600">{favoriteQuestions.length}</p>
                            </div>
                            <BookOpen className="w-12 h-12 text-pink-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">平均難度</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {favoriteQuestions.length > 0
                                        ? (
                                              favoriteQuestions.reduce(
                                                  (acc, fq) => acc + fq.question.difficulty_level,
                                                  0
                                              ) / favoriteQuestions.length
                                          ).toFixed(1)
                                        : '0'}
                                </p>
                            </div>
                            <Star className="w-12 h-12 text-purple-600 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* 操作按鈕 */}
                {favoriteQuestions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <button
                            onClick={handleStartPractice}
                            disabled={startingPractice}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlayCircle className="w-5 h-5" />
                            {startingPractice ? '準備中...' : '開始練習收藏題目'}
                        </button>
                    </div>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {/* 題目列表 */}
                {favoriteQuestions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">還沒有收藏題目</h3>
                        <p className="text-gray-600">在練習時點擊愛心按鈕來收藏重要的題目</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {favoriteQuestions.map((fq) => (
                            <div
                                key={fq.id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="text-lg font-medium text-gray-900 mb-2">
                                                    {fq.question.question_text}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                        {fq.question.question_categories?.name || '未分類'}
                                                    </span>
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                                                        難度 {fq.question.difficulty_level}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFavorite(fq.id)}
                                                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="移除收藏"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                            {['A', 'B', 'C', 'D'].map((option) => {
                                                const optionKey = `option_${option.toLowerCase()}` as keyof typeof fq.question
                                                const optionText = fq.question[optionKey]
                                                if (!optionText) return null

                                                const isCorrect = fq.question.correct_answer === option

                                                return (
                                                    <div
                                                        key={option}
                                                        className={`p-3 rounded-lg border-2 ${
                                                            isCorrect
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <span className="font-semibold">{option}.</span> {optionText}
                                                        {isCorrect && (
                                                            <span className="ml-2 text-green-600 font-semibold">✓ 正確答案</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span>
                                                收藏時間：{new Date(fq.created_at).toLocaleDateString('zh-TW')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
