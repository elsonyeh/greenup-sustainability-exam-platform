import React from 'react'
import { Leaf, User, Settings, LogOut } from 'lucide-react'

interface HeaderProps {
  user: any // 待實現用戶型別
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-4">
          {/* Logo 和標題 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">GreenUP</h1>
              <p className="text-sm text-secondary">永續發展基礎能力測驗練習平台</p>
            </div>
          </div>

          {/* 用戶區域 */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.full_name || user.email}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-100">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-error transition-colors rounded-lg hover:bg-gray-100">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button className="btn btn-outline">
                  登入
                </button>
                <button className="btn btn-primary">
                  註冊
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header