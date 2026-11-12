import { shippingConfig } from '../data/checkout'

const PHONE_PATTERN = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const formatVnd = (value = 0) =>
  `${Number(value || 0).toLocaleString('vi-VN')}₫`

export const calculateShippingFee = (shippingMethod, subtotal) => {
  if (shippingMethod === 'store_pickup') return 0
  if (subtotal >= shippingConfig.freeShippingThreshold) return 0
  return shippingConfig.standardFee
}

export const validateCheckout = ({ form, shippingMethod, selectedStoreId, paymentMethod }) => {
  const errors = {}

  if (!form.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên.'
  if (!PHONE_PATTERN.test(form.phone.trim())) {
    errors.phone = 'Số điện thoại chưa đúng định dạng Việt Nam.'
  }
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Email chưa đúng định dạng.'
  }
  if (!shippingMethod) errors.shippingMethod = 'Vui lòng chọn phương thức nhận hàng.'
  if (!paymentMethod) errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán.'

  if (shippingMethod === 'delivery') {
    if (!form.province) errors.province = 'Vui lòng chọn Tỉnh/Thành phố.'
    if (!form.district) errors.district = 'Vui lòng chọn Quận/Huyện.'
    if (!form.ward) errors.ward = 'Vui lòng chọn Phường/Xã.'
    if (!form.addressLine.trim()) errors.addressLine = 'Vui lòng nhập địa chỉ cụ thể.'
  }

  if (shippingMethod === 'store_pickup' && !selectedStoreId) {
    errors.selectedStoreId = 'Vui lòng chọn cửa hàng nhận sản phẩm.'
  }

  return errors
}

export const buildCheckoutOrder = ({ form, selectedItems, paymentMethod, voucherCode }) => ({
  items: selectedItems.map(item => ({ productVariant: item.productVariantId || item.id, quantity: item.quantity })),
  shippingAddress: {
    fullName: form.fullName.trim(), phone: form.phone.trim(), province: form.province,
    district: form.district, ward: form.ward, detailAddress: form.addressLine.trim(),
  },
  paymentMethod: paymentMethod.toUpperCase(),
  note: form.note.trim(),
  ...(voucherCode ? { voucherCode } : {}),
})


export const readCheckoutAddress = userId => {
  if (!userId) return {}
  try {
    const saved = JSON.parse(localStorage.getItem(`tluphone:checkout-address:${userId}`))
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {}
    const fields = ['fullName', 'phone', 'province', 'district', 'ward', 'addressLine']
    const address = Object.fromEntries(fields.filter(field => typeof saved[field] === 'string').map(field => [field, saved[field]]))
    return Object.keys(address).length ? { ...address, saveAddress: true } : {}
  } catch { return {} }
}
