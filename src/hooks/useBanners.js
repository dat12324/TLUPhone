import { useEffect, useState } from 'react'
import api from '../lib/api.js'

const cache = new Map()
export const invalidateBanners = () => cache.clear()

const useBanners = position => {
  const [state, setState] = useState({ banners: [], loading: true, error: '' })
  useEffect(() => {
    let active = true
    setState({ banners: [], loading: true, error: '' })
    let entry = cache.get(position)
    if (!entry || entry.expiresAt <= Date.now()) {
      entry = { expiresAt: Date.now() + 30000 }
      entry.promise = api.get('/banners', { params: { position, page: 1, limit: 100 }, skipAuth: true })
        .then(({ data }) => data.data.map(banner => ({ ...banner, id: banner._id })))
        .catch(error => { if (cache.get(position) === entry) cache.delete(position); throw error })
      cache.set(position, entry)
    }
    entry.promise.then(banners => {
      if (active) setState({ banners, loading: false, error: '' })
    }).catch(error => {
      if (active) setState({ banners: [], loading: false, error: error.message })
    })
    return () => { active = false }
  }, [position])
  return state
}

export default useBanners
