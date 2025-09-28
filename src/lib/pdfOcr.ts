import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'

// 設定 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

interface OCRResult {
  text: string
  confidence: number
  pages: PageOCRResult[]
}

interface PageOCRResult {
  pageNumber: number
  text: string
  confidence: number
  boundingBoxes: TextBox[]
}

interface TextBox {
  text: string
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

interface ParsedQuestion {
  questionNumber: number
  questionText: string
  options: {
    A?: string
    B?: string
    C?: string
    D?: string
  }
  correctAnswer?: 'A' | 'B' | 'C' | 'D'
  explanation?: string
  confidence: number
}

interface PDFOCROptions {
  language?: string
  enableImageOCR?: boolean
  enableTextExtraction?: boolean
  ocrEngine?: Tesseract.OEM
  pageSegmentationMode?: Tesseract.PSM
}

// 主要的 PDF OCR 處理函數
export async function processPDFWithOCR(
  file: File,
  options: PDFOCROptions = {}
): Promise<OCRResult> {
  const {
    language = 'chi_tra',
    enableImageOCR = true,
    enableTextExtraction = true,
    // ocrEngine = Tesseract.OEM.LSTM_ONLY,
    // pageSegmentationMode = Tesseract.PSM.AUTO
  } = options

  try {
    // 轉換 File 為 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    
    // 載入 PDF 文件
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages
    
    const pages: PageOCRResult[] = []
    let allText = ''

    // 處理每一頁
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      
      let pageText = ''
      let pageConfidence = 0
      const boundingBoxes: TextBox[] = []

      // 嘗試直接提取文字（適用於可選取的 PDF）
      if (enableTextExtraction) {
        try {
          const textContent = await page.getTextContent()
          const extractedText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          
          if (extractedText.trim().length > 50) {
            pageText = extractedText
            pageConfidence = 0.95 // 直接提取的文字信心度較高
          }
        } catch (error) {
          console.warn(`直接文字提取失敗 (第 ${pageNum} 頁):`, error)
        }
      }

      // 如果直接提取失敗或文字太少，使用 OCR
      if (enableImageOCR && (!pageText || pageText.trim().length < 50)) {
        try {
          // 將 PDF 頁面轉換為圖片
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')!
          const viewport = page.getViewport({ scale: 2.0 })
          
          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          // 使用 Tesseract 進行 OCR
          const ocrResult = await Tesseract.recognize(
            canvas,
            language,
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR 進度 (第 ${pageNum} 頁): ${Math.round(m.progress * 100)}%`)
                }
              }
            }
          )

          pageText = ocrResult.data.text
          pageConfidence = ocrResult.data.confidence / 100

          // 提取文字框位置資訊
          ocrResult.data.words.forEach(word => {
            if (word.confidence > 60) { // 只保留信心度較高的文字
              boundingBoxes.push({
                text: word.text,
                confidence: word.confidence / 100,
                x: word.bbox.x0,
                y: word.bbox.y0,
                width: word.bbox.x1 - word.bbox.x0,
                height: word.bbox.y1 - word.bbox.y0
              })
            }
          })

        } catch (error) {
          console.error(`OCR 處理失敗 (第 ${pageNum} 頁):`, error)
          pageText = ''
          pageConfidence = 0
        }
      }

      pages.push({
        pageNumber: pageNum,
        text: pageText,
        confidence: pageConfidence,
        boundingBoxes
      })

      allText += pageText + '\n\n'
    }

    // 計算整體信心度
    const overallConfidence = pages.reduce((sum, page) => sum + page.confidence, 0) / pages.length

    return {
      text: allText.trim(),
      confidence: overallConfidence,
      pages
    }

  } catch (error) {
    console.error('PDF OCR 處理錯誤:', error)
    throw new Error('PDF 文件處理失敗')
  }
}

// 解析題目結構
export function parseQuestionsFromText(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  
  try {
    // 正則表達式匹配題目格式
    const questionPattern = /(\d+)[\.\)]\s*([^A-D]*?)(?=A[\.\)]\s*|$)(A[\.\)]\s*[^B]*?)(?=B[\.\)]\s*|$)(B[\.\)]\s*[^C]*?)(?=C[\.\)]\s*|$)(C[\.\)]\s*[^D]*?)(?=D[\.\)]\s*|$)(D[\.\)]\s*[^答案]*?)(?=答案|解析|\d+[\.\)]|$)/gs

    let match
    while ((match = questionPattern.exec(text)) !== null) {
      const [, questionNum, questionText, optionA, optionB, optionC, optionD] = match

      const question: ParsedQuestion = {
        questionNumber: parseInt(questionNum),
        questionText: cleanText(questionText),
        options: {
          A: cleanOptionText(optionA),
          B: cleanOptionText(optionB),
          C: cleanOptionText(optionC),
          D: cleanOptionText(optionD)
        },
        confidence: 0.8 // 基本信心度
      }

      // 嘗試找到正確答案
      const answerPattern = new RegExp(`${questionNum}[^\\d]*?答案[：:]?\\s*([ABCD])`, 'i')
      const answerMatch = text.match(answerPattern)
      if (answerMatch) {
        question.correctAnswer = answerMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D'
        question.confidence += 0.1
      }

      // 嘗試找到解析
      const explanationPattern = new RegExp(`${questionNum}[^\\d]*?(?:解析|說明)[：:]?\\s*([^\\d]*?)(?=\\d+[\\.\\)]|$)`, 'is')
      const explanationMatch = text.match(explanationPattern)
      if (explanationMatch) {
        question.explanation = cleanText(explanationMatch[1])
        question.confidence += 0.1
      }

      questions.push(question)
    }

    // 如果沒找到標準格式，嘗試其他格式
    if (questions.length === 0) {
      return parseAlternativeFormats(text)
    }

    return questions.sort((a, b) => a.questionNumber - b.questionNumber)

  } catch (error) {
    console.error('題目解析錯誤:', error)
    return []
  }
}

// 解析其他格式的題目
function parseAlternativeFormats(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  
  // 嘗試解析簡單的編號格式
  const lines = text.split('\n').filter(line => line.trim())
  let currentQuestion: Partial<ParsedQuestion> | null = null
  let questionCounter = 1

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 檢查是否為題目開始（包含數字或特定關鍵字）
    if (/^\d+[\.\)]/.test(trimmedLine) || /^題目|^問題/.test(trimmedLine)) {
      if (currentQuestion) {
        questions.push(currentQuestion as ParsedQuestion)
      }
      
      currentQuestion = {
        questionNumber: questionCounter++,
        questionText: cleanText(trimmedLine.replace(/^\d+[\.\)]/, '')),
        options: {},
        confidence: 0.6
      }
    }
    // 檢查選項
    else if (currentQuestion && /^[ABCD][\.\)]/.test(trimmedLine)) {
      const option = trimmedLine[0] as 'A' | 'B' | 'C' | 'D'
      currentQuestion.options![option] = cleanText(trimmedLine.substring(2))
    }
    // 檢查答案
    else if (currentQuestion && /答案|正確答案/.test(trimmedLine)) {
      const answerMatch = trimmedLine.match(/[ABCD]/)
      if (answerMatch) {
        currentQuestion.correctAnswer = answerMatch[0] as 'A' | 'B' | 'C' | 'D'
      }
    }
    // 累積題目文字
    else if (currentQuestion && trimmedLine && !currentQuestion.options!.A) {
      currentQuestion.questionText += ' ' + trimmedLine
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion as ParsedQuestion)
  }

  return questions
}

// 清理文字
function cleanText(text: string): string {
  return text
    .replace(/[\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 清理選項文字
function cleanOptionText(text: string): string {
  return text
    .replace(/^[ABCD][\.\)]\s*/, '')
    .replace(/[\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 驗證題目完整性
export function validateParsedQuestions(questions: ParsedQuestion[]): ParsedQuestion[] {
  return questions.filter(q => {
    // 檢查基本要求
    const hasQuestionText = q.questionText && q.questionText.length > 10
    const hasOptions = Object.keys(q.options).length >= 2
    const hasValidOptions = Object.values(q.options).every(opt => opt && opt.length > 1)
    
    return hasQuestionText && hasOptions && hasValidOptions
  })
}

// 批量處理多個 PDF 檔案
export async function processBatchPDFs(
  files: File[],
  options: PDFOCROptions = {},
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<{ [fileName: string]: OCRResult }> {
  const results: { [fileName: string]: OCRResult } = {}
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress(i + 1, files.length, file.name)
    }
    
    try {
      const result = await processPDFWithOCR(file, options)
      results[file.name] = result
    } catch (error) {
      console.error(`處理 ${file.name} 時發生錯誤:`, error)
      results[file.name] = {
        text: '',
        confidence: 0,
        pages: []
      }
    }
  }
  
  return results
}

// 檢查檔案是否為 PDF
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

// 估算處理時間
export function estimateProcessingTime(file: File, enableOCR: boolean = true): number {
  const fileSizeMB = file.size / (1024 * 1024)
  
  if (!enableOCR) {
    return Math.max(2, fileSizeMB * 0.5) // 純文字提取較快
  }
  
  // OCR 處理時間估算（每 MB 約需 30-60 秒）
  return Math.max(10, fileSizeMB * 45)
} 