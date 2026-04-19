import { useState } from 'react'
import { 
  X, 
  Moon, 
  Sun, 
  Palette, 
  TreePine, 
  Waves,
  Keyboard,
  Info,
  Check
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useBrowserStore } from '../stores/browserStore'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { clearHistory, clearHistoryOlderThan } = useBrowserStore()
  const [activeTab, setActiveTab] = useState<'appearance' | 'shortcuts' | 'privacy' | 'about'>('appearance')

  const themes = [
    { id: 'dark', name: 'Dark', icon: Moon, color: 'bg-neutral-900' },
    { id: 'light', name: 'Light', icon: Sun, color: 'bg-neutral-100' },
    { id: 'ocean', name: 'Ocean', icon: Waves, color: 'bg-sky-900' },
    { id: 'forest', name: 'Forest', icon: TreePine, color: 'bg-emerald-900' },
  ] as const

  const shortcuts = [
    { key: 'Ctrl + T', action: 'New Tab' },
    { key: 'Ctrl + W', action: 'Close Tab' },
    { key: 'Ctrl + Shift + T', action: 'Reopen Closed Tab' },
    { key: 'Ctrl + Tab', action: 'Next Tab' },
    { key: 'Ctrl + Shift + Tab', action: 'Previous Tab' },
    { key: 'Ctrl + 1-9', action: 'Switch to Tab 1-9' },
    { key: 'Ctrl + L', action: 'Focus Address Bar' },
    { key: 'Alt + Left', action: 'Back' },
    { key: 'Alt + Right', action: 'Forward' },
    { key: 'Ctrl + R', action: 'Reload' },
    { key: 'Ctrl + H', action: 'History' },
    { key: 'Ctrl + Shift + B', action: 'Bookmarks' },
    { key: 'F11', action: 'Fullscreen' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-2xl animate-fade-in overflow-hidden">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-56 bg-muted/50 border-r border-border p-4">
            <h2 className="text-lg font-semibold mb-6">Settings</h2>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'appearance' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Palette className="w-4 h-4" />
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('shortcuts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'shortcuts' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                Keyboard
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'privacy' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon className="w-4 h-4" />
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'about' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Info className="w-4 h-4" />
                About
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium capitalize">{activeTab}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Theme</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {themes.map(({ id, name, icon: Icon, color }) => (
                        <button
                          key={id}
                          onClick={() => setTheme(id as typeof theme)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            theme === id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="flex-1 text-left">{name}</span>
                          {theme === id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
                  <div className="grid gap-2">
                    {shortcuts.map(({ key, action }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="text-sm">{action}</span>
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono border border-border">
                          {key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Data Management</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => clearHistoryOlderThan(7)}
                        className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80"
                      >
                        <span className="text-sm">Clear history older than 7 days</span>
                        <Moon className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={clearHistory}
                        className="w-full flex items-center justify-between p-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20"
                      >
                        <span className="text-sm">Clear all history</span>
                        <Moon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Waves className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">ProxiBrowse</h3>
                    <p className="text-sm text-muted-foreground mb-4">Advanced Web Proxy Browser</p>
                    <p className="text-xs text-muted-foreground">Version 2.0.0</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Built with React, TypeScript, and Tailwind CSS</p>
                    <p>Powered by Zustand for state management</p>
                    <p>Icons by Lucide</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
