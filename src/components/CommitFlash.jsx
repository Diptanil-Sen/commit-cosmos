import { useState, useEffect, useRef } from 'react'
import styles from './CommitFlash.module.css'

export default function CommitFlash({ commit }) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!commit) return
    setCurrent(commit)
    setVisible(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timerRef.current)
  }, [commit])

  if (!current) return null

  return (
    <div className={`${styles.flash} ${visible ? styles.visible : styles.hidden}`}>
      <div
        className={styles.bar}
        style={{ '--c': current.color }}
      >
        <div className={styles.dot} />
        <div className={styles.content}>
          <span className={styles.repo}>{current.repo}</span>
          <span className={styles.sha}>{current.sha}</span>
        </div>
        <div className={styles.msg}>{current.msg}</div>
        <div className={styles.author}>{current.author}</div>
      </div>
    </div>
  )
}
