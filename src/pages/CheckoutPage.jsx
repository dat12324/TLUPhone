import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import CheckoutAddress from '../components/checkout/CheckoutAddress'
import CheckoutSummary, { CheckoutItems } from '../components/checkout/CheckoutSummary'
import AddressSelector from '../components/checkout/AddressSelector'
import OrderSuccessModal from '../components/checkout/OrderSuccessModal'
import { mapAddress } from '../helpers/profile'
import { useCart } from '../context/CartContext'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import {
  buildCheckoutOrder,
  calculateShippingFee,
  validateCheckout,
  readCheckoutAddress,
} from '../helpers/checkout'

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
            <CheckoutItems selectedItems={selectedItems} selectedTotalQuantity={selectedTotalQuantity} />
            <CheckoutAddress
              user={user} form={form} errors={errors} updateField={updateField}
              onOpenAddresses={() => setAddressBookOpen(true)}
            />
          </div>

          <CheckoutSummary
            selectedSubtotal={selectedSubtotal} selectedTotalQuantity={selectedTotalQuantity}
            appliedCoupon={appliedCoupon} applyCoupon={applyCoupon} removeCoupon={removeCoupon}
            couponDiscount={couponDiscount} couponBusy={couponBusy} shippingFee={shippingFee} total={total}
            paymentMethod={paymentMethod}
            onPaymentChange={method => { setPaymentMethod(method); setErrors(current => ({ ...current, paymentMethod: undefined })) }}
            errors={errors} busy={busy} cartBusy={cartBusy} cartError={cartError} submittedOrder={submittedOrder}
          />
        </fieldset>
      </form>

      {addressBookOpen && (
        <AddressSelector
          addresses={addresses} addressesLoading={addressesLoading} addressesError={addressesError}
          onClose={() => setAddressBookOpen(false)} onRetry={() => setAddressRetry(value => value + 1)}
          onSelect={selectAddress}
        />
      )}

      {submittedOrder && (
        <OrderSuccessModal
          submittedOrder={submittedOrder} cleanupWarning={cleanupWarning} busy={busy}
          onViewOrders={() => navigate('/orders')} onContinueShopping={() => navigate('/products')}
        />
      )}
    </div>
  )
}

export default CheckoutPage
