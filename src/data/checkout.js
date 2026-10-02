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

export const storeLocations = [
  {
    id: 'hanoi-tlu',
    name: 'TLUPhone Đại học Thăng Long',
    address: 'Đường Nguyễn Xiển, Hà Nội',
    hours: '08:00 - 21:30',
  },
  {
    id: 'hanoi-caugiay',
    name: 'TLUPhone Cầu Giấy',
    address: '123 Cầu Giấy, Cầu Giấy, Hà Nội',
    hours: '08:00 - 21:30',
  },
  {
    id: 'hcm-quan1',
    name: 'TLUPhone Quận 1',
    address: '120 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
    hours: '08:00 - 21:30',
  },
]

export const addressOptions = [
  {
    name: 'Hà Nội',
    districts: [
      { name: 'Đống Đa', wards: ['Trung Liệt', 'Khương Thượng', 'Láng Hạ'] },
      { name: 'Cầu Giấy', wards: ['Dịch Vọng', 'Mai Dịch', 'Yên Hòa'] },
      { name: 'Hai Bà Trưng', wards: ['Bách Khoa', 'Bạch Mai', 'Minh Khai'] },
    ],
  },
  {
    name: 'TP. Hồ Chí Minh',
    districts: [
      { name: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Cầu Kho'] },
      { name: 'Quận 3', wards: ['Phường 1', 'Phường 2', 'Võ Thị Sáu'] },
      { name: 'Thành phố Thủ Đức', wards: ['Linh Trung', 'Linh Tây', 'Thảo Điền'] },
    ],
  },
  {
    name: 'Đà Nẵng',
    districts: [
      { name: 'Hải Châu', wards: ['Hải Châu I', 'Hải Châu II', 'Thạch Thang'] },
      { name: 'Thanh Khê', wards: ['Thạc Gián', 'Vĩnh Trung', 'Xuân Hà'] },
    ],
  },
]

export const shippingConfig = {
  standardFee: 30000,
  freeShippingThreshold: 500000,
}
