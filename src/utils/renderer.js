export const PALETTE = [
  '#38bdf8', '#a78bfa', '#34d399', '#fbbf24',
  '#fb7185', '#00ffe7', '#f472b6', '#60a5fa',
  '#4ade80', '#e879f9', '#facc15', '#2dd4bf',
  '#f97316', '#818cf8',
]

// Generate background stars once
export function generateBgStars(count = 400) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 5000 - 1200,
    y: Math.random() * 4000 - 1000,
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

export function createSystem(meta, commits, color, index, W, H) {
  const r = Math.max(9, Math.min(30, 9 + Math.sqrt(commits.length) * 1.6))
  const planetCount = Math.min(6, Math.max(1, Math.floor(commits.length / 15)))

  return {
    id: meta.full_name,
    repo: meta.name,
    full: meta.full_name,
    meta,
    commits,
    color,
    r,
    x: W / 2,
    y: H / 2,
    language: meta.language || '—',
    // animation state
    pulses: [],
    particles: [],
    glow: 0,
    // planets
    planets: Array.from({ length: planetCount }, (_, i) => ({
      angle: (i / planetCount) * Math.PI * 2 + Math.random() * 0.5,
      dist: r * (2.2 + i * 0.9),
      size: Math.random() * 2.5 + 1.2,
      speed: (0.0004 + Math.random() * 0.0012) * (Math.random() < 0.5 ? 1 : -1),
      color: PALETTE[(index + i + 4) % PALETTE.length],
      trail: [],
    })),
  }
}

export function repositionSystems(systems, W, H) {
  const n = systems.length
  if (!n) return
  const cx = W / 2, cy = H / 2
  const ringRadii = [0, 170, 295, 400, 490, 570]

  systems.forEach((s, i) => {
    if (i === 0) { s.x = cx; s.y = cy; return }
    const ring = Math.ceil(i / 6)
    const slot = (i - 1) % 6
    const slotsInRing = Math.min(6, n - (ring - 1) * 6)
    const angle = (slot / slotsInRing) * Math.PI * 2 + ring * 0.6
    const dist = (ringRadii[Math.min(ring, 5)] || 570) + (Math.random() * 50 - 25)
    s.x = cx + Math.cos(angle) * dist
    s.y = cy + Math.sin(angle) * dist
  })
}

