import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Menu, 
  Bookmark, 
  History, 
  Settings,
  PanelLeft
} from 'lucide-react'

interface ToolbarProps {
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onForward: () => void
  onReload: () => void
  onToggleSidebar: () => void
  onShowBookmarks: () => void
  onShowHistory: () => void
  onShowSettings: () => void
  sidebarOpen: boolean
}

export function Toolbar({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReload,
  onToggleSidebar,
  onShowBookmarks,
  onShowHistory,
  onShowSettings,
  sidebarOpen,
}: ToolbarProps) {
  const iconButtonClass = `
    p-2 rounded-lg hover:bg-muted
    transition-colors duration-150
    disabled:opacity-30 disabled:cursor-not-allowed
  `

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-card border-b border-border">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className={iconButtonClass}
        title="Back (Alt+Left)"
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <button
        onClick={onForward}
        disabled={!canGoForward}
        className={iconButtonClass}
        title="Forward (Alt+Right)"
      >
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <button
        onClick={onReload}
        className={iconButtonClass}
        title="Reload (Ctrl+R)"
      >
        <RotateCw className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="w-px h-6 bg-border mx-2" />
      
      <button
        onClick={onToggleSidebar}
        className={`${iconButtonClass} ${sidebarOpen ? 'bg-muted' : ''}`}
        title="Toggle Sidebar (Ctrl+Shift+B)"
      >
        <PanelLeft className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <button
        onClick={onShowBookmarks}
        className={iconButtonClass}
        title="Bookmarks (Ctrl+Shift+B)"
      >
        <Bookmark className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <button
        onClick={onShowHistory}
        className={iconButtonClass}
        title="History (Ctrl+H)"
      >
        <History className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex-1" />
      
      <button
        onClick={onShowSettings}
        className={iconButtonClass}
        title="Settings"
      >
        <Settings className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}
