import styles from './Tooltip.module.css'

export default function Tooltip({ tooltip }) {
  if (!tooltip) return null
  const { x, y, type, data } = tooltip
  if (!data) return null

  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

  if (type === 'sun') {
    return (
      <div className={styles.tooltip} style={{ left: x + 18, top: y - 10 }}>
        <div className={styles.name}>@{data.name}</div>
        <div className={styles.lang} style={{ color: '#fbbf24' }}>github user</div>
        <div className={styles.rows}>
          <Row label="Repos" val={data.publicRepos ?? '—'} />
          <Row label="Followers" val={fmt(data.followers ?? 0)} />
          {data.bio && <div className={styles.desc}>{data.bio.slice(0, 80)}</div>}
        </div>
        <div className={styles.hint}>click to open profile</div>
      </div>
    )
  }

  return (
    <div className={styles.tooltip} style={{ left: x + 18, top: y - 10 }}>
      <div className={styles.name}>{data.full}</div>
      <div className={styles.lang} style={{ color: data.color }}>{data.language}</div>
      <div className={styles.rows}>
        <Row label="Commits" val={data.commits?.length ?? '—'} />
        <Row label="Stars" val={'★ ' + fmt(data.stars || 0)} />
        <Row label="Forks" val={fmt(data.forks || 0)} />
        {data.description && (
          <div className={styles.desc}>{data.description.slice(0, 80)}</div>
        )}
      </div>
      <div className={styles.hint}>click to open on github</div>
    </div>
  )
}

function Row({ label, val }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:16, fontSize:'0.62rem', marginBottom:3 }}>
      <span style={{ color:'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ color:'rgba(255,255,255,0.85)' }}>{val}</span>
    </div>
  )
}