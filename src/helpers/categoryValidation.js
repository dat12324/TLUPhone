const removeVietnameseMarks = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')

export const normalizeCategorySlug = (value = '') => removeVietnameseMarks(value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-')

export const normalizeCategoryForm = (values = {}) => ({
  name: String(values.name || '').trim().replace(/\s+/g, ' '),
  slug: normalizeCategorySlug(values.slug),
  description: String(values.description || '').trim(),
  image: values.image || null,
  status: values.status === 'inactive' ? 'inactive' : 'active',
})

export const validateCategoryForm = (values) => {
  const errors = {}

  if (!values.name) errors.name = 'Vui lòng nhập tên danh mục.'
  else if (values.name.length < 2 || values.name.length > 80) errors.name = 'Tên danh mục phải từ 2 đến 80 ký tự.'

  if (!values.slug) errors.slug = 'Vui lòng nhập slug.'
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) errors.slug = 'Slug chỉ gồm chữ thường, số và dấu gạch ngang.'
  else if (values.slug.length < 2 || values.slug.length > 80) errors.slug = 'Slug phải từ 2 đến 80 ký tự.'

  if (values.description.length > 500) errors.description = 'Mô tả không được vượt quá 500 ký tự.'
  return errors
}

