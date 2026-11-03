import { useEffect, useState } from 'react'
import api from '../lib/api.js'
import { mapCatalogProduct } from '../helpers/productAdapter.js'

const cache = new Map()
export const invalidateProductCatalog = () => cache.clear()

// Mỗi truy vấn chỉ lấy một trang Product; chia sẻ request/cache public trong 30 giây.
const useCatalog = (params, reloadKey = 0) => {
  const key = JSON.stringify(params)
  const [state, setState] = useState({ products: [], loading: true, error: '' })
  useEffect(() => {
    let active = true
    setState({ products: [], loading: params !== null, error: '' })
    if (params === null) return
    let entry = cache.get(key)
    if (!entry || (!entry.pending && entry.expires <= Date.now())) {
      entry = { pending: true, expires: 0 }
      entry.promise = api.get('/products', { params: { page: 1, ...JSON.parse(key) }, skipAuth: true })
        .then(({ data }) => {
          const products = data.data.map(product => ({
            ...mapCatalogProduct(product, product.skus, [product.brandInfo].filter(Boolean), [product.categoryInfo].filter(Boolean)),
            price: product.price, originalPrice: product.compareAtPrice ?? product.price,
          }))
          entry.pending = false
          entry.expires = Date.now() + 30000
          return products
        }).catch(error => {
          if (cache.get(key) === entry) cache.delete(key)
          throw error
        })
      cache.set(key, entry)
    }
    entry.promise.then(products => { if (active) setState({ products, loading: false, error: '' }) })
      .catch(error => { if (active) setState({ products: [], loading: false, error: error.message }) })
    return () => { active = false }
  }, [key, reloadKey])
  return state
}

export default useCatalog
