import { formatSkuCapacity, skuCapacityGb } from '../utils/adminFormatters.js'

const placeholder = '/images/products/placeholder.svg'
export const colorKey = value => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN')
export const capacityKey = sku => `${skuCapacityGb(sku.ram) ?? sku.ram}-${skuCapacityGb(sku.storage) ?? sku.storage}`

// Dữ liệu import cũ chứa thông số trong specifications thay vì technicalSpecs.
export const getProductTechnicalSpecs = (product) => {
  const items = Array.isArray(product?.specifications) ? product.specifications.flatMap(group => group.items || []) : []
  const values = Object.fromEntries(items.map(item => [item.label.trim().toLocaleLowerCase('vi-VN'), String(item.value || '').trim()]))
  const specs = {}
  for (const [field, labels, unit] of [
    ['chip', ['chipset', 'chip']],
    ['operatingSystem', ['hệ điều hành', 'hệ điều hành khi ra mắt']],
    ['network', ['hỗ trợ mạng', 'mạng di động', 'mạng']],
    ['screenSize', ['kích thước màn hình'], /([\d.,]+)\s*(?:inch|")/i],
    ['batteryCapacity', ['dung lượng pin', 'pin'], /([\d.,]+)\s*mAh/i],
    ['refreshRate', ['tần số quét'], /([\d.,]+)\s*Hz/i],
    ['cameraMainMp', ['camera chính', 'camera sau'], /([\d.,]+)\s*MP/i],
  ]) {
    const value = labels.map(label => values[label]).find(Boolean)
    if (!value) continue
    if (!unit) { specs[field] = value; continue }
    const match = value.match(/^(\d+(?:[.,]\d+)?)$/) || value.match(unit)
    if (!match) continue
    const digits = field === 'batteryCapacity' ? match[1].replace(/[.,](?=\d{3}(?:\D|$))/g, '') : match[1]
    const number = Number(digits.replace(',', '.'))
    if (Number.isFinite(number) && number > 0) specs[field] = number
  }
  // Giá trị đã lưu trực tiếp, kể cả null/chuỗi rỗng khi xóa, luôn được ưu tiên.
  return { ...specs, ...product?.technicalSpecs }
}

export const mapCatalogProduct = (product, skus = [], brands = [], categories = []) => {
  const brand = brands.find(item => item._id === product.brand)
  const category = categories.find(item => item._id === product.category)
  const live = skus.filter(sku => sku.product === product._id && sku.status === 'active' && !sku.deletedAt).sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  const colors = new Map()
  const capacities = new Map()
  const stockByCombination = {}
  const skuByCombination = {}
  const commonImages = (product.images || []).map(image => image.url).filter(Boolean)
  for (const sku of live) {
    const colorId = colorKey(sku.color.name)
    const variantId = capacityKey(sku)
    const colorImages = [sku.color.image?.url, ...(sku.images || []).map(image => image.url)].filter(Boolean)
    if (!colors.has(colorId)) colors.set(colorId, { id: colorId, name: sku.color.name, colorCode: sku.color.code, image: colorImages[0] || commonImages[0] || placeholder, images: [] })
    const color = colors.get(colorId)
    const candidate = colorImages[0]
    if (candidate && (!color.images.length || candidate.startsWith('https://res.cloudinary.com/') && !color.image.startsWith('https://res.cloudinary.com/'))) {
      color.image = candidate
      color.images = [candidate]
    }
    const originalPrice = sku.compareAtPrice ?? sku.price
    if (!capacities.has(variantId)) capacities.set(variantId, { id: variantId, ram: formatSkuCapacity(sku.ram), storage: formatSkuCapacity(sku.storage), price: sku.price, originalPrice })
    else if (sku.price < capacities.get(variantId).price) Object.assign(capacities.get(variantId), { price: sku.price, originalPrice })
    const key = `${variantId}_${colorId}`
    stockByCombination[key] = Number.isSafeInteger(sku.availableStock) && sku.availableStock >= 0 ? sku.availableStock : null
    skuByCombination[key] = { ...sku, id: sku._id, originalPrice, stock: stockByCombination[key], ram: formatSkuCapacity(sku.ram), storage: formatSkuCapacity(sku.storage) }
  }
  const priced = [...live].sort((a, b) => a.price - b.price)[0]
  const specifications = Object.fromEntries((product.specifications || []).map(group => [group.key, { title: group.title, items: Object.fromEntries((group.items || []).map(item => [item.label, item.value])) }]))
  const technical = product.technicalSpecs || {}
  return { ...product, source: 'api', id: product._id, databaseId: product._id, brand: brand?.name || '', brandInfo: brand, categoryInfo: category,
    images: commonImages, image: product.images?.find(image => image.isPrimary)?.url || commonImages[0] || [...colors.values()][0]?.image || placeholder,
    price: priced?.price ?? null, originalPrice: priced ? priced.compareAtPrice ?? priced.price : null,
    rating: product.ratingAverage ?? 0, reviewCount: product.reviewCount ?? 0,
    isFeatured: Boolean(product.flags?.isFeatured), isNew: Boolean(product.flags?.isNew), isHotDeal: Boolean(product.flags?.isHotDeal),
    variants: [...capacities.values()].sort((a, b) => a.price - b.price), colors: [...colors.values()], stockByCombination, skuByCombination, skus: live, specifications,
    specs: [technical.chip, capacities.values().next().value?.ram, capacities.values().next().value?.storage].filter(Boolean).join(' · '),
  }
}

const normalizedColorCode = code => {
  const value = String(code || '').trim().toLowerCase()
  return /^#[a-f0-9]{3}$/.test(value) ? '#' + [...value.slice(1)].map(char => char + char).join('') : value
}

// Chỉ tìm ảnh trong cùng Product; tên màu phải khớp và mã màu không được mâu thuẫn.
export const findSharedColorImage = (variants, productId, color, excludeId) => {
  const name = colorKey(color?.name || '')
  if (!name || !productId) return null
  const code = normalizedColorCode(color?.code)
  const candidates = variants.filter(variant =>
    String(variant.product?._id ?? variant.product) === String(productId) &&
    (!excludeId || String(variant._id) !== String(excludeId)) && !variant.deletedAt &&
    colorKey(variant.color?.name || '') === name && variant.color?.image?.url &&
    (!code || !variant.color.code || normalizedColorCode(variant.color.code) === code))
  if (!code && new Set(candidates.map(variant => normalizedColorCode(variant.color.code)).filter(Boolean)).size > 1) return null
  const donor = candidates.find(variant => code && normalizedColorCode(variant.color.code) === code) || candidates[0]
  return donor ? { url: donor.color.image.url, ...(donor.color.image.publicId ? { publicId: donor.color.image.publicId } : {}) } : null
}

export const getProductColorOptions = (variants, productId) => {
  const options = new Map()
  for (const variant of variants) {
    if (String(variant.product?._id ?? variant.product) !== String(productId) || variant.deletedAt) continue
    const name = variant.color?.name?.normalize('NFC').trim().replace(/\s+/g, ' ')
    if (!name) continue
    const code = normalizedColorCode(variant.color.code)
    const key = `${colorKey(name)}:${code}`
    if (!options.has(key)) options.set(key, { key, name, code })
  }
  return [...options.values()]
}


export const summarizeAdminProduct = (product, variants) => {
  const skus = variants.filter(sku => !sku.deletedAt && String(sku.product?._id ?? sku.product) === String(product._id))
  const active = skus.filter(sku => sku.status === 'active')
  const priced = (active.length ? active : skus).filter(sku => typeof sku.price === 'number' && Number.isFinite(sku.price) && sku.price >= 0).sort((a, b) => a.price - b.price)[0]
  const colorOptions = new Map()
  for (const sku of skus) {
    const key = colorKey(sku.color?.name || '')
    if (key && !colorOptions.has(key)) colorOptions.set(key, { key, name: sku.color.name, code: sku.color.code })
  }
  const inventory = active.some(sku => Number.isSafeInteger(sku.availableStock) && sku.availableStock > 0) ? 'available'
    : active.length && active.every(sku => sku.availableStock === 0) ? 'out' : 'unknown'
  return { ...product, sellingPrice: priced?.price ?? null, originalPrice: priced?.compareAtPrice ?? null,
    skuCount: skus.length, configurationCount: new Set(skus.map(capacityKey)).size,
    colorOptions: [...colorOptions.values()], inventory, skuSearch: skus.map(sku => sku.sku || '').join(' '),
    displayImage: product.images?.find(image => image.isPrimary && image.url)?.url || product.images?.find(image => image.url)?.url || skus.find(sku => sku.color?.image?.url)?.color.image.url || placeholder,
  }
}


export const getProductGallery = (product, selectedColor) => {
  if (!product) return []
  const variantUrls = new Set((product.skus || []).flatMap(sku => [sku.color?.image?.url, ...(sku.images || []).map(image => image.url)]).filter(Boolean))
  const images = [...new Set([
    ...(selectedColor?.images || []),
    ...(product.colors || []).flatMap(color => color.images || []),
    ...(product.images || []).filter(url => !variantUrls.has(url)),
  ].filter(Boolean))]
  return images.length ? images : [product.image || placeholder]
}
