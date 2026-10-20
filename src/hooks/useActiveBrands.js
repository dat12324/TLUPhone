import { useEffect, useState } from 'react'
import { getActiveBrands } from '../services/brandService'

const useActiveBrands = () => {
  const [activeBrands, setActiveBrands] = useState(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    getActiveBrands({ signal: controller.signal })
      .then((items) => {
        if (active) setActiveBrands(items)
      })
      .catch((error) => {
        if (active && error.name !== 'AbortError') setActiveBrands([])
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  return {
    activeBrands: activeBrands || [],
    loading: activeBrands === null,
  }
}

export default useActiveBrands
