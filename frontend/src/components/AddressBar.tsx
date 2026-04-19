import { useState, useRef, useEffect } from 'react'
import { Search, Lock, Shield, Globe } from 'lucide-react'

interface AddressBarProps {
  url: string
  isLoading: boolean
  onNavigate: (url: string) => void
}

export function AddressBar({ url, isLoading, onNavigate }: AddressBarProps) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isFocused) {
      setInputValue(url)
    }
  }, [url, isFocused])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onNavigate(inputValue.trim())
      inputRef.current?.blur()
    }
  }

  const isSecure = url.startsWith('https://')
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1')

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-2 flex-1 bg-muted rounded-lg px-3 py-1.5 transition-all duration-150 focus-within:ring-2 focus-within:ring-primary/50">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : isSecure ? (
          <Lock className="w-4 h-4 text-accent" />
        ) : isLocalhost ? (
          <Shield className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Globe className="w-4 h-4 text-muted-foreground" />
        )}
        
        <input
          ref={inputRef}
          id="address-bar"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search or enter address"
          className="
            flex-1 bg-transparent border-none outline-none
            text-sm text-foreground placeholder:text-muted-foreground
          "
        />
        
        <Search className="w-4 h-4 text-muted-foreground opacity-50" />
      </div>
    </form>
  )
}
