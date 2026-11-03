export const MAX_BRAND_LOGO_BYTES = 5 * 1024 * 1024
export const ALLOWED_BRAND_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const removeVietnameseMarks = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')

export const normalizeBrandSlug = (value = '') => removeVietnameseMarks(value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-')

export const normalizeBrandForm = (values) => ({
  name: (values.name || '').trim().replace(/\s+/g, ' '),
  slug: normalizeBrandSlug(values.slug),
  logo: values.logo || null,
  description: (values.description || '').trim(),
  status: values.status === 'inactive' ? 'inactive' : 'active',
})

export const validateBrandForm = (values) => {
  const errors = {}
  if (!values.name) errors.name = 'Vui lòng nhập tên thương hiệu.'
  else if (values.name.length < 2 || values.name.length > 80) errors.name = 'Tên thương hiệu phải từ 2 đến 80 ký tự.'

  if (!values.slug) errors.slug = 'Vui lòng nhập slug.'
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) errors.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.'
  else if (values.slug.length < 2 || values.slug.length > 60) errors.slug = 'Slug phải từ 2 đến 60 ký tự.'

  if (values.description.length > 500) errors.description = 'Mô tả không được vượt quá 500 ký tự.'
  return errors
}

export const validateBrandLogoFile = (file) => {
  if (!file) return ''
  if (!ALLOWED_BRAND_LOGO_TYPES.includes(file.type)) return 'Chỉ chấp nhận ảnh PNG, JPG, JPEG hoặc WebP.'
  if (file.size > MAX_BRAND_LOGO_BYTES) return 'Ảnh logo không được vượt quá 5MB.'
  return ''
}
