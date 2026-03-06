import styles from './Tooltip.module.css'

export default function Tooltip({ system, x, y }) {
  if (!system) return null

  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

  return (
    <div
      className={styles.tooltip}
      style={{ left: x + 18, top: y - 10 }}
    >
      <div className={styles.name}>{system.full}</div>
      <div className={styles.lang} style={{ color: system.color }}>
        {system.language}
      </div>
      <div className={styles.rows}>
        <Row label="Commits" val={system.commits.length} />
        <Row label="Stars" val={'★ ' + fmt(system.meta.stargazers_count || 0)} />
        <Row label="Forks" val={fmt(system.meta.forks_count || 0)} />
        <Row label="Planets" val={system.planets.length} />
        {system.meta.description && (
          <div className={styles.desc}>{system.meta.description.slice(0, 80)}</div>
        )}
      </div>
    </div>
  )
}

function Row({ label, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.62rem', marginBottom: 3 }}>
      <span style={{ color: 'var(--text-2)' }}>{label}</span>
      <span style={{ color: 'var(--text-1)' }}>{val}</span>
    </div>
  )
}
