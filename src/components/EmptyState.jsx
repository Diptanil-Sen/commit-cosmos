import styles from './EmptyState.module.css'

const EXAMPLES = [
  { label: 'React', slug: 'facebook/react' },
  { label: 'VS Code', slug: 'microsoft/vscode' },
  { label: 'Next.js', slug: 'vercel/next.js' },
]

export default function EmptyState({ onAdd }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.orbs}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>
        <div className={styles.icon}>✦</div>
        <div className={styles.title}>Your Universe Awaits</div>
        <div className={styles.body}>
          Add any GitHub repository from the sidebar.<br />
          Each repo becomes a star. Each commit — a pulse of light.
        </div>
        <div className={styles.examples}>
          {EXAMPLES.map(e => (
            <button
              key={e.slug}
              className={styles.exBtn}
              onClick={() => onAdd(e.slug)}
            >
              Try {e.label} →
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
