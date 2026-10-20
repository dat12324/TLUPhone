import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiBox, FiFolder, FiX } from 'react-icons/fi'
import { formatAdminDate } from '../../../utils/adminFormatters'

const DetailItem = ({ label, children, wide = false }) => (
  <div className={wide ? 'sm:col-span-2' : ''}>
    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-1.5 break-words text-sm font-medium leading-6 text-secondary">{children || '—'}</dd>
  </div>
)

const CategoryDetailModal = ({ category, onClose }) => {
  const titleId = useId()
  const modalRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0)
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(modalRef.current?.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])]
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={modalRef} className="max-h-[96vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xl text-primary"><FiFolder aria-hidden="true" /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Chi tiết danh mục</p><h2 id={titleId} className="mt-1 text-xl font-bold text-secondary sm:text-2xl">{category.name}</h2></div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Đóng chi tiết"><FiX className="text-xl" aria-hidden="true" /></button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3"><FiBox className="text-xl text-slate-500" aria-hidden="true" /><span className="text-sm font-medium text-slate-600">Sản phẩm đang liên kết</span></div>
            <strong className="text-xl text-secondary">{category.productCount.toLocaleString('vi-VN')}</strong>
          </div>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <DetailItem label="ID">{category.id}</DetailItem>
            <DetailItem label="Trạng thái"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${category.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{category.status === 'active' ? 'Đang hoạt động' : 'Đã ẩn'}</span></DetailItem>
            <DetailItem label="Mã danh mục">{category.code}</DetailItem>
            <DetailItem label="Slug">{category.slug}</DetailItem>
            <DetailItem label="Mô tả" wide>{category.description}</DetailItem>
            <DetailItem label="Ngày tạo">{formatAdminDate(category.createdAt)}</DetailItem>
            <DetailItem label="Cập nhật gần nhất">{formatAdminDate(category.updatedAt)}</DetailItem>
          </dl>
          <div className="mt-6 flex justify-end border-t border-slate-200 pt-4"><button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-secondary px-5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">Đóng</button></div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default CategoryDetailModal
