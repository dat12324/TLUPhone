import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiCreditCard, FiDollarSign, FiHome, FiMail, FiMapPin, FiPhone, FiShield, FiShoppingBag, FiUser } from 'react-icons/fi'
import SideDrawer from '../components/common/SideDrawer'
import CouponSelector from '../components/common/CouponSelector'
import { mapAddress } from '../helpers/profile'
import { useCart } from '../context/CartContext'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import {
  paymentMethods,
} from '../data/checkout'
import {
  buildCheckoutOrder,
  calculateShippingFee,
  formatVnd,
  validateCheckout,
  readCheckoutAddress,
} from '../helpers/checkout'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  province: '',
  district: '',
  ward: '',
  addressLine: '',
  saveAddress: false,
  note: '',
}

const inputClass = (error) => `w-full rounded-xl border bg-white px-4 py-3 text-sm text-secondary outline-none transition placeholder:text-gray-400 ${error
    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-rose-100'
  }`

const FormField = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-secondary">
      {label} {required && <span className="text-primary">*</span>}
    </span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
  </label>
)

const IconField = ({ name, label, icon: Icon, form, errors, onChange, type, placeholder }) => (
  <FormField label={label} required error={errors[name]}>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type={type} value={form[name]} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} className={`${inputClass(errors[name])} pl-10`} />
    </div>
  </FormField>
)

const CheckoutSection = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="mb-4 font-bold text-secondary">{title}</h2>
    {children}
  </section>
)

