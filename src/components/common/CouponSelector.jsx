import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiGift, FiTag, FiX } from 'react-icons/fi'
import api from '../../lib/api.js'

const CouponSelector = ({
  appliedCoupon,
  subtotal = 0,
  onApply,
  onRemove,
  title = true,
  className = '',
}) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState('')
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retry, setRetry] = useState(0)
  const [applying, setApplying] = useState(false)
  const applyingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    setLoading(true)
    setLoadError('')
    setCoupons([])
    api.get('/vouchers', { params: { limit: 100 }, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setCoupons(data.data.filter(coupon =>
          coupon.status === 'active' && new Date(coupon.startsAt) <= new Date() &&
          new Date(coupon.endsAt) > new Date() && (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit)))
      })
      .catch(error => { if (!controller.signal.aborted) setLoadError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [isOpen, retry])

  const handleApply = async (value = code) => {
    if (applyingRef.current) return
    applyingRef.current = true
    setApplying(true)
    setError('')
    let result
    try { result = await onApply(value) }
    catch (failure) { result = { success: false, message: failure.message } }
    finally { applyingRef.current = false; setApplying(false) }

    if (result?.success) {
      setCode('')
      setSelectedCode('')
      setIsOpen(false)
    } else if (result?.message) {
      setError(result.message)
    }
  }

  const openSelector = () => {
    setError('')
    setIsOpen(true)
  }

  return (
    <div className={className}>
      {title && (
        <h2 className="mb-3 flex items-center gap-2 font-bold text-secondary">
          <FiTag className="text-primary" /> Mã giảm giá
        </h2>
      )}

      {appliedCoupon ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <FiTag className="mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <strong className="text-sm text-emerald-700">{appliedCoupon.code}</strong>
                <p className="mt-0.5 text-xs text-emerald-600">{appliedCoupon.description}</p>
              </div>
            </div>
            <button type="button" onClick={onRemove} className="p-1 text-gray-400 transition hover:text-rose-500" title="Hủy mã giảm giá">
              <FiX className="text-sm" />
            </button>
          </div>

        </div>
      ) : (
        <button type="button" onClick={openSelector} className="group flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm transition hover:border-primary hover:bg-rose-50">
          <span className="flex items-center gap-2 text-gray-600"><FiTag className="text-primary" /> Áp dụng mã giảm giá</span>
          <span className="font-semibold text-primary group-hover:underline">Chọn</span>
        </button>
      )}



      {isOpen && !appliedCoupon && createPortal((
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !applying) setIsOpen(false) }}>
          <div role="dialog" aria-modal="true" aria-labelledby="voucher-dialog-title" aria-busy={applying} className="relative z-[101] flex max-h-[calc(100vh-6rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="relative z-10 shrink-0 border-b border-gray-100 bg-white px-6 py-4 text-center">
              <h2 id="voucher-dialog-title" className="text-xl font-bold text-secondary sm:text-2xl">Nhập hoặc chọn mã khuyến mãi</h2>
              <button type="button" aria-label="Đóng" disabled={applying} onClick={() => setIsOpen(false)} className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"><FiX className="text-xl" /></button>
            </div>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <input type="text" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setSelectedCode(''); setError('') }} onKeyDown={(event) => { if (event.key === 'Enter' && code.trim()) { event.preventDefault(); void handleApply() } }} placeholder="Nhập mã khuyến mãi" autoFocus className="min-w-0 flex-1 px-4 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-gray-400 sm:text-base" />
                <button type="button" onClick={() => handleApply()} disabled={!code.trim() || applying} className="border-l border-gray-200 px-5 font-semibold text-primary disabled:cursor-not-allowed disabled:text-gray-300">{applying ? 'Đang kiểm tra…' : 'Áp dụng'}</button>
              </div>
              {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-500">{error}</p>}
              {loading && <p role="status" className="mt-4 text-sm text-gray-500">Đang tải mã giảm giá…</p>}
              {loadError && <p role="alert" className="mt-4 text-sm text-rose-600">{loadError} <button type="button" onClick={() => setRetry(value => value + 1)} className="font-semibold underline">Thử lại</button></p>}
              {!loading && !loadError && coupons.length === 0 && <p className="mt-4 text-sm text-gray-500">Chưa có mã giảm giá còn hiệu lực. Bạn vẫn có thể nhập mã để kiểm tra.</p>}
              <p className="mb-3 mt-5 text-sm font-semibold uppercase text-gray-600">Khả dụng</p>
              <div className="grid max-h-[34vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {coupons.map((coupon) => {
                  const eligible = subtotal >= coupon.minOrderValue
                  const selected = selectedCode === coupon.code
                  return (
                    <button type="button" key={coupon._id} disabled={applying} onClick={() => { setSelectedCode(coupon.code); setCode(coupon.code); setError('') }} className={`flex min-h-32 items-center gap-4 rounded-xl border p-4 text-left transition ${selected ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 bg-gray-50 hover:border-rose-300'}`}>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl text-white"><FiGift /></span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-sm text-secondary sm:text-base">{coupon.code}</strong>
                        <span className="mt-1 block text-sm font-medium text-rose-600">{coupon.description || (coupon.discountType === 'percentage' ? `Giảm ${coupon.discountValue}%` : `Giảm ${coupon.discountValue.toLocaleString('vi-VN')}₫`)}</span>
                        <span className={`mt-2 block text-xs ${eligible ? 'text-gray-500' : 'text-amber-600'}`}>{eligible ? 'Có thể áp dụng cho đơn hàng' : `Đơn tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫`}</span>
                      </span>
                      <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${selected ? 'border-primary bg-primary ring-4 ring-rose-100' : 'border-gray-300 bg-white'}`} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:px-7">
              <span className="text-sm text-gray-500">{selectedCode ? `Đã chọn: ${selectedCode}` : 'Chưa chọn ưu đãi nào.'}</span>
              <button type="button" disabled={!selectedCode || applying} onClick={() => handleApply(selectedCode)} className="min-w-40 rounded-xl bg-primary px-8 py-3 font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">{applying ? 'Đang kiểm tra…' : 'Xác nhận'}</button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  )
}

export default CouponSelector
