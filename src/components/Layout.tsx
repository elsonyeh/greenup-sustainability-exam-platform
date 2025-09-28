import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Home,
    BookOpen,
    BarChart3,
    Trophy,
    User,
    // Settings,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react'

const navigationItems = [
    { name: '首頁', href: '/', icon: Home },
    { name: '開始練習', href: '/practice', icon: BookOpen },
    { name: '學習統計', href: '/stats', icon: BarChart3 },
    { name: '排行榜', href: '/leaderboard', icon: Trophy },
    { name: '個人檔案', href: '/profile', icon: User },
]

const adminNavigationItems = [
    { name: '管理後台', href: '/admin', icon: Shield },
]

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { profile, signOut, isAdmin } = useAuth()
    const location = useLocation()

    const allNavigationItems = isAdmin
        ? [...navigationItems, ...adminNavigationItems]
        : navigationItems

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 手機版側邊欄背景 */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* 側邊欄 */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold text-primary">永續測驗平台</h1>
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="mt-4 px-2">
                    <div className="space-y-1">
                        {allNavigationItems.map((item) => {
                            const isActive = location.pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* 使用者資訊 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0">
                            {profile?.avatar_url ? (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={profile.avatar_url}
                                    alt={profile.full_name || '使用者'}
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                                {profile?.full_name || profile?.email}
                            </p>
                            {isAdmin && (
                                <p className="text-xs text-primary font-medium">管理員</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        登出
                    </button>
                </div>
            </div>

            {/* 主要內容區域 */}
            <div className="md:pl-64">
                {/* 頂部導航列 */}
                <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <button
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <div className="hidden md:block">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {allNavigationItems.find(item => item.href === location.pathname)?.name || '首頁'}
                                </h2>
                            </div>

                            <div className="flex items-center space-x-4">
                                {/* 這裡可以加入通知、設定等功能 */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 頁面內容 */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
} 