export const shippingMethods = [
  {
    id: 'delivery',
    label: 'Giao hàng tận nơi',
    description: 'Giao đến địa chỉ của bạn trên toàn quốc',
  },
  {
    id: 'store_pickup',
    label: 'Nhận tại cửa hàng',
    description: 'Nhận hàng trực tiếp tại cửa hàng TLUPhone',
  },
]

export const paymentMethods = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    available: true,
  },
  {
    id: 'momo',
    label: 'Ví MoMo',
    description: 'Thanh toán qua ví điện tử MoMo',
    available: false,
  },
  {
    id: 'card',
    label: 'Thẻ Visa / Mastercard',
    description: 'Thanh toán online bằng thẻ quốc tế',
    available: false,
  },
]

export const shippingConfig = {
  standardFee: 30000,
  freeShippingThreshold: 500000,
}
