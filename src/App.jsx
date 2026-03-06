import { useEffect, useState, useRef } from 'react';
import CosmosCanvas from './components/CosmosCanvas';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import Tooltip from './components/Tooltip';
import CommitFlash from './components/CommitFlash';
import ZoomControls from './components/ZoomControls';
import IntroScreen from './components/IntroScreen';
import { useCosmosStore } from './hooks/useCosmosStore';
import { setSoundEnabled, isSoundEnabled } from './utils/soundEngine';
import './index.css';

export default function App() {
  const { sun, planets, loading, error, loadUser } = useCosmosStore();

  // Speed multiplier: 1 = normal, 0.1 = slow, 5 = fast
  const [speed, setSpeed] = useState(1);

  // Sound toggle
  const [soundOn, setSoundOn] = useState(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState(null); // { x, y, planet | sun }

  // Commit flash state
  const [flashMsg, setFlashMsg] = useState(null);

  // Screenshot trigger — we pass a ref callback down to CosmosCanvas
  const screenshotRef = useRef(null);

  // Sidebar mobile collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Intro screen — shown until user first searches
  const [showIntro, setShowIntro] = useState(true);

  // ── Shareable URLs ──────────────────────────────────────────────────────────
  // On mount: read ?user= from URL and auto-load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUser = params.get('user');
    if (urlUser) {
      setShowIntro(false);
      loadUser(urlUser);
    }
  }, []);

  // When a user is loaded, push their name into the URL so it's shareable
  useEffect(() => {
    if (sun?.login) {
      const url = new URL(window.location.href);
      url.searchParams.set('user', sun.login);
      window.history.replaceState({}, '', url.toString());
      setShowIntro(false);
    }
  }, [sun?.login]);

  // ── Sound toggle ─────────────────────────────────────────────────────────
  function handleSoundToggle() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  }

  // ── Screenshot ──────────────────────────────────────────────────────────────
  function handleScreenshot() {
    if (screenshotRef.current) {
      screenshotRef.current(); // triggers download inside CosmosCanvas
    }
  }

  // ── Handle search from Sidebar or Intro ─────────────────────────────────────
  function handleSearch(username) {
    setShowIntro(false);
    loadUser(username);
  }

  return (
    <div className="app-shell">
      {/* Animated intro — fades out once user searches */}
      {showIntro && <IntroScreen onSearch={handleSearch} loading={loading} />}

      {/* Main layout: sidebar + canvas */}
      <div className={`main-layout ${showIntro ? 'hidden' : ''}`}>
        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Toggle sidebar"
        >
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
          />
        </aside>

        <main className="canvas-wrapper">
          <CosmosCanvas
            sun={sun}
            planets={planets}
            speed={speed}
            onTooltip={setTooltip}
            onCommitFlash={setFlashMsg}
            screenshotRef={screenshotRef}
          />

          <Tooltip tooltip={tooltip} />
          <CommitFlash message={flashMsg} onDone={() => setFlashMsg(null)} />
          <ZoomControls />
        </main>
      </div>
    </div>
  );
}
