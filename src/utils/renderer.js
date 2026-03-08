export const PALETTE = [
  '#38bdf8', '#a78bfa', '#34d399', '#fbbf24',
  '#fb7185', '#00ffe7', '#f472b6', '#60a5fa',
  '#4ade80', '#e879f9', '#facc15', '#2dd4bf',
  '#f97316', '#818cf8',
]

const LANGUAGE_COLORS = {
  JavaScript: '#fbbf24', TypeScript: '#38bdf8', Python: '#34d399',
  Rust: '#f97316', Go: '#00ffe7', C: '#a78bfa',
  'C++': '#fb7185', Ruby: '#e879f9', Java: '#60a5fa',
  Swift: '#f472b6', Kotlin: '#4ade80', Shell: '#facc15',
  HTML: '#fb923c', CSS: '#818cf8', Dart: '#2dd4bf',
}

export function getLanguageColor(lang) {
  return LANGUAGE_COLORS[lang] || '#ffffff'
}

export function generateBgStars(count = 500) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 6000 - 1500,
    y: Math.random() * 5000 - 1200,
    r: Math.random() * 1.4 + 0.15,
    a: Math.random() * 0.5 + 0.06,
    sp: Math.random() * 0.008 + 0.001,
    ph: Math.random() * Math.PI * 2,
  }))
}

