import { mockFlashSales } from '../data/mock/flashSales'

const MOCK_DELAY_MS = 280

const normalizeText = (value = '') => String(value).trim().toLocaleLowerCase('vi-VN')
const parseTime = (value) => {
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

export const getFlashSaleStatus = (flashSale, now = Date.now()) => {
  if (!flashSale?.isEnabled) return 'disabled'
  const startAt = parseTime(flashSale.startAt)
  const endAt = parseTime(flashSale.endAt)
  if (startAt === null || endAt === null || endAt <= startAt) return 'disabled'
  if (now < startAt) return 'upcoming'
  if (now >= endAt) return 'ended'
  return 'active'
}

const waitForMock = (operation, signal) => new Promise((resolve, reject) => {
  const cancelRequest = () => {
    clearTimeout(timeoutId)
    reject(new DOMException('Flash Sale request was cancelled', 'AbortError'))
  }
  const timeoutId = setTimeout(() => {
    signal?.removeEventListener('abort', cancelRequest)
    try {
      resolve(operation())
    } catch (error) {
      reject(error)
    }
  }, MOCK_DELAY_MS)

  if (signal?.aborted) cancelRequest()
  else signal?.addEventListener('abort', cancelRequest, { once: true })
})

const sortFlashSales = (items, sortBy) => {
  const compareDate = (a, b, field, direction) => {
    const first = parseTime(a[field])
    const second = parseTime(b[field])
    if (first === null && second === null) return 0
    if (first === null) return 1
    if (second === null) return -1
    return direction === 'asc' ? first - second : second - first
  }
  const sorted = [...items]
  if (sortBy === 'startOldest') return sorted.sort((a, b) => compareDate(a, b, 'startAt', 'asc'))
  if (sortBy === 'createdNewest') return sorted.sort((a, b) => compareDate(a, b, 'createdAt', 'desc'))
  if (sortBy === 'createdOldest') return sorted.sort((a, b) => compareDate(a, b, 'createdAt', 'asc'))
  return sorted.sort((a, b) => compareDate(a, b, 'startAt', 'desc'))
}

export const getFlashSales = ({
  search = '',
  status = 'all',
  sortBy = 'startNewest',
  page = 1,
  limit = 10,
  signal,
  now = Date.now(),
} = {}) => waitForMock(() => {
  const allFlashSales = mockFlashSales.map((flashSale) => ({
    ...flashSale,
    items: Array.isArray(flashSale.items) ? flashSale.items : [],
    skuCount: Array.isArray(flashSale.items) ? flashSale.items.length : 0,
    computedStatus: getFlashSaleStatus(flashSale, now),
  }))
  const normalizedSearch = normalizeText(search)
  const filtered = allFlashSales.filter((flashSale) => {
    const matchesSearch = !normalizedSearch || normalizeText(flashSale.name).includes(normalizedSearch)
    const matchesStatus = status === 'all' || flashSale.computedStatus === status
    return matchesSearch && matchesStatus
  })
  const sorted = sortFlashSales(filtered, sortBy)
  const safeLimit = Math.min(10, Math.max(1, Number(limit) || 10))
  const totalPages = Math.ceil(sorted.length / safeLimit)
  const requestedPage = Math.max(1, Number(page) || 1)
  const safePage = totalPages ? Math.min(requestedPage, totalPages) : 1
  const startIndex = (safePage - 1) * safeLimit
  const nextBoundaryAt = allFlashSales
    .filter((flashSale) => flashSale.isEnabled)
    .flatMap((flashSale) => [parseTime(flashSale.startAt), parseTime(flashSale.endAt)])
    .filter((timestamp) => timestamp !== null && timestamp > now)
    .sort((a, b) => a - b)[0] || null

  return {
    items: sorted.slice(startIndex, startIndex + safeLimit),
    total: sorted.length,
    page: safePage,
    limit: safeLimit,
    totalPages,
    summary: {
      total: allFlashSales.length,
      active: allFlashSales.filter((item) => item.computedStatus === 'active').length,
      upcoming: allFlashSales.filter((item) => item.computedStatus === 'upcoming').length,
      ended: allFlashSales.filter((item) => item.computedStatus === 'ended').length,
    },
    meta: { nextBoundaryAt },
  }
}, signal)

// Khi có Backend, giữ nguyên contract UI và thay mock bằng:
// GET `${import.meta.env.VITE_API_URL}/api/admin/flash-sales`.
