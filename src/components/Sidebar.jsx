import { useState, useRef } from 'react'
import styles from './Sidebar.module.css'

const QUICK = [
  'facebook/react',
  'vuejs/vue',
  'vercel/next.js',
  'microsoft/vscode',
  'torvalds/linux',
  'denoland/deno',
  'sveltejs/svelte',
  'golang/go',
]

export default function Sidebar({ systems, loading, error, onAdd, onRemove, onFocus, allCommits }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const totalStars = systems.reduce((a, s) => a + (s.meta.stargazers_count || 0), 0)

  const handleSubmit = () => {
    if (!input.trim()) return
    onAdd(input)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleQuick = (slug) => {
    setInput(slug)
    onAdd(slug)
  }

  const formatStars = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return n.toString()
  }

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.head}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <div>
            <div className={styles.logoTitle}>COMMIT<br />COSMOS</div>
            <div className={styles.logoSub}>Any repo · as a living universe</div>
          </div>
        </div>
      </div>

      {/* Add Repo */}
      <div className={styles.addSection}>
        <div className={styles.sectionLabel}>
          <span className={styles.labelLine} />
          Add Repository
        </div>

        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>⌗</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="owner / repo or GitHub URL"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            className={styles.addBtn}
            onClick={handleSubmit}
            disabled={!!loading}
          >
            {loading ? <span className={styles.miniSpin} /> : '→'}
          </button>
        </div>

        {error && <div className={styles.error}>⚠ {error}</div>}
        {loading && <div className={styles.loadingText}>Charting {loading}…</div>}

        {/* Quick Add */}
        <div className={styles.quickLabel}>Popular repos</div>
        <div className={styles.chips}>
          {QUICK.map(slug => (
            <button
              key={slug}
              className={styles.chip}
              onClick={() => handleQuick(slug)}
              disabled={!!loading || !!systems.find(s => s.id === slug)}
            >
              {slug.split('/')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Star Systems List */}
      <div className={styles.systemsList}>
        {systems.length === 0 ? (
          <div className={styles.emptyList}>
            <div className={styles.emptyIcon}>◎</div>
            <div>No star systems yet.<br />Add a repo to begin.</div>
          </div>
        ) : (
          <>
            <div className={styles.sectionLabel} style={{ padding: '0 20px 10px' }}>
              <span className={styles.labelLine} />
              Star Systems
            </div>
            {systems.map(sys => (
              <div
                key={sys.id}
                className={styles.sysItem}
                style={{ '--c': sys.color }}
                onClick={() => onFocus(sys)}
              >
                <div className={styles.sysDot} />
                <div className={styles.sysInfo}>
                  <div className={styles.sysName}>{sys.full}</div>
                  <div className={styles.sysMeta}>
                    <span style={{ color: sys.color }}>{sys.language}</span>
                    <span>·</span>
                    <span>{sys.commits.length} commits</span>
                    <span>·</span>
                    <span>★ {formatStars(sys.meta.stargazers_count || 0)}</span>
                  </div>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={e => { e.stopPropagation(); onRemove(sys.id) }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Stats Footer */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <div className={styles.statN}>{systems.length}</div>
          <div className={styles.statL}>Repos</div>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <div className={styles.statN}>{allCommits.length.toLocaleString()}</div>
          <div className={styles.statL}>Commits</div>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <div className={styles.statN}>{formatStars(totalStars)}</div>
          <div className={styles.statL}>Total ★</div>
        </div>
      </div>
    </aside>
  )
}
