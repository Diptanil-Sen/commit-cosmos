import { useState } from 'react'
import styles from './Sidebar.module.css'

const DEMO_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'tj', 'Diptanil-Sen']

export default function Sidebar({
  sun, planets = [], loading, error, onSearch,
  speed, onSpeedChange, soundOn, onSoundToggle,
  onScreenshot, onShareLink,
  showConstellation, onConstellationToggle,
}) {
  const [input, setInput] = useState('')

  function handleSubmit() {
    const u = input.trim()
    if (!u) return
    onSearch(u)
  }

  const totalCommits = planets.reduce((acc, p) => acc + (p.moons?.length || 0), 0)
  const totalStars = planets.reduce((acc, p) => acc + (p.stars || 0), 0)

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoStar}>✦</span>
          <div>
            <div className={styles.logoTitle}>COMMIT</div>
            <div className={styles.logoSub}>COSMOS</div>
          </div>
        </div>
        <p className={styles.logoCaption}>any github user · as a solar system</p>
      </div>

      <div className={styles.section}>
        <label className={styles.sectionLabel}>— enter github username</label>
        <div className={styles.inputRow}>
          <span className={styles.atSign}>@</span>
          <input
            className={styles.input}
            placeholder="username"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
          />
          <button className={styles.goBtn} onClick={handleSubmit} disabled={loading || !input.trim()}>
            {loading ? <span className={styles.spinner} /> : '→'}
          </button>
        </div>
        <div className={styles.chips}>
          {DEMO_USERS.map(u => (
            <button key={u} className={styles.chip} onClick={() => onSearch(u)} disabled={loading}>{u}</button>
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.section}>
        <label className={styles.sectionLabel}>— controls</label>
        <div className={styles.controlRow}>
          <span className={styles.controlLabel}>speed</span>
          <input type="range" className={styles.slider} min={0.1} max={6} step={0.1} value={speed} onChange={e => onSpeedChange(parseFloat(e.target.value))} />
          <span className={styles.controlValue}>{speed.toFixed(1)}x</span>
        </div>
        <div className={styles.actionRow}>
          <button className={`${styles.actionBtn} ${soundOn ? styles.actionBtnActive : ''}`} onClick={onSoundToggle}>
            {soundOn ? '🔊' : '🔇'} sound
          </button>
          <button className={`${styles.actionBtn} ${showConstellation ? styles.actionBtnActive : ''}`} onClick={onConstellationToggle}>
            ✦ lines
          </button>
          <button className={styles.actionBtn} onClick={onScreenshot}>📸 save</button>
          <button className={styles.actionBtn} onClick={onShareLink} disabled={!sun?.name}>🔗 share</button>
        </div>
      </div>

      {sun && (
        <div className={styles.section}>
          <label className={styles.sectionLabel}>— {planets.length} planets</label>
          <div className={styles.planetList}>
            {planets.map(planet => (
              <button key={planet.name} className={styles.planetRow} onClick={() => window.__cosmos_focus_planet?.(planet)}>
                <span className={styles.planetDot} style={{ background: planet.color }} />
                <span className={styles.planetName}>{planet.name}</span>
                <span className={styles.planetMeta}>
                  {planet.language}
                  <span className={styles.dot}>·</span>
                  {planet.moons?.length || 0} moons
                  <span className={styles.dot}>·</span>
                  ★ {(planet.stars || 0) >= 1000 ? `${((planet.stars||0)/1000).toFixed(1)}k` : planet.stars || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {sun && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{planets.length}</span>
            <span className={styles.statKey}>planets</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{totalCommits}</span>
            <span className={styles.statKey}>commits</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{totalStars >= 1000 ? `${(totalStars/1000).toFixed(1)}k` : totalStars}</span>
            <span className={styles.statKey}>stars</span>
          </div>
        </div>
      )}
    <div className={styles.footer}>
        <button className={styles.homeBtn} onClick={() => window.location.href = '/'}>
          ✦ back to home
        </button>
        <span className={styles.madeBy}>made by <a href="https://github.com/Diptanil-Sen" target="_blank" rel="noreferrer">Diptanil Sen</a></span>
      </div>
    </div>
  )
}