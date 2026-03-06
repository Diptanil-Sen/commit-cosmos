import { useState, useRef } from 'react'
import styles from './Sidebar.module.css'

const DEMOS = ['torvalds', 'gaearon', 'sindresorhus', 'tj', 'Diptanil-Sen']

export default function Sidebar({ sun, planets, loading, error, onLoad, username }) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    const u = input.trim().replace(/^@/, '')
    if (u) { onLoad(u); setInput('') }
  }

  const totalCommits = planets.reduce((a, p) => a + p.commits.length, 0)
  const totalStars = planets.reduce((a, p) => a + p.stars, 0)
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.head}>
        <div className={styles.logoIcon}>✦</div>
        <div>
          <div className={styles.logoTitle}>COMMIT<br />COSMOS</div>
          <div className={styles.logoSub}>Any GitHub user · as a solar system</div>
        </div>
      </div>

      <div className={styles.addSection}>
        <div className={styles.sectionLabel}>
          <span className={styles.line} /> Enter GitHub Username
        </div>
        <div className={styles.inputWrap}>
          <span className={styles.at}>@</span>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="username"
            spellCheck={false}
            autoComplete="off"
          />
          <button className={styles.goBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className={styles.spin} /> : '→'}
          </button>
        </div>
        {error && <div className={styles.error}>⚠ {error}</div>}
        {loading && <div className={styles.loadingText}>Charting the cosmos…</div>}

        <div className={styles.demoLabel}>Try these</div>
        <div className={styles.chips}>
          {DEMOS.map(u => (
            <button key={u} className={styles.chip} onClick={() => onLoad(u)} disabled={loading}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {sun && (
        <>
          <div className={styles.userCard}>
            <div className={styles.sunDot} />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{sun.displayName}</div>
              <div className={styles.userHandle}>@{sun.name}</div>
              {sun.bio && <div className={styles.userBio}>{sun.bio.slice(0, 70)}</div>}
            </div>
          </div>

          <div className={styles.planetList}>
            <div className={styles.sectionLabel} style={{ padding: '0 20px 8px' }}>
              <span className={styles.line} /> {planets.length} Planets
            </div>
            {planets.map(p => (
              <div
                key={p.id}
                className={styles.planetItem}
                style={{ '--c': p.color }}
                onClick={() => window.__cosmos_focus_planet?.(p)}
              >
                <div className={styles.planetDot} />
                <div className={styles.planetInfo}>
                  <div className={styles.planetName}>{p.name}</div>
                  <div className={styles.planetMeta}>
                    <span style={{ color: p.color }}>{p.language}</span>
                    <span>·</span>
                    <span>{p.moons.length} moons</span>
                    <span>·</span>
                    <span>★ {fmt(p.stars)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!sun && !loading && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>◎</div>
          <div>Enter a GitHub username<br />to birth their solar system</div>
        </div>
      )}

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <div className={styles.statN}>{planets.length}</div>
          <div className={styles.statL}>Planets</div>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <div className={styles.statN}>{totalCommits.toLocaleString()}</div>
          <div className={styles.statL}>Commits</div>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <div className={styles.statN}>{fmt(totalStars)}</div>
          <div className={styles.statL}>Stars</div>
        </div>
      </div>
    </aside>
  )
}