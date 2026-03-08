import { useEffect, useState, useRef } from 'react'
import CosmosCanvas from './components/CosmosCanvas'
import Sidebar from './components/Sidebar'
import Tooltip from './components/Tooltip'
import CommitFlash from './components/CommitFlash'
import CommitDrawer from './components/CommitDrawer'
import CompareView from './components/CompareView'
import ZoomControls from './components/ZoomControls'
import HelpPanel from './components/HelpPanel'
import IntroScreen from './components/IntroScreen'
import { useCosmosStore } from './hooks/useCosmosStore'
import { setSoundEnabled } from './utils/soundEngine'
import './index.css'

export default function App() {
  const main = useCosmosStore()
  const compare = useCosmosStore()

  const [speed, setSpeed] = useState(1)
  const [soundOn, setSoundOn] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [flashMsg, setFlashMsg] = useState(null)
  const [showConstellation, setShowConstellation] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showIntro, setShowIntro] = useState(true)
  const [compareMode, setCompareMode] = useState(false)
  const [compareUsername, setCompareUsername] = useState('')
  const [drawerPlanet, setDrawerPlanet] = useState(null)
  const screenshotRef = useRef(null)

  // URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlUser = params.get('user')
    if (urlUser) { setShowIntro(false); main.loadUser(urlUser) }
  }, [])

  // Push URL
  useEffect(() => {
    if (main.sun?.name) {
      const url = new URL(window.location.href)
      url.searchParams.set('user', main.sun.name)
      window.history.replaceState({}, '', url.toString())
      setShowIntro(false)
    }
  }, [main.sun?.name])

  function handleSoundToggle() {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
  }

  function handleSearch(username) {
    setShowIntro(false)
    main.loadUser(username)
  }

  function copyShareLink() {
    if (!main.sun?.name) return
    const url = new URL(window.location.href)
    url.searchParams.set('user', main.sun.name)
    navigator.clipboard.writeText(url.toString())
  }

  function handleCompare(username) {
    if (!username.trim()) return
    setCompareUsername(username.trim())
    compare.loadUser(username.trim())
    setCompareMode(true)
  }

  return (
    <div className="app-shell">
      {showIntro && <IntroScreen onSearch={handleSearch} loading={main.loading} />}

      <div className={`main-layout ${showIntro ? 'hidden' : ''}`}>
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle sidebar">
          <span /><span /><span />
        </button>

        <aside className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar
            sun={main.sun}
            planets={main.planets}
            loading={main.loading}
            error={main.error}
            onSearch={handleSearch}
            speed={speed}
            onSpeedChange={setSpeed}
            soundOn={soundOn}
            onSoundToggle={handleSoundToggle}
            onScreenshot={() => screenshotRef.current?.()}
            onShareLink={copyShareLink}
            showConstellation={showConstellation}
            onConstellationToggle={() => setShowConstellation(v => !v)}
            onCompare={handleCompare}
          />
        </aside>

        <main className="canvas-wrapper">
          <CosmosCanvas
            sun={main.sun}
            planets={main.planets}
            asteroids={main.asteroids}
            constellation={main.constellation}
            nebulaClouds={main.nebulaClouds}
            comet={main.comet}
            speed={speed}
            showConstellation={showConstellation}
            onTooltip={setTooltip}
            onCommitFlash={setFlashMsg}
            onPlanetClick={setDrawerPlanet}
            screenshotRef={screenshotRef}
          />
          <Tooltip tooltip={tooltip} />
          <CommitFlash commit={flashMsg} />
          <ZoomControls />
          <HelpPanel />
        </main>
      </div>

      {/* Compare split screen */}
      {compareMode && (
        <CompareView
          left={{
            sun: main.sun, planets: main.planets,
            asteroids: main.asteroids, constellation: main.constellation,
            nebulaClouds: main.nebulaClouds, comet: main.comet,
            username: main.sun?.name || '',
          }}
          right={{
            sun: compare.sun, planets: compare.planets,
            asteroids: compare.asteroids, constellation: compare.constellation,
            nebulaClouds: compare.nebulaClouds, comet: compare.comet,
            username: compareUsername,
          }}
          onClose={() => setCompareMode(false)}
        />
      )}

      {/* Commit drawer */}
      {drawerPlanet && (
        <CommitDrawer planet={drawerPlanet} onClose={() => setDrawerPlanet(null)} />
      )}
    </div>
  )
}