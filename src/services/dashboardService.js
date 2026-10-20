import { dashboardMockData, LOW_STOCK_THRESHOLD } from '../data/mock/dashboard'
import { calculateDashboardData } from '../helpers/dashboardAnalytics'

const MOCK_DELAY_MS = 280

export const getDashboardData = ({ period = '7days', signal } = {}) =>
  new Promise((resolve, reject) => {
    const cancelRequest = () => {
      clearTimeout(timeoutId)
      reject(new DOMException('Dashboard request was cancelled', 'AbortError'))
    }
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', cancelRequest)
      resolve(calculateDashboardData(dashboardMockData, period, LOW_STOCK_THRESHOLD))
    }, MOCK_DELAY_MS)

    if (signal?.aborted) cancelRequest()
    else signal?.addEventListener('abort', cancelRequest, { once: true })
  })

// Khi có Backend, chỉ thay phần triển khai trên bằng GET
// `${import.meta.env.VITE_API_URL}/api/admin/dashboard?period=${period}`.
