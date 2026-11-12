
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertTriangle, FiLoader, FiX } from 'react-icons/fi'

const CancelOrderModal = ({ order, onClose, onConfirm, busy = false }) => {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const submitting = useRef(false)
  const dialogRef = useRef(null)
  const pending = busy || loading

  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current.showModal()
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (submitting.current || busy) return
    submitting.current = true

    setLoading(true)
    setError('')

    try {
      await onConfirm(order, reason.trim())
    } catch (err) {
      setError(err.message || 'Không thể hủy đơn hàng.')
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  return createPortal(
    <dialog ref={dialogRef}
        onCancel={event => { event.preventDefault(); if (!pending) onClose() }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        aria-describedby="cancel-order-description"
        aria-busy={pending}
        className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-md overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/40"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <FiAlertTriangle size={24} />
          </div>

          <button type="button" onClick={onClose} disabled={pending} aria-label="Đóng" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50">
            <FiX size={20} />
          </button>
        </div>

        <h2 id="cancel-order-title" className="mt-5 text-xl font-bold text-slate-900">
          Xác nhận hủy đơn hàng
        </h2>

        <p id="cancel-order-description" className="mt-3 text-sm leading-6 text-slate-600">
          Bạn có chắc chắn muốn hủy đơn hàng{' '}
          <strong className="break-all">{order.orderCode}</strong> không?
        </p>

        <div className="mt-4">
          <label htmlFor="cancel-order-reason" className="mb-2 block text-sm font-medium text-slate-700">Lý do hủy <span className="font-normal text-slate-500">(không bắt buộc)</span></label>
          <textarea id="cancel-order-reason" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} disabled={pending}
            rows={3} placeholder="Nhập lý do hủy đơn hàng…"
            aria-describedby="cancel-reason-count"
            className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50" />
          <p id="cancel-reason-count" className="mt-1 text-right text-xs text-slate-500">{reason.length}/500</p>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border px-5 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Giữ đơn hàng
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {pending && <FiLoader className="animate-spin" />}
            {pending ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </button>
        </div>
    </dialog>,
    document.body
  )
}

export default CancelOrderModal
