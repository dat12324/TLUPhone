import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertTriangle, FiLoader, FiX } from 'react-icons/fi'
import {
  normalizeBrandCode,
  normalizeBrandForm,
  normalizeBrandSlug,
  validateBrandForm,
} from '../../../helpers/brandValidation'
import { fileToDataUrl } from '../../../utils/brandLogo'
import BrandLogoInput from './BrandLogoInput'

const emptyBrand = {
  name: '',
  code: '',
  slug: '',
  logo: null,
  description: '',
  status: 'active',
}

const getInitialValues = (brand) => brand ? {
  name: brand.name || '',
  code: brand.code || '',
  slug: brand.slug || '',
  logo: brand.logo || null,
  description: brand.description || '',
  status: brand.status === 'inactive' ? 'inactive' : 'active',
} : emptyBrand

const fieldClass = (hasError) => `min-h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-secondary outline-none transition focus:ring-2 focus:ring-primary/15 ${hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'}`

const BrandFormModal = ({ brand, onClose, onSave, onSaved }) => {
  const formId = useId()
  const modalRef = useRef(null)
  const confirmRef = useRef(null)
  const nameRef = useRef(null)
  const errorSummaryRef = useRef(null)
  const initialValues = useMemo(() => getInitialValues(brand), [brand])
  const [values, setValues] = useState(initialValues)
  const [logoFile, setLogoFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [codeAuto, setCodeAuto] = useState(!brand)
  const [slugAuto, setSlugAuto] = useState(!brand)
  const isEdit = Boolean(brand)
  const dirty = logoFile !== null || JSON.stringify(values) !== JSON.stringify(initialValues)

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
      code: !isEdit && codeAuto ? normalizeBrandCode(name) : current.code,
      slug: !isEdit && slugAuto ? normalizeBrandSlug(name) : current.slug,
    }))
    clearFieldError('name')
  }

  const validateField = (field) => {
    if (!dirty) return
    const normalized = normalizeBrandForm(values)
    const fieldError = validateBrandForm(normalized)[field]
    setValues((current) => ({ ...current, [field]: normalized[field] }))
    setErrors((current) => ({ ...current, [field]: fieldError }))
  }

  const selectLogo = (file, fileError) => {
    setLogoFile(file)
    setErrors((current) => ({ ...current, logo: fileError || undefined }))
  }

  const removeLogo = () => {
    setLogoFile(null)
    updateField('logo', null)
    clearFieldError('logo')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving || !dirty) return
    setSubmitted(true)

    const normalized = normalizeBrandForm(values)
    const nextErrors = validateBrandForm(normalized)
    if (errors.logo) nextErrors.logo = errors.logo
    setValues(normalized)
    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    setSaving(true)
    try {
      const logo = logoFile ? await fileToDataUrl(logoFile) : normalized.logo
      const savedBrand = await onSave({ ...normalized, logo })
      setSaving(false)
      onSaved(savedBrand)
    } catch (error) {
      if (error.field) {
        setErrors((current) => ({ ...current, [error.field]: error.message }))
        window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
      } else {
        setSubmitError(error.message || 'Không thể lưu thương hiệu. Vui lòng thử lại.')
      }
      setSaving(false)
    }
  }

  const describedBy = (field, hintId) => [hintId, errors[field] ? `${formId}-${field}-error` : ''].filter(Boolean).join(' ') || undefined
  const errorEntries = Object.entries(errors).filter(([, message]) => message)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose() }}>
      <div ref={modalRef} className="relative flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Quản lý thương hiệu</p>
            <h2 id={`${formId}-title`} className="mt-1 text-xl font-bold text-secondary sm:text-2xl">{isEdit ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}</h2>
            <p className="mt-1 text-sm text-slate-500">{isEdit ? 'Cập nhật thông tin nhưng không thay đổi ID thương hiệu.' : 'Tạo thương hiệu mới cho danh mục điện thoại.'}</p>
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
                <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-semibold text-secondary">Tên thương hiệu <span className="text-primary">*</span></label>
                <input ref={nameRef} id={`${formId}-name`} value={values.name} onChange={handleNameChange} onBlur={() => validateField('name')} maxLength="80" className={fieldClass(errors.name)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} placeholder="Ví dụ: Apple" />
                {errors.name && <p id={`${formId}-name-error`} className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor={`${formId}-code`} className="mb-1.5 block text-sm font-semibold text-secondary">Mã thương hiệu <span className="text-primary">*</span></label>
                <input id={`${formId}-code`} value={values.code} onChange={(event) => { setCodeAuto(false); updateField('code', event.target.value.toUpperCase()) }} onBlur={() => validateField('code')} maxLength="30" className={fieldClass(errors.code)} aria-invalid={Boolean(errors.code)} aria-describedby={describedBy('code', `${formId}-code-hint`)} placeholder="APPLE" />
                <p id={`${formId}-code-hint`} className="mt-1.5 text-xs text-slate-500">Chữ in hoa, số và dấu gạch dưới.</p>
                {errors.code && <p id={`${formId}-code-error`} className="mt-1 text-xs font-medium text-red-600">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor={`${formId}-slug`} className="mb-1.5 block text-sm font-semibold text-secondary">Slug <span className="text-primary">*</span></label>
                <input id={`${formId}-slug`} value={values.slug} onChange={(event) => { setSlugAuto(false); updateField('slug', event.target.value.toLowerCase()) }} onBlur={() => validateField('slug')} maxLength="60" className={fieldClass(errors.slug)} aria-invalid={Boolean(errors.slug)} aria-describedby={describedBy('slug', `${formId}-slug-hint`)} placeholder="apple" />
                <p id={`${formId}-slug-hint`} className="mt-1.5 text-xs text-slate-500">Chữ thường, số và dấu gạch ngang.</p>
                {errors.slug && <p id={`${formId}-slug-error`} className="mt-1 text-xs font-medium text-red-600">{errors.slug}</p>}
              </div>
            </div>

            <BrandLogoInput id={`${formId}-logo`} brandName={values.name} logo={values.logo} file={logoFile} error={errors.logo} onSelect={selectLogo} onRemove={removeLogo} />

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <label htmlFor={`${formId}-description`} className="text-sm font-semibold text-secondary">Mô tả</label>
                <span className="text-xs text-slate-400">{values.description.length}/500</span>
              </div>
              <textarea id={`${formId}-description`} value={values.description} onChange={(event) => updateField('description', event.target.value)} onBlur={() => validateField('description')} rows="3" maxLength="500" className={`${fieldClass(errors.description)} resize-y py-3`} aria-invalid={Boolean(errors.description)} aria-describedby={describedBy('description')} placeholder="Thông tin ngắn về thương hiệu..." />
              {errors.description && <p id={`${formId}-description-error`} className="mt-1.5 text-xs font-medium text-red-600">{errors.description}</p>}
            </div>

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
              {saving ? 'Đang lưu...' : 'Lưu thương hiệu'}
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

export default BrandFormModal
