import styles from './ZoomControls.module.css'

export default function ZoomControls() {
  return (
    <div className={styles.wrap}>
      <button className={styles.btn} onClick={() => window.__cosmos_zoom?.(1.25)} title="Zoom In">+</button>
      <button className={styles.btn} onClick={() => window.__cosmos_zoom?.(0.8)} title="Zoom Out">−</button>
      <button className={styles.btn} onClick={() => window.__cosmos_reset_cam?.()} title="Reset View">⌖</button>
    </div>
  )
}
