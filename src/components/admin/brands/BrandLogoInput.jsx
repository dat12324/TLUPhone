import { useEffect, useRef, useState } from 'react'
import { FiImage, FiTrash2, FiUpload } from 'react-icons/fi'
import { ALLOWED_BRAND_LOGO_TYPES, validateBrandLogoFile } from '../../../helpers/brandValidation'

const BrandLogoInput = ({ id, brandName, logo, file, error, onSelect, onRemove }) => {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(logo || '')
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
    if (!file) {
      setPreviewUrl(logo || '')
      return undefined
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file, logo])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    const fileError = validateBrandLogoFile(selectedFile)
    onSelect(fileError ? null : selectedFile, fileError)
    if (fileError) event.target.value = ''
  }

  const removeLogo = () => {
    if (inputRef.current) inputRef.current.value = ''
    onRemove()
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-secondary">Logo</span>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          {previewUrl && !imageError ? (
            <img src={previewUrl} alt={`Xem trước logo ${brandName || 'thương hiệu'}`} className="h-full w-full object-contain p-2" onError={() => setImageError(true)} />
          ) : brandName ? (
            <span className="text-lg font-bold text-slate-500">{brandName.slice(0, 2).toUpperCase()}</span>
          ) : (
            <FiImage className="text-2xl text-slate-300" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary focus-within:ring-2 focus-within:ring-primary">
              <FiUpload aria-hidden="true" /> Chọn ảnh
            </label>
            {(previewUrl || file) && (
              <button type="button" onClick={removeLogo} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <FiTrash2 aria-hidden="true" /> Bỏ ảnh
              </button>
            )}
          </div>
          <input ref={inputRef} id={id} type="file" accept={ALLOWED_BRAND_LOGO_TYPES.join(',')} onChange={handleFileChange} className="sr-only" aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} />
          <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-slate-500">PNG, JPG, JPEG hoặc WebP; tối đa 2MB.</p>
          {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default BrandLogoInput
