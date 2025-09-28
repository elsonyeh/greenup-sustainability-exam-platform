import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download } from 'lucide-react'
import { extractQuestionsFromText } from '../lib/gemini'
import { questionService, categoryService } from '../lib/database'
import * as pdfjsLib from 'pdfjs-dist'

interface ImportedQuestion {
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
  category: string
  difficulty: number
  tags: string[]
  confidence?: number
}

const QuestionImporter: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [importedQuestions, setImportedQuestions] = useState<ImportedQuestion[]>([])
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setStatusMessage('請上傳 PDF 格式的文件')
      setImportStatus('error')
      return
    }

    setIsProcessing(true)
    setImportStatus('processing')
    setStatusMessage('正在讀取 PDF 文件...')

    try {
      // 設置 PDF.js worker 路徑
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

      // 讀取 PDF 文件
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise

      let extractedText = ''

      // 遍歷所有頁面
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        extractedText += pageText + '\n'
      }

      setExtractedText(extractedText)
      setStatusMessage('PDF 讀取完成，正在使用 AI 分析題目...')

      // 使用 Gemini AI 處理文本
      const questions = await extractQuestionsFromText(extractedText)
      setImportedQuestions(questions)
      setStatusMessage(`成功提取 ${questions.length} 道題目`)
      setImportStatus('success')

    } catch (error) {
      console.error('文件處理失敗:', error)
      setStatusMessage('文件處理失敗，請檢查文件格式或網路連接')
      setImportStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImportToDatabase = async () => {
    if (importedQuestions.length === 0) return

    setIsProcessing(true)
    setStatusMessage('正在匯入資料庫...')

    try {
      // 載入分類資料
      if (categories.length === 0) {
        const categoryData = await categoryService.getCategories()
        setCategories(categoryData)
      }

      // 批量匯入題目
      const questionsToImport = importedQuestions.map(q => {
        // 找到對應的分類ID
        const categoryId = categories.find(cat => cat.name === q.category)?.id

        return {
          question: {
            question_text: q.question_text,
            question_type: 'multiple_choice' as const,
            difficulty_level: q.difficulty,
            points: 1,
            time_limit: 60,
            tags: q.tags,
            category_id: categoryId,
            source_file: '匯入檔案'
          },
          options: q.options.map((opt, idx) => ({
            option_text: opt,
            is_correct: idx === q.correct_answer,
            sort_order: idx
          })),
          explanation: q.explanation
        }
      })

      const results = await questionService.bulkImportQuestions(questionsToImport)
      const successCount = results.filter(r => r.success).length

      setStatusMessage(`成功匯入 ${successCount} 道題目到資料庫`)
      setImportStatus('success')

    } catch (error) {
      console.error('資料庫匯入失敗:', error)
      setStatusMessage('資料庫匯入失敗，請檢查網路連接或聯繫管理員')
      setImportStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportQuestions = () => {
    const dataStr = JSON.stringify(importedQuestions, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `questions_export_${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const renderStatusIcon = () => {
    switch (importStatus) {
      case 'processing':
        return <Loader className="w-6 h-6 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      default:
        return <Upload className="w-6 h-6 text-gray-400" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">AI 智能題庫匯入工具</h2>
        <p className="text-gray-600">
          上傳永續發展基礎能力測驗的 PDF 文件，使用 Google Gemini AI 自動提取和分類題目
        </p>
      </div>

      {/* 上傳區域 */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            {renderStatusIcon()}
          </div>

          <h3 className="text-lg font-medium text-gray-800 mb-2">
            上傳 PDF 測驗文件
          </h3>

          <p className="text-gray-600 mb-4">
            支援永續發展基礎能力測驗的 PDF 格式文件，最大 10MB
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
            id="pdf-upload"
          />

          <label
            htmlFor="pdf-upload"
            className={`btn ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'btn-primary cursor-pointer'}`}
          >
            <Upload className="w-5 h-5 mr-2" />
            選擇 PDF 文件
          </label>

          {statusMessage && (
            <div className={`mt-4 p-3 rounded-lg ${
              importStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : importStatus === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* 提取的文本預覽 */}
      {extractedText && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">提取的原始文本</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* AI 處理結果 */}
      {importedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              AI 處理結果 ({importedQuestions.length} 道題目)
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleExportQuestions}
                className="btn btn-outline flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                匯出 JSON
              </button>
              <button
                onClick={handleImportToDatabase}
                disabled={isProcessing}
                className="btn btn-primary flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                匯入資料庫
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {importedQuestions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        題目 {index + 1}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {question.category}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                        難度 {question.difficulty}/5
                      </span>
                      {question.confidence && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          信心度 {question.confidence}%
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      {question.question_text}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-lg border ${
                        optionIndex === question.correct_answer
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>{' '}
                      {option}
                      {optionIndex === question.correct_answer && (
                        <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                      )}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">AI 生成解析</h5>
                    <p className="text-blue-700 text-sm">{question.explanation}</p>
                  </div>
                )}

                {question.tags && question.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionImporter