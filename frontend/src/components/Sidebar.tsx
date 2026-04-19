import { useState } from 'react'
import { X, Bookmark, History, Folder, Plus, Trash2, ExternalLink } from 'lucide-react'
import { useBrowserStore } from '../stores/browserStore'

interface SidebarProps {
  onClose: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  
  const { 
    bookmarks, 
    folders, 
    history, 
    removeBookmark, 
    removeFolder, 
    addFolder,
    navigate,
    setActiveTab: setActiveBrowserTab,
    addTab
  } = useBrowserStore()

  const handleOpenUrl = (url: string) => {
    addTab(url)
    onClose()
  }

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolder(false)
    }
  }

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'bookmarks' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'bookmarks' ? (
          <div className="p-3 space-y-4">
            {/* Folders */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">Folders</span>
                <button
                  onClick={() => setShowNewFolder(!showNewFolder)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              {showNewFolder && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="flex-1 px-2 py-1 text-sm bg-muted rounded border border-border"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                  />
                  <button
                    onClick={handleAddFolder}
                    className="px-2 py-1 bg-primary text-primary-foreground text-sm rounded"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {folders.map((folder) => (
                  <div key={folder} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{folder}</span>
                      <span className="text-xs text-muted-foreground">
                        ({bookmarks.filter(b => b.folder === folder).length})
                      </span>
                    </div>
                    <button
                      onClick={() => removeFolder(folder)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* All Bookmarks */}
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase">All Bookmarks</span>
              <div className="mt-2 space-y-1">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleOpenUrl(bookmark.url)}
                  >
                    {bookmark.favicon ? (
                      <img src={bookmark.favicon} alt="" className="w-4 h-4 rounded-sm" />
                    ) : (
                      <div className="w-4 h-4 rounded-sm bg-muted-foreground/30" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{bookmark.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeBookmark(bookmark.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <span className="text-xs font-medium text-muted-foreground uppercase">Recent History</span>
            <div className="mt-2 space-y-1">
              {history.slice(0, 50).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleOpenUrl(item.url)}
                >
                  {item.favicon ? (
                    <img src={item.favicon} alt="" className="w-4 h-4 rounded-sm" />
                  ) : (
                    <History className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(item.visitedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
