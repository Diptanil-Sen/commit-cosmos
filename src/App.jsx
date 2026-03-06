import { useState, useCallback } from 'react'
import CosmosCanvas from './components/CosmosCanvas'
import Sidebar from './components/Sidebar'
import Tooltip from './components/Tooltip'
import ZoomControls from './components/ZoomControls'
import { useCosmosStore } from './hooks/useCosmosStore'

export default function App() {
  const [hoveredObj, setHoveredObj] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const {
    sun, planets,
    sunRef, planetsRef,
    loading, error, username,
    loadUser,
  } = useCosmosStore()

  const handleHover = useCallback((obj, x, y) => {
    setHoveredObj(obj || null)
    if (x !== undefined) setTooltipPos({ x, y })
  }, [])

  // Adapt tooltip for both sun and planet
  const tooltipData = hoveredObj ? {
    system: hoveredObj.full ? {
      full: hoveredObj.full,
      language: hoveredObj.language,
      color: hoveredObj.color,
      commits: { length: hoveredObj.commits?.length || 0 },
      meta: {
        stargazers_count: hoveredObj.stars,
        forks_count: hoveredObj.forks,
        description: hoveredObj.description,
      }
    } : {
      full: hoveredObj.name + ' (Sun)',
      language: `${hoveredObj.publicRepos} repos · ${hoveredObj.followers} followers`,
      color: '#ffd54f',
      commits: { length: 0 },
      meta: {
        stargazers_count: 0,
        forks_count: 0,
        description: hoveredObj.bio,
      }
    }
  } : null

  return (
    <>
      <CosmosCanvas
        sunRef={sunRef}
        planetsRef={planetsRef}
        onHover={handleHover}
      />
      <Sidebar
        sun={sun}
        planets={planets}
        loading={loading}
        error={error}
        username={username}
        onLoad={loadUser}
      />
      {tooltipData && (
        <Tooltip system={tooltipData.system} x={tooltipPos.x} y={tooltipPos.y} />
      )}
      <ZoomControls />
    </>
  )
}