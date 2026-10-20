const removeVietnameseMarks = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')

export const normalizeCategoryCode = (value = '') => removeVietnameseMarks(value)
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .replace(/_+/g, '_')

export const normalizeCategorySlug = (value = '') => removeVietnameseMarks(value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-')

export const normalizeCategoryForm = (values = {}) => ({
  name: String(values.name || '').trim().replace(/\s+/g, ' '),
  code: normalizeCategoryCode(values.code),
  slug: normalizeCategorySlug(values.slug),
  description: String(values.description || '').trim(),
  status: values.status === 'inactive' ? 'inactive' : 'active',
})

export const validateCategoryForm = (values) => {
  const errors = {}

  if (!values.name) errors.name = 'Vui lòng nhập tên danh mục.'
  else if (values.name.length < 2 || values.name.length > 80) errors.name = 'Tên danh mục phải từ 2 đến 80 ký tự.'

  if (!values.code) errors.code = 'Vui lòng nhập mã danh mục.'
  else if (!/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/.test(values.code)) errors.code = 'Mã chỉ gồm chữ in hoa, số và dấu gạch dưới.'
  else if (values.code.length < 2 || values.code.length > 50) errors.code = 'Mã danh mục phải từ 2 đến 50 ký tự.'

  if (!values.slug) errors.slug = 'Vui lòng nhập slug.'
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) errors.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.'
  else if (values.slug.length < 2 || values.slug.length > 80) errors.slug = 'Slug phải từ 2 đến 80 ký tự.'

  if (values.description.length > 500) errors.description = 'Mô tả không được vượt quá 500 ký tự.'
  return errors
}

