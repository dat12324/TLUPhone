/**
 * Danh sách mã giảm giá mẫu
 * Sau này sẽ được thay thế bằng API từ Backend
 *
 * Các loại (type):
 *   - 'percent': Giảm theo phần trăm (value = % giảm, maxDiscount = giảm tối đa)
 *   - 'fixed':   Giảm cố định (value = số tiền giảm)
 *
 * minOrder: Giá trị đơn hàng tối thiểu để áp dụng
 */
const coupons = [
  {
    id: 'GIAM10',
    code: 'GIAM10',
    description: 'Giảm 10% tối đa 500.000₫',
    type: 'percent',
    value: 10,
    maxDiscount: 500000,
    minOrder: 2000000,
    active: true,
  },
  {
    id: 'GIAM500K',
    code: 'GIAM500K',
    description: 'Giảm 500.000₫ cho đơn từ 5 triệu',
    type: 'fixed',
    value: 500000,
    maxDiscount: 500000,
    minOrder: 5000000,
    active: true,
  },
  {
    id: 'TLU2026',
    code: 'TLU2026',
    description: 'Giảm 1.000.000₫ cho đơn từ 10 triệu',
    type: 'fixed',
    value: 1000000,
    maxDiscount: 1000000,
    minOrder: 10000000,
    active: true,
  },
  {
    id: 'WELCOME',
    code: 'WELCOME',
    description: 'Giảm 200.000₫ cho đơn từ 2 triệu',
    type: 'fixed',
    value: 200000,
    maxDiscount: 200000,
    minOrder: 2000000,
    active: true,
  },
  {
    id: 'SALE15',
    code: 'SALE15',
    description: 'Giảm 15% tối đa 1.000.000₫ cho đơn từ 8 triệu',
    type: 'percent',
    value: 15,
    maxDiscount: 1000000,
    minOrder: 8000000,
    active: true,
  },
]

export default coupons
