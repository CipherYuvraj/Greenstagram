import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Conditionally import React Query DevTools only in development
let ReactQueryDevtools: React.ComponentType<any> = () => null;

if (process.env.NODE_ENV === 'development') {
  try {
    const { ReactQueryDevtools: DevTools } = require('@tanstack/react-query-devtools');
    ReactQueryDevtools = DevTools;
  } catch (error) {
    console.warn('React Query DevTools not available:', error);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
