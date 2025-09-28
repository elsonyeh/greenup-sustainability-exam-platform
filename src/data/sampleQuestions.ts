// 從 PDF 提取的範例題目資料
export const sampleQuestions = [
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
    explanation: "主要不利衝擊(PAIs)的揭露屬於「不利的永續性影響」方面的資訊揭露。根據SFDR規範，金融機構必須揭露其投資對永續發展造成的主要不利影響，這有助於投資者了解投資決策對環境和社會的負面衝擊。",
    category: "經濟永續",
    difficulty: 3,
    tags: ["SFDR", "PAI", "永續投資", "資訊揭露"],
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    explanation: "根據我國永續發展行動方案，20億元以下的上市櫃公司將自2026年開始編製永續報告書。這是為了擴大永續資訊揭露範圍的重要措施，讓更多企業參與永續發展實踐。",
    category: "治理永續",
    difficulty: 2,
    tags: ["永續報告書", "上市櫃公司", "資訊揭露", "台灣法規"],
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    question_text: "因應企業碳盤查需求，對於盤查對象及查驗機構採哪一種方式管理？",
    options: [
      "分類管理",
      "分群管理",
      "分級管理",
      "統一管理"
    ],
    correct_answer: 2,
    explanation: "企業碳盤查採用「分級管理」方式，根據企業規模、排放量等因素進行分級，不同級別的企業有不同的盤查要求和查驗標準，這樣能更有效地管理碳盤查工作。",
    category: "環境永續",
    difficulty: 2,
    tags: ["碳盤查", "溫室氣體", "分級管理", "環境管理"],
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    question_text: "上市上櫃公司永續發展實務守則中，為健全永續發展之管理，推動永續政策需定期向哪一個單位報告？",
    options: [
      "總經理會議",
      "公司業務會議",
      "股東會",
      "董事會"
    ],
    correct_answer: 3,
    explanation: "根據上市上櫃公司永續發展實務守則，推動永續政策需定期向「董事會」報告。董事會作為公司最高治理機構，負責監督永續發展策略的執行和成效。",
    category: "治理永續",
    difficulty: 2,
    tags: ["董事會", "永續治理", "實務守則", "公司治理"],
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    question_text: "根據永續金融揭露規範(SFDR)真正具有落實ESG精神的基金，至少必須符合以下哪些規定？",
    options: [
      "Article 6 或 Article 7",
      "Article 7 或 Article 8",
      "Article 8 或 Article 9",
      "Article 6、Article 7 及 Article 9"
    ],
    correct_answer: 2,
    explanation: "根據SFDR規範，真正具有落實ESG精神的基金至少必須符合「Article 8 或 Article 9」的規定。Article 8是促進環境或社會特徵的基金，Article 9是以永續投資為目標的基金，這兩類基金才真正體現ESG投資精神。",
    category: "經濟永續",
    difficulty: 3,
    tags: ["SFDR", "ESG基金", "永續投資", "Article 8", "Article 9"],
    year: 2023,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const questionCategories = [
  {
    id: 'environmental',
    name: '環境永續',
    description: '環境保護、氣候變遷、資源管理相關議題',
    icon: '🌱',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'social',
    name: '社會永續',
    description: '社會責任、勞工權益、社區發展相關議題',
    icon: '👥',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'economic',
    name: '經濟永續',
    description: '永續金融、綠色投資、循環經濟相關議題',
    icon: '💰',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'governance',
    name: '治理永續',
    description: '企業治理、透明度、風險管理相關議題',
    icon: '🏛️',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'integrated',
    name: '綜合應用',
    description: '跨領域整合、案例分析、政策應用',
    icon: '🎯',
    color: 'bg-red-100 text-red-800'
  }
]