import products from '../data/products'
import { mockBrands } from '../data/mock/brands'
import { mockCategories } from '../data/mock/categories'

const MOCK_DELAY_MS = 180

const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('vi-VN')
  .trim()

const normalizeCapacity = (value = '') => String(value)
  .replace(/\s+/g, '')
  .toUpperCase()

const waitForMock = (operation, signal) => new Promise((resolve, reject) => {
  const cancelRequest = () => {
    clearTimeout(timeoutId)
    reject(new DOMException('Catalog request was cancelled', 'AbortError'))
  }
  const timeoutId = setTimeout(() => {
    signal?.removeEventListener('abort', cancelRequest)
    resolve(operation())
  }, MOCK_DELAY_MS)

  if (signal?.aborted) cancelRequest()
  else signal?.addEventListener('abort', cancelRequest, { once: true })
})

const productSlug = (product) => product.slug || normalizeText(product.name)
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const prepareProduct = (product) => ({
  ...product,
  databaseId: String(product.id),
  slug: productSlug(product),
})

const includesCapacity = (product, values, field) => {
  if (!values?.length) return true
  return (product.variants || []).some((variant) => (
    values.includes(normalizeCapacity(variant[field]))
  ))
}

const sortProducts = (items, sort) => {
  const sorted = [...items]
  if (sort === 'price_asc') return sorted.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return sorted.sort((a, b) => b.price - a.price)
  if (sort === 'rating_desc') return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  if (sort === 'popular') {
    return sorted.sort((a, b) => {
      const featuredDifference = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
      if (featuredDifference) return featuredDifference

      const reviewDifference = (b.reviewCount || 0) - (a.reviewCount || 0)
      if (reviewDifference) return reviewDifference

      const ratingDifference = (b.rating || 0) - (a.rating || 0)
      if (ratingDifference) return ratingDifference

      const aHasPromotion = Boolean(a.isHotDeal || a.originalPrice > a.price)
      const bHasPromotion = Boolean(b.isHotDeal || b.originalPrice > b.price)
      const promotionDifference = Number(bHasPromotion) - Number(aHasPromotion)
      if (promotionDifference) return promotionDifference

      return Number(b.id) - Number(a.id)
    })
  }
  return sorted.sort((a, b) => Number(b.id) - Number(a.id))
}

export const getProducts = (params = {}, { signal } = {}) => waitForMock(() => {
  const {
    page = 1,
    limit = 20,
    search = '',
    brand,
    minPrice,
    maxPrice,
    storage = [],
    ram = [],
    sort = 'newest',
    hotDeal,
    featured,
    isNew,
  } = params

  const searchValue = normalizeText(search)
  const brandValue = normalizeText(brand)
  const storageValues = Array.isArray(storage) ? storage.map(normalizeCapacity) : []
  const ramValues = Array.isArray(ram) ? ram.map(normalizeCapacity) : []

  const filtered = products.map(prepareProduct).filter((product) => {
    const matchesSearch = !searchValue
      || normalizeText(product.name).includes(searchValue)
      || normalizeText(product.brand).includes(searchValue)
    const matchesBrand = !brandValue
      || normalizeText(product.brand) === brandValue
      || normalizeText(product.brand).replace(/[^a-z0-9]+/g, '-') === brandValue
    const matchesPrice = (minPrice === undefined || product.price >= Number(minPrice))
      && (maxPrice === undefined || product.price < Number(maxPrice))
    const matchesFlags = (hotDeal === undefined || Boolean(product.isHotDeal || product.originalPrice > product.price) === Boolean(hotDeal))
      && (featured === undefined || Boolean(product.isFeatured) === Boolean(featured))
      && (isNew === undefined || Boolean(product.isNew) === Boolean(isNew))

    return matchesSearch
      && matchesBrand
      && matchesPrice
      && matchesFlags
      && includesCapacity(product, storageValues, 'storage')
      && includesCapacity(product, ramValues, 'ram')
  })

  const sorted = sortProducts(filtered, sort)
  const safeLimit = Math.max(1, Number(limit) || 20)
  const totalItems = sorted.length
  const totalPages = Math.ceil(totalItems / safeLimit)
  const safePage = totalPages
    ? Math.min(Math.max(1, Number(page) || 1), totalPages)
    : 1
  const startIndex = (safePage - 1) * safeLimit

  return {
    items: sorted.slice(startIndex, startIndex + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
    },
  }
}, signal)

export const getProductBySlug = (slug, { signal } = {}) => waitForMock(() => {
  const product = products.find((item) => (
    String(item.id) === String(slug) || productSlug(item) === slug
  ))
  if (!product) throw new Error('Không tìm thấy sản phẩm.')
  return prepareProduct(product)
}, signal)

export const getCatalogBrands = ({ signal } = {}) => waitForMock(() => mockBrands
  .filter((brand) => brand.status === 'active')
  .map((brand) => ({
    ...brand,
    productCount: products.filter((product) => normalizeText(product.brand) === normalizeText(brand.name)).length,
  })), signal)

export const getCatalogCategories = ({ signal } = {}) => waitForMock(() => mockCategories
  .filter((category) => category.status === 'active')
  .map((category) => ({ ...category })), signal)
