import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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

// 模擬題目數據（實際會從 Supabase 獲取）
const mockQuestions = [
    {
        id: '1',
        question_text: '下列何者是聯合國永續發展目標（SDGs）的核心原則？',
        option_a: '經濟成長優先',
        option_b: '不讓任何人掉隊（Leave No One Behind）',
        option_c: '利潤最大化',
        option_d: '快速工業化',
        correct_answer: 'B' as const,
        explanation: '「不讓任何人掉隊」是聯合國永續發展目標的核心原則，強調包容性發展。',
        category_name: '綜合應用',
        difficulty_level: 2
    },
    {
        id: '2',
        question_text: '循環經濟的三大原則不包括下列何者？',
        option_a: '設計消除廢棄物和污染',
        option_b: '維持產品和材料的使用',
        option_c: '最大化產品產量',
        option_d: '再生自然系統',
        correct_answer: 'C' as const,
        explanation: '循環經濟的三大原則是：1.設計消除廢棄物和污染、2.維持產品和材料的使用、3.再生自然系統。',
        category_name: '經濟永續',
        difficulty_level: 3
    }
]

export default function PracticePage() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuth()

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({})
    const [showResult, setShowResult] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 分鐘
    const [practiceStarted, setPracticeStarted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [favoriteQuestions, setFavoriteQuestions] = useState<Set<string>>(new Set())

    const currentQuestion = mockQuestions[currentQuestionIndex]
    const totalQuestions = mockQuestions.length
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1

    // 計時器
    useEffect(() => {
        if (!practiceStarted) return

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
    }, [practiceStarted])

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartPractice = () => {
        setPracticeStarted(true)
    }

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer)
    }

    const handleNextQuestion = () => {
        if (selectedAnswer) {
            setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: selectedAnswer
            }))
        }

        if (isLastQuestion) {
            handleFinishPractice()
        } else {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedAnswer(answers[mockQuestions[currentQuestionIndex + 1]?.id] || null)
        }
    }

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
            setSelectedAnswer(answers[mockQuestions[currentQuestionIndex - 1]?.id] || null)
        }
    }

    const handleToggleFavorite = (questionId: string) => {
        setFavoriteQuestions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(questionId)) {
                newSet.delete(questionId)
            } else {
                newSet.add(questionId)
            }
            return newSet
        })
    }

    const handleFinishPractice = async () => {
        setLoading(true)
        // 這裡會保存結果到 Supabase
        setTimeout(() => {
            setShowResult(true)
            setLoading(false)
        }, 1000)
    }

    const calculateResults = () => {
        const totalAnswered = Object.keys(answers).length
        const correctAnswers = Object.entries(answers).filter(([questionId, answer]) => {
            const question = mockQuestions.find(q => q.id === questionId)
            return question && question.correct_answer === answer
        }).length

        return {
            totalAnswered,
            correctAnswers,
            accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0,
            score: correctAnswers * 5 // 每題 5 分
        }
    }

    // 開始練習頁面
    if (!practiceStarted) {
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
        const results = calculateResults()

        return (
            <div className="max-w-4xl mx-auto">
                <div className="card text-center">
                    <div className="card-content">
                        <div className="mb-8">
                            {results.accuracy >= 80 ? (
                                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            ) : results.accuracy >= 60 ? (
                                <Clock className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                            ) : (
                                <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                            )}

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                練習完成！
                            </h1>
                            <p className="text-gray-600">
                                恭喜您完成了本次練習，以下是您的成績統計
                            </p>
                        </div>

                        {/* 成績統計 */}
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            <div className="stats-card">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{results.score}</p>
                                    <p className="text-sm text-gray-600">總分</p>
                                </div>
                            </div>
                            <div className="stats-card">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">{results.accuracy}%</p>
                                    <p className="text-sm text-gray-600">正確率</p>
                                </div>
                            </div>
                            <div className="stats-card">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-purple-600">{results.correctAnswers}</p>
                                    <p className="text-sm text-gray-600">答對題數</p>
                                </div>
                            </div>
                            <div className="stats-card">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-orange-600">{formatTime(30 * 60 - timeRemaining)}</p>
                                    <p className="text-sm text-gray-600">使用時間</p>
                                </div>
                            </div>
                        </div>

                        {/* 操作按鈕 */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-outline"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                重新練習
                            </button>
                            <button
                                onClick={() => navigate('/stats')}
                                className="btn-primary"
                            >
                                查看詳細統計
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 練習進行中
    return (
        <div className="max-w-4xl mx-auto">
            {/* 頂部進度條 */}
            <div className="card mb-6">
                <div className="card-content">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                題目 {currentQuestionIndex + 1} / {totalQuestions}
                            </span>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className={`text-sm font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleToggleFavorite(currentQuestion.id)}
                            className={`p-2 rounded-lg transition-colors ${favoriteQuestions.has(currentQuestion.id)
                                    ? 'text-red-500 bg-red-50'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                        >
                            <Heart className={`h-5 w-5 ${favoriteQuestions.has(currentQuestion.id) ? 'fill-current' : ''
                                }`} />
                        </button>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 題目內容 */}
            <div className="card mb-6">
                <div className="card-content">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
                                {currentQuestion.category_name}
                            </span>
                            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                                {currentQuestion.question_text}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i < currentQuestion.difficulty_level ? 'bg-yellow-400' : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
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
                                    <div className="flex items-start">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 mt-0.5 ${selectedAnswer === option
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-gray-300'
                                            }`}>
                                            {option}
                                        </div>
                                        <div className="flex-1">
                                            {optionText}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
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