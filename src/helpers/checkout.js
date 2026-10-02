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

export const buildCheckoutOrder = ({
  form,
  selectedItems,
  shippingMethod,
  selectedStore,
  paymentMethod,
  appliedCoupon,
  subtotal,
  discount,
  shippingFee,
  total,
}) => ({
  customer: {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    note: form.note.trim(),
  },
  shippingAddress: shippingMethod === 'delivery'
    ? {
        province: form.province,
        district: form.district,
        ward: form.ward,
        addressLine: form.addressLine.trim(),
        saveForLater: Boolean(form.saveAddress),
      }
    : null,
  items: selectedItems.map((item) => ({
    cartItemId: item.id,
    productId: item.productId,
    name: item.name,
    image: item.image,
    variant: item.selectedVariant,
    color: item.selectedColor,
    quantity: item.quantity,
    unitPrice: item.price,
    lineTotal: item.price * item.quantity,
  })),
  shippingMethod: {
    type: shippingMethod,
    store: shippingMethod === 'store_pickup' ? selectedStore : null,
  },
  paymentMethod,
  voucher: appliedCoupon
    ? {
        id: appliedCoupon.id,
        code: appliedCoupon.code,
        type: appliedCoupon.type,
        value: appliedCoupon.value,
      }
    : null,
  subtotal,
  discount,
  shippingFee,
  total,
})
