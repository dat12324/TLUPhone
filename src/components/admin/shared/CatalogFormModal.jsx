import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertTriangle, FiLoader, FiX } from 'react-icons/fi'
import { normalizeBrandForm, normalizeBrandSlug, validateBrandForm } from '../../../helpers/brandValidation'
import { normalizeCategoryForm, normalizeCategorySlug, validateCategoryForm } from '../../../helpers/categoryValidation'
import ImageUploadInput from '../../common/ImageUploadInput'

const formOptions = {
  brand: {
    label: 'thương hiệu', imageField: 'logo', imageLabel: 'Logo', slugMaxLength: 60,
    namePlaceholder: 'Ví dụ: Apple', slugPlaceholder: 'apple', descriptionRows: 3,
    descriptionPlaceholder: 'Thông tin ngắn về thương hiệu...',
    createDescription: 'Tạo thương hiệu mới cho danh mục điện thoại.',
    editDescription: 'Cập nhật thông tin nhưng không thay đổi ID thương hiệu.',
    normalize: normalizeBrandForm, normalizeSlug: normalizeBrandSlug, validate: validateBrandForm,
  },
  category: {
    label: 'danh mục', imageField: 'image', imageLabel: 'Ảnh danh mục', slugMaxLength: 80,
    namePlaceholder: 'Ví dụ: Điện thoại chơi game', slugPlaceholder: 'dien-thoai-choi-game', descriptionRows: 4,
    descriptionPlaceholder: 'Mô tả ngắn về nhóm sản phẩm...',
    createDescription: 'Tạo nhóm sản phẩm mới trong hệ thống.',
    editDescription: 'Cập nhật thông tin nhưng không thay đổi ID hoặc liên kết sản phẩm.',
    normalize: normalizeCategoryForm, normalizeSlug: normalizeCategorySlug, validate: validateCategoryForm,
  },
}

const fieldClass = (hasError) => `min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-secondary outline-none transition focus:ring-2 focus:ring-primary/15 ${hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'}`