const CheckoutPage = () => {
  const navigate = useNavigate()
  const {
    selectedItems,
    selectedSubtotal,
    appliedCoupon, applyCoupon, couponDiscount, couponBusy,
    removeCoupon,
    cartLoading, cartBusy, cartError, removeFromCart, reloadCart,
  } = useCart()

  const { user, authLoading, isAuthenticated } = useAuth()
  const checkoutUserId = user?.id || user?._id
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const [cleanupWarning, setCleanupWarning] = useState('')
  const [form, setForm] = useState(() => ({ ...initialForm, fullName: user?.fullName || '', phone: user?.phone || '', email: user?.email || '' }))
  const [errors, setErrors] = useState({})
  const shippingMethod = 'delivery'
  const selectedStoreId = ''
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState('')
  const [addressRetry, setAddressRetry] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [submitError, setSubmitError] = useState('')
  const [submittedOrder, setSubmittedOrder] = useState(null)

  const shippingFee = calculateShippingFee(shippingMethod, selectedSubtotal)
  const total = Math.max(0, selectedSubtotal - couponDiscount + shippingFee)
  const selectedTotalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  useEffect(() => {
    if (!checkoutUserId) { setForm({ ...initialForm }); return }
    setForm({
      ...initialForm,
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || '',
      ...readCheckoutAddress(checkoutUserId),
    })
  }, [checkoutUserId])

  useEffect(() => {
    if (!addressBookOpen || !user?.id) return
    const controller = new AbortController()
    const loadAddresses = async () => {
      setAddressesLoading(true)
      setAddressesError('')
      setAddresses([])
      try {
        const { data } = await api.get('/users/getAddresses', { signal: controller.signal })
        if (!controller.signal.aborted) setAddresses(data.data.map(mapAddress))
      } catch (error) {
        if (!controller.signal.aborted) setAddressesError(error.message)
      } finally {
        if (!controller.signal.aborted) setAddressesLoading(false)
      }
    }
    void loadAddresses()
    return () => controller.abort()
  }, [addressBookOpen, user?.id, addressRetry])

  const selectAddress = address => {
    setForm(current => ({
      ...current,
      fullName: address.receiverName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      addressLine: address.detailAddress,
    }))
    setErrors({})
    setSubmitError('')
    setAddressBookOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting.current || submittedOrder || cartLoading || cartBusy || couponBusy) return
    setSubmitError('')
    if (!selectedItems.length) { setSubmitError('Không có sản phẩm nào được chọn để đặt hàng.'); return }
    if (cartError) { setSubmitError(cartError); return }
    if (shippingMethod !== 'delivery' || paymentMethod !== 'cod') {
      setSubmitError('Hiện chỉ hỗ trợ giao hàng tận nơi và thanh toán COD.')
      return
    }
    const validationErrors = validateCheckout({ form, shippingMethod, selectedStoreId, paymentMethod })
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    submitting.current = true
    setBusy(true)
    const purchased = [...selectedItems]
    try {
      const { data } = await api.post('/orders', buildCheckoutOrder({ form, selectedItems: purchased, paymentMethod, voucherCode: appliedCoupon?.code }))
      setSubmittedOrder(data.data)
      setCleanupWarning('')
      if (appliedCoupon) removeCoupon()
      try {
        const key = `tluphone:checkout-address:${checkoutUserId}`
        if (form.saveAddress) {
          const { fullName, phone, province, district, ward, addressLine } = form
          localStorage.setItem(key, JSON.stringify({ fullName, phone, province, district, ward, addressLine }))
        } else localStorage.removeItem(key)
      } catch {
        setCleanupWarning('Đơn đã được tạo nhưng trình duyệt không thể ghi nhớ địa chỉ cho lần sau.')
      }
      try {
        for (const item of purchased) {
          if (!(await removeFromCart(item.id))) throw new Error('Không thể xóa sản phẩm khỏi giỏ hàng.')
        }
      } catch {
        setCleanupWarning('Đơn đã được tạo. Chưa hoàn tất cập nhật giỏ hàng; bạn có thể kiểm tra lại trong tài khoản.')
      }
    } catch (failure) {
      setSubmitError(failure.message)
      void reloadCart()
    } finally { submitting.current = false; setBusy(false) }
  }

  if (authLoading || cartLoading && !submittedOrder) return <p className="p-10 text-center text-slate-500">Đang tải thông tin đặt hàng…</p>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: { pathname: '/checkout' } }} />

  if (selectedItems.length === 0 && !submittedOrder) {
    return (
      <div className="flex min-h-[70vh] items-center bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-3xl text-primary">
              <FiShoppingBag />
            </span>
            <h1 className="text-2xl font-bold text-secondary">Chưa có sản phẩm để thanh toán</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">Hãy quay lại giỏ hàng và chọn ít nhất một sản phẩm trước khi tiếp tục.</p>
            <Link to="/cart" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-95">
              <FiArrowLeft /> Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-12">
      <div className="mx-auto max-w-[1200px] px-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm">
          <nav aria-label="Điều hướng thanh toán" className="flex items-center gap-3">
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-secondary transition hover:text-primary"><FiArrowLeft aria-hidden="true" /> Quay lại giỏ hàng</Link>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <h1 className="text-slate-500">Thông tin thanh toán</h1>
          </nav>
          <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Miễn phí vận chuyển cho đơn từ 500.000₫</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6">
        {submitError && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {submitError}
          </div>
        )}

        <fieldset className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-12" disabled={busy || cartBusy}>
          <div className="min-w-0 space-y-4 lg:col-span-8">
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
            <CheckoutSection title="Thông tin khách hàng">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-sm sm:border-r sm:border-slate-100 sm:pr-4">
                  <p className="font-semibold text-secondary">{user?.fullName}</p>
                  <p className="text-slate-600">{user?.phone || 'Chưa có số điện thoại'}</p>
                </div>
                <IconField name="email" label="Email" icon={FiMail} type="email" placeholder="email@example.com" form={form} errors={errors} onChange={updateField} />
              </div>
            </CheckoutSection>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-secondary">Địa chỉ giao hàng</h2>
                <button type="button" onClick={() => setAddressBookOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/25 px-3 text-xs font-semibold text-primary transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                  <FiMapPin aria-hidden="true" /> Chọn từ sổ địa chỉ
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IconField name="fullName" label="Tên người nhận" icon={FiUser} placeholder="Nhập họ và tên" form={form} errors={errors} onChange={updateField} />
                <IconField name="phone" label="Số điện thoại người nhận" icon={FiPhone} type="tel" placeholder="Nhập số điện thoại" form={form} errors={errors} onChange={updateField} />
                <FormField label="Tỉnh/Thành phố" required error={errors.province}>
                  <input value={form.province} onChange={event => updateField('province', event.target.value)} autoComplete="address-level1" placeholder="Nhập Tỉnh/Thành phố" className={inputClass(errors.province)} />
                </FormField>
                <FormField label="Quận/Huyện" required error={errors.district}>
                  <input value={form.district} onChange={event => updateField('district', event.target.value)} autoComplete="address-level2" placeholder="Nhập Quận/Huyện" className={inputClass(errors.district)} />
                </FormField>
                <FormField label="Phường/Xã" required error={errors.ward}>
                  <input value={form.ward} onChange={event => updateField('ward', event.target.value)} autoComplete="address-level3" placeholder="Nhập Phường/Xã" className={inputClass(errors.ward)} />
                </FormField>
                <IconField name="addressLine" label="Địa chỉ nhà" icon={FiHome} placeholder="Số nhà, tên đường" form={form} errors={errors} onChange={updateField} />
                <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                  <input type="checkbox" checked={form.saveAddress} onChange={event => updateField('saveAddress', event.target.checked)} className="h-4 w-4 accent-primary" />
                  Ghi nhớ địa chỉ để tự điền cho lần mua kế tiếp
                </label>
                <div className="sm:col-span-2">
                  <FormField label="Ghi chú (nếu có)">
                    <textarea rows="2" value={form.note} onChange={event => updateField('note', event.target.value)} placeholder="Nhập ghi chú giao hàng" className={`${inputClass(false)} resize-y`} />
                  </FormField>
                </div>
              </div>
            </section>
          </div>

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
                    <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => { setPaymentMethod(method.id); setErrors((current) => ({ ...current, paymentMethod: undefined })) }} className="sr-only" />
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
        </fieldset>
      </form>

      {addressBookOpen && (
        <SideDrawer title="Chọn địa chỉ giao hàng" onClose={() => setAddressBookOpen(false)}>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
            {addressesLoading ? <p role="status" className="py-6 text-center text-sm text-slate-500">Đang tải sổ địa chỉ…</p> : addressesError ? (
              <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                <p>{addressesError}</p>
                <button type="button" onClick={() => setAddressRetry(value => value + 1)} className="mt-2 min-h-10 font-semibold underline">Thử lại</button>
              </div>
            ) : addresses.length ? addresses.map(address => (
              <button key={address.id} type="button" onClick={() => selectAddress(address)} className="block w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary hover:bg-rose-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  {address.receiverName}
                  {address.isDefault && <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-primary">Mặc định</span>}
                </span>
                <span className="mt-1 block text-sm text-slate-600">{address.phone}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-500">{[address.detailAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}</span>
              </button>
            )) : (
              <div className="py-8 text-center text-sm text-slate-500">
                <p>Bạn chưa có địa chỉ đã lưu.</p>
                <button type="button" onClick={() => setAddressBookOpen(false)} className="mt-4 min-h-11 rounded-lg border border-slate-200 px-4 font-semibold text-secondary">Nhập địa chỉ mới</button>
              </div>
            )}
          </div>
        </SideDrawer>
      )}

      {submittedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600"><FiCheckCircle /></span>
            <h2 className="mt-4 text-2xl font-extrabold text-secondary">Đặt hàng thành công</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">Đơn hàng của bạn đã được ghi nhận. Bạn có thể theo dõi trong lịch sử mua hàng.</p>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm">
              <div className="flex justify-between gap-4"><span className="text-gray-500">Mã tham chiếu</span><strong className="text-secondary">{submittedOrder.orderCode}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Số lượng sản phẩm</span><strong className="text-secondary">{submittedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Tổng thanh toán</span><strong className="text-primary">{formatVnd(submittedOrder.totalAmount)}</strong></div>
            </div>
            {cleanupWarning && <p role="status" className="mt-3 text-sm text-amber-700">{cleanupWarning}</p>}
            <button type="button" onClick={() => navigate('/orders')} className="mt-4 w-full rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold">Xem đơn hàng</button>
            <button type="button" disabled={busy} onClick={() => navigate('/products')} className="mt-5 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700">Tiếp tục mua sắm</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
