import { X, Plus } from 'lucide-react'
import { Tab } from '../stores/browserStore'
import { useRef, useState } from 'react'

interface TabBarProps {
  tabs: Tab[]
  activeTab: string | null
  onTabClick: (id: string) => void
  onTabClose: (id: string) => void
  onNewTab: () => void
}

export function TabBar({ tabs, activeTab, onTabClick, onTabClose, onNewTab }: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [draggingTab, setDraggingTab] = useState<string | null>(null)

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY
    }
  }

  return (
    <div className="flex items-center bg-card border-b border-border h-10">
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto scrollbar-hide"
        onWheel={handleWheel}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={() => setDraggingTab(tab.id)}
            onDragEnd={() => setDraggingTab(null)}
            onClick={() => onTabClick(tab.id)}
            className={`
              group flex items-center gap-2 px-3 py-2 min-w-[140px] max-w-[200px] 
              cursor-pointer select-none transition-all duration-150
              ${activeTab === tab.id 
                ? 'bg-background border-t-2 border-primary' 
                : 'hover:bg-muted border-t-2 border-transparent'
              }
              ${draggingTab === tab.id ? 'opacity-50' : ''}
            `}
          >
            {tab.isLoading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : tab.favicon ? (
              <img src={tab.favicon} alt="" className="w-4 h-4 rounded-sm" />
            ) : (
              <div className="w-4 h-4 rounded-sm bg-muted-foreground/30" />
            )}
            
            <span className="flex-1 truncate text-sm text-card-foreground">
              {tab.title || 'New Tab'}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              className="
                opacity-0 group-hover:opacity-100
                p-1 rounded hover:bg-muted-foreground/20
                transition-opacity duration-150
              "
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={onNewTab}
        className="
          p-2 mx-1 rounded hover:bg-muted
          transition-colors duration-150
        "
        title="New Tab (Ctrl+T)"
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  )
}
