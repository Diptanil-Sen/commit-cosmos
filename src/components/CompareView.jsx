import styles from './CompareView.module.css'
import CosmosCanvas from './CosmosCanvas'

export default function CompareView({ left, right, onClose }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div className={styles.label}>
          <span className={styles.labelUser} style={{ color: '#fbbf24' }}>
            ✦ {left.sun?.displayName || left.username}
          </span>
          <span className={styles.vs}>vs</span>
          <span className={styles.labelUser} style={{ color: '#00ffe7' }}>
            ✦ {right.sun?.displayName || right.username}
          </span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕ exit compare</button>
      </div>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelLabel} style={{ color: '#fbbf24' }}>
            @{left.sun?.name || left.username}
            {left.sun && (
              <span className={styles.panelStats}>
                {left.planets?.length} repos · ★ {fmt(left.planets?.reduce((a,p) => a + p.stars, 0) || 0)}
              </span>
            )}
          </div>
          <CosmosCanvas
            sun={left.sun}
            planets={left.planets || []}
            asteroids={left.asteroids || []}
            constellation={left.constellation || []}
            nebulaClouds={left.nebulaClouds || []}
            comet={left.comet}
            speed={1}
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.panel}>
          <div className={styles.panelLabel} style={{ color: '#00ffe7' }}>
            @{right.sun?.name || right.username}
            {right.sun && (
              <span className={styles.panelStats}>
                {right.planets?.length} repos · ★ {fmt(right.planets?.reduce((a,p) => a + p.stars, 0) || 0)}
              </span>
            )}
          </div>
          <CosmosCanvas
            sun={right.sun}
            planets={right.planets || []}
            asteroids={right.asteroids || []}
            constellation={right.constellation || []}
            nebulaClouds={right.nebulaClouds || []}
            comet={right.comet}
            speed={1}
          />
        </div>
      </div>
    </div>
  )
}

function fmt(n) { return n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n) }