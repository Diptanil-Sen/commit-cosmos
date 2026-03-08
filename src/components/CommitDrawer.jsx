import { useEffect, useRef } from 'react'
import styles from './CommitDrawer.module.css'

export default function CommitDrawer({ planet, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!planet) return null

  const commits = planet.commits || []

  return (
    <div className={styles.overlay} onClick={e => e.target === ref.current && onClose()}>
      <div className={styles.drawer} ref={ref}>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.dot} style={{ background: planet.color }} />
            <div>
              <div className={styles.repoName}>{planet.name}</div>
              <div className={styles.repoMeta}>
                <span style={{ color: planet.color }}>{planet.language}</span>
                <span className={styles.sep}>·</span>
                ★ {planet.stars >= 1000 ? `${(planet.stars / 1000).toFixed(1)}k` : planet.stars}
                <span className={styles.sep}>·</span>
                {commits.length} commits
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <a href={'https://github.com/' + planet.full} target="_blank" rel="noreferrer" className={styles.ghLink}>
              open on github
            </a>
            <button className={styles.closeBtn} onClick={onClose}>x</button>
          </div>
        </div>

        {planet.description && (
          <div className={styles.desc}>{planet.description}</div>
        )}

        <div className={styles.commitList}>
          {commits.length === 0 && (
            <div className={styles.empty}>No commits found</div>
          )}
          {commits.map((c, i) => {
            const msg = c.commit.message.split('\n')[0]
            const date = new Date(c.commit.author.date)
            const sha = c.sha.slice(0, 7)
            return (
              
                <a
                key={sha + i}
                className={styles.commitRow}
                href={'https://github.com/' + planet.full + '/commit/' + c.sha}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.commitDot} style={{ background: planet.color }} />
                <div className={styles.commitBody}>
                  <div className={styles.commitMsg}>{msg}</div>
                  <div className={styles.commitMeta}>
                    <span className={styles.sha}>{sha}</span>
                    <span className={styles.sep}>·</span>
                    <span>{c.commit.author.name}</span>
                    <span className={styles.sep}>·</span>
                    <span>{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

      </div>
    </div>
  )
}