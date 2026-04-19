import { useState } from 'react'
import { X, History, Search, Trash2, ExternalLink, Clock } from 'lucide-react'
import { useBrowserStore, HistoryItem } from '../stores/browserStore'
import Fuse from 'fuse.js'

interface HistoryDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function HistoryDialog({ isOpen, onClose }: HistoryDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  
  const { history, clearHistory, clearHistoryOlderThan, addTab } = useBrowserStore()

  const fuse = new Fuse(history, {
    keys: ['title', 'url'],
    threshold: 0.3,
  })

  const filteredHistory = searchQuery
    ? fuse.search(searchQuery).map(r => r.item)
    : history

  // Group by date
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.visitedAt).toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
    return groups
  }, {} as Record<string, HistoryItem[]>)

  const handleOpenUrl = (url: string) => {
    addTab(url)
    onClose()
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleDeleteSelected = () => {
    // In a real implementation, you'd remove specific items
    setSelectedItems(new Set())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-card rounded-xl border border-border shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-semibold">History</h2>
            <span className="text-sm text-muted-foreground">({history.length} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg border border-border"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => clearHistoryOlderThan(7)}
              className="px-3 py-2 text-sm bg-muted rounded-lg hover:bg-muted/80"
            >
              Clear 7+ days
            </button>
            <button
              onClick={clearHistory}
              className="px-3 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card py-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{date}</span>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              
              <div className="grid gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-4 h-4 rounded border-border"
                    />
                    
                    {item.favicon ? (
                      <img src={item.favicon} alt="" className="w-5 h-5 rounded" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-muted-foreground/30" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.url}</p>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenUrl(item.url)}
                        className="p-2 rounded-lg hover:bg-primary/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
