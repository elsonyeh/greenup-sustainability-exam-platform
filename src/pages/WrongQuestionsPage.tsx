import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { AlertCircle, BookOpen, Target, TrendingUp, PlayCircle, CheckCircle, Heart } from 'lucide-react'

interface WrongQuestion {
    id: string
    question_id: string
    wrong_count: number
    last_wrong_at: string
    mastered: boolean
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

export default function WrongQuestionsPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterMastered, setFilterMastered] = useState(false)
    const [startingPractice, setStartingPractice] = useState(false)
    const [favoriteQuestions, setFavoriteQuestions] = useState<Set<string>>(new Set())

    useEffect(() => {
        fetchWrongQuestions()
        if (user) {
            fetchUserFavorites()
        }
    }, [user, filterMastered])

    const fetchUserFavorites = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('user_favorites')
                .select('question_id')
                .eq('user_id', user.id)

            if (error) throw error

            const favoriteIds = new Set(data?.map(f => f.question_id) || [])
            setFavoriteQuestions(favoriteIds)
        } catch (err) {
            console.error('Error fetching user favorites:', err)
        }
    }

    const fetchWrongQuestions = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            let query = supabase
                .from('wrong_answers')
                .select(`
                    id,
                    question_id,
                    wrong_count,
                    last_wrong_at,
                    mastered,
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
                .order('last_wrong_at', { ascending: false })

            if (!filterMastered) {
                query = query.eq('mastered', false)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError

            const normalized = (data || []).map((row: any) => ({
                ...row,
                question: Array.isArray(row.question) ? row.question[0] : row.question
            }))
            setWrongQuestions(normalized)
        } catch (err) {
            console.error('Error fetching wrong questions:', err)
            setError('載入錯題記錄失敗')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsMastered = async (wrongAnswerId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('wrong_answers')
                .update({ mastered: true })
                .eq('id', wrongAnswerId)

            if (updateError) throw updateError

            // 更新本地狀態
            setWrongQuestions(prev =>
                prev.map(wq =>
                    wq.id === wrongAnswerId ? { ...wq, mastered: true } : wq
                )
            )
        } catch (err) {
            console.error('Error marking as mastered:', err)
            alert('標記為已掌握失敗')
        }
    }

    const handleToggleFavorite = async (questionId: string) => {
        if (!user) return

        const isFavorited = favoriteQuestions.has(questionId)

        // 立即更新 UI
        setFavoriteQuestions(prev => {
            const newSet = new Set(prev)
            if (isFavorited) {
                newSet.delete(questionId)
            } else {
                newSet.add(questionId)
            }
            return newSet
        })

        try {
            if (isFavorited) {
                // 移除收藏
                await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('question_id', questionId)
            } else {
                // 新增收藏
                await supabase
                    .from('user_favorites')
                    .insert({
                        user_id: user.id,
                        question_id: questionId
                    })
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            // 如果資料庫操作失敗，回滾 UI 變更
            setFavoriteQuestions(prev => {
                const newSet = new Set(prev)
                if (isFavorited) {
                    newSet.add(questionId)
                } else {
                    newSet.delete(questionId)
                }
                return newSet
            })
            alert('收藏操作失敗')
        }
    }

    const handleStartPractice = async () => {
        if (!user || wrongQuestions.length === 0) return

        try {
            setStartingPractice(true)

            // 創建練習會話
            const { data: sessionData, error: sessionError } = await supabase
                .from('practice_sessions')
                .insert({
                    user_id: user.id,
                    session_type: 'wrong_questions',
                    total_questions: wrongQuestions.length,
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

    const unmasteredCount = wrongQuestions.filter(wq => !wq.mastered).length
    const masteredCount = wrongQuestions.filter(wq => wq.mastered).length

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 頁面標題 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                        錯題庫
                    </h1>
                    <p className="text-gray-600">複習錯誤題目，強化弱點知識</p>
                </div>

                {/* 統計卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">未掌握題目</p>
                                <p className="text-3xl font-bold text-red-600">{unmasteredCount}</p>
                            </div>
                            <Target className="w-12 h-12 text-red-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">已掌握題目</p>
                                <p className="text-3xl font-bold text-green-600">{masteredCount}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">總錯題數</p>
                                <p className="text-3xl font-bold text-orange-600">{wrongQuestions.length}</p>
                            </div>
                            <BookOpen className="w-12 h-12 text-orange-600 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* 操作按鈕 */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleStartPractice}
                                disabled={unmasteredCount === 0 || startingPractice}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlayCircle className="w-5 h-5" />
                                {startingPractice ? '準備中...' : '開始練習未掌握題目'}
                            </button>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filterMastered}
                                onChange={(e) => setFilterMastered(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">顯示已掌握題目</span>
                        </label>
                    </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {/* 題目列表 */}
                {wrongQuestions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {filterMastered ? '沒有錯題記錄' : '沒有未掌握的錯題'}
                        </h3>
                        <p className="text-gray-600">
                            {filterMastered ? '繼續保持，多多練習！' : '太棒了！所有錯題都已掌握'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {wrongQuestions.map((wq) => (
                            <div
                                key={wq.id}
                                className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow ${wq.mastered ? 'opacity-60' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="text-lg font-medium text-gray-900 mb-2">
                                                    {wq.question.question_text}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                        {(Array.isArray(wq.question.question_categories)
                                                            ? wq.question.question_categories[0]?.name
                                                            : wq.question.question_categories?.name) ?? '未分類'}
                                                    </span>
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                                                        難度 {wq.question.difficulty_level}
                                                    </span>
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                                        錯誤 {wq.wrong_count} 次
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleFavorite(wq.question_id)}
                                                className={`ml-4 p-2 rounded-lg transition-all ${favoriteQuestions.has(wq.question_id)
                                                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                                    }`}
                                                title={favoriteQuestions.has(wq.question_id) ? '取消收藏' : '加入收藏'}
                                            >
                                                <Heart className={`w-5 h-5 ${favoriteQuestions.has(wq.question_id) ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                            {['A', 'B', 'C', 'D'].map((option) => {
                                                const optionKey = `option_${option.toLowerCase()}` as keyof typeof wq.question
                                                const optionText = wq.question[optionKey]
                                                if (!optionText) return null

                                                const isCorrect = wq.question.correct_answer === option

                                                return (
                                                    <div
                                                        key={option}
                                                        className={`p-3 rounded-lg border-2 ${isCorrect
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
                                                最後錯誤時間：{new Date(wq.last_wrong_at).toLocaleDateString('zh-TW')}
                                            </span>
                                            {!wq.mastered && (
                                                <button
                                                    onClick={() => handleMarkAsMastered(wq.id)}
                                                    className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    標記為已掌握
                                                </button>
                                            )}
                                            {wq.mastered && (
                                                <span className="text-green-600 font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    已掌握
                                                </span>
                                            )}
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
