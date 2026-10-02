import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FiGift, FiTag, FiX } from 'react-icons/fi'
import coupons from '../../data/coupons'

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

  const handleApply = (value = code) => {
    setError('')
    const result = onApply(value)

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
          {subtotal < appliedCoupon.minOrder && (
            <p className="mt-1.5 text-[11px] text-amber-600">* Đơn tối thiểu {appliedCoupon.minOrder.toLocaleString('vi-VN')}₫ để áp dụng</p>
          )}
        </div>
      ) : (
        <button type="button" onClick={openSelector} className="group flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm transition hover:border-primary hover:bg-rose-50">
          <span className="flex items-center gap-2 text-gray-600"><FiTag className="text-primary" /> Áp dụng mã giảm giá</span>
          <span className="font-semibold text-primary group-hover:underline">Chọn</span>
        </button>
      )}

      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}

      {isOpen && !appliedCoupon && createPortal((
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
          <div className="relative z-[101] flex max-h-[calc(100vh-6rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="relative z-10 shrink-0 border-b border-gray-100 bg-white px-6 py-4 text-center">
              <h2 className="text-xl font-bold text-secondary sm:text-2xl">Nhập hoặc chọn mã khuyến mãi</h2>
              <button type="button" aria-label="Đóng" onClick={() => setIsOpen(false)} className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"><FiX className="text-xl" /></button>
            </div>

            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <input type="text" value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setSelectedCode(''); setError('') }} onKeyDown={(event) => { if (event.key === 'Enter' && code.trim()) handleApply() }} placeholder="Nhập mã khuyến mãi" autoFocus className="min-w-0 flex-1 px-4 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-gray-400 sm:text-base" />
                <button type="button" onClick={() => handleApply()} disabled={!code.trim()} className="border-l border-gray-200 px-5 font-semibold text-primary disabled:cursor-not-allowed disabled:text-gray-300">Áp dụng</button>
              </div>
              {error && <p className="mt-2 text-sm font-medium text-rose-500">{error}</p>}
              <p className="mb-3 mt-5 text-sm font-semibold uppercase text-gray-600">Khả dụng</p>
              <div className="grid max-h-[34vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {coupons.filter((coupon) => coupon.active).map((coupon) => {
                  const eligible = subtotal >= coupon.minOrder
                  const selected = selectedCode === coupon.code
                  return (
                    <button type="button" key={coupon.id} onClick={() => { setSelectedCode(coupon.code); setCode(coupon.code); setError('') }} className={`flex min-h-32 items-center gap-4 rounded-xl border p-4 text-left transition ${selected ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 bg-gray-50 hover:border-rose-300'}`}>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl text-white"><FiGift /></span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-sm text-secondary sm:text-base">{coupon.code}</strong>
                        <span className="mt-1 block text-sm text-blue-600">{coupon.description}</span>
                        <span className={`mt-2 block text-xs ${eligible ? 'text-gray-500' : 'text-amber-600'}`}>{eligible ? 'Có thể áp dụng cho đơn hàng' : `Đơn tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}₫`}</span>
                      </span>
                      <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${selected ? 'border-primary bg-primary ring-4 ring-rose-100' : 'border-gray-300 bg-white'}`} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:px-7">
              <span className="text-sm text-gray-500">{selectedCode ? `Đã chọn: ${selectedCode}` : 'Chưa chọn ưu đãi nào.'}</span>
              <button type="button" disabled={!selectedCode} onClick={() => handleApply(selectedCode)} className="min-w-40 rounded-xl bg-primary px-8 py-3 font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">Xác nhận</button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  )
}

export default CouponSelector
