import { useDeferredValue, useEffect, useState } from 'react'
import { FiActivity, FiCheckCircle, FiClock, FiPlus, FiRefreshCw, FiSearch, FiZap } from 'react-icons/fi'
import FlashSalesTable, { FlashSalesEmptyState } from '../../components/admin/flash-sales/FlashSalesTable'
import StatCard from '../../components/admin/dashboard/StatCard'
import { getFlashSales } from '../../services/flashSaleService'

const PAGE_LIMIT = 10
const MAX_TIMEOUT = 2_147_483_647

const FlashSalesPageSkeleton = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
    </div>
    <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
  </div>
)

const FlashSalesPage = () => {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('startNewest')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setLoading(true)
    setError('')

    getFlashSales({ search: deferredSearch, status, sortBy, page, limit: PAGE_LIMIT, signal: controller.signal })
      .then((data) => {
        if (!active) return
        setResult(data)
        if (data.page !== page) setPage(data.page)
      })
      .catch((requestError) => {
        if (active && requestError.name !== 'AbortError') setError('Không thể tải danh sách Flash Sale. Vui lòng thử lại.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [deferredSearch, status, sortBy, page, reloadKey])

  useEffect(() => {
    const nextBoundaryAt = result?.meta?.nextBoundaryAt
    if (!nextBoundaryAt) return undefined
    const delay = Math.min(Math.max(0, nextBoundaryAt - Date.now() + 100), MAX_TIMEOUT)
    const timer = window.setTimeout(() => setReloadKey((value) => value + 1), delay)
    return () => window.clearTimeout(timer)
  }, [result?.meta?.nextBoundaryAt])

  const updateSearch = (event) => { setSearch(event.target.value); setPage(1) }
  const updateStatus = (event) => { setStatus(event.target.value); setPage(1) }
  const updateSort = (event) => { setSortBy(event.target.value); setPage(1) }
  const isInitialLoading = loading && !result

  return (
    <section className="mx-auto max-w-[1600px]" aria-labelledby="flash-sales-title" aria-busy={loading}>
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Marketing</p>
          <h1 id="flash-sales-title" className="mt-1 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">Quản lý Flash Sale</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Quản lý các chương trình giảm giá có thời hạn tại TLUPhone.</p>
        </div>
        <div className="shrink-0">
          <button type="button" disabled className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500" title="Tính năng sẽ được triển khai ở bước tiếp theo"><FiPlus aria-hidden="true" /> Tạo Flash Sale</button>
          <p className="mt-1.5 text-right text-xs text-slate-400">Sẽ có ở bước tiếp theo</p>
        </div>
      </div>

      {error && !result ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm" role="alert">
          <p className="font-semibold text-red-700">{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><FiRefreshCw aria-hidden="true" /> Thử lại</button>
        </div>
      ) : isInitialLoading ? (
        <FlashSalesPageSkeleton />
      ) : result && (
        <div className="space-y-6">
          {error && <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert"><span>{error} Dữ liệu gần nhất vẫn được giữ lại.</span><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 font-semibold hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><FiRefreshCw aria-hidden="true" /> Thử lại</button></div>}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FiZap} label="Tổng chương trình" value={result.summary.total.toLocaleString('vi-VN')} note="Tất cả Flash Sale trong hệ thống" tone="blue" />
            <StatCard icon={FiActivity} label="Đang diễn ra" value={result.summary.active.toLocaleString('vi-VN')} note="Đang áp dụng theo thời gian hiện tại" tone="emerald" />
            <StatCard icon={FiClock} label="Sắp diễn ra" value={result.summary.upcoming.toLocaleString('vi-VN')} note="Đã lên lịch và chưa bắt đầu" tone="amber" />
            <StatCard icon={FiCheckCircle} label="Đã kết thúc" value={result.summary.ended.toLocaleString('vi-VN')} note="Đã vượt qua thời gian kết thúc" tone="rose" />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="flash-sale-list-title">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div><h2 id="flash-sale-list-title" className="text-lg font-bold text-secondary">Danh sách Flash Sale</h2><p className="mt-1 text-sm text-slate-500">Trạng thái được cập nhật tự động theo thời gian bắt đầu và kết thúc.</p></div>
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                  <label className="relative block md:min-w-64"><span className="sr-only">Tìm Flash Sale</span><FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input value={search} onChange={updateSearch} placeholder="Tìm theo tên chương trình..." className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
                  <label><span className="sr-only">Lọc trạng thái</span><select value={status} onChange={updateStatus} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 md:w-auto"><option value="all">Tất cả trạng thái</option><option value="upcoming">Sắp diễn ra</option><option value="active">Đang diễn ra</option><option value="ended">Đã kết thúc</option><option value="disabled">Đã tắt</option></select></label>
                  <label><span className="sr-only">Sắp xếp Flash Sale</span><select value={sortBy} onChange={updateSort} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 md:w-auto"><option value="startNewest">Bắt đầu mới nhất</option><option value="startOldest">Bắt đầu sớm nhất</option><option value="createdNewest">Tạo mới nhất</option><option value="createdOldest">Tạo cũ nhất</option></select></label>
                </div>
              </div>
            </div>

            <div className={`relative transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
              {loading && <p className="absolute right-5 top-3 z-10 rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-500 shadow-sm" aria-live="polite">Đang cập nhật...</p>}
              {result.items.length > 0 ? <FlashSalesTable flashSales={result.items} /> : <FlashSalesEmptyState />}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500">Tổng <strong className="text-secondary">{result.total}</strong> kết quả</p>
              {result.totalPages > 1 && <div className="flex items-center gap-2"><button type="button" disabled={result.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="min-h-11 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Trang trước</button><span className="min-w-20 text-center font-semibold text-secondary">{result.page}/{result.totalPages}</span><button type="button" disabled={result.page >= result.totalPages || loading} onClick={() => setPage((current) => current + 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Trang sau</button></div>}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default FlashSalesPage

