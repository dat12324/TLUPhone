import { useEffect, useState } from 'react'
import { FiDollarSign, FiPackage, FiRefreshCw, FiShoppingBag, FiUsers } from 'react-icons/fi'
import LowStockProducts from '../../components/admin/dashboard/LowStockProducts'
import OrderStatusChart from '../../components/admin/dashboard/OrderStatusChart'
import RecentOrders from '../../components/admin/dashboard/RecentOrders'
import RevenueChart from '../../components/admin/dashboard/RevenueChart'
import StatCard from '../../components/admin/dashboard/StatCard'
import TopProducts from '../../components/admin/dashboard/TopProducts'
import { DASHBOARD_PERIODS } from '../../helpers/dashboardAnalytics'
import { getDashboardData } from '../../services/dashboardService'
import { formatAdminDate, formatVnd } from '../../utils/adminFormatters'

const DashboardSkeleton = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
    </div>
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-2" />
      <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
    <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
  </div>
)

const DashboardPage = () => {
  const [period, setPeriod] = useState('7days')
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setLoading(true)
    setError('')

    getDashboardData({ period, signal: controller.signal })
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((requestError) => {
        if (active && requestError.name !== 'AbortError') {
          setError('Không thể tải dữ liệu Dashboard. Vui lòng thử lại.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [period, reloadKey])

  return (
    <section className="mx-auto max-w-[1600px]" aria-labelledby="dashboard-title" aria-busy={loading}>
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Khu vực quản trị</p>
          <h1 id="dashboard-title" className="mt-1 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">Tổng quan kinh doanh</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Theo dõi tình hình kinh doanh của TLUPhone.</p>
        </div>

        <div className="overflow-x-auto pb-1" aria-label="Lọc Dashboard theo thời gian">
          <div className="inline-flex min-w-max rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {Object.entries(DASHBOARD_PERIODS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${period === value ? 'bg-secondary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                aria-pressed={period === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm" role="alert">
          <p className="font-semibold text-red-700">{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <FiRefreshCw aria-hidden="true" /> Thử lại
          </button>
        </div>
      ) : loading || !dashboard ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-slate-500">
            Dữ liệu mẫu cập nhật đến {formatAdminDate(dashboard.meta.referenceDate)} · Bộ lọc đang áp dụng: {dashboard.meta.periodLabel}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FiDollarSign} label="Tổng doanh thu" value={formatVnd(dashboard.summary.revenue)} note="Chỉ tính đơn hàng đã hoàn thành" tone="rose" />
            <StatCard icon={FiShoppingBag} label="Tổng đơn hàng" value={dashboard.summary.orderCount.toLocaleString('vi-VN')} note={`Đơn tạo trong ${dashboard.meta.periodLabel.toLowerCase()}`} tone="blue" />
            <StatCard icon={FiPackage} label="Sản phẩm đang bán" value={dashboard.summary.activeProductCount.toLocaleString('vi-VN')} note="Sản phẩm có trạng thái đang kinh doanh" tone="amber" />
            <StatCard icon={FiUsers} label="Tổng khách hàng" value={dashboard.summary.customerCount.toLocaleString('vi-VN')} note="Tổng số tài khoản khách hàng" tone="emerald" />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <RevenueChart data={dashboard.revenueSeries} periodLabel={dashboard.meta.periodLabel} />
            </div>
            <OrderStatusChart data={dashboard.orderStatuses} />
          </div>

          <RecentOrders orders={dashboard.recentOrders} />

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <TopProducts products={dashboard.topProducts} />
            <LowStockProducts products={dashboard.lowStockProducts} threshold={dashboard.meta.lowStockThreshold} />
          </div>
        </div>
      )}
    </section>
  )
}

export default DashboardPage
