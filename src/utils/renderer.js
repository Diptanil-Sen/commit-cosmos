export const PALETTE = [
  '#38bdf8', '#a78bfa', '#34d399', '#fbbf24',
  '#fb7185', '#00ffe7', '#f472b6', '#60a5fa',
  '#4ade80', '#e879f9', '#facc15', '#2dd4bf',
  '#f97316', '#818cf8',
]

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
  const cx = 0
  const cy = 0

  // SUN
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
  }

  // PLANETS (repos)
  const planets = repoData.map(({ repo, commits }, i) => {
    const angle = (i / repoData.length) * Math.PI * 2
    const orbitR = 180 + i * 95 + Math.random() * 40
    const r = Math.max(7, Math.min(22, 7 + Math.sqrt(repo.stargazers_count + 1) * 1.4))
    const color = PALETTE[i % PALETTE.length]
    const speed = (0.00015 + Math.random() * 0.0002) * (Math.random() < 0.5 ? 1 : -1)

    // MOONS (commits)
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
      color,
      r,
      orbitR,
      angle,
      speed,
      x: cx + Math.cos(angle) * orbitR,
      y: cy + Math.sin(angle) * orbitR,
      commits,
      moons,
      pulses: [],
      particles: [],
      glow: 0,
      trail: [],
    }
  })

  return { sun, planets }
}

export function updateUniverse(sun, planets, dt) {
  for (const p of planets) {
    p.angle += p.speed * dt
    p.x = sun.x + Math.cos(p.angle) * p.orbitR
    p.y = sun.y + Math.sin(p.angle) * p.orbitR

    // Store planet trail
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
}

export function drawFrame(ctx, W, H, sun, planets, bgStars, camX, camY, camZ) {
  ctx.clearRect(0, 0, W, H)

  // Deep void
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

  // BG stars
  const t = Date.now() * 0.001
  for (const s of bgStars) {
    const a = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(215,230,255,${a})`
    ctx.fill()
  }

  if (!sun) { ctx.restore(); return }

  // Planet orbit rings
  for (const p of planets) {
    ctx.beginPath()
    ctx.arc(sun.x, sun.y, p.orbitR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.028)'
    ctx.lineWidth = 0.8
    ctx.stroke()
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

  // Draw planets + moons
  for (const p of planets) {
    drawPlanet(ctx, p)
  }

  // Draw sun last (on top)
  drawSun(ctx, sun)

  ctx.restore()
}

function drawSun(ctx, sun) {
  // Outer glow layers
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

  // Corona flare
  const corona = ctx.createRadialGradient(sun.x, sun.y, sun.r * 0.5, sun.x, sun.y, sun.r * 2.5)
  corona.addColorStop(0, 'rgba(255,240,180,0.6)')
  corona.addColorStop(0.4, 'rgba(255,200,80,0.2)')
  corona.addColorStop(1, 'rgba(255,150,0,0)')
  ctx.beginPath()
  ctx.arc(sun.x, sun.y, sun.r * 2.5, 0, Math.PI * 2)
  ctx.fillStyle = corona
  ctx.fill()

  // Core
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

  // Username label
  ctx.font = `bold 13px 'Syne', sans-serif`
  ctx.fillStyle = 'rgba(255,240,180,0.9)'
  ctx.textAlign = 'center'
  ctx.fillText(sun.displayName, sun.x, sun.y + sun.r + 18)
}

function drawPlanet(ctx, p) {
  // Moon orbit rings
  for (const m of p.moons) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, m.orbitR, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(p.color, 0.04)
    ctx.lineWidth = 0.4
    ctx.stroke()
  }

  // Pulses
  p.pulses = p.pulses.filter(pulse => pulse.a > 0.01)
  for (const pulse of p.pulses) {
    pulse.r += 1.2
    pulse.a *= 0.93
    ctx.beginPath()
    ctx.arc(p.x, p.y, pulse.r, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(p.color, pulse.a * 0.7)
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  // Particles
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

  // Glow
  p.glow *= 0.93
  const gr = p.r * 2.5 + p.glow * p.r * 2
  const gc = ctx.createRadialGradient(p.x, p.y, p.r * 0.3, p.x, p.y, gr)
  gc.addColorStop(0, hexToRgba(p.color, 0.3 + p.glow * 0.25))
  gc.addColorStop(1, hexToRgba(p.color, 0))
  ctx.beginPath()
  ctx.arc(p.x, p.y, gr, 0, Math.PI * 2)
  ctx.fillStyle = gc
  ctx.fill()

  // Planet core
  const pc = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r)
  pc.addColorStop(0, '#fff')
  pc.addColorStop(0.3, p.color)
  pc.addColorStop(1, darkenHex(p.color, 0.4))
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = pc
  ctx.fill()

  // Planet label
  ctx.font = `700 10px 'Syne', sans-serif`
  ctx.fillStyle = hexToRgba(p.color, 0.8)
  ctx.textAlign = 'center'
  ctx.fillText(p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name, p.x, p.y + p.r + 13)

  // Moons
  for (const m of p.moons) {
    const mx = p.x + Math.cos(m.angle) * m.orbitR
    const my = p.y + Math.sin(m.angle) * m.orbitR

    // Moon trail
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

    // Moon body
    ctx.beginPath()
    ctx.arc(mx, my, m.r, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(m.color, 0.75)
    ctx.fill()
  }
}

function drawNebulae(ctx, W, H) {
  const pts = [
    { x: W * 0.2, y: H * 0.25, r: 550, c: 'rgba(56,189,248,0.035)' },
    { x: W * 0.8, y: H * 0.7, r: 450, c: 'rgba(167,139,250,0.045)' },
    { x: W * 0.5, y: H * 0.5, r: 650, c: 'rgba(52,211,153,0.02)' },
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
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
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