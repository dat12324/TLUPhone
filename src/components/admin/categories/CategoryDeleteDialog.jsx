import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertTriangle, FiLoader, FiTrash2, FiX } from 'react-icons/fi'

const CategoryDeleteDialog = ({ category, onClose, onConfirm, onCompleted }) => {
  const titleId = useId()
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  const savingRef = useRef(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isBlocked = category.productCount > 0

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
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  const confirmDelete = async () => {
    if (savingRef.current || isBlocked) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      const deletedCategory = await onConfirm()
      onCompleted(deletedCategory)
    } catch (requestError) {
      setError(requestError.message || 'Không thể xóa danh mục. Vui lòng thử lại.')
      savingRef.current = false
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <div ref={dialogRef} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-description`}>
        <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${isBlocked ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{isBlocked ? <FiAlertTriangle aria-hidden="true" /> : <FiTrash2 aria-hidden="true" />}</span>
          <button type="button" onClick={onClose} disabled={saving} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40" aria-label="Đóng hộp thoại"><FiX className="text-xl" aria-hidden="true" /></button>
        </div>
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <h2 id={titleId} className="text-xl font-bold text-secondary">{isBlocked ? 'Không thể xóa danh mục' : `Xóa danh mục ${category.name}?`}</h2>
          <div id={`${titleId}-description`} className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            {isBlocked ? (
              <><p>Danh mục <strong className="text-secondary">{category.name}</strong> đang liên kết với <strong className="text-secondary">{category.productCount.toLocaleString('vi-VN')} sản phẩm</strong>.</p><p>Để bảo toàn dữ liệu sản phẩm và đơn hàng, hãy sử dụng chức năng <strong>Ẩn danh mục</strong> thay vì xóa.</p></>
            ) : (
              <><p>Danh mục chưa có sản phẩm liên kết và có thể xóa an toàn.</p><p>Thao tác này không thể hoàn tác. Sản phẩm và đơn hàng không bị xóa dây chuyền.</p></>
            )}
          </div>
          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button ref={cancelRef} type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40">{isBlocked ? 'Đã hiểu' : 'Hủy'}</button>
            {!isBlocked && <button type="button" onClick={confirmDelete} disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{saving && <FiLoader className="animate-spin" aria-hidden="true" />}{saving ? 'Đang xóa...' : 'Xóa danh mục'}</button>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CategoryDeleteDialog

