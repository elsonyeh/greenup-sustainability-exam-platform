import React from 'react'
import {
  Home,
  PlayCircle,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react'

type Page = 'dashboard' | 'practice' | 'questions' | 'statistics' | 'admin'

interface NavigationProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navItems = [
    { id: 'dashboard' as Page, label: '首頁', icon: Home },
    { id: 'practice' as Page, label: '開始練習', icon: PlayCircle },
    { id: 'questions' as Page, label: '題庫管理', icon: BookOpen },
    { id: 'statistics' as Page, label: '學習統計', icon: BarChart3 },
    { id: 'admin' as Page, label: '管理後台', icon: Settings }
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto">
        {/* 桌面版導航 */}
        <div className="hidden md:flex items-center gap-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* 移動版導航 */}
        <div className="md:hidden flex items-center justify-between py-3">
          <span className="font-semibold text-gray-800">
            {navItems.find(item => item.id === currentPage)?.label}
          </span>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 移動版菜單 */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation