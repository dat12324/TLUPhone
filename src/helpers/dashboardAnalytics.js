export const DASHBOARD_PERIODS = {
  today: 'Hôm nay',
  '7days': '7 ngày gần nhất',
  '30days': '30 ngày gần nhất',
  month: 'Tháng này',
}

export const ORDER_STATUS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

const startOfDay = (value) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

const endOfDay = (value) => {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date
}

const getDateRange = (period, referenceDate) => {
  const end = endOfDay(referenceDate)
  const start = startOfDay(referenceDate)

  if (period === '7days') start.setDate(start.getDate() - 6)
  if (period === '30days') start.setDate(start.getDate() - 29)
  if (period === 'month') start.setDate(1)

  return { start, end }
}

const getOrderTotal = (order) =>
  order.items.reduce((total, orderItem) => total + orderItem.unitPrice * orderItem.quantity, 0)

const getDateKey = (value) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildRevenueSeries = (orders, start, end) => {
  const revenueByDate = new Map()
  orders
    .filter((order) => order.status === 'completed')
    .forEach((order) => {
      const key = getDateKey(order.createdAt)
      revenueByDate.set(key, (revenueByDate.get(key) || 0) + getOrderTotal(order))
    })

  const series = []
  for (let timestamp = start.getTime(); timestamp <= end.getTime(); timestamp += DAY_IN_MS) {
    const date = new Date(timestamp)
    const key = getDateKey(date)
    series.push({
      date: key,
      label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: revenueByDate.get(key) || 0,
    })
  }
  return series
}

const buildStatusCounts = (orders) =>
  Object.entries(ORDER_STATUS).map(([status, label]) => ({
    status,
    label,
    count: orders.filter((order) => order.status === status).length,
  }))

const buildTopProducts = (orders, productById, skuById) => {
  const totals = new Map()
  orders
    .filter((order) => order.status === 'completed')
    .flatMap((order) => order.items)
    .forEach((orderItem) => {
      const sku = skuById.get(orderItem.skuId)
      if (!sku) return
      const current = totals.get(sku.productId) || { quantity: 0, revenue: 0 }
      current.quantity += orderItem.quantity
      current.revenue += orderItem.quantity * orderItem.unitPrice
      totals.set(sku.productId, current)
    })

  return [...totals.entries()]
    .map(([productId, total]) => ({ ...productById.get(productId), ...total }))
    .filter((product) => product.id)
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 5)
}

export const calculateDashboardData = (source, period = '7days', lowStockThreshold = 5) => {
  const selectedPeriod = DASHBOARD_PERIODS[period] ? period : '7days'
  const { start, end } = getDateRange(selectedPeriod, source.referenceDate)
  const productById = new Map(source.products.map((product) => [product.id, product]))
  const customerById = new Map(source.customers.map((customer) => [customer.id, customer]))
  const skus = source.products.flatMap((product) => product.skus)
  const skuById = new Map(skus.map((sku) => [sku.id, sku]))
  const orders = source.orders
    .filter((order) => {
      const createdAt = new Date(order.createdAt)
      return createdAt >= start && createdAt <= end
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const completedOrders = orders.filter((order) => order.status === 'completed')
  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    code: order.code,
    customerName: customerById.get(order.customerId)?.fullName || 'Khách hàng',
    createdAt: order.createdAt,
    total: getOrderTotal(order),
    status: order.status,
    statusLabel: ORDER_STATUS[order.status] || order.status,
  }))

  const lowStockProducts = skus
    .filter((sku) => sku.active && sku.stock < lowStockThreshold && productById.get(sku.productId)?.active)
    .map((sku) => ({
      ...sku,
      productName: productById.get(sku.productId).name,
      image: productById.get(sku.productId).image,
    }))
    .sort((a, b) => a.stock - b.stock)

  return {
    meta: {
      period: selectedPeriod,
      periodLabel: DASHBOARD_PERIODS[selectedPeriod],
      rangeStart: start.toISOString(),
      rangeEnd: end.toISOString(),
      referenceDate: source.referenceDate,
      lowStockThreshold,
    },
    summary: {
      revenue: completedOrders.reduce((total, order) => total + getOrderTotal(order), 0),
      orderCount: orders.length,
      activeProductCount: source.products.filter((product) => product.active).length,
      customerCount: source.customers.length,
    },
    revenueSeries: buildRevenueSeries(orders, start, end),
    orderStatuses: buildStatusCounts(orders),
    recentOrders,
    topProducts: buildTopProducts(orders, productById, skuById),
    lowStockProducts,
  }
}