const CatalogFormModal = ({ item, type, onClose, onSave, onSaved, onFailed }) => {
  const options = formOptions[type]
  const { label, imageField, normalize, normalizeSlug, validate } = options
  const formId = useId()
  const modalRef = useRef(null)
  const confirmRef = useRef(null)
  const nameRef = useRef(null)
  const errorSummaryRef = useRef(null)
  const initialValues = useMemo(() => ({
    name: item?.name || '', slug: item?.slug || '', description: item?.description || '',
    [imageField]: item?.[imageField] || null,
    status: item?.status === 'inactive' ? 'inactive' : 'active',
  }), [item, imageField])
  const [values, setValues] = useState(initialValues)
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [slugAuto, setSlugAuto] = useState(true)
  const isEdit = Boolean(item)
  const dirty = imageFile !== null || JSON.stringify(values) !== JSON.stringify(initialValues)

  const closeWithoutSaving = useCallback(() => {
    if (!saving) onClose()
  }, [onClose, saving])

  const requestClose = useCallback(() => {
    if (saving) return
    if (dirty) setConfirmClose(true)
    else onClose()
  }, [dirty, onClose, saving])

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 0)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  useEffect(() => {
    if (confirmClose) window.setTimeout(() => confirmRef.current?.querySelector('button')?.focus(), 0)
  }, [confirmClose])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (confirmClose) setConfirmClose(false)
        else requestClose()
        return
      }
      if (event.key !== 'Tab') return

      const container = confirmClose ? confirmRef.current : modalRef.current
      const focusable = [...(container?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [confirmClose, requestClose])

  const clearFieldError = (field) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setSubmitError('')
  }

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    clearFieldError(field)
  }

  const handleNameChange = (event) => {
    const name = event.target.value
    setValues((current) => ({
      ...current,
      name,
      slug: slugAuto ? normalizeSlug(name) : current.slug,
    }))
    clearFieldError('name')
  }

  const validateField = (field) => {
    if (!dirty) return
    const normalized = normalize(values)
    const fieldError = validate(normalized)[field]
    setValues((current) => ({ ...current, [field]: normalized[field] }))
    setErrors((current) => ({ ...current, [field]: fieldError }))
  }

  const selectImage = (file, fileError) => {
    setImageFile(file)
    setErrors((current) => ({ ...current, [imageField]: fileError || undefined }))
  }

  const removeImage = () => {
    setImageFile(null)
    updateField(imageField, null)
    clearFieldError(imageField)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving || !dirty) return
    setSubmitted(true)

    const normalized = normalize(values)
    const nextErrors = validate(normalized)
    if (errors[imageField]) nextErrors[imageField] = errors[imageField]
    setValues(normalized)
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    setSaving(true)
    try {
      const savedItem = await onSave({ ...normalized, imageFile })
      setSaving(false)
      onSaved(savedItem)
    } catch (error) {
      onFailed?.(error)
      if (error.field) {
        setErrors((current) => ({ ...current, [error.field]: error.message }))
        window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
      } else {
        setSubmitError(error.message || `Không thể lưu ${label}. Vui lòng thử lại.`)
      }
      setSaving(false)
    }
  }

  const describedBy = (field, hintId) => [hintId, errors[field] ? `${formId}-${field}-error` : ''].filter(Boolean).join(' ') || undefined
  const errorEntries = Object.entries(errors).filter(([, message]) => message)

  const imageInput = <ImageUploadInput id={`${formId}-${imageField}`} label={options.imageLabel} imageName={values.name} imageUrl={values[imageField]} file={imageFile} error={errors[imageField]} onSelect={selectImage} onRemove={removeImage} />

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose() }}>
      <div ref={modalRef} className="relative flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Quản lý {label}</p>
            <h2 id={`${formId}-title`} className="mt-1 text-xl font-bold text-secondary sm:text-2xl">{`${isEdit ? 'Chỉnh sửa' : 'Thêm'} ${label}`}</h2>
            <p className="mt-1 text-sm text-slate-500">{isEdit ? options.editDescription : options.createDescription}</p>
          </div>
          <button type="button" onClick={requestClose} disabled={saving} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40" aria-label="Đóng form">
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto" noValidate>
          <div className="space-y-5 px-5 py-5 sm:px-6">
            {((submitted && errorEntries.length > 0) || submitError) && (
              <div ref={errorSummaryRef} tabIndex="-1" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 outline-none focus:ring-2 focus:ring-red-500" role="alert" aria-labelledby={`${formId}-error-title`}>
                <h3 id={`${formId}-error-title`} className="font-bold">Vui lòng kiểm tra lại thông tin</h3>
                {submitError && <p className="mt-1">{submitError}</p>}
                {errorEntries.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errorEntries.map(([field, message]) => <li key={field}><a href={`#${formId}-${field}`} className="underline">{message}</a></li>)}
                  </ul>
                )}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-semibold text-secondary">Tên {label} <span className="text-primary">*</span></label>
                <input ref={nameRef} id={`${formId}-name`} value={values.name} onChange={handleNameChange} onBlur={() => validateField('name')} maxLength="80" className={fieldClass(errors.name)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} placeholder={options.namePlaceholder} />
                {errors.name && <p id={`${formId}-name-error`} className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>}
              </div>


              <div>
                <label htmlFor={`${formId}-slug`} className="mb-1.5 block text-sm font-semibold text-secondary">Slug <span className="text-primary">*</span></label>
                <input id={`${formId}-slug`} value={values.slug} onChange={(event) => { setSlugAuto(false); updateField('slug', event.target.value.toLowerCase()) }} onBlur={() => validateField('slug')} maxLength={options.slugMaxLength} className={fieldClass(errors.slug)} aria-invalid={Boolean(errors.slug)} aria-describedby={describedBy('slug', `${formId}-slug-hint`)} placeholder={options.slugPlaceholder} />
                <p id={`${formId}-slug-hint`} className="mt-1.5 text-xs text-slate-500">Chữ thường, số và dấu gạch ngang.</p>
                {errors.slug && <p id={`${formId}-slug-error`} className="mt-1 text-xs font-medium text-red-600">{errors.slug}</p>}
              </div>
            </div>

            {type === 'brand' && imageInput}

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <label htmlFor={`${formId}-description`} className="text-sm font-semibold text-secondary">Mô tả</label>
                <span className="text-xs text-slate-400">{values.description.length}/500</span>
              </div>
              <textarea id={`${formId}-description`} value={values.description} onChange={(event) => updateField('description', event.target.value)} onBlur={() => validateField('description')} rows={options.descriptionRows} maxLength="500" className={`${fieldClass(errors.description)} resize-y py-3`} aria-invalid={Boolean(errors.description)} aria-describedby={describedBy('description')} placeholder={options.descriptionPlaceholder} />
              {errors.description && <p id={`${formId}-description-error`} className="mt-1.5 text-xs font-medium text-red-600">{errors.description}</p>}
            </div>

            {type === 'category' && imageInput}

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-secondary">Trạng thái</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[['active', 'Đang hoạt động', 'Hiển thị trong hệ thống'], ['inactive', 'Đã ẩn', 'Tạm thời không hiển thị']].map(([value, label, note]) => (
                  <label key={value} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${values.status === value ? 'border-primary bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name={`${formId}-status`} value={value} checked={values.status === value} onChange={(event) => updateField('status', event.target.value)} className="mt-1 h-4 w-4 accent-primary" />
                    <span><strong className="block text-sm text-secondary">{label}</strong><span className="mt-0.5 block text-xs text-slate-500">{note}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button type="button" onClick={requestClose} disabled={saving} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40">Hủy</button>
            <button type="submit" disabled={saving || !dirty} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {saving && <FiLoader className="animate-spin" aria-hidden="true" />}
              {saving ? 'Đang lưu...' : `Lưu ${label}`}
            </button>
          </div>
        </form>

        {confirmClose && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/45 p-5">
            <div ref={confirmRef} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby={`${formId}-confirm-title`} aria-describedby={`${formId}-confirm-desc`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-700"><FiAlertTriangle aria-hidden="true" /></span>
              <h3 id={`${formId}-confirm-title`} className="mt-4 text-lg font-bold text-secondary">Bỏ các thay đổi chưa lưu?</h3>
              <p id={`${formId}-confirm-desc`} className="mt-2 text-sm leading-6 text-slate-500">Thông tin bạn vừa nhập sẽ không được lưu lại.</p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setConfirmClose(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Tiếp tục chỉnh sửa</button>
                <button type="button" onClick={closeWithoutSaving} className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">Bỏ thay đổi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default CatalogFormModal
