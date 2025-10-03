import {
    BookOpen,
    BarChart3,
    Trophy,
    Target,
    Mail,
    MapPin,
    Clock,
    Users,
    Lightbulb,
    Shield,
    Globe,
    Award,
    CheckCircle
} from 'lucide-react'

export default function AboutPage() {
    const features = [
        {
            icon: BookOpen,
            title: '智慧練習',
            description: '根據您的學習進度推薦合適的題目，提升學習效率',
            color: 'bg-blue-500'
        },
        {
            icon: BarChart3,
            title: '詳細統計',
            description: '追蹤您的學習進度，分析強弱項目',
            color: 'bg-green-500'
        },
        {
            icon: Trophy,
            title: '排行榜',
            description: '與其他學習者競爭，激發學習動機',
            color: 'bg-yellow-500'
        },
        {
            icon: Target,
            title: '錯題複習',
            description: '針對性複習錯題，確實掌握知識要點',
            color: 'bg-red-500'
        }
    ]

    const technologies = [
        { name: 'TG-CI 氣候影響波動指數', description: '先進的氣候風險評估技術' },
        { name: 'AI 演算法', description: '整合大數據與雲端運算' },
        { name: '機器學習預測模型', description: '精準的氣候風險分析' },
        { name: 'TCFD 框架', description: '符合國際氣候相關財務揭露準則' }
    ]

    const partners = [
        '高雄金融科技創新園區',
        '台灣人工智慧協會',
        '中山大學創業育成中心',
        'Google Cloud',
        'AWS',
        'NVIDIA'
    ]

    return (
        <div className="space-y-12">
            {/* Hero 區塊 */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 text-white opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
                <div className="relative z-10">
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
                        <Globe className="h-4 w-4 mr-2" />
                        永續發展 · 創新科技
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">關於我們</h1>
                    <p className="text-xl text-white/90 max-w-3xl">
                        致力於推動永續發展教育與氣候風險評估的創新科技公司
                    </p>
                </div>
                {/* 裝飾性背景元素 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* 公司介紹 */}
            <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">中山永續金融科技</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-500 mx-auto rounded-full mb-6"></div>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Ai FinTech Corp. 運用 AI 驅動的氣候風險評估與科學建模技術，
                        為企業和投資提供精準的氣候風險分析，支持永續投資與策略決策。
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* 核心使命 */}
                    <div className="card p-8 hover:shadow-xl transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl mr-4">
                                <Lightbulb className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">核心使命</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            利用 AI 驅動的氣候風險評估與科學建模技術，提供精準的氣候風險分析，
                            協助企業實現永續發展目標，推動綠色金融創新。
                        </p>
                    </div>

                    {/* 技術優勢 */}
                    <div className="card p-8 hover:shadow-xl transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-green-100 rounded-xl mr-4">
                                <Shield className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">技術優勢</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            整合大數據、雲端運算與機器學習，分析 8 種物理風險類型：
                            溫度、海水、洪水、乾旱、山崩、空氣污染、颱風、地震。
                        </p>
                    </div>
                </div>
            </div>

            {/* 平台核心功能 */}
            <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">平台核心功能</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-500 mx-auto rounded-full mb-6"></div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        專為永續發展學習設計的全方位平台，提供最優質的學習體驗
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                                style={{ animationDelay: `${0.4 + index * 0.15}s` }}
                            >
                                <div className="text-center">
                                    <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* 裝飾性背景 */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>

                                {/* 底部裝飾線 */}
                                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 核心技術 */}
            <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">核心技術</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {technologies.map((tech, index) => (
                        <div key={index} className="flex items-start p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                            <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{tech.name}</h3>
                                <p className="text-gray-600">{tech.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 合作夥伴 */}
            <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">合作夥伴</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {partners.map((partner, index) => (
                        <div key={index} className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="flex items-center">
                                <Award className="h-5 w-5 text-primary mr-2" />
                                <span className="text-gray-700 font-medium">{partner}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 聯絡資訊 */}
            <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.7s_forwards]">
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">聯絡我們</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-white rounded-2xl shadow-md mb-4">
                                <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">地址</h3>
                            <p className="text-gray-600 text-sm">
                                高雄金融科技創新園區<br />
                                高雄市前鎮區復興四路1號
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-white rounded-2xl shadow-md mb-4">
                                <Clock className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">營業時間</h3>
                            <p className="text-gray-600 text-sm">
                                週一至週五<br />
                                09:00 - 18:00
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-white rounded-2xl shadow-md mb-4">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">電子郵件</h3>
                            <a
                                href="mailto:aifinsysco@gmail.com"
                                className="text-primary hover:underline text-sm break-all"
                            >
                                aifinsysco@gmail.com
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <a
                            href="https://aifinsys.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <Globe className="h-5 w-5 mr-2" />
                            造訪官方網站
                        </a>
                    </div>
                </div>
            </div>

            {/* 版權資訊 */}
            <div className="text-center py-8 border-t border-gray-200 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards]">
                <p className="text-gray-600 text-sm">
                    © 2024 Ai FinTech Corp. (中山永續金融科技) All rights reserved.
                </p>
                <p className="text-gray-500 text-xs mt-2">
                    運用 AI 驅動的氣候風險評估與科學建模技術，為永續發展賦能
                </p>
            </div>
        </div>
    )
}
