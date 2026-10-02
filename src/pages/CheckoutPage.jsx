import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiHome,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import CouponSelector from '../components/common/CouponSelector'
import {
  addressOptions,
  paymentMethods,
  shippingMethods,
  storeLocations,
} from '../data/checkout'
import {
  buildCheckoutOrder,
  calculateShippingFee,
  formatVnd,
  validateCheckout,
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

const inputClass = (error) => `w-full rounded-xl border bg-white px-4 py-3 text-sm text-secondary outline-none transition placeholder:text-gray-400 ${
  error
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

const CheckoutPage = () => {
  const navigate = useNavigate()
  const {
    selectedItems,
    selectedSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    removeSelectedItems,
    couponDiscount,
  } = useCart()

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [shippingMethod, setShippingMethod] = useState('delivery')
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [submitError, setSubmitError] = useState('')
  const [submittedOrder, setSubmittedOrder] = useState(null)
  const [mockOrderCode, setMockOrderCode] = useState('')

  const selectedProvince = addressOptions.find((item) => item.name === form.province)
  const districtOptions = selectedProvince?.districts || []
  const selectedDistrict = districtOptions.find((item) => item.name === form.district)
  const wardOptions = selectedDistrict?.wards || []
  const selectedStore = storeLocations.find((store) => store.id === selectedStoreId) || null

  const shippingFee = useMemo(
    () => calculateShippingFee(shippingMethod, selectedSubtotal),
    [shippingMethod, selectedSubtotal]
  )
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

  const handleProvinceChange = (value) => {
    setForm((current) => ({
      ...current,
      province: value,
      district: '',
      ward: '',
    }))
    setErrors((current) => ({
      ...current,
      province: undefined,
      district: undefined,
      ward: undefined,
    }))
  }

  const handleDistrictChange = (value) => {
    setForm((current) => ({ ...current, district: value, ward: '' }))
    setErrors((current) => ({ ...current, district: undefined, ward: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitError('')

    if (selectedItems.length === 0) {
      setSubmitError('Không có sản phẩm nào được chọn để đặt hàng.')
      return
    }

    const validationErrors = validateCheckout({
      form,
      shippingMethod,
      selectedStoreId,
      paymentMethod,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const order = buildCheckoutOrder({
      form,
      selectedItems,
      shippingMethod,
      selectedStore,
      paymentMethod,
      appliedCoupon,
      subtotal: selectedSubtotal,
      discount: couponDiscount,
      shippingFee,
      total,
    })

    setSubmittedOrder(order)
    setMockOrderCode(`TLU-${Date.now().toString().slice(-8)}`)
    removeSelectedItems()
    if (appliedCoupon) removeCoupon()
  }

  if (selectedItems.length === 0 && !submittedOrder) {
    return (
      <div className="flex min-h-[70vh] items-center bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-3xl text-primary">
              <FiShoppingBag />
            </span>
            <h1 className="text-2xl font-bold text-secondary">Chưa có sản phẩm để thanh toán</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Hãy quay lại giỏ hàng và chọn ít nhất một sản phẩm trước khi tiếp tục.
            </p>
            <Link to="/cart" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-95">
              <FiArrowLeft /> Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500 md:text-sm">
            <Link to="/cart" className="transition hover:text-primary">Giỏ hàng</Link>
            <span>/</span>
            <span className="font-medium text-secondary">Đặt hàng</span>
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-secondary md:text-3xl">Thông tin đặt hàng</h1>
            <p className="mt-1 text-sm text-gray-500">Kiểm tra thông tin trước khi xác nhận đơn hàng.</p>
          </div>
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <FiArrowLeft /> Thay đổi sản phẩm
          </Link>
        </div>

        {submitError && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-primary"><FiUser /></span>
                <div>
                  <h2 className="font-bold text-secondary">Thông tin người nhận</h2>
                  <p className="text-xs text-gray-500">Dùng để liên hệ và xác nhận giao nhận.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Họ và tên" required error={errors.fullName}>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Nguyễn Văn A" className={`${inputClass(errors.fullName)} pl-10`} />
                  </div>
                </FormField>
                <FormField label="Số điện thoại" required error={errors.phone}>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="0912345678" className={`${inputClass(errors.phone)} pl-10`} />
                  </div>
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Email" required error={errors.email}>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@example.com" className={`${inputClass(errors.email)} pl-10`} />
                    </div>
                  </FormField>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FiTruck /></span>
                <div>
                  <h2 className="font-bold text-secondary">Phương thức nhận hàng</h2>
                  <p className="text-xs text-gray-500">Chọn cách bạn muốn nhận sản phẩm.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shippingMethods.map((method) => (
                  <label key={method.id} className={`cursor-pointer rounded-xl border p-4 transition ${shippingMethod === method.id ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 hover:border-rose-300'}`}>
                    <input type="radio" name="shippingMethod" value={method.id} checked={shippingMethod === method.id} onChange={() => { setShippingMethod(method.id); setErrors((current) => ({ ...current, shippingMethod: undefined, selectedStoreId: undefined })) }} className="sr-only" />
                    <span className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${shippingMethod === method.id ? 'border-primary' : 'border-gray-300'}`}>
                        {shippingMethod === method.id && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </span>
                      <span>
                        <strong className="block text-sm text-secondary">{method.label}</strong>
                        <span className="mt-1 block text-xs text-gray-500">{method.description}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.shippingMethod && <p className="mt-2 text-xs font-medium text-rose-600">{errors.shippingMethod}</p>}

              {shippingMethod === 'delivery' && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Tỉnh/Thành phố" required error={errors.province}>
                    <select value={form.province} onChange={(e) => handleProvinceChange(e.target.value)} className={inputClass(errors.province)}>
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {addressOptions.map((province) => <option key={province.name} value={province.name}>{province.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Quận/Huyện" required error={errors.district}>
                    <select value={form.district} disabled={!form.province} onChange={(e) => handleDistrictChange(e.target.value)} className={`${inputClass(errors.district)} disabled:cursor-not-allowed disabled:bg-gray-50`}>
                      <option value="">Chọn Quận/Huyện</option>
                      {districtOptions.map((district) => <option key={district.name} value={district.name}>{district.name}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Phường/Xã" required error={errors.ward}>
                    <select value={form.ward} disabled={!form.district} onChange={(e) => updateField('ward', e.target.value)} className={`${inputClass(errors.ward)} disabled:cursor-not-allowed disabled:bg-gray-50`}>
                      <option value="">Chọn Phường/Xã</option>
                      {wardOptions.map((ward) => <option key={ward} value={ward}>{ward}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Địa chỉ cụ thể" required error={errors.addressLine}>
                    <div className="relative">
                      <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.addressLine} onChange={(e) => updateField('addressLine', e.target.value)} placeholder="Số nhà, tên đường" className={`${inputClass(errors.addressLine)} pl-10`} />
                    </div>
                  </FormField>
                  <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.saveAddress}
                      onChange={(e) => updateField('saveAddress', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-secondary">Lưu địa chỉ này cho lần mua sau</span>
                      <span className="mt-0.5 block text-xs text-gray-500">Địa chỉ sẽ được lưu vào tài khoản khi hệ thống có đăng nhập và Backend.</span>
                    </span>
                  </label>
                </div>
              )}

              {shippingMethod === 'store_pickup' && (
                <div className="mt-5 space-y-3">
                  {storeLocations.map((store) => (
                    <label key={store.id} className={`block cursor-pointer rounded-xl border p-4 transition ${selectedStoreId === store.id ? 'border-primary bg-rose-50 ring-1 ring-primary' : 'border-gray-200 hover:border-rose-300'}`}>
                      <input type="radio" name="store" value={store.id} checked={selectedStoreId === store.id} onChange={() => { setSelectedStoreId(store.id); setErrors((current) => ({ ...current, selectedStoreId: undefined })) }} className="sr-only" />
                      <span className="flex items-start gap-3">
                        <FiMapPin className="mt-0.5 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <strong className="block text-sm text-secondary">{store.name}</strong>
                          <span className="mt-1 block text-xs text-gray-500">{store.address}</span>
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600"><FiClock /> {store.hours}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                  {errors.selectedStoreId && <p className="text-xs font-medium text-rose-600">{errors.selectedStoreId}</p>}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><FiCreditCard /></span>
                <div>
                  <h2 className="font-bold text-secondary">Phương thức thanh toán</h2>
                  <p className="text-xs text-gray-500">Không thực hiện giao dịch thật ở phiên bản hiện tại.</p>
                </div>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
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
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <FormField label="Ghi chú đơn hàng">
                <textarea rows="4" value={form.note} onChange={(e) => updateField('note', e.target.value)} placeholder="Ví dụ: Giao hàng trong giờ hành chính..." className={`${inputClass(false)} resize-none`} />
              </FormField>
            </section>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-5">
            <section>
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="flex items-center gap-2 font-bold text-secondary"><FiPackage className="text-primary" /> Sản phẩm đặt mua</h2>
                <span className="text-xs font-semibold text-gray-500">{selectedTotalQuantity} sản phẩm</span>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img src={item.image || PLACEHOLDER_IMAGE} alt={item.name} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }} className="h-full w-full object-contain p-1.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/products/${item.productId}`} className="line-clamp-2 text-sm font-bold leading-snug text-secondary hover:text-primary">{item.name}</Link>
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
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-center">
                <Link to="/cart" className="text-xs font-semibold text-primary hover:underline">Muốn thay đổi sản phẩm? Quay lại giỏ hàng</Link>
              </div>
            </section>

            <section className="border-t border-gray-100 p-5">
              <CouponSelector
                appliedCoupon={appliedCoupon}
                subtotal={selectedSubtotal}
                onApply={applyCoupon}
                onRemove={removeCoupon}
              />
            </section>

            <section className="border-t border-gray-100 p-5">
              <h2 className="mb-4 font-bold text-secondary">Tổng tiền đơn hàng</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-gray-600"><span>Tạm tính</span><span className="font-semibold text-secondary">{formatVnd(selectedSubtotal)}</span></div>
                <div className="flex justify-between gap-4 text-gray-600"><span>Giảm giá</span><span className="font-semibold text-emerald-600">-{formatVnd(couponDiscount)}</span></div>
                <div className="flex justify-between gap-4 text-gray-600"><span>Phí vận chuyển</span><span className={`font-semibold ${shippingFee === 0 ? 'text-emerald-600' : 'text-secondary'}`}>{shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}</span></div>
              </div>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <span className="font-bold text-secondary">Tổng thanh toán</span>
                  <strong className="text-2xl text-primary">{formatVnd(total)}</strong>
                </div>
                <p className="mt-1 text-right text-[11px] text-gray-400">Đã bao gồm thuế VAT</p>
              </div>
              <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 hover:shadow-lg active:scale-[0.98]">
                <FiCheckCircle /> ĐẶT HÀNG
              </button>
              <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-gray-500"><FiShield className="mt-0.5 shrink-0 text-emerald-600" /> Đây là đơn hàng mô phỏng, chưa gửi tới Backend.</p>
            </section>
          </aside>
        </div>
      </form>

      {submittedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600"><FiCheckCircle /></span>
            <h2 className="mt-4 text-2xl font-extrabold text-secondary">Đặt hàng thành công</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">Đơn hàng mô phỏng đã được tạo. Các sản phẩm vừa đặt đã được xóa khỏi giỏ hàng.</p>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm">
              <div className="flex justify-between gap-4"><span className="text-gray-500">Mã tham chiếu</span><strong className="text-secondary">{mockOrderCode}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Số lượng sản phẩm</span><strong className="text-secondary">{submittedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Tổng thanh toán</span><strong className="text-primary">{formatVnd(submittedOrder.total)}</strong></div>
            </div>
            <button type="button" onClick={() => navigate('/products')} className="mt-5 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700">Tiếp tục mua sắm</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
