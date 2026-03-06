import { useState, useCallback, useRef } from 'react'
import { fetchUniverse } from '../utils/github'
import { buildUniverse } from '../utils/renderer'

export function useCosmosStore() {
  const [sun, setSun] = useState(null)
  const [planets, setPlanets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')

  const sunRef = useRef(null)
  const planetsRef = useRef([])

  const loadUser = useCallback(async (user) => {
    const u = user.trim().replace(/^@/, '')
    if (!u) return
    setError('')
    setLoading(true)
    setUsername(u)
    try {
      const { user: userData, repoData } = await fetchUniverse(u)
      const { sun: newSun, planets: newPlanets } = buildUniverse(userData, repoData)
      sunRef.current = newSun
      planetsRef.current = newPlanets
      setSun(newSun)
      setPlanets(newPlanets)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(''), [])

  return {
    sun, planets,
    sunRef, planetsRef,
    loading, error, username,
    loadUser, clearError,
  }
}