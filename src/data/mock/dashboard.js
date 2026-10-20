import products from '../products'

export const DASHBOARD_REFERENCE_DATE = '2026-10-13T18:00:00+07:00'
export const LOW_STOCK_THRESHOLD = 5

const STOCK_LEVELS = [3, 12, 2, 8, 4, 15, 1, 9, 6, 11, 2, 7]

const createSku = (product, productIndex, skuIndex) => {
  const variant = product.variants?.[skuIndex] || product.variants?.[0]
  const color = product.colors?.[skuIndex] || product.colors?.[0]
  const storage = variant?.storage || product.specs?.split(',').at(-1)?.trim() || 'Tiêu chuẩn'
  const colorName = color?.name || 'Mặc định'

  return {
    id: `sku-${product.id}-${skuIndex + 1}`,
    productId: String(product.id),
    label: `${colorName} · ${storage}`,
    price: Number(variant?.price || product.price || 0),
    stock: STOCK_LEVELS[productIndex * 2 + skuIndex] ?? 10,
    active: true,
  }
}

export const dashboardProducts = products.slice(0, 6).map((product, productIndex) => ({
  id: String(product.id),
  name: product.name,
  image: product.image,
  active: true,
  skus: [createSku(product, productIndex, 0), createSku(product, productIndex, 1)],
}))

export const dashboardCustomers = [
  { id: 'customer-001', fullName: 'Nguyễn Minh Anh', active: true },
  { id: 'customer-002', fullName: 'Trần Quốc Bảo', active: true },
  { id: 'customer-003', fullName: 'Lê Thảo Nhi', active: true },
  { id: 'customer-004', fullName: 'Phạm Hoàng Nam', active: true },
  { id: 'customer-005', fullName: 'Võ Thu Hà', active: true },
  { id: 'customer-006', fullName: 'Đặng Gia Huy', active: true },
  { id: 'customer-007', fullName: 'Bùi Khánh Linh', active: true },
]

const skuById = new Map(
  dashboardProducts.flatMap((product) => product.skus.map((sku) => [sku.id, sku])),
)

const item = (skuId, quantity) => ({
  skuId,
  quantity,
  unitPrice: skuById.get(skuId)?.price || 0,
})

const order = (id, customerId, createdAt, status, items) => ({
  id,
  code: `TLU${id.slice(-4)}`,
  customerId,
  createdAt,
  status,
  items,
})

export const dashboardOrders = [
  order('order-1018', 'customer-001', '2026-10-13T16:40:00+07:00', 'completed', [item('sku-1-1', 1), item('sku-5-1', 1)]),
  order('order-1017', 'customer-004', '2026-10-13T14:05:00+07:00', 'shipping', [item('sku-3-1', 1)]),
  order('order-1016', 'customer-002', '2026-10-13T10:25:00+07:00', 'pending', [item('sku-2-1', 1)]),
  order('order-1015', 'customer-006', '2026-10-13T08:30:00+07:00', 'cancelled', [item('sku-4-1', 2)]),
  order('order-1014', 'customer-003', '2026-10-12T19:10:00+07:00', 'completed', [item('sku-2-1', 1), item('sku-6-1', 2)]),
  order('order-1013', 'customer-005', '2026-10-12T11:45:00+07:00', 'confirmed', [item('sku-5-2', 1)]),
  order('order-1012', 'customer-007', '2026-10-11T15:20:00+07:00', 'completed', [item('sku-3-1', 2)]),
  order('order-1011', 'customer-002', '2026-10-10T09:15:00+07:00', 'completed', [item('sku-1-2', 1)]),
  order('order-1010', 'customer-001', '2026-10-09T17:35:00+07:00', 'cancelled', [item('sku-1-1', 1)]),
  order('order-1009', 'customer-004', '2026-10-08T13:50:00+07:00', 'shipping', [item('sku-4-2', 1)]),
  order('order-1008', 'customer-003', '2026-10-07T10:05:00+07:00', 'completed', [item('sku-2-1', 2), item('sku-5-1', 1)]),
  order('order-1007', 'customer-006', '2026-10-05T18:20:00+07:00', 'completed', [item('sku-6-2', 1)]),
  order('order-1006', 'customer-005', '2026-10-03T14:40:00+07:00', 'completed', [item('sku-3-2', 1), item('sku-4-1', 1)]),
  order('order-1005', 'customer-007', '2026-10-01T09:30:00+07:00', 'confirmed', [item('sku-2-2', 1)]),
  order('order-1004', 'customer-002', '2026-09-29T16:15:00+07:00', 'completed', [item('sku-1-1', 1)]),
  order('order-1003', 'customer-001', '2026-09-24T11:10:00+07:00', 'completed', [item('sku-5-1', 2)]),
  order('order-1002', 'customer-004', '2026-09-18T08:45:00+07:00', 'completed', [item('sku-4-1', 1), item('sku-6-1', 1)]),
  order('order-1001', 'customer-003', '2026-09-10T13:25:00+07:00', 'completed', [item('sku-3-1', 1)]),
]

export const dashboardMockData = {
  referenceDate: DASHBOARD_REFERENCE_DATE,
  products: dashboardProducts,
  customers: dashboardCustomers,
  orders: dashboardOrders,
}
