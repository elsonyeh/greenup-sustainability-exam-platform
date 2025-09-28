import React, { useState } from 'react'
import './styles/globals.css'
import Header from './components/Header'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import QuestionBank from './components/QuestionBank'
import Statistics from './components/Statistics'
import AdminPanel from './components/AdminPanel'

type Page = 'dashboard' | 'practice' | 'questions' | 'statistics' | 'admin'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [user, setUser] = useState(null) // 待實現用戶認證

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'practice':
        return <Practice />
      case 'questions':
        return <QuestionBank />
      case 'statistics':
        return <Statistics />
      case 'admin':
        return <AdminPanel />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="container mx-auto py-8">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
