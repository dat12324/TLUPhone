import rawProducts from './cellphones_dien_thoai_full.json' with { type: 'json' }

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const getBrand = (name = '') => {
  const value = name.toLowerCase()
  const brands = [
    ['iphone', 'Apple'], ['apple', 'Apple'], ['samsung', 'Samsung'],
    ['xiaomi', 'Xiaomi'], ['redmi', 'Xiaomi'], ['poco', 'POCO'],
    ['oppo', 'OPPO'], ['realme', 'realme'], ['vivo', 'vivo'],
    ['nubia', 'Nubia'], ['honor', 'HONOR'], ['tecno', 'TECNO'],
    ['infinix', 'Infinix'], ['nothing', 'Nothing'], ['oneplus', 'OnePlus'],
    ['motorola', 'Motorola'],
  ]
  return brands.find(([keyword]) => value.includes(keyword))?.[1] || 'Khác'
}

const getColorCode = (name = '') => {
  const value = name.toLowerCase()
  const colors = [
    ['đen', '#171717'], ['black', '#171717'], ['trắng', '#f8fafc'],
    ['white', '#f8fafc'], ['bạc', '#cbd5e1'], ['silver', '#cbd5e1'],
    ['xanh dương', '#2563eb'], ['xanh lá', '#16a34a'], ['xanh', '#0f766e'],
    ['blue', '#2563eb'], ['green', '#16a34a'], ['đỏ', '#dc2626'],
    ['red', '#dc2626'], ['vàng', '#eab308'], ['gold', '#d4a017'],
    ['tím', '#7e22ce'], ['purple', '#7e22ce'], ['hồng', '#ec4899'],
    ['pink', '#ec4899'], ['xám', '#64748b'], ['gray', '#64748b'],
    ['grey', '#64748b'], ['cam', '#f97316'], ['orange', '#f97316'],
  ]
  return colors.find(([keyword]) => value.includes(keyword))?.[1] || '#94a3b8'
}

const improveImage = (url) => {
  if (!url) return PLACEHOLDER_IMAGE
  return url.replace('/rs:fill:50:50/', '/rs:fill:500:500/')
}

const normalizePrice = (value, fallback = 0) => {
  const price = Number(value)
  return Number.isFinite(price) && price > 0 ? price : fallback
}

const normalizeSpecKey = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const groupTechnicalSpecifications = (items) => {
  const groups = {
    display: { title: 'Màn hình', items: {} },
    rearCamera: { title: 'Camera sau', items: {} },
    frontCamera: { title: 'Camera trước', items: {} },
    performance: { title: 'Hệ điều hành - CPU', items: {} },
    battery: { title: 'Pin & Sạc', items: {} },
    connectivity: { title: 'Kết nối', items: {} },
    general: { title: 'Thông tin khác', items: {} },
  }

  Object.entries(items).forEach(([key, value]) => {
    const normalizedKey = normalizeSpecKey(key)
    let group = groups.general

    if (normalizedKey.includes('man hinh') || normalizedKey.includes('do phan giai') || normalizedKey.includes('tan so quet') || normalizedKey.includes('kieu man hinh')) {
      group = groups.display
    } else if (normalizedKey.includes('camera sau') || normalizedKey.includes('den flash') || normalizedKey.includes('chup anh') || normalizedKey === 'quay video' || normalizedKey === 'quay phim' || normalizedKey.includes('tinh nang camera')) {
      group = groups.rearCamera
    } else if (normalizedKey.includes('camera truoc') || normalizedKey.includes('quay video truoc') || normalizedKey.includes('video call')) {
      group = groups.frontCamera
    } else if (normalizedKey.includes('he dieu hanh') || normalizedKey.includes('chipset') || normalizedKey.includes('cpu') || normalizedKey.includes('gpu') || normalizedKey === 'ram' || normalizedKey.includes('bo nho trong')) {
      group = groups.performance
    } else if (normalizedKey.includes('pin') || normalizedKey.includes('sac') || normalizedKey.includes('cong sac')) {
      group = groups.battery
    } else if (normalizedKey.includes('mang') || normalizedKey.includes('sim') || normalizedKey.includes('nfc') || normalizedKey.includes('wi-fi') || normalizedKey.includes('bluetooth') || normalizedKey.includes('gps')) {
      group = groups.connectivity
    }

    group.items[key] = value
  })

  return Object.fromEntries(
    Object.entries(groups).filter(([, group]) => Object.keys(group.items).length > 0)
  )
}

const crawledProducts = rawProducts.map((raw, index) => {
  const price = normalizePrice(raw.price_vnd)
  const originalPrice = Math.max(price, normalizePrice(raw.original_price_vnd, price))
  const rawColors = Array.isArray(raw.colors) ? raw.colors : []
  const colors = rawColors.map((color, colorIndex) => ({
    id: `c${color.product_id || colorIndex + 1}`,
    name: color.color || `Màu ${colorIndex + 1}`,
    colorCode: getColorCode(color.color),
    image: improveImage(color.image),
  }))
  const images = [...new Set(colors.map((color) => color.image).filter(Boolean))]
  const specs = [raw.screen_inch && `${raw.screen_inch} inches`, raw.ram_gb && `${raw.ram_gb}GB RAM`, raw.storage]
    .filter(Boolean)
    .join(', ')
  const technicalItems = raw.specifications && typeof raw.specifications === 'object'
    ? raw.specifications
    : {}
  const normalizedColors = colors.length > 0
    ? colors
    : [{ id: 'c1', name: 'Mặc định', colorCode: '#94a3b8', image: PLACEHOLDER_IMAGE }]

  return {
    id: index + 1001,
    name: raw.name || `Sản phẩm ${index + 1}`,
    brand: getBrand(raw.name),
    image: images[0] || PLACEHOLDER_IMAGE,
    images: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
    price,
    originalPrice,
    specs,
    rating: 4.5,
    reviewCount: 0,
    isFeatured: index < 12,
    isNew: /mới/i.test(raw.tag || ''),
    isHotDeal: Number(raw.discount_pct) >= 10,
    shortDescription: raw.tag || `${raw.name} chính hãng, bảo hành đầy đủ.`,
    description: `${raw.name} với cấu hình ${specs || 'đa dạng'}, giá bán ${price.toLocaleString('vi-VN')}₫. Sản phẩm chính hãng, hỗ trợ giao hàng và bảo hành theo chính sách của TLUPhone.`,
    highlights: Object.entries(technicalItems).slice(0, 6).map(([key, value]) => `${key}: ${value}`),
    variants: [{
      id: `v${index + 1001}`,
      ram: raw.ram_gb ? `${raw.ram_gb}GB` : '',
      storage: raw.storage || 'Tiêu chuẩn',
      price,
      originalPrice,
    }],
    colors: normalizedColors,
    specifications: groupTechnicalSpecifications(technicalItems),
    sourceUrl: raw.url,
  }
})

export default crawledProducts
