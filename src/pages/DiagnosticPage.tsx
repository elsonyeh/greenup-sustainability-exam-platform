import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

export default function DiagnosticPage() {
    // 檢查環境變數
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

    const checks = [
        {
            name: 'VITE_SUPABASE_URL',
            value: SUPABASE_URL,
            required: true,
            displayValue: SUPABASE_URL
        },
        {
            name: 'VITE_SUPABASE_ANON_KEY',
            value: SUPABASE_ANON_KEY,
            required: true,
            displayValue: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : undefined
        },
        {
            name: 'VITE_GEMINI_API_KEY',
            value: GEMINI_API_KEY,
            required: false,
            displayValue: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 20)}...` : undefined
        }
    ]

    const allRequired = checks.filter(c => c.required).every(c => c.value)
    const allPassed = checks.every(c => c.value)

    // 輸出到 console
    console.log('=== Vercel 環境變數診斷 ===')
    checks.forEach(check => {
        console.log(`${check.name}:`, check.value ? '✓ Set' : '✗ Missing')
        if (check.value && check.name === 'VITE_SUPABASE_URL') {
            console.log('  Value:', check.value)
        }
    })
    console.log('Environment Mode:', import.meta.env.MODE)
    console.log('Is Production:', import.meta.env.PROD)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* 標題 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">🔍 Vercel 環境變數診斷工具</h1>
                <p className="text-white/90">檢查 Vercel 部署的環境變數是否正確設置</p>
            </div>

            {/* 總結狀態 */}
            <div className={`card p-6 border-2 ${allRequired ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className="flex items-start">
                    {allRequired ? (
                        <CheckCircle className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
                    ) : (
                        <XCircle className="h-8 w-8 text-red-600 mr-4 flex-shrink-0" />
                    )}
                    <div>
                        <h2 className={`text-2xl font-bold mb-2 ${allRequired ? 'text-green-900' : 'text-red-900'}`}>
                            {allRequired ? '✅ 必需的環境變數已設置' : '❌ 有必需的環境變數缺失'}
                        </h2>
                        <p className={allRequired ? 'text-green-700' : 'text-red-700'}>
                            {allRequired
                                ? '所有必需的環境變數都已正確設置。如果網站仍然無法載入，問題可能不是環境變數。'
                                : '請在 Vercel Dashboard 的 Settings → Environment Variables 中添加缺失的環境變數，然後重新部署。'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 環境資訊 */}
            <div className="card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    環境資訊
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">環境模式</div>
                        <div className="font-semibold text-gray-900">{import.meta.env.MODE}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">是否為生產環境</div>
                        <div className="font-semibold text-gray-900">{import.meta.env.PROD ? '是' : '否'}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Base URL</div>
                        <div className="font-semibold text-gray-900">{import.meta.env.BASE_URL}</div>
                    </div>
                </div>
            </div>

            {/* 環境變數檢查結果 */}
            <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">環境變數檢查結果</h2>
                <div className="space-y-4">
                    {checks.map((check, index) => (
                        <div key={index} className={`p-4 rounded-lg border-2 ${
                            check.value
                                ? 'border-green-500 bg-green-50'
                                : check.required
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-yellow-500 bg-yellow-50'
                        }`}>
                            <div className="flex items-start">
                                {check.value ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                ) : check.required ? (
                                    <XCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 mb-1">
                                        {check.name}
                                        {check.required && <span className="ml-2 text-red-600 text-sm">(必需)</span>}
                                    </div>
                                    {check.value ? (
                                        <div className="text-sm text-gray-700">
                                            <div className="font-medium text-green-700 mb-1">✓ 已設置</div>
                                            <code className="bg-white px-2 py-1 rounded text-xs break-all">
                                                {check.displayValue}
                                            </code>
                                        </div>
                                    ) : (
                                        <div className={`text-sm ${check.required ? 'text-red-700' : 'text-yellow-700'}`}>
                                            ✗ 未設置或無法讀取
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 修復指南 */}
            {!allRequired && (
                <div className="card p-6 bg-red-50 border-2 border-red-200">
                    <h2 className="text-xl font-bold mb-4 text-red-900">🚀 修復步驟</h2>
                    <div className="space-y-3 text-red-800">
                        <div className="flex items-start">
                            <span className="font-bold mr-2">1.</span>
                            <span>前往 <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Vercel Dashboard</a></span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">2.</span>
                            <span>選擇你的專案，點擊 Settings → Environment Variables</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">3.</span>
                            <span>添加缺失的環境變數（名稱必須完全一致）</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">4.</span>
                            <span>勾選 Production、Preview、Development</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold mr-2">5.</span>
                            <span>回到 Deployments 頁面，點擊 Redeploy（不要勾選 Use existing Build Cache）</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Console 提示 */}
            <div className="card p-6 bg-blue-50 border-2 border-blue-200">
                <h2 className="text-xl font-bold mb-2 text-blue-900">💡 提示</h2>
                <p className="text-blue-800">
                    詳細的診斷資訊已輸出到瀏覽器 Console（按 F12 → Console 標籤查看）
                </p>
            </div>
        </div>
    )
}
