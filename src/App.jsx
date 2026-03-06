import HelpPanel from './components/HelpPanel'
import { useEffect, useState, useRef } from 'react'
import CosmosCanvas from './components/CosmosCanvas'
import Sidebar from './components/Sidebar'
import Tooltip from './components/Tooltip'
import CommitFlash from './components/CommitFlash'
import ZoomControls from './components/ZoomControls'
import IntroScreen from './components/IntroScreen'
import { useCosmosStore } from './hooks/useCosmosStore'
import { setSoundEnabled } from './utils/soundEngine'
import './index.css'

export default function App() {
  const { sun, planets, asteroids, constellation, nebulaClouds, comet, loading, error, loadUser } = useCosmosStore()

  const [speed, setSpeed] = useState(1)
  const [soundOn, setSoundOn] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [flashMsg, setFlashMsg] = useState(null)
  const [showConstellation, setShowConstellation] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const screenshotRef = useRef(null)

  // Shareable URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlUser = params.get('user')
    if (urlUser) {
      setShowIntro(false)
      loadUser(urlUser)
    }
  }, [])

  // Push URL when user loads
  useEffect(() => {
    if (sun?.name) {
      const url = new URL(window.location.href)
      url.searchParams.set('user', sun.name)
      window.history.replaceState({}, '', url.toString())
      setShowIntro(false)
    }
  }, [sun?.name])

  function handleSoundToggle() {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  function handleScreenshot() {
    screenshotRef.current?.()
  }

  function handleSearch(username) {
    setShowIntro(false)
    loadUser(username)
  }

  function copyShareLink() {
    if (!sun?.name) return
    const url = new URL(window.location.href)
    url.searchParams.set('user', sun.name)
    navigator.clipboard.writeText(url.toString())
  }

  return (
    <div className="app-shell">
      {showIntro && <IntroScreen onSearch={handleSearch} loading={loading} />}

      <div className={`main-layout ${showIntro ? 'hidden' : ''}`}>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
          <span /><span /><span />
        </button>

        <aside className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar
            sun={sun}
            planets={planets}
            loading={loading}
            error={error}
            onSearch={handleSearch}
            speed={speed}
            onSpeedChange={setSpeed}
            soundOn={soundOn}
            onSoundToggle={handleSoundToggle}
            onScreenshot={handleScreenshot}
            onShareLink={copyShareLink}
            showConstellation={showConstellation}
            onConstellationToggle={() => setShowConstellation(v => !v)}
          />
        </aside>

        <main className="canvas-wrapper">
          <CosmosCanvas
            sun={sun}
            planets={planets}
            asteroids={asteroids}
            constellation={constellation}
            nebulaClouds={nebulaClouds}
            comet={comet}
            speed={speed}
            showConstellation={showConstellation}
            onTooltip={setTooltip}
            onCommitFlash={setFlashMsg}
            screenshotRef={screenshotRef}
          />
          <Tooltip tooltip={tooltip} />
          <CommitFlash commit={flashMsg} />
          <ZoomControls />
          <HelpPanel />
        </main>
      </div>
    </div>
  )
}