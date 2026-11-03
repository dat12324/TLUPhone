export const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

export const formatCompactVnd = (value) => {
  const number = Number(value || 0)
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`
  if (number >= 1_000_000) return `${(number / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`
  if (number >= 1_000) return `${(number / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} nghìn`
  return number.toLocaleString('vi-VN')
}

export const formatAdminDate = (value) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

// Chấp nhận số GB từ API và chuỗi GB/TB cũ, không sửa dữ liệu gốc.
export const skuCapacityGb = value => {
  const match = String(value ?? '').trim().match(/^(\d+(?:\.\d+)?)\s*(GB|TB)?$/i)
  return match ? Number(match[1]) * (match[2]?.toUpperCase() === 'TB' ? 1024 : 1) : null
}
export const formatSkuCapacity = value => {
  const gb = skuCapacityGb(value)
  return gb === null ? String(value ?? '—') : (gb >= 1024 && gb % 1024 === 0 ? `${gb / 1024}TB` : `${gb}GB`)
}
export const groupProductVariants = (items, mode = 'capacity') => {
  const groups = new Map()
  for (const item of items) {
    const ram = formatSkuCapacity(item.ram)
    const storage = formatSkuCapacity(item.storage)
    const color = item.color?.name?.normalize('NFC').trim().replace(/\s+/g, ' ') || 'Chưa có tên màu'
    const colorKey = color.toLocaleLowerCase('vi-VN')
    const capacityKey = `${ram}/${storage}`
    const key = mode === 'color' ? colorKey : capacityKey
    if (!groups.has(key)) groups.set(key, { key, label: mode === 'color' ? color : `${ram} / ${storage}`, image: null, code: item.color?.code, items: [], members: new Set() })
    const group = groups.get(key)
    group.image ||= item.color?.image?.url
    group.code ||= item.color?.code
    group.items.push(item)
    group.members.add(mode === 'color' ? capacityKey : colorKey)
  }
  const result = [...groups.values()].map(({ members, ...group }) => ({ ...group, count: members.size }))
  if (mode === 'capacity') result.sort((a, b) =>
    (skuCapacityGb(a.items[0].ram) ?? Infinity) - (skuCapacityGb(b.items[0].ram) ?? Infinity) ||
    (skuCapacityGb(a.items[0].storage) ?? Infinity) - (skuCapacityGb(b.items[0].storage) ?? Infinity))
  return result
}
