import api from '../lib/api.js'

export const mapBrand = brand => ({ ...brand, id: brand._id, logo: brand.logo?.url || '', logoMetadata: brand.logo || null, productCount: brand.productCount ?? null })
export const mapCategory = category => ({ ...category, id: category._id, image: category.image?.url || '', imageMetadata: category.image || null, productCount: category.productCount ?? null })

export const paginateCatalog = (all, { search = '', status = 'all', sortBy = 'nameAsc', page = 1, limit = 10 } = {}) => {
  const term = search.trim().toLocaleLowerCase('vi-VN')
  const items = all.filter(item => (status === 'all' || item.status === status) &&
    (!term || `${item.name} ${item.slug}`.toLocaleLowerCase('vi-VN').includes(term)))
  items.sort(sortBy === 'newest' ? (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    : (a, b) => (sortBy === 'nameDesc' ? -1 : 1) * a.name.localeCompare(b.name, 'vi'))
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10))
  const totalPages = Math.ceil(items.length / safeLimit)
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages || 1)
  return { items: items.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    total: items.length, page: safePage, limit: safeLimit, totalPages,
    summary: { total: all.length, active: all.filter(item => item.status === 'active').length,
      inactive: all.filter(item => item.status === 'inactive').length } }
}

export const catalogBody = (data, imageField) => {
  const body = {}
  for (const field of ['name', 'slug', 'description', 'status']) {
    if (data[field] !== undefined && !(field === 'slug' && !data[field].trim())) body[field] = data[field]
  }
  if (!data.imageFile && (data[imageField] === null || typeof data[imageField] === 'object' && data[imageField])) {
    body[imageField] = data[imageField] === null ? null : {
      url: data[imageField].url, publicId: data[imageField].publicId,
    }
  }
  if (!data.imageFile) return body
  const form = new FormData()
  for (const [key, value] of Object.entries(body)) form.append(key, String(value))
  form.append('image', data.imageFile)
  return form
}

export const PRODUCT_FIELDS = ['name', 'slug', 'brand', 'category', 'shortDescription', 'description', 'highlights', 'images', 'technicalSpecs', 'specifications', 'tags', 'flags', 'status', 'primaryImageIndex']
export const VARIANT_FIELDS = ['sku', 'ram', 'storage', 'color', 'images', 'price', 'compareAtPrice', 'lowStockThreshold', 'isDefault', 'status']

export const mutationBody = (data, fields, files = [], colorFile) => {
  const body = Object.fromEntries(fields.filter(field => data[field] !== undefined && !(field === 'slug' && !data[field].trim())).map(field => [field, data[field]]))
  if (!files.length && !colorFile) return body
  const form = new FormData()
  for (const [key, value] of Object.entries(body)) form.append(key, typeof value === 'string' ? value : JSON.stringify(value))
  files.forEach(file => form.append('images', file))
  if (colorFile) form.append('colorImage', colorFile)
  return form
}

// Brand/Category ít thay đổi; chia sẻ request và cache public trong 30 giây.
const references = new Map()
export const loadCatalogReferences = (resource) => {
  if (!['brands', 'categories'].includes(resource)) throw new Error('Danh mục tham chiếu không hợp lệ.')
  const current = references.get(resource)
  if (current && (current.pending || current.expires > Date.now())) return current.promise
  const entry = { pending: true, expires: 0 }
  entry.promise = (async () => {
    const items = []
    let page = 1
    let totalPages = 1
    do {
      const { data } = await api.get('/' + resource, { params: { page, limit: 100, status: 'active' }, skipAuth: true })
      items.push(...data.data)
      totalPages = data.pagination.totalPages
      page += 1
    } while (page <= totalPages)
    entry.pending = false
    entry.expires = Date.now() + 30000
    return items
  })().catch(error => { references.delete(resource); throw error })
  references.set(resource, entry)
  return entry.promise
}
