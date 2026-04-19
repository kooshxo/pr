import { useRef, useEffect, useState } from 'react'
import { useBrowserStore } from '../stores/browserStore'
import { Loader2, AlertCircle } from 'lucide-react'

interface WebViewProps {
  tabId: string
  url: string
  isActive: boolean
}

const API_PATH = '/api'

export function WebView({ tabId, url, isActive }: WebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { updateTab } = useBrowserStore()

  const proxyUrl = `${API_PATH}/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    if (isActive) {
      setIsLoading(true)
      setError(null)
      updateTab(tabId, { isLoading: true })
    }
  }, [url, isActive, tabId, updateTab])

  const handleLoad = () => {
    setIsLoading(false)
    updateTab(tabId, { isLoading: false })
  }

  const handleError = () => {
    setIsLoading(false)
    setError('Failed to load page')
    updateTab(tabId, { isLoading: false })
  }

  if (error && isActive) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load page</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null)
            setIsLoading(true)
            updateTab(tabId, { isLoading: true })
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`absolute inset-0 ${isActive ? 'z-10' : 'z-0 hidden'}`}>
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        title={`Tab ${tabId}`}
      />
    </div>
  )
}
