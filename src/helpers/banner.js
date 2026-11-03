export const bannerPositions = {
  hero: 'Banner chính trang chủ',
  promo: 'Banner phụ trang chủ',
  'product-iphone': 'Banner iPhone',
  'product-android': 'Banner Android',
}

export const getBannerProductSlug = link => {
  const match = typeof link === 'string' && link.match(/^\/products\/([^/?#]+)$/)
  try { return match ? decodeURIComponent(match[1]) : '' }
  catch { return '' }
}

export const isValidBannerLink = link => {
  if (typeof link !== 'string' || !link || /[\s\\]/.test(link)) return false
  if (link.startsWith('/') && !link.startsWith('//')) return true
  try {
    const url = new URL(link)
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
  } catch { return false }
}

export const bannerThemes = {
  slate: 'from-slate-900 via-slate-800 to-rose-950',
  indigo: 'from-slate-950 via-indigo-950 to-violet-950',
  zinc: 'from-slate-950 via-zinc-900 to-blue-950',
  amber: 'from-zinc-900 via-stone-900 to-amber-950',
  purple: 'from-purple-950 via-slate-900 to-rose-950',
}

export const groupBannersByPosition = banners => {
  const groups = new Map()
  for (const banner of banners) {
    if (!groups.has(banner.position)) groups.set(banner.position, { position: banner.position, label: bannerPositions[banner.position] || banner.position, items: [] })
    groups.get(banner.position).items.push(banner)
  }
  return [...groups.values()]
}

export const bannerDisplayStatus = (banner, now = Date.now()) => {
  if (banner.status !== 'active') return 'Đã ẩn'
  if (banner.startsAt && new Date(banner.startsAt).getTime() > now) return 'Chưa đến lịch'
  if (banner.endsAt && new Date(banner.endsAt).getTime() <= now) return 'Đã hết hạn'
  return 'Đang hiển thị'
}

export const localBannerDate = value => {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export const bannerBody = (values, file) => {
  const data = { ...values, displayOrder: Number(values.displayOrder) }
  const slug = getBannerProductSlug(values.link)
  data.link = slug ? `/products/${encodeURIComponent(slug)}` : '/products'
  for (const key of ['startsAt', 'endsAt']) data[key] = values[key] ? new Date(values[key]).toISOString() : null
  if (!file) return data
  const form = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'image') form.append(key, value === null ? '' : String(value))
  }
  form.append('image', file)
  return form
}
