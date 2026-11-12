import { Link } from 'react-router-dom'
import { FiCheckCircle, FiCreditCard, FiDollarSign, FiShield } from 'react-icons/fi'
import CouponSelector from '../common/CouponSelector'
import { CheckoutSection } from './CheckoutAddress'
import { paymentMethods } from '../../data/checkout'
import { formatVnd } from '../../helpers/checkout'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

export const CheckoutItems = ({ selectedItems, selectedTotalQuantity }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <h2 className="font-bold text-secondary">Danh sách sản phẩm</h2>
      <span className="text-xs font-semibold text-gray-500">{selectedTotalQuantity} sản phẩm</span>
    </div>
    <div className="divide-y divide-gray-100">
      {selectedItems.map((item) => (
        <div key={item.id} className="flex gap-4 px-5 py-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <img src={item.image || PLACEHOLDER_IMAGE} alt={item.name} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }} className="h-full w-full object-contain p-1.5" />
          </div>
          <div className="min-w-0 flex-1">
            <Link to={`/products/${item.slug}`} className="line-clamp-2 text-sm font-bold leading-snug text-secondary hover:text-primary">{item.name}</Link>
            <div className="mt-1 space-y-0.5 text-xs text-gray-500">
              {item.selectedVariant && <p>Phiên bản: {[item.selectedVariant.storage, item.selectedVariant.ram].filter(Boolean).join(' - ')}</p>}
              {item.selectedColor && <p>Màu sắc: {item.selectedColor.name}</p>}
              <p>Số lượng: {item.quantity}</p>
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-xs text-gray-500">{formatVnd(item.price)}/máy</span>
              <strong className="text-sm text-primary">{formatVnd(item.price * item.quantity)}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

const CheckoutSummary = ({
  selectedSubtotal, selectedTotalQuantity, appliedCoupon, applyCoupon, removeCoupon,
  couponDiscount, couponBusy, shippingFee, total, paymentMethod, onPaymentChange,
  errors, busy, cartBusy, cartError, submittedOrder,
}) => (
  <aside className="min-w-0 space-y-4 lg:col-span-4">
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-bold text-secondary">Thông tin đơn hàng</h2>
      <CouponSelector appliedCoupon={appliedCoupon} subtotal={selectedSubtotal} onApply={applyCoupon} onRemove={removeCoupon} title={false} className="mb-4" />
      <div className="mb-3 flex justify-between gap-4 text-sm text-gray-600"><span>Số lượng sản phẩm</span><span className="font-semibold text-secondary">{selectedTotalQuantity}</span></div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 text-gray-600"><span>Tạm tính</span><span className="font-semibold text-secondary">{formatVnd(selectedSubtotal)}</span></div>
        {couponDiscount > 0 && <div className="flex justify-between gap-4 text-emerald-600"><span>Giảm giá ({appliedCoupon.code})</span><span className="font-semibold">−{formatVnd(couponDiscount)}</span></div>}
        <div className="flex justify-between gap-4 text-gray-600"><span>Phí vận chuyển</span><span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : 'text-secondary'}`}>{shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}</span></div>
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-end justify-between gap-4">
          <span className="font-bold text-secondary">Tổng thanh toán</span>
          <strong className="text-2xl text-primary">{formatVnd(total)}</strong>
        </div>
        <p className="mt-1 text-right text-[11px] text-gray-400">Đã bao gồm thuế VAT</p>
      </div>
    </section>
    <CheckoutSection title="Phương thức thanh toán">
      <div className="space-y-3">
        {paymentMethods.filter(method => method.available).map((method) => (
          <label key={method.id} className={`block cursor-pointer rounded-xl border p-4 transition ${paymentMethod === method.id ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 hover:border-rose-300'}`}>
            <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => onPaymentChange(method.id)} className="sr-only" />
            <span className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === method.id ? 'border-primary' : 'border-gray-300'}`}>
                {paymentMethod === method.id && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-secondary">{method.label}</strong>
                  {!method.available && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">Giao diện demo</span>}
                </span>
                <span className="mt-1 block text-xs text-gray-500">{method.description}</span>
              </span>
              {method.id === 'cod' ? <FiDollarSign className="shrink-0 text-emerald-600" /> : <FiCreditCard className="shrink-0 text-blue-600" />}
            </span>
          </label>
        ))}
      </div>
      {errors.paymentMethod && <p className="mt-2 text-xs font-medium text-rose-600">{errors.paymentMethod}</p>}
    </CheckoutSection>
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <button type="submit" disabled={busy || cartBusy || couponBusy || Boolean(cartError) || Boolean(submittedOrder)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50">
        <FiCheckCircle /> {busy ? 'ĐANG ĐẶT HÀNG…' : 'ĐẶT HÀNG'}
      </button>
      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-gray-500"><FiShield className="mt-0.5 shrink-0 text-emerald-600" /> Giá và tồn kho được xác nhận lại khi tạo đơn.</p>
    </section>
  </aside>
)

export default CheckoutSummary
