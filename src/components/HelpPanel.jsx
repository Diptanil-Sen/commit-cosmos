import { useState } from 'react'
import styles from './HelpPanel.module.css'

const FEATURES = [
  { icon: '🪐', title: 'Planets = Repos', desc: 'Each repo orbits as a planet. Size = star count.' },
  { icon: '🌙', title: 'Moons = Commits', desc: 'Every commit orbits its planet as a tiny moon.' },
  { icon: '🌈', title: 'Language Nebulae', desc: 'Repos grouped by language glow in colored clouds.' },
  { icon: '💫', title: 'Asteroid Belt', desc: 'Appears beyond the outermost planet.' },
  { icon: '☄️', title: 'Streak Comet', desc: 'Active commit streaks spawn a flying comet.' },
  { icon: '🟢', title: 'Activity Rings', desc: 'Green ring = active repo. Grey = dormant.' },
  { icon: '✦', title: 'Constellation', desc: 'Toggle lines connecting repos in creation order.' },
  { icon: '🖱️', title: 'Click a planet', desc: 'Opens that repo on GitHub in a new tab.' },
  { icon: '🔗', title: 'Shareable URL', desc: '?user=username — share your galaxy with anyone.' },
  { icon: '📸', title: 'Screenshot', desc: 'Save your cosmos as a PNG.' },
  { icon: '🔊', title: 'Sound', desc: 'Each planet has a unique tonal ping on commits.' },
  { icon: '⚡', title: 'Speed control', desc: 'Slow down or speed up orbital time.' },
]

export default function HelpPanel() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.wrap}>
      <button
        className={`${styles.btn} ${open ? styles.btnActive : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Show features"
      >
        ?
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.title}>HOW IT WORKS</span>
            <button className={styles.close} onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className={styles.list}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.item}>
                <span className={styles.icon}>{f.icon}</span>
                <div>
                  <div className={styles.itemTitle}>{f.title}</div>
                  <div className={styles.itemDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}