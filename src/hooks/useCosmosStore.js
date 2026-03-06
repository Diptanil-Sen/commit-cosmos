import { useState, useCallback, useRef } from 'react'
import { fetchUniverse } from '../utils/github'
import { buildUniverse } from '../utils/renderer'

export function useCosmosStore() {
  const [sun, setSun] = useState(null)
  const [planets, setPlanets] = useState([])
  const [asteroids, setAsteroids] = useState([])
  const [constellation, setConstellation] = useState([])
  const [nebulaClouds, setNebulaClouds] = useState([])
  const [comet, setComet] = useState(null)
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
      const result = buildUniverse(userData, repoData)
      sunRef.current = result.sun
      planetsRef.current = result.planets
      setSun(result.sun)
      setPlanets(result.planets)
      setAsteroids(result.asteroids || [])
      setConstellation(result.constellation || [])
      setNebulaClouds(result.nebulaClouds || [])
      setComet(result.comet || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(''), [])

  return {
    sun, planets, asteroids, constellation, nebulaClouds, comet,
    sunRef, planetsRef,
    loading, error, username,
    loadUser, clearError,
  }
}