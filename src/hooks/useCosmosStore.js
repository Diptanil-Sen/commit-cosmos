import { useState, useCallback, useRef } from 'react'
import { fetchRepo, parseCommits } from '../utils/github'
import { createSystem, repositionSystems, PALETTE } from '../utils/renderer'

export function useCosmosStore() {
  const [systems, setSystems] = useState([])
  const [allCommits, setAllCommits] = useState([])
  const [loading, setLoading] = useState(null) // slug being loaded
  const [error, setError] = useState('')
  const systemsRef = useRef([])

  const syncRef = (updated) => {
    systemsRef.current = updated
  }

  const addRepo = useCallback(async (raw, W, H) => {
    const slug = raw
      .replace(/^https?:\/\/(www\.)?github\.com\//, '')
      .replace(/\/$/, '')
      .trim()

    if (!slug.includes('/')) {
      setError('Use format: owner/repo')
      return false
    }

    const already = systemsRef.current.find(
      s => s.id.toLowerCase() === slug.toLowerCase()
    )
    if (already) {
      setError('Already in the cosmos.')
      return false
    }

    setError('')
    setLoading(slug)

    try {
      const { meta, commits: rawCommits } = await fetchRepo(slug)
      const color = PALETTE[systemsRef.current.length % PALETTE.length]
      const commits = parseCommits(rawCommits, meta.name, color)

      const sys = createSystem(meta, commits, color, systemsRef.current.length, W, H)

      const updated = [...systemsRef.current, sys]
      repositionSystems(updated, W, H)
      syncRef(updated)
      setSystems([...updated])

      // Rebuild flat commit list
      const flat = []
      for (const s of updated) {
        for (const c of s.commits) flat.push({ ...c, sysRef: s })
      }
      flat.sort((a, b) => a.date - b.date)
      setAllCommits(flat)

      setLoading(null)
      return true
    } catch (err) {
      setError(err.message)
      setLoading(null)
      return false
    }
  }, [])

  const removeRepo = useCallback((id, W, H) => {
    const updated = systemsRef.current.filter(s => s.id !== id)
    repositionSystems(updated, W, H)
    syncRef(updated)
    setSystems([...updated])

    const flat = []
    for (const s of updated) {
      for (const c of s.commits) flat.push({ ...c, sysRef: s })
    }
    flat.sort((a, b) => a.date - b.date)
    setAllCommits(flat)
  }, [])

  const clearError = useCallback(() => setError(''), [])

  return {
    systems,
    systemsRef,
    allCommits,
    loading,
    error,
    addRepo,
    removeRepo,
    clearError,
  }
}
