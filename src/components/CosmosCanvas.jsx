import { useEffect, useRef, useCallback, useState } from 'react'
import {
  generateBgStars,
  drawFrame,
  fireCommit,
  updatePlanets,
  screenToWorld,
} from '../utils/renderer'

const BG_STARS = generateBgStars(400)

export default function CosmosCanvas({
  systemsRef,
  allCommits,
  timeIdx,
  onTimeChange,
  playing,
  onPlayEnd,
  onHover,
  onCanvasSize,
}) {
  const canvasRef = useRef(null)
  const camRef = useRef({ x: 0, y: 0, z: 1, targetZ: 1 })
  const dragRef = useRef(null)
  const rafRef = useRef(null)
  const lastTRef = useRef(0)
  const accumRef = useRef(0)
  const playingRef = useRef(playing)
  const timeIdxRef = useRef(timeIdx)
  const allCommitsRef = useRef(allCommits)
  const PLAY_MS = 40

  // Keep refs in sync
  useEffect(() => { playingRef.current = playing }, [playing])
  useEffect(() => { timeIdxRef.current = timeIdx }, [timeIdx])
  useEffect(() => { allCommitsRef.current = allCommits }, [allCommits])

  // Canvas setup + resize
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      onCanvasSize(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop)
      const dt = Math.min(now - lastTRef.current, 60)
      lastTRef.current = now

      const cam = camRef.current
      cam.z += (cam.targetZ - cam.z) * 0.09

      // Planet rotation
      updatePlanets(systemsRef.current, dt)

      // Playback
      if (playingRef.current && allCommitsRef.current.length) {
        accumRef.current += dt
        while (
          accumRef.current >= PLAY_MS &&
          timeIdxRef.current < allCommitsRef.current.length - 1
        ) {
          accumRef.current -= PLAY_MS
          timeIdxRef.current++
          const c = allCommitsRef.current[timeIdxRef.current]
          if (c?.sysRef) fireCommit(c.sysRef)
          onTimeChange(timeIdxRef.current)
        }
        if (timeIdxRef.current >= allCommitsRef.current.length - 1) {
          onPlayEnd()
        }
      }

      const W = canvas.width
      const H = canvas.height
      drawFrame(ctx, W, H, systemsRef.current, BG_STARS, cam.x, cam.y, cam.z, true)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Pan controls
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

    // Hover hit test
    const W = canvas.width, H = canvas.height
    const { wx, wy } = screenToWorld(e.clientX, e.clientY, W, H, cam.x, cam.y, cam.z)
    const hit = systemsRef.current.find(
      s => Math.hypot(wx - s.x, wy - s.y) < s.r + 16
    )
    onHover(hit || null, e.clientX, e.clientY)
  }, [onHover])

  const handleMouseUp = useCallback(() => { dragRef.current = null }, [])
  const handleMouseLeave = useCallback(() => { dragRef.current = null; onHover(null) }, [])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const cam = camRef.current
    cam.targetZ = Math.max(0.2, Math.min(4.5, cam.targetZ * (e.deltaY > 0 ? 0.87 : 1.15)))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Expose zoom controls
  useEffect(() => {
    window.__cosmos_zoom = (factor) => {
      camRef.current.targetZ = Math.max(0.2, Math.min(4.5, camRef.current.targetZ * factor))
    }
    window.__cosmos_reset_cam = () => {
      camRef.current.x = 0
      camRef.current.y = 0
      camRef.current.targetZ = 1
    }
    window.__cosmos_focus = (sys) => {
      const canvas = canvasRef.current
      const W = canvas.width, H = canvas.height
      const dx = W / 2 - sys.x
      const dy = H / 2 - sys.y
      camRef.current.x += dx * 0.65
      camRef.current.y += dy * 0.65
      camRef.current.targetZ = 1.6
    }
    // Expose fire for scrubber seeking
    window.__cosmos_fire_at = (idx) => {
      const c = allCommitsRef.current[idx]
      if (c?.sysRef) fireCommit(c.sysRef)
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
