import { useState, useCallback, useRef } from 'react'
import CosmosCanvas from './components/CosmosCanvas'
import Sidebar from './components/Sidebar'
import Timeline from './components/Timeline'
import Tooltip from './components/Tooltip'
import CommitFlash from './components/CommitFlash'
import ZoomControls from './components/ZoomControls'
import EmptyState from './components/EmptyState'
import { useCosmosStore } from './hooks/useCosmosStore'

export default function App() {
  const [canvasSize, setCanvasSize] = useState({ W: window.innerWidth, H: window.innerHeight })
  const [timeIdx, setTimeIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [hoveredSys, setHoveredSys] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [flashCommit, setFlashCommit] = useState(null)
  const flashThrottle = useRef(0)

  const {
    systems,
    systemsRef,
    allCommits,
    loading,
    error,
    addRepo,
    removeRepo,
    clearError,
  } = useCosmosStore()

  const handleAdd = useCallback(async (slug) => {
    const ok = await addRepo(slug, canvasSize.W, canvasSize.H)
    if (ok) setPlaying(true)
  }, [addRepo, canvasSize])

  const handleRemove = useCallback((id) => {
    removeRepo(id, canvasSize.W, canvasSize.H)
  }, [removeRepo, canvasSize])

  const handleFocus = useCallback((sys) => {
    window.__cosmos_focus?.(sys)
  }, [])

  const handleTimeChange = useCallback((idx) => {
    setTimeIdx(idx)
    const now = Date.now()
    if (now - flashThrottle.current > 200) {
      flashThrottle.current = now
      const c = allCommits[idx]
      if (c) setFlashCommit({ ...c, _t: now })
    }
  }, [allCommits])

  const handleHover = useCallback((sys, x, y) => {
    setHoveredSys(sys || null)
    if (x !== undefined) setTooltipPos({ x, y })
  }, [])

  return (
    <>
      <CosmosCanvas
        systemsRef={systemsRef}
        allCommits={allCommits}
        timeIdx={timeIdx}
        onTimeChange={handleTimeChange}
        playing={playing}
        onPlayEnd={() => setPlaying(false)}
        onHover={handleHover}
        onCanvasSize={(W, H) => setCanvasSize({ W, H })}
      />

      <Sidebar
        systems={systems}
        loading={loading}
        error={error}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onFocus={handleFocus}
        allCommits={allCommits}
      />

      {allCommits.length > 0 && (
        <Timeline
          allCommits={allCommits}
          timeIdx={timeIdx}
          playing={playing}
          onSeek={setTimeIdx}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}

      <Tooltip
        system={hoveredSys}
        x={tooltipPos.x}
        y={tooltipPos.y}
      />

      <CommitFlash commit={flashCommit} />

      <ZoomControls />

      {systems.length === 0 && <EmptyState onAdd={handleAdd} />}
    </>
  )
}
