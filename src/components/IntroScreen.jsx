import { useState, useEffect, useRef } from 'react'
import styles from './IntroScreen.module.css'

const DEMO_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'Diptanil-Sen']

const FEATURES = [
  { icon: '🪐', title: 'Planets = Repos', desc: 'Size = star count' },
  { icon: '🌙', title: 'Moons = Commits', desc: 'Every commit orbits its planet' },
  { icon: '🌈', title: 'Language Nebulae', desc: 'Repos grouped by language glow in colored clouds' },
  { icon: '☄️', title: 'Streak Comet', desc: 'Active commit streak spawns a flying comet' },
  { icon: '🟢', title: 'Activity Rings', desc: 'Green = active repo, grey = dormant' },
  { icon: '✦',  title: 'Constellation Mode', desc: 'Toggle lines connecting repos in creation order' },
  { icon: '🖱️', title: 'Click a Planet', desc: 'Opens that repo on GitHub' },
  { icon: '🔗', title: 'Shareable URL', desc: '?user=username — share your galaxy' },
  { icon: '📸', title: 'Screenshot', desc: 'Save your cosmos as a PNG' },
  { icon: '🔊', title: 'Sound', desc: 'Each planet has a unique tonal ping' },
]

export default function IntroScreen({ onSearch, loading }) {
  const [input, setInput] = useState('')
  const [stars, setStars] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    const s = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    }))
    setStars(s)
    setTimeout(() => inputRef.current?.focus(), 600)
  }, [])

  function handleSubmit() {
    const u = input.trim()
    if (!u) return
    onSearch(u)
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.overlay}>
      {/* Star field */}
      <div className={styles.starfield} aria-hidden="true">
        {stars.map(s => (
          <span
            key={s.id}
            className={styles.star}
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.nebula1} aria-hidden="true" />
      <div className={styles.nebula2} aria-hidden="true" />

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <span className={styles.logoIcon}>✦</span>
          <h1 className={styles.logo}>
            COMMIT<br />
            <span className={styles.logoAccent}>COSMOS</span>
          </h1>
        </div>

        <p className={styles.tagline}>
          Your entire GitHub history —<br />
          <em>as a living solar system.</em>
        </p>

        {/* Search */}
        <div className={styles.searchRow}>
          <div className={styles.inputWrap}>
            <span className={styles.atSign}>@</span>
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="github username"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <button
            className={styles.btn}
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
          >
            {loading ? <span className={styles.spinner} /> : <>EXPLORE <span className={styles.arrow}>→</span></>}
          </button>
        </div>

        {/* Demo chips */}
        <div className={styles.chips}>
          <span className={styles.tryLabel}>try →</span>
          {DEMO_USERS.map(u => (
            <button key={u} className={styles.chip} onClick={() => onSearch(u)} disabled={loading}>{u}</button>
          ))}
        </div>

        {/* Feature grid */}
        <div className={styles.featureSection}>
          <div className={styles.featureDivider}>
            <span>WHAT YOU'LL SEE</span>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}