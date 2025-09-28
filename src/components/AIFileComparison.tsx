import React, { useState, useRef } from 'react'
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  Zap,
  BarChart3,
  Brain
} from 'lucide-react'
import { compareQuestionAndAnswerFiles, batchGenerateExplanations } from '../lib/gemini'
import { questionService, importService, categoryService } from '../lib/database'

interface ComparisonResult {
  comparison_result: {
    total_questions_found: number
    matched_questions: number
    unmatched_questions: number
    duplicate_questions: number
    invalid_questions: number
  }
  quality_analysis: {
    category_distribution: Record<string, number>
    difficulty_distribution: Record<string, number>
    average_quality_score: number
  }
  issues_found: Array<{
    type: string
    description: string
    question_number: string
    severity: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
  processed_questions: Array<{
    question_text: string
    options: string[]
    correct_answer: number
    explanation: string
    category: string
    difficulty_level: number
    tags: string[]
    quality_score: number
  }>
}

const AIFileComparison: React.FC = () => {
  const [questionFile, setQuestionFile] = useState<File | null>(null)
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const questionFileRef = useRef<HTMLInputElement>(null)
  const answerFileRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('載入分類失敗:', error)
    }
  }

  const handleFileUpload = async (file: File, type: 'question' | 'answer') => {
    const text = await file.text()

    if (type === 'question') {
      setQuestionFile(file)
    } else {
      setAnswerFile(file)
    }

    return text
  }

  const analyzeFiles = async () => {
    if (!questionFile || !answerFile) {
      setError('請同時上傳題目檔案和答案檔案')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const questionContent = await questionFile.text()
      const answerContent = await answerFile.text()

      // 使用 AI 比對分析檔案
      const result = await compareQuestionAndAnswerFiles(questionContent, answerContent)
      setComparisonResult(result)

      // 記錄匯入分析
      await importService.createImportLog({
        file_name: `${questionFile.name} + ${answerFile.name}`,
        file_type: 'comparison_analysis',
        file_size: questionFile.size + answerFile.size,
        questions_imported: 0,
        import_status: 'completed',
        ai_analysis_result: result
      })

    } catch (error) {
      console.error('檔案分析失敗:', error)
      setError(error instanceof Error ? error.message : '檔案分析失敗')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const importToDatabase = async () => {
    if (!comparisonResult) return

    setIsImporting(true)
    setImportProgress(0)

    try {
      const { processed_questions } = comparisonResult
      const total = processed_questions.length
      let imported = 0

      for (const [index, questionData] of processed_questions.entries()) {
        try {
          // 找到對應的分類 ID
          const category = categories.find(cat =>
            cat.name === questionData.category ||
            cat.name.includes(questionData.category.split('永續')[0])
          )

          // 準備題目資料
          const question = {
            category_id: category?.id,
            question_text: questionData.question_text,
            question_type: 'multiple_choice' as const,
            difficulty_level: questionData.difficulty_level,
            points: questionData.difficulty_level,
            time_limit: 60,
            tags: questionData.tags,
            source_file: `${questionFile?.name} + ${answerFile?.name}`
          }

          // 準備選項資料
          const options = questionData.options.map((option, idx) => ({
            option_text: option,
            is_correct: idx === questionData.correct_answer,
            sort_order: idx
          }))

          // 匯入到資料庫
          await questionService.bulkImportQuestions([{
            question,
            options,
            explanation: questionData.explanation
          }])

          imported++
          setImportProgress(Math.round((imported / total) * 100))

          // 避免過快請求
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          console.error(`匯入題目 ${index + 1} 失敗:`, error)
        }
      }

      // 更新匯入記錄
      const logs = await importService.getImportLogs(1)
      if (logs.length > 0) {
        await importService.updateImportLog(logs[0].id, {
          questions_imported: imported,
          import_status: imported === total ? 'completed' : 'partial'
        })
      }

      alert(`成功匯入 ${imported}/${total} 個題目到資料庫！`)

    } catch (error) {
      console.error('匯入資料庫失敗:', error)
      setError(error instanceof Error ? error.message : '匯入資料庫失敗')
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const generateAdditionalExplanations = async () => {
    if (!comparisonResult) return

    try {
      const questions = comparisonResult.processed_questions.map(q => ({
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer
      }))

      const explanations = await batchGenerateExplanations(questions)

      // 更新結果中的解析
      const updatedResult = {
        ...comparisonResult,
        processed_questions: comparisonResult.processed_questions.map((q, idx) => ({
          ...q,
          explanation: explanations[idx] || q.explanation
        }))
      }

      setComparisonResult(updatedResult)
      alert('AI 解析生成完成！')

    } catch (error) {
      console.error('生成解析失敗:', error)
      setError('生成解析失敗')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-primary">AI 檔案比對與匯入工具</h2>
      </div>

      {/* 檔案上傳區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            題目檔案
          </h3>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => questionFileRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">
              {questionFile ? questionFile.name : '點擊上傳題目檔案 (.txt, .pdf, .docx)'}
            </p>
          </div>
          <input
            ref={questionFileRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'question')}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            答案檔案
          </h3>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => answerFileRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">
              {answerFile ? answerFile.name : '點擊上傳答案檔案 (.txt, .pdf, .docx)'}
            </p>
          </div>
          <input
            ref={answerFileRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'answer')}
          />
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={analyzeFiles}
          disabled={!questionFile || !answerFile || isAnalyzing}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              AI 分析中...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              開始 AI 分析
            </>
          )}
        </button>

        {comparisonResult && (
          <>
            <button
              onClick={generateAdditionalExplanations}
              className="btn btn-secondary"
            >
              <Brain className="w-4 h-4 mr-2" />
              生成詳細解析
            </button>

            <button
              onClick={importToDatabase}
              disabled={isImporting}
              className="btn btn-primary disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  匯入中... {importProgress}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  匯入資料庫
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">錯誤</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* 分析結果 */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* 統計概覽 */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              分析結果概覽
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {comparisonResult.comparison_result.total_questions_found}
                </div>
                <div className="text-sm text-gray-600">總題目數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {comparisonResult.comparison_result.matched_questions}
                </div>
                <div className="text-sm text-gray-600">匹配成功</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {comparisonResult.comparison_result.unmatched_questions}
                </div>
                <div className="text-sm text-gray-600">未匹配</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {comparisonResult.comparison_result.invalid_questions}
                </div>
                <div className="text-sm text-gray-600">無效題目</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {comparisonResult.quality_analysis.average_quality_score}/10
                </div>
                <div className="text-sm text-gray-600">平均品質</div>
              </div>
            </div>
          </div>

          {/* 問題列表 */}
          {comparisonResult.issues_found.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                發現的問題
              </h3>
              <div className="space-y-2">
                {comparisonResult.issues_found.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <span className="font-medium">{issue.type}</span>
                      <span className="text-sm opacity-75">#{issue.question_number}</span>
                    </div>
                    <p className="mt-1 text-sm">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 建議 */}
          {comparisonResult.recommendations.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                改善建議
              </h3>
              <ul className="space-y-2">
                {comparisonResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 題目預覽 */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              處理後的題目預覽 (前 3 題)
            </h3>
            <div className="space-y-4">
              {comparisonResult.processed_questions.slice(0, 3).map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">題目 {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {question.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 rounded">
                        難度 {question.difficulty_level}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 rounded">
                        品質 {question.quality_score}/10
                      </span>
                    </div>
                  </div>
                  <p className="font-medium mb-3">{question.question_text}</p>
                  <div className="space-y-1 mb-3">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded text-sm ${
                          optIndex === question.correct_answer
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-800">
                        <strong>解析：</strong>{question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIFileComparison