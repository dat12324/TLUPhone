import products from '../data/products'
import { mockBrands } from '../data/mock/brands'
import { normalizeBrandForm, validateBrandForm } from '../helpers/brandValidation'

const MOCK_DELAY_MS = 280
let brandStore = mockBrands.map((brand) => ({ ...brand }))
const legacyProductBrandNameById = new Map(mockBrands.map((brand) => [brand.id, brand.name]))

const normalizeText = (value = '') => value.trim().toLocaleLowerCase('vi-VN')

const productCountByBrand = products.reduce((counts, product) => {
  const key = normalizeText(product.brand)
  counts.set(key, (counts.get(key) || 0) + 1)
  return counts
}, new Map())

const getLinkedProductCount = (brand) => {
  const legacyBrandName = legacyProductBrandNameById.get(brand.id) || brand.name
  return productCountByBrand.get(normalizeText(legacyBrandName)) || 0
}

const enrichBrands = () => brandStore.map((brand) => ({
  ...brand,
  productCount: getLinkedProductCount(brand),
}))

const sortBrands = (items, sortBy) => {
  const sorted = [...items]
  if (sortBy === 'nameDesc') return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'))
  if (sortBy === 'newest') return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

const createServiceError = (message, code, field) => {
  const error = new Error(message)
  error.code = code
  error.field = field
  return error
}

const waitForMock = (operation, signal) => new Promise((resolve, reject) => {
  const cancelRequest = () => {
    clearTimeout(timeoutId)
    reject(new DOMException('Brand request was cancelled', 'AbortError'))
  }
  const timeoutId = setTimeout(() => {
    signal?.removeEventListener('abort', cancelRequest)
    try {
      resolve(operation())
    } catch (error) {
      reject(error)
    }
  }, MOCK_DELAY_MS)

  if (signal?.aborted) cancelRequest()
  else signal?.addEventListener('abort', cancelRequest, { once: true })
})

const assertUniqueBrand = (data, excludeId = null) => {
  const codeExists = brandStore.some((brand) => brand.id !== excludeId && normalizeText(brand.code) === normalizeText(data.code))
  if (codeExists) throw createServiceError('Mã thương hiệu đã tồn tại.', 'DUPLICATE_CODE', 'code')

  const slugExists = brandStore.some((brand) => brand.id !== excludeId && normalizeText(brand.slug) === normalizeText(data.slug))
  if (slugExists) throw createServiceError('Slug đã tồn tại.', 'DUPLICATE_SLUG', 'slug')
}

const normalizeAndValidateBrand = (data) => {
  const normalized = normalizeBrandForm(data)
  const [firstError] = Object.entries(validateBrandForm(normalized))
  if (firstError) throw createServiceError(firstError[1], 'VALIDATION_ERROR', firstError[0])
  return normalized
}

export const getBrands = ({
  search = '',
  status = 'all',
  sortBy = 'nameAsc',
  page = 1,
  limit = 10,
  signal,
} = {}) => waitForMock(() => {
    const allBrands = enrichBrands()
    const normalizedSearch = normalizeText(search)
    const filtered = allBrands.filter((brand) => {
      const matchesSearch = !normalizedSearch
        || normalizeText(brand.name).includes(normalizedSearch)
        || normalizeText(brand.code).includes(normalizedSearch)
      const matchesStatus = status === 'all' || brand.status === status
      return matchesSearch && matchesStatus
    })
    const sorted = sortBrands(filtered, sortBy)
    const safeLimit = Math.max(1, Number(limit) || 10)
    const totalPages = Math.ceil(sorted.length / safeLimit)
    const requestedPage = Math.max(1, Number(page) || 1)
    const safePage = totalPages ? Math.min(requestedPage, totalPages) : 1
    const startIndex = (safePage - 1) * safeLimit

    return {
      items: sorted.slice(startIndex, startIndex + safeLimit),
      total: sorted.length,
      page: safePage,
      limit: safeLimit,
      totalPages,
      summary: {
        total: allBrands.length,
        active: allBrands.filter((brand) => brand.status === 'active').length,
        inactive: allBrands.filter((brand) => brand.status === 'inactive').length,
      },
    }
  }, signal)

export const getBrandById = (id, { signal } = {}) => waitForMock(() => {
  const brand = enrichBrands().find((item) => item.id === id)
  if (!brand) throw createServiceError('Không tìm thấy thương hiệu.', 'BRAND_NOT_FOUND')
  return { ...brand }
}, signal)

export const getBrandProductCount = (id, { signal } = {}) => waitForMock(() => {
  const brand = brandStore.find((item) => item.id === id)
  if (!brand) throw createServiceError('Không tìm thấy thương hiệu.', 'BRAND_NOT_FOUND')
  return getLinkedProductCount(brand)
}, signal)

export const getActiveBrands = ({ signal } = {}) => waitForMock(() => enrichBrands()
  .filter((brand) => brand.status === 'active')
  .sort((a, b) => a.name.localeCompare(b.name, 'vi')), signal)

export const createBrand = (data, { signal } = {}) => waitForMock(() => {
  const normalized = normalizeAndValidateBrand(data)
  assertUniqueBrand(normalized)
  const now = new Date().toISOString()
  const brand = {
    id: `brand_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...normalized,
    createdAt: now,
    updatedAt: now,
  }
  brandStore = [brand, ...brandStore]
  legacyProductBrandNameById.set(brand.id, brand.name)
  return { ...brand, productCount: 0 }
}, signal)

export const updateBrand = (id, data, { signal } = {}) => waitForMock(() => {
  const index = brandStore.findIndex((brand) => brand.id === id)
  if (index < 0) throw createServiceError('Không tìm thấy thương hiệu.', 'BRAND_NOT_FOUND')
  const normalized = normalizeAndValidateBrand(data)
  assertUniqueBrand(normalized, id)
  const updated = {
    ...brandStore[index],
    ...normalized,
    id,
    createdAt: brandStore[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  brandStore = brandStore.map((brand) => brand.id === id ? updated : brand)
  return {
    ...updated,
    productCount: getLinkedProductCount(updated),
  }
}, signal)

export const updateBrandStatus = (id, status, { signal } = {}) => waitForMock(() => {
  if (!['active', 'inactive'].includes(status)) {
    throw createServiceError('Trạng thái thương hiệu không hợp lệ.', 'INVALID_STATUS', 'status')
  }
  const brand = brandStore.find((item) => item.id === id)
  if (!brand) throw createServiceError('Không tìm thấy thương hiệu.', 'BRAND_NOT_FOUND')

  const updated = status === brand.status ? brand : {
    ...brand,
    status,
    updatedAt: new Date().toISOString(),
  }
  brandStore = brandStore.map((item) => item.id === id ? updated : item)
  return { ...updated, productCount: getLinkedProductCount(updated) }
}, signal)

// Khi có Backend, thay các hàm mock bằng GET/POST/PATCH tại
// `${import.meta.env.VITE_API_URL}/api/admin/brands`.
