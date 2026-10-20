import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiEye, FiEyeOff, FiLoader, FiX } from 'react-icons/fi'

const CategoryStatusDialog = ({ category, onClose, onConfirm, onCompleted }) => {
  const titleId = useId()
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  const savingRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isHiding = category.status === 'active'
  const nextStatus = isHiding ? 'inactive' : 'active'

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => cancelRef.current?.focus(), 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !savingRef.current) {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(dialogRef.current?.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])]
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
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  const confirmStatus = async () => {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      const updatedCategory = await onConfirm(nextStatus)
      onCompleted(updatedCategory)
    } catch (requestError) {
      setError(requestError.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.')
      savingRef.current = false
      setSaving(false)
    }
  }

  const Icon = isHiding ? FiEyeOff : FiEye

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <div ref={dialogRef} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-description`}>
        <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${isHiding ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <Icon aria-hidden="true" />
          </span>
          <button type="button" onClick={onClose} disabled={saving} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40" aria-label="Đóng hộp thoại">
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <h2 id={titleId} className="text-xl font-bold text-secondary">
            {isHiding ? 'Ẩn danh mục' : 'Kích hoạt danh mục'} {category.name}?
          </h2>
          <div id={`${titleId}-description`} className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <p>Danh mục này hiện có <strong className="text-secondary">{category.productCount.toLocaleString('vi-VN')} sản phẩm</strong> liên kết.</p>
            {isHiding ? (
              <p>Danh mục sẽ không còn xuất hiện trong danh sách có thể chọn khi tạo sản phẩm mới hoặc trên bộ chọn danh mục phía khách hàng. Sản phẩm và đơn hàng đã liên kết vẫn được giữ nguyên.</p>
            ) : (
              <p>Danh mục sẽ trở lại danh sách có thể chọn. Các sản phẩm và liên kết hiện có không thay đổi.</p>
            )}
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button ref={cancelRef} type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40">Hủy</button>
            <button type="button" onClick={confirmStatus} disabled={saving} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${isHiding ? 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600' : 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600'}`}>
              {saving && <FiLoader className="animate-spin" aria-hidden="true" />}
              {saving ? 'Đang cập nhật...' : isHiding ? 'Ẩn danh mục' : 'Kích hoạt'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CategoryStatusDialog
