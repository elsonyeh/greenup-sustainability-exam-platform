import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 建立 React Query 客戶端
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 分鐘
            gcTime: 1000 * 60 * 10, // 10 分鐘
            retry: (failureCount, error: any) => {
                // 不重試 4xx 錯誤
                if (error?.status >= 400 && error?.status < 500) {
                    return false
                }
                return failureCount < 3
            },
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>,
) 