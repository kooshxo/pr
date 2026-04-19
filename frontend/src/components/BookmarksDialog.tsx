import { useState } from 'react'
import { X, Plus, Folder, Bookmark as BookmarkIcon, ExternalLink, Search } from 'lucide-react'
import { useBrowserStore } from '../stores/browserStore'
import Fuse from 'fuse.js'

interface BookmarksDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function BookmarksDialog({ isOpen, onClose }: BookmarksDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [newBookmark, setNewBookmark] = useState({ url: '', title: '', folder: 'Favorites' })
  const [showAddForm, setShowAddForm] = useState(false)
  
  const { bookmarks, folders, addBookmark, removeBookmark, addTab } = useBrowserStore()

  const fuse = new Fuse(bookmarks, {
    keys: ['title', 'url'],
    threshold: 0.3,
  })

  const filteredBookmarks = searchQuery
    ? fuse.search(searchQuery).map(r => r.item)
    : bookmarks

  const handleAddBookmark = () => {
    if (newBookmark.url.trim()) {
      addBookmark({
        url: newBookmark.url,
        title: newBookmark.title || newBookmark.url,
        folder: newBookmark.folder,
      })
      setNewBookmark({ url: '', title: '', folder: 'Favorites' })
      setShowAddForm(false)
    }
  }

  const handleOpenBookmark = (url: string) => {
    addTab(url)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Bookmarks</h2>
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
              placeholder="Search bookmarks..."
              className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg border border-border"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Add Bookmark Form */}
        {showAddForm && (
          <div className="p-4 bg-muted/50 border-b border-border space-y-3">
            <input
              type="text"
              value={newBookmark.url}
              onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
              placeholder="URL"
              className="w-full px-3 py-2 bg-background rounded-lg border border-border"
            />
            <input
              type="text"
              value={newBookmark.title}
              onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
              placeholder="Title (optional)"
              className="w-full px-3 py-2 bg-background rounded-lg border border-border"
            />
            <select
              value={newBookmark.folder}
              onChange={(e) => setNewBookmark({ ...newBookmark, folder: e.target.value })}
              className="w-full px-3 py-2 bg-background rounded-lg border border-border"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddBookmark}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bookmarks List */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          {folders.map(folder => {
            const folderBookmarks = filteredBookmarks.filter(b => b.folder === folder)
            if (folderBookmarks.length === 0 && searchQuery) return null
            
            return (
              <div key={folder} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{folder}</span>
                  <span className="text-xs text-muted-foreground">({folderBookmarks.length})</span>
                </div>
                <div className="grid gap-2">
                  {folderBookmarks.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted group"
                    >
                      {bookmark.favicon ? (
                        <img src={bookmark.favicon} alt="" className="w-5 h-5 rounded" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{bookmark.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleOpenBookmark(bookmark.url)}
                          className="p-2 rounded-lg hover:bg-primary/20"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeBookmark(bookmark.id)}
                          className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Uncategorized */}
          {filteredBookmarks.filter(b => !b.folder).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookmarkIcon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Uncategorized</span>
              </div>
              <div className="grid gap-2">
                {filteredBookmarks.filter(b => !b.folder).map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted group"
                  >
                    {bookmark.favicon ? (
                      <img src={bookmark.favicon} alt="" className="w-5 h-5 rounded" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{bookmark.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleOpenBookmark(bookmark.url)}
                        className="p-2 rounded-lg hover:bg-primary/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="p-2 rounded-lg hover:bg-destructive/20 text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
