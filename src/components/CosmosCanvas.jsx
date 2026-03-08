import { useEffect, useRef, useCallback } from 'react'
import {
  drawFrame, updateUniverse, generateBgStars,
  triggerSupernova, updateSupernova,
  updateShootingStars,
} from '../utils/renderer'
import { pingCommit } from '../utils/soundEngine'

export default function CosmosCanvas({
  sun, planets, asteroids = [], constellation = [], nebulaClouds = [], comet = null,
  speed = 1, showConstellation = false,
  onTooltip, onCommitFlash, onPlanetClick, screenshotRef,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    sun: null, planets: [], asteroids: [], constellation: [],
    nebulaClouds: [], comet: null,
    bgStars: generateBgStars(500),
    shootingStars: [],
    camX: 0, camY: 0, camZ: 1, targetZ: 1,
    dragging: false, dragMoved: false, lastX: 0, lastY: 0,
    lastTime: null, speed: 1,
    showConstellation: false,
    supernovaDone: false,
  })

  // Screenshot
  useEffect(() => {
    if (screenshotRef) {
      screenshotRef.current = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const link = document.createElement('a')
        link.download = `commit-cosmos-${stateRef.current.sun?.name || 'cosmos'}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
    }
  }, [screenshotRef])

  useEffect(() => { stateRef.current.speed = speed }, [speed])
  useEffect(() => { stateRef.current.showConstellation = showConstellation }, [showConstellation])

  // Sync props, trigger supernova when new user loads
  useEffect(() => {
    stateRef.current.sun = sun ?? null
    stateRef.current.planets = planets ?? []
    stateRef.current.asteroids = asteroids ?? []
    stateRef.current.constellation = constellation ?? []
    stateRef.current.nebulaClouds = nebulaClouds ?? []
    stateRef.current.comet = comet ?? null
    if (sun && planets?.length) {
      stateRef.current.camX = 0
      stateRef.current.camY = 0
      stateRef.current.camZ = 1
      stateRef.current.targetZ = 1
      stateRef.current.supernovaDone = false
      triggerSupernova(planets)
    }
  }, [sun, planets, asteroids, constellation, nebulaClouds, comet])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function loop(ts) {
      const s = stateRef.current
      const dt = Math.min((ts - (s.lastTime ?? ts)), 50) * s.speed
      s.lastTime = ts
      s.camZ += (s.targetZ - s.camZ) * 0.1

      if (s.sun && s.planets.length) {
        if (!s.supernovaDone) {
          s.supernovaDone = updateSupernova(s.planets, dt)
        }
        updateUniverse(s.sun, s.planets, dt, s.asteroids, s.comet)
      }

      // Collect commit messages for shooting stars
      const msgs = s.planets.flatMap(p => p.moons.map(m => m.msg))
      updateShootingStars(s.shootingStars, dt, msgs)

      drawFrame(ctx, canvas.width, canvas.height, s.sun, s.planets, s.bgStars, s.camX, s.camY, s.camZ, {
        showConstellation: s.showConstellation,
        constellation: s.constellation,
        asteroids: s.asteroids,
        nebulaClouds: s.nebulaClouds,
        comet: s.comet,
        shootingStars: s.shootingStars,
      })

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  // Globals
  useEffect(() => {
    window.__cosmos_zoom = f => {
      stateRef.current.targetZ = Math.min(5, Math.max(0.1, stateRef.current.targetZ * f))
    }
    window.__cosmos_reset_cam = () => {
      stateRef.current.camX = 0
      stateRef.current.camY = 0
      stateRef.current.targetZ = 1
    }
    window.__cosmos_focus_planet = planet => {
      if (!planet) return
      stateRef.current.targetZ = 2.5
      stateRef.current.camX = -(planet.x ?? 0)
      stateRef.current.camY = -(planet.y ?? 0)
    }
  }, [])

  const getHit = useCallback((e) => {
    const s = stateRef.current
    if (!s.sun) return null
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left - canvas.width / 2) / s.camZ - s.camX
    const my = (e.clientY - rect.top - canvas.height / 2) / s.camZ - s.camY
    return hitTest(mx, my, s.sun, s.planets)
  }, [])

  const handleMouseDown = useCallback((e) => {
    stateRef.current.dragging = true
    stateRef.current.dragMoved = false
    stateRef.current.lastX = e.clientX
    stateRef.current.lastY = e.clientY
  }, [])

  const handleMouseMove = useCallback((e) => {
    const s = stateRef.current
    if (s.dragging) {
      const dx = e.clientX - s.lastX, dy = e.clientY - s.lastY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) s.dragMoved = true
      s.camX += dx / s.camZ
      s.camY += dy / s.camZ
      s.lastX = e.clientX
      s.lastY = e.clientY
    } else {
      const hit = getHit(e)
      onTooltip?.(hit ? { x: e.clientX, y: e.clientY, ...hit } : null)
      canvasRef.current.style.cursor = hit ? 'pointer' : 'grab'
    }
  }, [onTooltip, getHit])

  const handleMouseUp = useCallback((e) => {
    const s = stateRef.current
    if (!s.dragMoved) {
      const hit = getHit(e)
      if (hit?.type === 'planet') {
        // Open commit drawer
        onPlanetClick?.(hit.data)
      } else if (hit?.type === 'sun') {
        window.open(`https://github.com/${hit.data.name}`, '_blank')
      }
    }
    s.dragging = false
  }, [getHit, onPlanetClick])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    stateRef.current.targetZ = Math.min(5, Math.max(0.1, stateRef.current.targetZ * (e.deltaY < 0 ? 1.1 : 0.9)))
  }, [])

  const touchRef = useRef({ dist: 0 })
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) touchRef.current.dist = pinchDist(e.touches)
    stateRef.current.lastX = e.touches[0].clientX
    stateRef.current.lastY = e.touches[0].clientY
  }, [])
  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const s = stateRef.current
    if (e.touches.length === 1) {
      s.camX += (e.touches[0].clientX - s.lastX) / s.camZ
      s.camY += (e.touches[0].clientY - s.lastY) / s.camZ
      s.lastX = e.touches[0].clientX
      s.lastY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const newDist = pinchDist(e.touches)
      s.targetZ = Math.min(5, Math.max(0.1, s.targetZ * (newDist / (touchRef.current.dist || newDist))))
      touchRef.current.dist = newDist
    }
  }, [])
  const handleTouchEnd = useCallback(() => { touchRef.current.dist = 0 }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { stateRef.current.dragging = false; onTooltip?.(null) }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  )
}

function hitTest(mx, my, sun, planets) {
  if (sun) {
    const dx = mx - (sun.x ?? 0), dy = my - (sun.y ?? 0)
    if (Math.sqrt(dx*dx + dy*dy) < (sun.r ?? 38) + 8) return { type: 'sun', data: sun }
  }
  for (const p of planets ?? []) {
    const dx = mx - (p.x ?? 0), dy = my - (p.y ?? 0)
    if (Math.sqrt(dx*dx + dy*dy) < (p.r ?? 10) + 6) return { type: 'planet', data: p }
  }
  return null
}

function pinchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx*dx + dy*dy)
}