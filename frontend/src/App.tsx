import { useEffect } from 'react'
import { Browser } from './components/Browser'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from 'sonner'
import './styles/globals.css'

function App() {
  useEffect(() => {
    // Prevent right-click on production
    if (import.meta.env.PROD) {
      document.addEventListener('contextmenu', (e) => e.preventDefault())
    }
  }, [])

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Browser />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
