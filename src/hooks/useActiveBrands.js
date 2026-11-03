import { useEffect, useState } from 'react'
import { loadCatalogReferences, mapBrand } from '../helpers/catalog.js'

const useActiveBrands = () => {
  const [activeBrands, setActiveBrands] = useState(null)
  useEffect(() => {
    let active = true
    loadCatalogReferences('brands')
      .then(items => { if (active) setActiveBrands(items.filter(item => item.status === 'active').map(mapBrand)) })
      .catch(() => { if (active) setActiveBrands([]) })
    return () => { active = false }
  }, [])
  return { activeBrands: activeBrands || [], loading: activeBrands === null }
}

export default useActiveBrands
