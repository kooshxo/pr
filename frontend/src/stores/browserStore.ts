import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'

export interface Tab {
  id: string
  url: string
  title: string
  favicon?: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  history: string[]
  historyIndex: number
}

export interface Bookmark {
  id: string
  url: string
  title: string
  favicon?: string
  folder?: string
  createdAt: number
}

export interface HistoryItem {
  id: string
  url: string
  title: string
  favicon?: string
  visitedAt: number
}

interface BrowserState {
  tabs: Tab[]
  activeTab: string | null
  bookmarks: Bookmark[]
  history: HistoryItem[]
  folders: string[]

  addTab: (url?: string) => string
  closeTab: (id: string) => void
  setActiveTab: (id: string | null) => void
  navigate: (tabId: string, url: string) => void
  goBack: (tabId: string) => void
  goForward: (tabId: string) => void
  reload: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  reorderTabs: (oldIndex: number, newIndex: number) => void

  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void
  removeBookmark: (id: string) => void
  addFolder: (name: string) => void
  removeFolder: (name: string) => void

  addToHistory: (item: Omit<HistoryItem, 'id' | 'visitedAt'>) => void
  clearHistory: () => void
  clearHistoryOlderThan: (days: number) => void
}

const formatUrl = (input: string): string => {
  const str = typeof input === 'string' ? input : String(input || '')
  const trimmed = str.trim()
  if (!trimmed) return 'https://duckduckgo.com'
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  
  // Check if it's likely a URL (has dot and no spaces)
  if (trimmed.includes('.') && !trimmed.includes(' ') && !trimmed.includes('?')) {
    // Check if it's not a search query with dots (like "node.js")
    const parts = trimmed.split('.')
    if (parts.length >= 2 && parts.every(p => p.length > 0)) {
      return `https://${trimmed}`
    }
  }
  
  // Use DuckDuckGo as search engine
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`
}

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTab: null,
      bookmarks: [
        { id: nanoid(), url: 'https://duckduckgo.com', title: 'DuckDuckGo', folder: 'Favorites', createdAt: Date.now() },
        { id: nanoid(), url: 'https://www.youtube.com', title: 'YouTube', folder: 'Favorites', createdAt: Date.now() },
        { id: nanoid(), url: 'https://github.com', title: 'GitHub', folder: 'Favorites', createdAt: Date.now() },
      ],
      history: [],
      folders: ['Favorites', 'Work', 'Personal'],

      addTab: (url = 'https://duckduckgo.com') => {
        const id = nanoid()
        const formattedUrl = formatUrl(url)
        
        set((state) => {
          const newTab: Tab = {
            id,
            url: formattedUrl,
            title: 'New Tab',
            isLoading: true,
            canGoBack: false,
            canGoForward: false,
            history: [formattedUrl],
            historyIndex: 0,
          }
          
          return {
            tabs: [...state.tabs, newTab],
            activeTab: id,
          }
        })
        
        return id
      },

      closeTab: (id: string) => {
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id)
          let newActiveTab = state.activeTab
          
          if (state.activeTab === id) {
            const closedIndex = state.tabs.findIndex((t) => t.id === id)
            newActiveTab = newTabs[Math.min(closedIndex, newTabs.length - 1)]?.id || null
          }
          
          if (newTabs.length === 0) {
            return { tabs: [], activeTab: null }
          }
          
          return { tabs: newTabs, activeTab: newActiveTab }
        })
      },

      setActiveTab: (id: string | null) => {
        set({ activeTab: id })
      },

      navigate: (tabId: string, url: string) => {
        const formattedUrl = formatUrl(url)
        
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== tabId) return tab
            
            const newHistory = tab.history.slice(0, tab.historyIndex + 1)
            newHistory.push(formattedUrl)
            
            return {
              ...tab,
              url: formattedUrl,
              isLoading: true,
              canGoBack: newHistory.length > 1,
              canGoForward: false,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            }
          }),
        }))
        
        // Add to history
        get().addToHistory({ url: formattedUrl, title: formattedUrl })
      },

      goBack: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== tabId || tab.historyIndex <= 0) return tab
            
            const newIndex = tab.historyIndex - 1
            return {
              ...tab,
              url: tab.history[newIndex],
              historyIndex: newIndex,
              canGoBack: newIndex > 0,
              canGoForward: true,
              isLoading: true,
            }
          }),
        }))
      },

      goForward: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== tabId || tab.historyIndex >= tab.history.length - 1) return tab
            
            const newIndex = tab.historyIndex + 1
            return {
              ...tab,
              url: tab.history[newIndex],
              historyIndex: newIndex,
              canGoBack: true,
              canGoForward: newIndex < tab.history.length - 1,
              isLoading: true,
            }
          }),
        }))
      },

      reload: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, isLoading: true } : tab
          ),
        }))
      },

      updateTab: (tabId: string, updates: Partial<Tab>) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, ...updates } : tab
          ),
        }))
      },

      reorderTabs: (oldIndex: number, newIndex: number) => {
        set((state) => {
          const newTabs = [...state.tabs]
          const [moved] = newTabs.splice(oldIndex, 1)
          newTabs.splice(newIndex, 0, moved)
          return { tabs: newTabs }
        })
      },

      addBookmark: (bookmark) => {
        const newBookmark: Bookmark = {
          ...bookmark,
          id: nanoid(),
          createdAt: Date.now(),
        }
        
        set((state) => ({
          bookmarks: [...state.bookmarks, newBookmark],
        }))
        
        toast.success('Bookmark added', {
          description: bookmark.title || bookmark.url,
        })
      },

      removeBookmark: (id: string) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }))
        
        toast.success('Bookmark removed')
      },

      addFolder: (name: string) => {
        if (!name.trim()) return
        
        set((state) => {
          if (state.folders.includes(name)) return state
          return { folders: [...state.folders, name] }
        })
      },

      removeFolder: (name: string) => {
        set((state) => ({
          folders: state.folders.filter((f) => f !== name),
          bookmarks: state.bookmarks.map((b) =>
            b.folder === name ? { ...b, folder: undefined } : b
          ),
        }))
      },

      addToHistory: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: nanoid(),
          visitedAt: Date.now(),
        }
        
        set((state) => {
          // Don't add duplicates consecutively
          if (state.history[0]?.url === item.url) {
            return state
          }
          
          return {
            history: [newItem, ...state.history].slice(0, 1000), // Keep last 1000
          }
        })
      },

      clearHistory: () => {
        set({ history: [] })
        toast.success('History cleared')
      },

      clearHistoryOlderThan: (days: number) => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        
        set((state) => ({
          history: state.history.filter((h) => h.visitedAt > cutoff),
        }))
        
        toast.success(`Cleared history older than ${days} days`)
      },
    }),
    {
      name: 'browser-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        folders: state.folders,
        history: state.history,
      }),
    }
  )
)
