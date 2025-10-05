import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    ArrowRight,
    ArrowLeft,
    Flag,
    Heart,
    Settings
} from 'lucide-react'

interface Question {
    id: string
    question_text: string
    option_a: string | null
    option_b: string | null
    option_c: string | null
    option_d: string | null
    correct_answer: 'A' | 'B' | 'C' | 'D'
    explanation: string | null
    ai_generated_explanation: string | null
    category_name: string
    difficulty_level: number
}

export default function PracticePage() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { profile: _profile, user } = useAuth()

    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({})
    const [showResult, setShowResult] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 分鐘
    const [practiceStarted, setPracticeStarted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [questionsLoading, setQuestionsLoading] = useState(true)
    const [favoriteQuestions, setFavoriteQuestions] = useState<Set<string>>(new Set())
    const [practiceSessionId, setPracticeSessionId] = useState<string | null>(null)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [completedTime, setCompletedTime] = useState<number>(0) // 完成時的使用時間（秒）
    const [finalResults, setFinalResults] = useState<{
        totalAnswered: number
        correctAnswers: number
        wrongAnswers: number
        unanswered: number
        accuracy: number
        answerAccuracy: number
        score: number
    } | null>(null)
    const [showExplanationModal, setShowExplanationModal] = useState(false)
    const [selectedQuestionForExplanation, setSelectedQuestionForExplanation] = useState<Question | null>(null)

    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1

    // 獲取練習題目
    const fetchQuestions = async () => {
        try {
            setQuestionsLoading(true)

            // 如果有 sessionId，獲取該會話的類型和題目
            if (sessionId && user) {
                const { data: session, error: sessionError } = await supabase
                    .from('practice_sessions')
                    .select('session_type')
                    .eq('id', sessionId)
                    .single()

                if (sessionError) throw sessionError

                setPracticeSessionId(sessionId)

                let questionIds: string[] = []

                if (session.session_type === 'wrong_questions') {
                    // 獲取錯題
                    const { data: wrongQuestions, error: wrongError } = await supabase
                        .from('wrong_answers')
                        .select('question_id')
                        .eq('user_id', user.id)
                        .eq('mastered', false)

                    if (wrongError) throw wrongError
                    questionIds = wrongQuestions?.map(wq => wq.question_id) || []
                } else if (session.session_type === 'favorites') {
                    // 獲取收藏題目
                    const { data: favorites, error: favError } = await supabase
                        .from('user_favorites')
                        .select('question_id')
                        .eq('user_id', user.id)

                    if (favError) throw favError
                    questionIds = favorites?.map(f => f.question_id) || []
                }

                if (questionIds.length > 0) {
                    const { data: questionsData, error } = await supabase
                        .from('questions')
                        .select(`
                            id,
                            question_text,
                            option_a,
                            option_b,
                            option_c,
                            option_d,
                            correct_answer,
                            explanation,
                            ai_generated_explanation,
                            difficulty_level,
                            question_categories(name)
                        `)
                        .in('id', questionIds)

                    if (error) throw error

                    const formattedQuestions: Question[] = questionsData?.map(q => ({
                        id: q.id,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        explanation: q.explanation,
                        ai_generated_explanation: q.ai_generated_explanation,
                        category_name: (q.question_categories as any)?.name || '綜合應用',
                        difficulty_level: q.difficulty_level
                    })) || []

                    setQuestions(formattedQuestions)
                    setPracticeStarted(true)
                    setStartTime(new Date())
                    return
                }
            }

            // 默認：隨機練習
            const { data: questionsData, error } = await supabase
                .from('questions')
                .select(`
                    id,
                    question_text,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer,
                    explanation,
                    ai_generated_explanation,
                    difficulty_level,
                    question_categories(name)
                `)
                .limit(20) // 限制20題
                .order('created_at', { ascending: false })

            if (error) throw error

            const formattedQuestions: Question[] = questionsData?.map(q => ({
                id: q.id,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                ai_generated_explanation: q.ai_generated_explanation,
                category_name: (q.question_categories as any)?.name || '綜合應用',
                difficulty_level: q.difficulty_level
            })) || []

            setQuestions(formattedQuestions)
        } catch (error) {
            console.error('Error fetching questions:', error)
            // 如果獲取失敗，設置空陣列
            setQuestions([])
        } finally {
            setQuestionsLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions()
        if (user) {
            fetchUserFavorites()
        }
    }, [sessionId, user])

    // 載入使用者收藏的題目
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
        } catch (error) {
            console.error('Error fetching user favorites:', error)
        }
    }

    // 計時器
    useEffect(() => {
        if (!practiceStarted || showResult) return

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleFinishPractice()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [practiceStarted, showResult])

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartPractice = async () => {
        setPracticeStarted(true)
        setStartTime(new Date())

        // 創建練習會話記錄
        if (user) {
            try {
                const { data, error } = await supabase
                    .from('practice_sessions')
                    .insert({
                        user_id: user.id,
                        session_type: 'random',
                        total_questions: totalQuestions,
                        correct_answers: 0,
                        completed: false
                    })
                    .select()
                    .single()

                if (error) throw error
                setPracticeSessionId(data.id)
            } catch (error) {
                console.error('Error creating practice session:', error)
            }
        }
    }

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer)
    }

    const handleNextQuestion = () => {
        if (selectedAnswer) {
            const updatedAnswers = {
                ...answers,
                [currentQuestion.id]: selectedAnswer
            }
            setAnswers(updatedAnswers)
            console.log('下一題 - 已保存答案，當前答案數:', Object.keys(updatedAnswers).length)
        }

        if (isLastQuestion) {
            handleFinishPractice()
        } else {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedAnswer(answers[questions[currentQuestionIndex + 1]?.id] || null)
        }
    }

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
            setSelectedAnswer(answers[questions[currentQuestionIndex - 1]?.id] || null)
        }
    }

    const handleToggleFavorite = async (questionId: string) => {
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

        // 同步到資料庫
        if (!user) return

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
        }
    }

    const handleFinishPractice = async () => {
        setLoading(true)

        // 計算並保存完成時間
        const durationSeconds = startTime
            ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
            : 30 * 60 - timeRemaining
        setCompletedTime(durationSeconds)

        try {
            // 確保包含當前選中的答案
            let finalAnswers = { ...answers }
            if (selectedAnswer && currentQuestion) {
                finalAnswers[currentQuestion.id] = selectedAnswer
                setAnswers(finalAnswers)
            }

            console.log('完成練習 - 答案數量:', Object.keys(finalAnswers).length)
            console.log('完成練習 - 答案明細:', finalAnswers)

            // 計算結果（使用最終答案）
            const totalAnswered = Object.keys(finalAnswers).length
            const correctAnswers = Object.entries(finalAnswers).filter(([questionId, answer]) => {
                const question = questions.find(q => q.id === questionId)
                return question && question.correct_answer === answer
            }).length

            const wrongAnswers = totalAnswered - correctAnswers
            const unanswered = totalQuestions - totalAnswered

            // 保存最終結果
            const results = {
                totalAnswered,
                correctAnswers,
                wrongAnswers,
                unanswered,
                accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
                answerAccuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
                score: correctAnswers * 5
            }
            setFinalResults(results)

            // 保存練習答題記錄
            if (user && practiceSessionId) {
                // 批次保存所有答案（使用最終答案）
                const answerRecords = Object.entries(finalAnswers).map(([questionId, answer]) => {
                    const question = questions.find(q => q.id === questionId)
                    return {
                        session_id: practiceSessionId,
                        question_id: questionId,
                        user_answer: answer,
                        is_correct: question ? question.correct_answer === answer : false
                    }
                })

                if (answerRecords.length > 0) {
                    await supabase
                        .from('practice_answers')
                        .insert(answerRecords)
                }

                // 更新練習會話狀態
                await supabase
                    .from('practice_sessions')
                    .update({
                        correct_answers: correctAnswers,
                        completed: true,
                        completed_at: new Date().toISOString(),
                        duration_seconds: durationSeconds
                    })
                    .eq('id', practiceSessionId)

                // 保存收藏的題目
                if (favoriteQuestions.size > 0) {
                    const favoriteRecords = Array.from(favoriteQuestions).map(questionId => ({
                        user_id: user.id,
                        question_id: questionId
                    }))

                    await supabase
                        .from('user_favorites')
                        .upsert(favoriteRecords, {
                            onConflict: 'user_id,question_id',
                            ignoreDuplicates: true
                        })
                }

                // 保存錯題記錄和處理已掌握的題目
                const wrongQuestionIds = Object.entries(finalAnswers)
                    .filter(([questionId, answer]) => {
                        const question = questions.find(q => q.id === questionId)
                        return question && question.correct_answer !== answer
                    })
                    .map(([questionId]) => questionId)

                const correctQuestionIds = Object.entries(finalAnswers)
                    .filter(([questionId, answer]) => {
                        const question = questions.find(q => q.id === questionId)
                        return question && question.correct_answer === answer
                    })
                    .map(([questionId]) => questionId)

                // 處理答錯的題目
                if (wrongQuestionIds.length > 0) {
                    for (const questionId of wrongQuestionIds) {
                        // 檢查是否已存在錯題記錄
                        const { data: existingRecord } = await supabase
                            .from('wrong_answers')
                            .select('id, wrong_count')
                            .eq('user_id', user.id)
                            .eq('question_id', questionId)
                            .single()

                        if (existingRecord) {
                            // 更新錯誤次數
                            await supabase
                                .from('wrong_answers')
                                .update({
                                    wrong_count: existingRecord.wrong_count + 1,
                                    last_wrong_at: new Date().toISOString(),
                                    mastered: false
                                })
                                .eq('id', existingRecord.id)
                        } else {
                            // 新增錯題記錄
                            await supabase
                                .from('wrong_answers')
                                .insert({
                                    user_id: user.id,
                                    question_id: questionId,
                                    wrong_count: 1,
                                    mastered: false
                                })
                        }
                    }
                }

                // 處理答對的題目：如果之前是錯題且未掌握，標記為已掌握
                if (correctQuestionIds.length > 0) {
                    await supabase
                        .from('wrong_answers')
                        .update({ mastered: true })
                        .eq('user_id', user.id)
                        .in('question_id', correctQuestionIds)
                        .eq('mastered', false)
                }
            }
        } catch (error) {
            console.error('Error saving practice results:', error)
        } finally {
            setShowResult(true)
            setLoading(false)
        }
    }

    const calculateResults = () => {
        // 包含當前選中的答案
        const currentAnswers = selectedAnswer && currentQuestion
            ? { ...answers, [currentQuestion.id]: selectedAnswer }
            : answers

        const totalAnswered = Object.keys(currentAnswers).length
        const correctAnswers = Object.entries(currentAnswers).filter(([questionId, answer]) => {
            const question = questions.find(q => q.id === questionId)
            return question && question.correct_answer === answer
        }).length

        const wrongAnswers = totalAnswered - correctAnswers
        const unanswered = totalQuestions - totalAnswered

        return {
            totalAnswered,
            correctAnswers,
            wrongAnswers,
            unanswered,
            // 正確率基於總題數，而非已回答題數
            accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
            // 答對率（基於已回答題數）
            answerAccuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
            score: correctAnswers * 5 // 每題 5 分
        }
    }

    // 開始練習頁面
    if (!practiceStarted) {
        if (questionsLoading) {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="card text-center">
                        <div className="card-content">
                            <LoadingSpinner size="lg" className="mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">正在準備題目...</h2>
                            <p className="text-gray-600">請稍候，我們正在為您準備練習題目</p>
                        </div>
                    </div>
                </div>
            )
        }

        if (totalQuestions === 0) {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="card text-center">
                        <div className="card-content">
                            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                暫無可用題目
                            </h1>
                            <p className="text-gray-600 mb-8">
                                目前系統中沒有可用的練習題目，請聯繫管理員或稍後再試。
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn-outline"
                            >
                                返回首頁
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="max-w-2xl mx-auto">
                <div className="card text-center">
                    <div className="card-content">
                        <BookOpen className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            準備開始練習
                        </h1>
                        <p className="text-gray-600 mb-8">
                            您即將開始永續發展能力測驗練習。本次練習包含 {totalQuestions} 道題目，建議時間 30 分鐘。
                        </p>

                        <div className="bg-blue-50 rounded-lg p-6 mb-8">
                            <h3 className="font-semibold text-blue-900 mb-4">練習說明</h3>
                            <ul className="text-left text-blue-800 space-y-2">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    每題均為單選題，請選擇最適當的答案
                                </li>
                                <li className="flex items-start">
                                    <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    建議練習時間為 30 分鐘
                                </li>
                                <li className="flex items-start">
                                    <Heart className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    可以收藏題目以便日後複習
                                </li>
                                <li className="flex items-start">
                                    <RotateCcw className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                    練習過程中可以返回修改答案
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleStartPractice}
                            className="btn-primary text-lg px-8 py-4"
                        >
                            開始練習
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // 結果頁面
    if (showResult) {
        const results = finalResults || calculateResults()

        console.log('結果頁面 - finalResults:', finalResults)
        console.log('結果頁面 - calculateResults():', calculateResults())
        console.log('結果頁面 - results:', results)
        console.log('結果頁面 - completedTime:', completedTime)
        console.log('結果頁面 - totalQuestions:', totalQuestions)

        return (
            <div className="max-w-4xl mx-auto px-4">
                {/* 成績卡片 */}
                <div className="card text-center mb-6">
                    <div className="card-content">
                        <div className="mb-6">
                            <div className="relative inline-block">
                                {results.accuracy >= 80 ? (
                                    <>
                                        <div className="absolute inset-0 bg-green-400 blur-2xl opacity-30 animate-pulse"></div>
                                        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4 relative drop-shadow-lg" />
                                    </>
                                ) : results.accuracy >= 60 ? (
                                    <>
                                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 animate-pulse"></div>
                                        <Clock className="h-24 w-24 text-yellow-500 mx-auto mb-4 relative drop-shadow-lg" />
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-red-400 blur-2xl opacity-30 animate-pulse"></div>
                                        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4 relative drop-shadow-lg" />
                                    </>
                                )}
                            </div>

                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                練習完成！
                            </h1>
                            <p className="text-lg text-gray-600">
                                恭喜您完成了本次練習，以下是您的成績統計
                            </p>
                        </div>

                        {/* 成績統計 */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <p className="text-5xl font-bold text-white mb-2 drop-shadow">{results.score}</p>
                                <p className="text-sm text-blue-100 font-medium">總分</p>
                                <div className="mt-3 pt-3 border-t border-blue-400">
                                    <p className="text-xs text-blue-100">滿分 {totalQuestions * 5}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <p className="text-5xl font-bold text-white mb-2 drop-shadow">{results.accuracy}%</p>
                                <p className="text-sm text-green-100 font-medium">正確率</p>
                                <div className="mt-3 pt-3 border-t border-green-400">
                                    <p className="text-xs text-green-100">{results.correctAnswers}/{totalQuestions} 題</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <p className="text-5xl font-bold text-white mb-2 drop-shadow">{results.totalAnswered}</p>
                                <p className="text-sm text-purple-100 font-medium">作答題數</p>
                                <div className="mt-3 pt-3 border-t border-purple-400">
                                    <p className="text-xs text-purple-100">答對率 {results.answerAccuracy}%</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <p className="text-5xl font-bold text-white mb-2 drop-shadow font-mono">
                                    {formatTime(completedTime)}
                                </p>
                                <p className="text-sm text-orange-100 font-medium">使用時間</p>
                                <div className="mt-3 pt-3 border-t border-orange-400">
                                    <p className="text-xs text-orange-100">建議 30:00</p>
                                </div>
                            </div>
                        </div>

                        {/* 答題詳情 */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-5 text-center text-lg">答題詳情</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="bg-green-100 rounded-full p-2 mr-2">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <span className="text-3xl font-bold text-green-600">{results.correctAnswers}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium text-center">答對</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="bg-red-100 rounded-full p-2 mr-2">
                                            <XCircle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <span className="text-3xl font-bold text-red-600">{results.wrongAnswers}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium text-center">答錯</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-center mb-3">
                                        <div className="bg-gray-100 rounded-full p-2 mr-2">
                                            <Clock className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <span className="text-3xl font-bold text-gray-600">{results.unanswered}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium text-center">未作答</p>
                                </div>
                            </div>
                        </div>

                        {/* 評語 */}
                        <div className={`rounded-xl p-6 mb-6 border-2 ${
                            results.accuracy >= 80
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                                : results.accuracy >= 60
                                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                                : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300'
                        }`}>
                            <p className={`text-center font-medium text-lg ${
                                results.accuracy >= 80
                                    ? 'text-green-900'
                                    : results.accuracy >= 60
                                    ? 'text-yellow-900'
                                    : 'text-blue-900'
                            }`}>
                                {results.accuracy >= 80 ? (
                                    <>
                                        <span className="text-3xl mr-2">🎉</span>
                                        太棒了！您對永續發展的知識掌握得非常好！
                                    </>
                                ) : results.accuracy >= 60 ? (
                                    <>
                                        <span className="text-3xl mr-2">👍</span>
                                        不錯的表現！繼續加強練習，您會更進步！
                                    </>
                                ) : results.accuracy >= 40 ? (
                                    <>
                                        <span className="text-3xl mr-2">💪</span>
                                        還有進步空間，建議多複習錯題，加油！
                                    </>
                                ) : (
                                    <>
                                        <span className="text-3xl mr-2">📚</span>
                                        建議仔細閱讀相關資料，打好基礎後再練習！
                                    </>
                                )}
                            </p>
                        </div>

                        {/* 錯題清單 */}
                        {results.wrongAnswers > 0 && (
                            <div className="bg-white rounded-xl border-2 border-red-300 mb-6 shadow-lg w-full overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-4">
                                    <h3 className="font-bold text-white text-lg flex items-center flex-wrap gap-2">
                                        <div className="bg-white/20 rounded-lg p-2">
                                            <XCircle className="h-6 w-6 text-white" />
                                        </div>
                                        錯題回顧
                                        <span className="px-3 py-1 bg-white/30 backdrop-blur rounded-full text-sm">
                                            {results.wrongAnswers} 題
                                        </span>
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-b from-red-50/50 to-white max-h-[600px] overflow-y-auto overflow-x-hidden">
                                    {questions
                                        .filter(q => {
                                            const userAnswer = answers[q.id]
                                            return userAnswer && userAnswer !== q.correct_answer
                                        })
                                        .map((question, index) => {
                                            const userAnswer = answers[question.id]
                                            return (
                                                <div
                                                    key={question.id}
                                                    className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-red-400 hover:shadow-md transition-all duration-300 w-full overflow-hidden"
                                                >
                                                    <div className="mb-4 w-full">
                                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg shadow-sm flex-shrink-0">
                                                                <XCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                                                                錯題 {index + 1}
                                                            </span>
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg flex-shrink-0">
                                                                {question.category_name}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-900 font-semibold text-base leading-relaxed break-words overflow-wrap-anywhere">
                                                            {question.question_text}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3 mb-4 w-full">
                                                        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 overflow-hidden">
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                                    <p className="text-xs text-red-700 font-medium mb-1">您的答案</p>
                                                                    <p className="font-semibold text-red-700 break-words overflow-wrap-anywhere text-sm sm:text-base">
                                                                        {userAnswer}. {question[`option_${userAnswer.toLowerCase()}` as keyof Question] as string}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-3 overflow-hidden">
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                                    <p className="text-xs text-green-700 font-medium mb-1">正確答案</p>
                                                                    <p className="font-semibold text-green-700 break-words overflow-wrap-anywhere text-sm sm:text-base">
                                                                        {question.correct_answer}. {question[`option_${question.correct_answer.toLowerCase()}` as keyof Question] as string}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuestionForExplanation(question)
                                                            setShowExplanationModal(true)
                                                        }}
                                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <BookOpen className="h-5 w-5 flex-shrink-0" />
                                                        <span className="truncate">查看詳細解析</span>
                                                    </button>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        )}

                        {/* 操作按鈕 */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="group relative overflow-hidden bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 px-8 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center"
                            >
                                <RotateCcw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                                重新練習
                            </button>
                            <button
                                onClick={() => navigate('/stats')}
                                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center">
                                    查看詳細統計
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 解析彈窗 */}
                {showExplanationModal && selectedQuestionForExplanation && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 backdrop-blur rounded-lg p-2">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">題目解析</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowExplanationModal(false)
                                        setSelectedQuestionForExplanation(null)
                                    }}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">

                            <div className="p-6 bg-gradient-to-b from-gray-50/50 to-white">
                                {/* 題目 */}
                                <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg mb-4 shadow-sm">
                                        {selectedQuestionForExplanation.category_name}
                                    </span>
                                    <h4 className="text-xl font-bold text-gray-900 leading-relaxed">
                                        {selectedQuestionForExplanation.question_text}
                                    </h4>
                                </div>

                                {/* 所有選項 */}
                                <div className="mb-6 space-y-3">
                                    {['A', 'B', 'C', 'D'].map((option) => {
                                        const optionText = selectedQuestionForExplanation[`option_${option.toLowerCase()}` as keyof Question] as string
                                        if (!optionText) return null

                                        const isCorrect = option === selectedQuestionForExplanation.correct_answer
                                        const isUserAnswer = option === answers[selectedQuestionForExplanation.id]

                                        return (
                                            <div
                                                key={option}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    isCorrect
                                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-md'
                                                        : isUserAnswer
                                                        ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 shadow-md'
                                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                                                        isCorrect
                                                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                                            : isUserAnswer
                                                            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                                            : 'bg-gray-200 text-gray-700'
                                                    }`}>
                                                        {option}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className={`font-medium leading-relaxed ${
                                                            isCorrect ? 'text-green-900' : isUserAnswer ? 'text-red-900' : 'text-gray-800'
                                                        }`}>
                                                            {optionText}
                                                        </p>
                                                        {isCorrect && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <div className="bg-green-500 rounded-full p-1">
                                                                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                                                                </div>
                                                                <span className="text-xs font-semibold text-green-700">正確答案</span>
                                                            </div>
                                                        )}
                                                        {isUserAnswer && !isCorrect && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <div className="bg-red-500 rounded-full p-1">
                                                                    <XCircle className="h-3.5 w-3.5 text-white" />
                                                                </div>
                                                                <span className="text-xs font-semibold text-red-700">您的答案</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* 解析內容 */}
                                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
                                    <h5 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                                        <div className="bg-blue-500 rounded-lg p-2 mr-3">
                                            <BookOpen className="h-5 w-5 text-white" />
                                        </div>
                                        詳細解析
                                    </h5>
                                    <div className="text-blue-900 leading-relaxed bg-white/60 backdrop-blur rounded-lg p-4">
                                        {selectedQuestionForExplanation.ai_generated_explanation || selectedQuestionForExplanation.explanation ? (
                                            <div className="whitespace-pre-wrap">
                                                {selectedQuestionForExplanation.ai_generated_explanation || selectedQuestionForExplanation.explanation}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">暫無解析內容</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </div>

                            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4 shadow-lg">
                                <button
                                    onClick={() => {
                                        setShowExplanationModal(false)
                                        setSelectedQuestionForExplanation(null)
                                    }}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
                                >
                                    關閉
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // 練習進行中
    return (
        <div className="max-w-2xl mx-auto">
            {/* 頂部進度條 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="text-base font-semibold text-gray-800">
                                題目 {currentQuestionIndex + 1} / {totalQuestions}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <span className={`text-base font-mono font-semibold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'
                                }`}>
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-primary to-blue-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* 題目內容 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
                {/* 題目標題和收藏按鈕 */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1 pt-1">
                        <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-5">
                            {currentQuestion.category_name}
                        </span>
                        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                            {currentQuestion.question_text}
                        </h2>
                    </div>
                    <button
                        onClick={() => handleToggleFavorite(currentQuestion.id)}
                        className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${favoriteQuestions.has(currentQuestion.id)
                                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                        title={favoriteQuestions.has(currentQuestion.id) ? '取消收藏' : '收藏題目'}
                    >
                        <Heart className={`h-5 w-5 ${favoriteQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* 選項 */}
                <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof typeof currentQuestion] as string
                        if (!optionText) return null

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerSelect(option)}
                                className={`question-option w-full text-left ${selectedAnswer === option ? 'selected' : ''
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 font-semibold ${selectedAnswer === option
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-gray-300 text-gray-600'
                                        }`}>
                                        {option}
                                    </div>
                                    <div className="flex-1 py-1">
                                        {optionText}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 底部按鈕 */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    上一題
                </button>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleFinishPractice}
                        className="btn-destructive"
                        disabled={loading}
                    >
                        {loading ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                            <Flag className="mr-2 h-4 w-4" />
                        )}
                        交卷
                    </button>

                    <button
                        onClick={handleNextQuestion}
                        disabled={!selectedAnswer || loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLastQuestion ? '完成' : '下一題'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
} 