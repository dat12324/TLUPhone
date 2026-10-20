import products from '../data/products'
import { mockCategories } from '../data/mock/categories'
import { normalizeCategoryForm, validateCategoryForm } from '../helpers/categoryValidation'

const MOCK_DELAY_MS = 280
const STORAGE_KEY = 'tluphone.admin.categories.v1'

const normalizeText = (value = '') => value.trim().toLocaleLowerCase('vi-VN')
const cloneMockCategories = () => mockCategories.map((category) => ({ ...category }))

const createServiceError = (message, code, field) => {
  const error = new Error(message)
  error.code = code
  error.field = field
  return error
}

const readStoredCategories = () => {
  if (typeof window === 'undefined' || !window.localStorage) return cloneMockCategories()
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(parsed)) return cloneMockCategories()
    const valid = parsed.every((category) => category
      && typeof category.id === 'string'
      && typeof category.name === 'string'
      && typeof category.code === 'string'
      && typeof category.slug === 'string'
      && ['active', 'inactive'].includes(category.status))
    return valid ? parsed.map((category) => ({ ...category })) : cloneMockCategories()
  } catch {
    return cloneMockCategories()
  }
}

let categoryStore = readStoredCategories()

const waitForMock = (operation, signal) => new Promise((resolve, reject) => {
  const cancelRequest = () => {
    clearTimeout(timeoutId)
    reject(new DOMException('Category request was cancelled', 'AbortError'))
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

const commitStore = (nextStore) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore))
    } catch {
      throw createServiceError('Không thể lưu dữ liệu danh mục trên trình duyệt.', 'STORAGE_ERROR')
    }
  }
  categoryStore = nextStore
}

const assignedProductCount = products.filter((product) => Boolean(product.categoryId)).length
const getProductCount = (categoryId) => products.filter((product) => product.categoryId === categoryId).length
const getCategory = (id) => categoryStore.find((category) => category.id === id)

const validateCategory = (category) => {
  const [firstError] = Object.entries(validateCategoryForm(category))
  if (firstError) throw createServiceError(firstError[1], 'VALIDATION_ERROR', firstError[0])
}

const assertUniqueCategory = (category, excludeId = null) => {
  const duplicateCode = categoryStore.some((item) => item.id !== excludeId && normalizeText(item.code) === normalizeText(category.code))
  if (duplicateCode) throw createServiceError('Mã danh mục đã tồn tại.', 'DUPLICATE_CODE', 'code')

  const duplicateSlug = categoryStore.some((item) => item.id !== excludeId && normalizeText(item.slug) === normalizeText(category.slug))
  if (duplicateSlug) throw createServiceError('Slug đã tồn tại.', 'DUPLICATE_SLUG', 'slug')
}

const enrichCategory = (category) => ({
  ...category,
  productCount: getProductCount(category.id),
})

const sortCategories = (items, sortBy) => {
  const sorted = [...items]
  if (sortBy === 'nameDesc') return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'))
  if (sortBy === 'newest') return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

export const getCategories = ({
  search = '',
  status = 'all',
  sortBy = 'nameAsc',
  page = 1,
  limit = 10,
  signal,
} = {}) => waitForMock(() => {
  const allCategories = categoryStore.map(enrichCategory)
  const normalizedSearch = normalizeText(search)
  const filtered = allCategories.filter((category) => {
    const matchesSearch = !normalizedSearch
      || normalizeText(category.name).includes(normalizedSearch)
      || normalizeText(category.code).includes(normalizedSearch)
      || normalizeText(category.slug).includes(normalizedSearch)
    return matchesSearch && (status === 'all' || category.status === status)
  })
  const sorted = sortCategories(filtered, sortBy)
  const safeLimit = Math.min(10, Math.max(1, Number(limit) || 10))
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
      total: allCategories.length,
      active: allCategories.filter((category) => category.status === 'active').length,
      inactive: allCategories.filter((category) => category.status === 'inactive').length,
    },
    meta: {
      productRelationship: 'categoryId',
      assignedProductCount,
      unassignedProductCount: products.length - assignedProductCount,
    },
  }
}, signal)

export const getCategoryById = (id, { signal } = {}) => waitForMock(() => {
  const category = getCategory(id)
  if (!category) throw createServiceError('Không tìm thấy danh mục.', 'CATEGORY_NOT_FOUND')
  return enrichCategory(category)
}, signal)

export const getCategoryProductCount = (id, { signal } = {}) => waitForMock(() => {
  if (!getCategory(id)) throw createServiceError('Không tìm thấy danh mục.', 'CATEGORY_NOT_FOUND')
  return getProductCount(id)
}, signal)

export const createCategory = (data, { signal } = {}) => waitForMock(() => {
  const normalized = normalizeCategoryForm(data)
  validateCategory(normalized)
  assertUniqueCategory(normalized)
  const now = new Date().toISOString()
  const category = {
    id: `category_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...normalized,
    createdAt: now,
    updatedAt: now,
  }
  commitStore([category, ...categoryStore])
  return enrichCategory(category)
}, signal)

export const updateCategory = (id, data, { signal } = {}) => waitForMock(() => {
  const category = getCategory(id)
  if (!category) throw createServiceError('Không tìm thấy danh mục.', 'CATEGORY_NOT_FOUND')

  const normalized = normalizeCategoryForm({ ...category, ...data })
  validateCategory(normalized)
  assertUniqueCategory(normalized, id)
  const updated = {
    ...category,
    ...normalized,
    id,
    createdAt: category.createdAt,
    updatedAt: new Date().toISOString(),
  }
  commitStore(categoryStore.map((item) => item.id === id ? updated : item))
  return enrichCategory(updated)
}, signal)

export const getActiveCategories = ({ signal } = {}) => waitForMock(() => categoryStore
  .filter((category) => category.status === 'active')
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  .map(({ id, name, code, slug }) => ({ id, name, code, slug })), signal)

export const updateCategoryStatus = (id, status, { signal } = {}) => waitForMock(() => {
  if (!['active', 'inactive'].includes(status)) {
    throw createServiceError('Trạng thái danh mục không hợp lệ.', 'INVALID_STATUS', 'status')
  }

  const category = getCategory(id)
  if (!category) throw createServiceError('Không tìm thấy danh mục.', 'CATEGORY_NOT_FOUND')

  const updated = status === category.status ? category : {
    ...category,
    status,
    updatedAt: new Date().toISOString(),
  }
  commitStore(categoryStore.map((item) => item.id === id ? updated : item))
  return enrichCategory(updated)
}, signal)

export const deleteCategory = (id, { signal } = {}) => waitForMock(() => {
  const category = getCategory(id)
  if (!category) throw createServiceError('Không tìm thấy danh mục.', 'CATEGORY_NOT_FOUND')

  const productCount = getProductCount(id)
  if (productCount > 0) {
    const error = createServiceError(
      `Không thể xóa vì danh mục đang liên kết với ${productCount.toLocaleString('vi-VN')} sản phẩm. Hãy sử dụng chức năng Ẩn.`,
      'CATEGORY_HAS_PRODUCTS',
    )
    error.productCount = productCount
    throw error
  }

  commitStore(categoryStore.filter((item) => item.id !== id))
  return { ...category, productCount: 0 }
}, signal)

// Khi có Backend, giữ nguyên contract UI và thay mock/localStorage bằng:
// GET/POST /api/admin/categories, GET/PATCH/DELETE /api/admin/categories/:id,
// PATCH /api/admin/categories/:id/status.

