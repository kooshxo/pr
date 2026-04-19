import { useState, useCallback, useRef, useEffect } from 'react'
import { TabBar } from './TabBar'
import { AddressBar } from './AddressBar'
import { Toolbar } from './Toolbar'
import { WebView } from './WebView'
import { Sidebar } from './Sidebar'
import { BookmarksDialog } from './BookmarksDialog'
import { HistoryDialog } from './HistoryDialog'
import { SettingsDialog } from './SettingsDialog'
import { useBrowserStore } from '../stores/browserStore'
import { useHotkeys } from 'react-hotkeys-hook'

export function Browser() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { tabs, activeTab, addTab, closeTab, setActiveTab, navigate, goBack, goForward, reload } = useBrowserStore()
  const webViewRef = useRef<HTMLIFrameElement>(null)

  // Keyboard shortcuts
  useHotkeys('ctrl+t, cmd+t', (e) => {
    e.preventDefault()
    addTab()
  })

  useHotkeys('ctrl+w, cmd+w', (e) => {
    e.preventDefault()
    if (activeTab) closeTab(activeTab)
  })

  useHotkeys('ctrl+shift+t, cmd+shift+t', (e) => {
    e.preventDefault()
    addTab()
  })

  useHotkeys('ctrl+l, cmd+l', (e) => {
    e.preventDefault()
    const input = document.getElementById('address-bar')
    input?.focus()
    ;(input as HTMLInputElement)?.select()
  })

  useHotkeys('ctrl+h, cmd+y', (e) => {
    e.preventDefault()
    setShowHistory(true)
  })

  useHotkeys('ctrl+shift+b, cmd+shift+b', (e) => {
    e.preventDefault()
    setShowBookmarks(true)
  })

  useHotkeys('f11', (e) => {
    e.preventDefault()
    toggleFullscreen()
  })

  useHotkeys('ctrl+r, cmd+r, f5', (e) => {
    e.preventDefault()
    if (activeTab) reload(activeTab)
  })

  useHotkeys('alt+left', (e) => {
    e.preventDefault()
    if (activeTab) goBack(activeTab)
  })

  useHotkeys('alt+right', (e) => {
    e.preventDefault()
    if (activeTab) goForward(activeTab)
  })

  useHotkeys('ctrl+1, cmd+1', () => setActiveTab(tabs[0]?.id))
  useHotkeys('ctrl+2, cmd+2', () => setActiveTab(tabs[1]?.id))
  useHotkeys('ctrl+3, cmd+3', () => setActiveTab(tabs[2]?.id))
  useHotkeys('ctrl+4, cmd+4', () => setActiveTab(tabs[3]?.id))
  useHotkeys('ctrl+5, cmd+5', () => setActiveTab(tabs[4]?.id))
  useHotkeys('ctrl+6, cmd+6', () => setActiveTab(tabs[5]?.id))
  useHotkeys('ctrl+7, cmd+7', () => setActiveTab(tabs[6]?.id))
  useHotkeys('ctrl+8, cmd+8', () => setActiveTab(tabs[7]?.id))
  useHotkeys('ctrl+9, cmd+9', () => setActiveTab(tabs[tabs.length - 1]?.id))

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={setActiveTab}
        onTabClose={closeTab}
        onNewTab={addTab}
      />

      {/* Toolbar */}
      <Toolbar
        canGoBack={activeTabData?.canGoBack || false}
        canGoForward={activeTabData?.canGoForward || false}
        onBack={() => activeTab && goBack(activeTab)}
        onForward={() => activeTab && goForward(activeTab)}
        onReload={() => activeTab && reload(activeTab)}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onShowBookmarks={() => setShowBookmarks(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowSettings={() => setShowSettings(true)}
        sidebarOpen={showSidebar}
      />

      {/* Address Bar */}
      <AddressBar
        url={activeTabData?.url || ''}
        isLoading={activeTabData?.isLoading || false}
        onNavigate={(url) => activeTab && navigate(activeTab, url)}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar
            onClose={() => setShowSidebar(false)}
          />
        )}

        <div className="flex-1 relative">
          {tabs.map((tab) => (
            <WebView
              key={tab.id}
              tabId={tab.id}
              url={tab.url}
              isActive={tab.id === activeTab}
              onNavigate={(url) => navigate(tab.id, url)}
            />
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <BookmarksDialog
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
      />
      <HistoryDialog
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}