export function generateShootingStars() {
  return []
}

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${+alpha.toFixed(3)})`
}

export function darkenHex(hex, factor) {
  return `rgb(${[1, 3, 5]
    .map(i => Math.floor(parseInt(hex.slice(i, i + 2), 16) * factor))
    .join(',')})`
}

export function buildUniverse(user, repoData) {
  const cx = 0, cy = 0

  const sun = {
    name: user.login,
    displayName: user.name || user.login,
    avatar: user.avatar_url,
    bio: user.bio,
    followers: user.followers,
    publicRepos: user.public_repos,
    x: cx, y: cy,
    r: 38,
    color: '#fff9e6',
    glowColor: '#ffd54f',
    streak: computeStreak(repoData),
  }

  const planets = repoData.map(({ repo, commits }, i) => {
    const angle = (i / repoData.length) * Math.PI * 2
    const orbitR = 180 + i * 95 + Math.random() * 40
    const r = Math.max(7, Math.min(22, 7 + Math.sqrt(repo.stargazers_count + 1) * 1.4))
    const color = PALETTE[i % PALETTE.length]
    const speed = (0.00015 + Math.random() * 0.0002) * (Math.random() < 0.5 ? 1 : -1)

    const now = Date.now()
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
    const recentCommits = commits.filter(c => new Date(c.commit.author.date) > oneYearAgo).length
    const activityScore = Math.min(1, recentCommits / 20)

    const moons = commits.slice(0, 60).map((c, mi) => ({
      sha: c.sha.slice(0, 7),
      msg: c.commit.message.split('\n')[0].slice(0, 60),
      date: new Date(c.commit.author.date),
      author: c.commit.author.name,
      angle: (mi / Math.min(commits.length, 60)) * Math.PI * 2,
      orbitR: r * 2.2 + mi * 3.5,
      r: Math.random() * 1.8 + 0.8,
      speed: (0.0008 + Math.random() * 0.002) * (Math.random() < 0.5 ? 1 : -1),
      color,
      trail: [],
    }))

    return {
      id: repo.full_name,
      name: repo.name,
      full: repo.full_name,
      description: repo.description,
      language: repo.language || '—',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      color, r, orbitR, angle, speed,
      x: cx + Math.cos(angle) * orbitR,
      y: cy + Math.sin(angle) * orbitR,
      commits,
      moons,
      pulses: [], particles: [], glow: 0, trail: [],
      activityScore,
      planetIndex: i,
      // Supernova: planets start at sun center and explode out
      supernovaProgress: 0,
      supernovaTarget: { x: cx + Math.cos(angle) * orbitR, y: cy + Math.sin(angle) * orbitR },
    }
  })

  const asteroids = buildAsteroidBelt(repoData, planets)
  const constellation = buildConstellation(planets, repoData)
  const nebulaClouds = buildLanguageNebulae(planets)
  const comet = sun.streak > 2 ? buildComet(sun) : null

  return { sun, planets, asteroids, constellation, nebulaClouds, comet }
}

function computeStreak(repoData) {
  const allDates = new Set()
  repoData.forEach(({ commits }) => {
    commits.forEach(c => {
      allDates.add(new Date(c.commit.author.date).toDateString())
    })
  })
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (allDates.has(d.toDateString())) streak++
    else if (i > 0) break
  }
  return streak
}

function buildAsteroidBelt(repoData, planets) {
  const maxOrbit = planets.length > 0 ? Math.max(...planets.map(p => p.orbitR)) : 500
  const beltR = maxOrbit + 120
  return Array.from({ length: 80 }, (_, i) => ({
    angle: (i / 80) * Math.PI * 2 + Math.random() * 0.15,
    orbitR: beltR + (Math.random() - 0.5) * 60,
    r: Math.random() * 2 + 0.5,
    speed: 0.00003 + Math.random() * 0.00005,
    x: 0, y: 0,
    alpha: Math.random() * 0.4 + 0.15,
  }))
}

function buildConstellation(planets, repoData) {
  const sorted = [...planets].sort((a, b) => {
    const ra = repoData.find(r => r.repo.name === a.name)
    const rb = repoData.find(r => r.repo.name === b.name)
    if (!ra || !rb) return 0
    return new Date(ra.repo.created_at) - new Date(rb.repo.created_at)
  })
  return sorted.map((p, i) => ({ from: p, to: sorted[(i + 1) % sorted.length] }))
}

function buildLanguageNebulae(planets) {
  const groups = {}
  for (const p of planets) {
    const lang = p.language === '—' ? 'Other' : p.language
    if (!groups[lang]) groups[lang] = []
    groups[lang].push(p)
  }
  return Object.entries(groups)
    .filter(([, ps]) => ps.length >= 2)
    .map(([lang, ps]) => {
      const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length
      const cy = ps.reduce((s, p) => s + p.y, 0) / ps.length
      const maxDist = Math.max(...ps.map(p => Math.hypot(p.x - cx, p.y - cy)))
      return { lang, cx, cy, r: maxDist + 80, color: getLanguageColor(lang) }
    })
}

function buildComet(sun) {
  return {
    x: sun.x, y: sun.y,
    angle: Math.random() * Math.PI * 2,
    orbitR: 280 + Math.random() * 100,
    speed: 0.0008,
    trail: [],
    streak: sun.streak,
  }
}

// ── Supernova: explode planets out from center ──────────────────────────────
export function triggerSupernova(planets) {
  for (const p of planets) {
    p.x = 0
    p.y = 0
    p.supernovaProgress = 0
    p.trail = []
    for (const m of p.moons) m.trail = []
  }
}

export function updateSupernova(planets, dt) {
  let allDone = true
  for (const p of planets) {
    if (p.supernovaProgress < 1) {
      allDone = false
      p.supernovaProgress = Math.min(1, p.supernovaProgress + dt * 0.0008)
      const ease = easeOutElastic(p.supernovaProgress)
      p.x = p.supernovaTarget.x * ease
      p.y = p.supernovaTarget.y * ease
    }
  }
  return allDone
}

function easeOutElastic(t) {
  if (t === 0 || t === 1) return t
  const c4 = (2 * Math.PI) / 3
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export function updateUniverse(sun, planets, dt, asteroids, comet) {
  for (const p of planets) {
    // Only orbit if supernova done
    if (p.supernovaProgress >= 1) {
      p.angle += p.speed * dt
      p.x = sun.x + Math.cos(p.angle) * p.orbitR
      p.y = sun.y + Math.sin(p.angle) * p.orbitR
    }

    p.trail.push({ x: p.x, y: p.y })
    if (p.trail.length > 60) p.trail.shift()

    for (const m of p.moons) {
      m.angle += m.speed * dt
      m.trail.push({
        x: p.x + Math.cos(m.angle) * m.orbitR,
        y: p.y + Math.sin(m.angle) * m.orbitR,
      })
      if (m.trail.length > 12) m.trail.shift()
    }
  }

  if (asteroids) {
    for (const a of asteroids) {
      a.angle += a.speed * dt
      a.x = sun.x + Math.cos(a.angle) * a.orbitR
      a.y = sun.y + Math.sin(a.angle) * a.orbitR
    }
  }

  if (comet) {
    comet.angle += comet.speed * dt
    comet.x = sun.x + Math.cos(comet.angle) * comet.orbitR
    comet.y = sun.y + Math.sin(comet.angle) * comet.orbitR
    comet.trail.push({ x: comet.x, y: comet.y })
    if (comet.trail.length > 40) comet.trail.shift()
  }
}

// ── Shooting stars ──────────────────────────────────────────────────────────
export function spawnShootingStar(commitMessages = []) {
  const msg = commitMessages.length > 0
    ? commitMessages[Math.floor(Math.random() * commitMessages.length)]
    : null
  return {
    x: (Math.random() - 0.5) * 3000,
    y: (Math.random() - 0.5) * 2000,
    vx: (Math.random() * 6 + 4) * (Math.random() < 0.5 ? 1 : -1),
    vy: Math.random() * 3 + 1,
    life: 1,
    length: Math.random() * 120 + 60,
    msg,
    alpha: 0,
  }
}

export function updateShootingStars(stars, dt, commitMessages) {
  // Randomly spawn
  if (Math.random() < 0.004 * (dt / 16)) {
    stars.push(spawnShootingStar(commitMessages))
  }

  for (const s of stars) {
    s.x += s.vx * (dt / 16)
    s.y += s.vy * (dt / 16)
    s.life -= 0.012 * (dt / 16)
    s.alpha = s.life > 0.8 ? (1 - s.life) * 5 : s.life < 0.2 ? s.life * 5 : 1
  }

  // Remove dead stars
  for (let i = stars.length - 1; i >= 0; i--) {
    if (stars[i].life <= 0) stars.splice(i, 1)
  }
}

export function drawFrame(ctx, W, H, sun, planets, bgStars, camX, camY, camZ, opts = {}) {
  const {
    showConstellation = false, constellation = [],
    asteroids = [], nebulaClouds = [], comet = null,
    shootingStars = [],
  } = opts

  ctx.clearRect(0, 0, W, H)

  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H))
  bg.addColorStop(0, '#0a0420')
  bg.addColorStop(0.4, '#050115')
  bg.addColorStop(1, '#02010a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  drawNebulae(ctx, W, H)

  ctx.save()
  ctx.translate(W / 2 + camX, H / 2 + camY)
  ctx.scale(camZ, camZ)

  const t = Date.now() * 0.001
  for (const s of bgStars) {
    const a = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(215,230,255,${a})`
    ctx.fill()
  }

  // Shooting stars (in world space so they drift with camera feel)
  for (const s of shootingStars) {
    const angle = Math.atan2(s.vy, s.vx)
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(angle)
    const grad = ctx.createLinearGradient(-s.length, 0, 0, 0)
    grad.addColorStop(0, `rgba(255,255,255,0)`)
    grad.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.9})`)
    ctx.beginPath()
    ctx.moveTo(-s.length, 0)
    ctx.lineTo(0, 0)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Commit message label on shooting star
    if (s.msg && s.alpha > 0.4) {
      ctx.font = `500 9px 'Space Mono', monospace`
      ctx.fillStyle = `rgba(255,255,255,${s.alpha * 0.5})`
      ctx.textAlign = 'left'
      ctx.fillText(s.msg.slice(0, 40), 4, -4)
    }
    ctx.restore()
  }

  if (!sun) { ctx.restore(); return }

  // Language nebula clouds
  for (const cloud of nebulaClouds) {
    const g = ctx.createRadialGradient(cloud.cx, cloud.cy, 0, cloud.cx, cloud.cy, cloud.r)
    g.addColorStop(0, hexToRgba(cloud.color, 0.06))
    g.addColorStop(0.5, hexToRgba(cloud.color, 0.03))
    g.addColorStop(1, hexToRgba(cloud.color, 0))
    ctx.beginPath()
    ctx.arc(cloud.cx, cloud.cy, cloud.r, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
    ctx.font = `600 11px 'Space Mono', monospace`
    ctx.fillStyle = hexToRgba(cloud.color, 0.25)
    ctx.textAlign = 'center'
    ctx.fillText(cloud.lang, cloud.cx, cloud.cy - cloud.r + 20)
  }

  // Constellation lines
  if (showConstellation && constellation.length) {
    for (const line of constellation) {
      ctx.beginPath()
      ctx.moveTo(line.from.x, line.from.y)
      ctx.lineTo(line.to.x, line.to.y)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 0.8
      ctx.setLineDash([4, 8])
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  // Orbit rings
  for (const p of planets) {
    if (p.supernovaProgress < 1) continue
    ctx.beginPath()
    ctx.arc(sun.x, sun.y, p.orbitR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.028)'
    ctx.lineWidth = 0.8
    ctx.stroke()
  }

  // Asteroid belt
  for (const a of asteroids) {
    ctx.beginPath()
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(180,160,120,${a.alpha})`
    ctx.fill()
  }

  // Comet
  if (comet && comet.trail.length > 2) {
    for (let i = 1; i < comet.trail.length; i++) {
      const frac = i / comet.trail.length
      ctx.beginPath()
      ctx.moveTo(comet.trail[i - 1].x, comet.trail[i - 1].y)
      ctx.lineTo(comet.trail[i].x, comet.trail[i].y)
      ctx.strokeStyle = `rgba(255,240,180,${frac * 0.6})`
      ctx.lineWidth = frac * 3
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.arc(comet.x, comet.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#fff9e6'
    ctx.shadowColor = '#ffd54f'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.font = `700 9px 'Space Mono', monospace`
    ctx.fillStyle = 'rgba(255,220,100,0.7)'
    ctx.textAlign = 'center'
    ctx.fillText(`🔥 ${comet.streak} day streak`, comet.x, comet.y - 10)
  }

  // Planet trails
  for (const p of planets) {
    if (p.trail.length > 2) {
      for (let i = 1; i < p.trail.length; i++) {
        const frac = i / p.trail.length
        ctx.beginPath()
        ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
        ctx.lineTo(p.trail[i].x, p.trail[i].y)
        ctx.strokeStyle = hexToRgba(p.color, frac * 0.18)
        ctx.lineWidth = p.r * frac * 0.5
        ctx.stroke()
      }
    }
  }

  for (const p of planets) drawPlanet(ctx, p)
  drawSun(ctx, sun)

  ctx.restore()
}

function drawSun(ctx, sun) {
  const glowSizes = [180, 120, 80, 55]
  const glowAlphas = [0.04, 0.07, 0.12, 0.2]
  for (let i = 0; i < glowSizes.length; i++) {
    const g = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, glowSizes[i])
    g.addColorStop(0, `rgba(255,220,100,${glowAlphas[i]})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath()
    ctx.arc(sun.x, sun.y, glowSizes[i], 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
  }

  const corona = ctx.createRadialGradient(sun.x, sun.y, sun.r * 0.5, sun.x, sun.y, sun.r * 2.5)
  corona.addColorStop(0, 'rgba(255,240,180,0.6)')
  corona.addColorStop(0.4, 'rgba(255,200,80,0.2)')
  corona.addColorStop(1, 'rgba(255,150,0,0)')
  ctx.beginPath()
  ctx.arc(sun.x, sun.y, sun.r * 2.5, 0, Math.PI * 2)
  ctx.fillStyle = corona
  ctx.fill()

  const core = ctx.createRadialGradient(
    sun.x - sun.r * 0.3, sun.y - sun.r * 0.3, 0,
    sun.x, sun.y, sun.r
  )
  core.addColorStop(0, '#ffffff')
  core.addColorStop(0.3, '#fff9c4')
  core.addColorStop(0.7, '#ffcc02')
  core.addColorStop(1, '#ff9800')
  ctx.beginPath()
  ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()

  ctx.font = `bold 13px 'Syne', sans-serif`
  ctx.fillStyle = 'rgba(255,240,180,0.9)'
  ctx.textAlign = 'center'
  ctx.fillText(sun.displayName, sun.x, sun.y + sun.r + 18)
}

function drawPlanet(ctx, p) {
  // Activity ring
  if (p.activityScore > 0) {
    const ringColor = p.activityScore > 0.6 ? '#34d399' : p.activityScore > 0.3 ? '#fbbf24' : '#4b5563'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(ringColor, 0.5 * p.activityScore + 0.15)
    ctx.lineWidth = 2
    ctx.stroke()
  }

  for (const m of p.moons) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, m.orbitR, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(p.color, 0.04)
    ctx.lineWidth = 0.4
    ctx.stroke()
  }

  p.pulses = p.pulses.filter(pulse => pulse.a > 0.01)
  for (const pulse of p.pulses) {
    pulse.r += 1.2; pulse.a *= 0.93
    ctx.beginPath()
    ctx.arc(p.x, p.y, pulse.r, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(p.color, pulse.a * 0.7)
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  p.particles = p.particles.filter(pt => pt.life > 0.03)
  for (const pt of p.particles) {
    pt.x += pt.vx; pt.y += pt.vy
    pt.vx *= 0.96; pt.vy *= 0.96
    pt.life *= 0.91
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 1.5 * pt.life, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(p.color, pt.life)
    ctx.fill()
  }

  p.glow *= 0.93
  const gr = p.r * 2.5 + p.glow * p.r * 2
  const gc = ctx.createRadialGradient(p.x, p.y, p.r * 0.3, p.x, p.y, gr)
  gc.addColorStop(0, hexToRgba(p.color, 0.3 + p.glow * 0.25))
  gc.addColorStop(1, hexToRgba(p.color, 0))
  ctx.beginPath()
  ctx.arc(p.x, p.y, gr, 0, Math.PI * 2)
  ctx.fillStyle = gc
  ctx.fill()

  const pc = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r)
  pc.addColorStop(0, '#fff')
  pc.addColorStop(0.3, p.color)
  pc.addColorStop(1, darkenHex(p.color, 0.4))
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = pc
  ctx.fill()

  ctx.font = `700 10px 'Syne', sans-serif`
  ctx.fillStyle = hexToRgba(p.color, 0.8)
  ctx.textAlign = 'center'
  ctx.fillText(p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name, p.x, p.y + p.r + 13)

  for (const m of p.moons) {
    const mx = p.x + Math.cos(m.angle) * m.orbitR
    const my = p.y + Math.sin(m.angle) * m.orbitR
    if (m.trail.length > 2) {
      for (let i = 1; i < m.trail.length; i++) {
        const frac = i / m.trail.length
        ctx.beginPath()
        ctx.moveTo(m.trail[i - 1].x, m.trail[i - 1].y)
        ctx.lineTo(m.trail[i].x, m.trail[i].y)
        ctx.strokeStyle = hexToRgba(m.color, frac * 0.25)
        ctx.lineWidth = m.r * frac * 0.7
        ctx.stroke()
      }
    }
    ctx.beginPath()
    ctx.arc(mx, my, m.r, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(m.color, 0.75)
    ctx.fill()
  }
}

function drawNebulae(ctx, W, H) {
  const pts = [
    { x: W * 0.2, y: H * 0.25, r: 550, c: 'rgba(56,189,248,0.035)' },
    { x: W * 0.8, y: H * 0.7,  r: 450, c: 'rgba(167,139,250,0.045)' },
    { x: W * 0.5, y: H * 0.5,  r: 650, c: 'rgba(52,211,153,0.02)' },
    { x: W * 0.1, y: H * 0.85, r: 350, c: 'rgba(251,191,36,0.018)' },
  ]
  for (const n of pts) {
    const g = ctx.createRadialGradient(n.x, n.y, n.r * 0.1, n.x, n.y, n.r)
    g.addColorStop(0, n.c)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
  }
}

export function firePulse(planet) {
  planet.pulses.push({ r: planet.r * 0.8, a: 1, color: planet.color })
  planet.glow = Math.min(1, planet.glow + 0.8)
  for (let i = 0; i < 6; i++) {
    const ang = Math.random() * Math.PI * 2
    const spd = Math.random() * 1.6 + 0.4
    planet.particles.push({
      x: planet.x, y: planet.y,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      life: 1, color: planet.color,
    })
  }
}

export function screenToWorld(sx, sy, W, H, camX, camY, camZ) {
  return {
    wx: (sx - W / 2 - camX) / camZ,
    wy: (sy - H / 2 - camY) / camZ,
  }
}