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