export function drawFrame(ctx, W, H, systems, bgStars, camX, camY, camZ, showLabels) {
  ctx.clearRect(0, 0, W, H)

  // Deep void background
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H))
  bg.addColorStop(0, '#0a0420')
  bg.addColorStop(0.4, '#050115')
  bg.addColorStop(1, '#02010a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Nebula wisps
  drawNebulae(ctx, W, H)

  // Camera space
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.scale(camZ, camZ)
  ctx.translate(-W / 2 + camX / camZ, -H / 2 + camY / camZ)

  // Background stars
  const t = Date.now() * 0.001
  for (const s of bgStars) {
    const a = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(215, 230, 255, ${a})`
    ctx.fill()
  }

  // Web of connection lines between systems
  ctx.lineWidth = 0.5
  for (let i = 0; i < systems.length; i++) {
    for (let j = i + 1; j < systems.length; j++) {
      const a = systems[i], b = systems[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < 320) {
        ctx.globalAlpha = 0.06 * (1 - d / 320)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = '#38bdf8'
        ctx.stroke()
      }
    }
  }
  ctx.globalAlpha = 1

  // Draw each system
  for (const sys of systems) {
    drawSystem(ctx, sys, showLabels, camZ)
  }

  ctx.restore()
}

function drawNebulae(ctx, W, H) {
  const nebulae = [
    { x: W * 0.2, y: H * 0.25, r: 500, c: 'rgba(56,189,248,0.038)' },
    { x: W * 0.78, y: H * 0.72, r: 420, c: 'rgba(167,139,250,0.048)' },
    { x: W * 0.55, y: H * 0.5, r: 600, c: 'rgba(52,211,153,0.022)' },
    { x: W * 0.1, y: H * 0.8, r: 300, c: 'rgba(251,191,36,0.02)' },
  ]
  for (const n of nebulae) {
    const g = ctx.createRadialGradient(n.x, n.y, n.r * 0.1, n.x, n.y, n.r)
    g.addColorStop(0, n.c)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
  }
}

function drawSystem(ctx, sys, showLabels, camZ) {
  // Orbit rings
  for (const p of sys.planets) {
    ctx.beginPath()
    ctx.arc(sys.x, sys.y, p.dist, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // Ripple pulses
  sys.pulses = sys.pulses.filter(p => p.a > 0.01)
  for (const p of sys.pulses) {
    p.r += 1.5
    p.a *= 0.92
    ctx.beginPath()
    ctx.arc(sys.x, sys.y, p.r, 0, Math.PI * 2)
    ctx.strokeStyle = hexToRgba(p.color, p.a * 0.8)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // Particles
  sys.particles = sys.particles.filter(p => p.life > 0.03)
  for (const p of sys.particles) {
    p.x += p.vx; p.y += p.vy
    p.vx *= 0.965; p.vy *= 0.965
    p.life *= 0.905
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.8 * p.life, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(p.color, p.life)
    ctx.fill()
  }

  // Star corona glow
  sys.glow *= 0.93
  const coronaR = sys.r * 2.8 + sys.glow * sys.r * 2.5
  const corona = ctx.createRadialGradient(sys.x, sys.y, sys.r * 0.3, sys.x, sys.y, coronaR)
  corona.addColorStop(0, hexToRgba(sys.color, 0.35 + sys.glow * 0.3))
  corona.addColorStop(0.5, hexToRgba(sys.color, 0.08))
  corona.addColorStop(1, hexToRgba(sys.color, 0))
  ctx.beginPath()
  ctx.arc(sys.x, sys.y, coronaR, 0, Math.PI * 2)
  ctx.fillStyle = corona
  ctx.fill()

  // Star core
  const core = ctx.createRadialGradient(
    sys.x - sys.r * 0.3, sys.y - sys.r * 0.35, 0,
    sys.x, sys.y, sys.r
  )
  core.addColorStop(0, '#ffffff')
  core.addColorStop(0.25, '#f0f8ff')
  core.addColorStop(0.6, sys.color)
  core.addColorStop(1, darkenHex(sys.color, 0.4))
  ctx.beginPath()
  ctx.arc(sys.x, sys.y, sys.r, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()

  // Inner shine
  const shine = ctx.createRadialGradient(sys.x - sys.r * 0.4, sys.y - sys.r * 0.4, 0, sys.x, sys.y, sys.r * 0.8)
  shine.addColorStop(0, 'rgba(255,255,255,0.4)')
  shine.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.beginPath()
  ctx.arc(sys.x, sys.y, sys.r, 0, Math.PI * 2)
  ctx.fillStyle = shine
  ctx.fill()

  // Planet bodies with trails
  for (const p of sys.planets) {
    const px = sys.x + Math.cos(p.angle) * p.dist
    const py = sys.y + Math.sin(p.angle) * p.dist

    // Store trail
    p.trail.push({ x: px, y: py })
    if (p.trail.length > 18) p.trail.shift()

    // Draw trail
    if (p.trail.length > 2) {
      for (let i = 1; i < p.trail.length; i++) {
        const frac = i / p.trail.length
        ctx.beginPath()
        ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
        ctx.lineTo(p.trail[i].x, p.trail[i].y)
        ctx.strokeStyle = hexToRgba(p.color, frac * 0.35)
        ctx.lineWidth = p.size * frac * 0.8
        ctx.stroke()
      }
    }

    // Planet
    const pg = ctx.createRadialGradient(px - p.size * 0.3, py - p.size * 0.3, 0, px, py, p.size)
    pg.addColorStop(0, '#fff')
    pg.addColorStop(0.4, p.color)
    pg.addColorStop(1, darkenHex(p.color, 0.5))
    ctx.beginPath()
    ctx.arc(px, py, p.size, 0, Math.PI * 2)
    ctx.fillStyle = pg
    ctx.globalAlpha = 0.88
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // Label
  if (showLabels && camZ > 0.4) {
    const alpha = Math.min(1, (camZ - 0.4) * 2)
    ctx.font = `700 12px 'Syne', sans-serif`
    ctx.fillStyle = `rgba(240,244,255,${alpha * 0.85})`
    ctx.textAlign = 'center'
    const label = sys.full.length > 22 ? sys.repo : sys.full
    ctx.fillText(label, sys.x, sys.y + sys.r + 18)

    if (camZ > 0.9) {
      const a2 = Math.min(1, (camZ - 0.9) * 3)
      ctx.font = `10px 'Space Mono', monospace`
      ctx.fillStyle = hexToRgba(sys.color, a2 * 0.7)
      ctx.fillText(`${sys.commits.length} commits`, sys.x, sys.y + sys.r + 32)
    }
  }
}

export function fireCommit(sys) {
  sys.pulses.push({ r: sys.r * 0.8, a: 1, color: sys.color })
  sys.glow = Math.min(1, sys.glow + 0.7)
  for (let i = 0; i < 8; i++) {
    const ang = Math.random() * Math.PI * 2
    const spd = Math.random() * 1.8 + 0.4
    sys.particles.push({
      x: sys.x, y: sys.y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      life: 1,
      color: sys.color,
    })
  }
}

export function updatePlanets(systems, dt) {
  for (const s of systems) {
    for (const p of s.planets) {
      p.angle += p.speed * dt
    }
  }
}

export function worldToScreen(wx, wy, W, H, camX, camY, camZ) {
  return {
    sx: (wx - W / 2) * camZ + W / 2 + camX,
    sy: (wy - H / 2) * camZ + H / 2 + camY,
  }
}

export function screenToWorld(sx, sy, W, H, camX, camY, camZ) {
  return {
    wx: (sx - W / 2 - camX) / camZ + W / 2,
    wy: (sy - H / 2 - camY) / camZ + H / 2,
  }
}
