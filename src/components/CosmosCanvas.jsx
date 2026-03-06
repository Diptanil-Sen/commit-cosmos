import { useEffect, useRef, useCallback } from 'react'
import { generateBgStars, drawFrame, updateUniverse, screenToWorld } from '../utils/renderer'

const BG_STARS = generateBgStars(500)

export default function CosmosCanvas({ sunRef, planetsRef, onHover, onCanvasSize }) {
  const canvasRef = useRef(null)
  const camRef = useRef({ x: 0, y: 0, z: 0.7, targetZ: 0.7 })
  const dragRef = useRef(null)
  const rafRef = useRef(null)
  const lastTRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      onCanvasSize?.(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop)
      const dt = Math.min(now - lastTRef.current, 60)
      lastTRef.current = now
      const cam = camRef.current
      cam.z += (cam.targetZ - cam.z) * 0.08

      if (sunRef.current && planetsRef.current.length) {
        updateUniverse(sunRef.current, planetsRef.current, dt)
      }

      drawFrame(
        ctx,
        canvas.width,
        canvas.height,
        sunRef.current,
        planetsRef.current,
        BG_STARS,
        cam.x, cam.y, cam.z
      )
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    const cam = camRef.current
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      camX: cam.x, camY: cam.y,
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current
    const cam = camRef.current

    if (dragRef.current) {
      cam.x = dragRef.current.camX + (e.clientX - dragRef.current.startX)
      cam.y = dragRef.current.camY + (e.clientY - dragRef.current.startY)
    }

    const { wx, wy } = screenToWorld(
      e.clientX, e.clientY,
      canvas.width, canvas.height,
      cam.x, cam.y, cam.z
    )

    // Hit test planets
    const hit = planetsRef.current.find(
      p => Math.hypot(wx - p.x, wy - p.y) < p.r + 14
    )
    // Hit test sun
    const sun = sunRef.current
    const sunHit = sun && Math.hypot(wx - sun.x, wy - sun.y) < sun.r + 10
    onHover(hit || (sunHit ? sun : null), e.clientX, e.clientY)
  }, [onHover])

  const handleMouseUp = useCallback(() => { dragRef.current = null }, [])
  const handleMouseLeave = useCallback(() => {
    dragRef.current = null
    onHover(null)
  }, [onHover])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const cam = camRef.current
    cam.targetZ = Math.max(0.15, Math.min(5, cam.targetZ * (e.deltaY > 0 ? 0.88 : 1.14)))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    window.__cosmos_zoom = (f) => {
      camRef.current.targetZ = Math.max(0.15, Math.min(5, camRef.current.targetZ * f))
    }
    window.__cosmos_reset_cam = () => {
      camRef.current.x = 0
      camRef.current.y = 0
      camRef.current.targetZ = 0.7
    }
    window.__cosmos_focus_planet = (planet) => {
      camRef.current.x = -planet.x * camRef.current.z
      camRef.current.y = -planet.y * camRef.current.z
      camRef.current.targetZ = 2.2
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  )
}