import { useState, useEffect, useRef } from 'react';
import styles from './IntroScreen.module.css';

const DEMO_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'Diptanil-Sen'];

export default function IntroScreen({ onSearch, loading }) {
  const [input, setInput] = useState('');
  const [stars, setStars] = useState([]);
  const inputRef = useRef(null);

  // Generate random star positions once
  useEffect(() => {
    const s = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    }));
    setStars(s);
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 600);
  }, []);

  function handleSubmit() {
    const u = input.trim();
    if (!u) return;
    onSearch(u);
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className={styles.overlay}>
      {/* Animated star field */}
      <div className={styles.starfield} aria-hidden="true">
        {stars.map(s => (
          <span
            key={s.id}
            className={styles.star}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing nebula blobs */}
      <div className={styles.nebula1} aria-hidden="true" />
      <div className={styles.nebula2} aria-hidden="true" />

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <span className={styles.logoIcon}>✦</span>
          <h1 className={styles.logo}>
            COMMIT<br />
            <span className={styles.logoAccent}>COSMOS</span>
          </h1>
        </div>

        <p className={styles.tagline}>
          Your entire GitHub history —<br />
          <em>as a living solar system.</em>
        </p>

        <p className={styles.sub}>
          Every repo orbits as a planet. Every commit, a moon.
        </p>

        {/* Search */}
        <div className={styles.searchRow}>
          <div className={styles.inputWrap}>
            <span className={styles.atSign}>@</span>
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="github username"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <button
            className={styles.btn}
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>EXPLORE <span className={styles.arrow}>→</span></>
            )}
          </button>
        </div>

        {/* Demo chips */}
        <div className={styles.chips}>
          <span className={styles.tryLabel}>try →</span>
          {DEMO_USERS.map(u => (
            <button
              key={u}
              className={styles.chip}
              onClick={() => onSearch(u)}
              disabled={loading}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Feature pills */}
        <div className={styles.features}>
          {['Orbital physics', 'Commit history', 'Shareable URL', 'Screenshot', 'Realtime'].map(f => (
            <span key={f} className={styles.featurePill}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
