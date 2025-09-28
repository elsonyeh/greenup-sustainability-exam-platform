import React, { useState } from 'react'
import {
  Shuffle,
  BookOpen,
  Heart,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

const Practice: React.FC = () => {
  const [practiceMode, setPracticeMode] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  // 模擬題目資料
  const sampleQuestions = [
    {
      id: 1,
      question_text: "若投資決策對於永續造成「主要不利衝擊」(PAIs)須加以揭露；這是屬於下列哪方面的資訊揭露？",
      options: [
        "永續性風險政策",
        "產品的獲利性揭露",
        "不利的永續性影響",
        "產品級別揭露"
      ],
      correct_answer: 2,
      explanation: "主要不利衝擊(PAIs)的揭露屬於「不利的永續性影響」方面的資訊揭露。根據SFDR規範，金融機構必須揭露其投資對永續發展造成的主要不利影響。",
      category: "經濟永續",
      difficulty: 3
    },
    {
      id: 2,
      question_text: "我國推動上市櫃公司永續發展行動方案，擴大永續資訊揭露範圍，將自哪一年推動20億元以下的上市櫃公司編製永續報告書？",
      options: [
        "2023年",
        "2024年",
        "2025年",
        "2026年"
      ],
      correct_answer: 3,
      explanation: "根據我國永續發展行動方案，20億元以下的上市櫃公司將自2026年開始編製永續報告書，這是為了擴大永續資訊揭露範圍的重要措施。",
      category: "治理永續",
      difficulty: 2
    }
  ]

  const practiceTypes = [
    {
      id: 'random',
      title: '隨機練習',
      description: '從所有題目中隨機抽取，全面提升能力',
      icon: Shuffle,
      color: 'bg-blue-500',
      questionCount: 1250
    },
    {
      id: 'category',
      title: '分類練習',
      description: '按照永續發展分類進行專項練習',
      icon: BookOpen,
      color: 'bg-green-500',
      questionCount: 1250
    },
    {
      id: 'favorites',
      title: '收藏複習',
      description: '複習您收藏的重要題目',
      icon: Heart,
      color: 'bg-pink-500',
      questionCount: 45
    },
    {
      id: 'wrong_questions',
      title: '錯題強化',
      description: '針對答錯的題目進行強化練習',
      icon: RotateCcw,
      color: 'bg-orange-500',
      questionCount: 23
    }
  ]

  const handleStartPractice = (mode: string) => {
    setPracticeMode(mode)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleBackToSelection = () => {
    setPracticeMode(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  if (!practiceMode) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">選擇練習模式</h2>
          <p className="text-lg text-gray-600">選擇適合的練習方式，開始您的永續發展學習之旅</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceTypes.map((type) => {
            const Icon = type.icon
            return (
              <div key={type.id} className="card bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                   onClick={() => handleStartPractice(type.id)}>
                <div className="text-center">
                  <div className={`w-16 h-16 ${type.color} rounded-2xl mx-auto mb-4 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    {type.questionCount} 道題目
                  </div>
                  <button className="btn btn-primary w-full">
                    開始練習
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 練習統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">85%</div>
              <div className="text-gray-600">平均正確率</div>
            </div>
          </div>
          <div className="card bg-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">342</div>
              <div className="text-gray-600">已完成題數</div>
            </div>
          </div>
          <div className="card bg-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">7</div>
              <div className="text-gray-600">連續練習天數</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 練習模式界面
  const question = sampleQuestions[currentQuestion]
  const isCorrect = selectedAnswer === question.correct_answer

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 練習頂部信息 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToSelection}
          className="btn btn-outline flex items-center gap-2"
        >
          ← 返回選擇
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>02:35</span>
          </div>
          <div className="text-gray-600">
            {currentQuestion + 1} / {sampleQuestions.length}
          </div>
        </div>
      </div>

      {/* 進度條 */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
        />
      </div>

      {/* 題目卡片 */}
      <div className="card bg-white">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
              {question.category}
            </span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
              難度 {question.difficulty}/5
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
            {question.question_text}
          </h3>
        </div>

        {/* 選項 */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedAnswer === index
                  ? showResult
                    ? index === question.correct_answer
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : 'border-primary bg-primary-light/10 text-primary'
                  : showResult && index === question.correct_answer
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {showResult && (
                  <div className="ml-auto">
                    {index === question.correct_answer ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : selectedAnswer === index ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* 結果和解析 */}
        {showResult && (
          <div className="border-t pt-6">
            <div className={`p-4 rounded-lg mb-4 ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '答對了！' : '答錯了！'}
                </span>
              </div>
              <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                正確答案是：{String.fromCharCode(65 + question.correct_answer)}. {question.options[question.correct_answer]}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">詳細解析</h4>
              <p className="text-blue-700">{question.explanation}</p>
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex justify-between mt-6">
          <button className="btn btn-outline">
            <Heart className="w-5 h-5 mr-2" />
            收藏
          </button>

          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交答案
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
            >
              {currentQuestion < sampleQuestions.length - 1 ? '下一題' : '完成練習'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Practice