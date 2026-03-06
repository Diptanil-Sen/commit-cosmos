import { useRef, useCallback } from 'react'
import styles from './Timeline.module.css'

export default function Timeline({ allCommits, timeIdx, playing, onSeek, onPlay, onPause }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)

  const pct = allCommits.length > 1 ? timeIdx / (allCommits.length - 1) : 0
  const current = allCommits[timeIdx]

  const seek = useCallback((e) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const idx = Math.round(p * (allCommits.length - 1))
    onSeek(idx)
    window.__cosmos_fire_at?.(idx)
  }, [allCommits.length, onSeek])

  const onMouseDown = (e) => { dragging.current = true; seek(e) }
  const onMouseMove = useCallback((e) => { if (dragging.current) seek(e) }, [seek])
  const onMouseUp = () => { dragging.current = false }

  // Year ticks
  const ticks = []
  if (allCommits.length > 0) {
    const first = allCommits[0].date
    const last = allCommits[allCommits.length - 1].date
    const fy = first.getFullYear()
    const ly = last.getFullYear()
    for (let y = fy; y <= ly; y++) {
      const idx = allCommits.findIndex(c => c.date.getFullYear() >= y)
      const p = idx >= 0 ? idx / (allCommits.length - 1) : 0
      ticks.push({ year: y, pct: p })
    }
  }

  if (!allCommits.length) return null

  return (
    <div
      className={styles.timeline}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className={styles.top}>
        <div className={styles.dateBlock}>
          {current && (
            <>
              <span className={styles.dateMain}>
                {current.date.toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
              <span className={styles.dateSub}>
                <span style={{ color: current.color }}>{current.repo}</span>
                {' '}— {current.msg}
              </span>
            </>
          )}
        </div>

        <div className={styles.controls}>
          {playing ? (
            <button className={styles.ctrlBtn} onClick={onPause}>
              <span className={styles.pauseIcon}>⏸</span> Pause
            </button>
          ) : (
            <button className={`${styles.ctrlBtn} ${styles.ctrlBtnActive}`} onClick={onPlay}>
              <span>▶</span> Play
            </button>
          )}
          <button
            className={styles.ctrlBtn}
            onClick={() => { onSeek(allCommits.length - 1) }}
          >
            Live ●
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        className={styles.track}
        ref={trackRef}
        onMouseDown={onMouseDown}
      >
        <div className={styles.fill} style={{ width: `${pct * 100}%` }} />
        {/* Commit density marks */}
        {allCommits.map((c, i) => {
          if (i % Math.max(1, Math.floor(allCommits.length / 200)) !== 0) return null
          const p = i / (allCommits.length - 1)
          return (
            <div
              key={i}
              className={styles.mark}
              style={{ left: `${p * 100}%`, background: c.color }}
            />
          )
        })}
        <div className={styles.thumb} style={{ left: `${pct * 100}%` }} />
      </div>

      {/* Year labels */}
      <div className={styles.ticks}>
        {ticks.map(t => (
          <div
            key={t.year}
            className={styles.tick}
            style={{ left: `${t.pct * 100}%` }}
          >
            {t.year}
          </div>
        ))}
      </div>
    </div>
  )
}
