import api from '../../lib/api.js'
import { catalogBody, paginateCatalog, mapBrand } from '../../helpers/catalog.js'
import { useDeferredValue, useEffect, useState } from 'react'
import { FiRefreshCw, FiSearch } from 'react-icons/fi'
import BrandsTable, { BrandsEmptyState } from '../../components/admin/brands/BrandsTable'
import CatalogFormModal from '../../components/admin/shared/CatalogFormModal'
import CatalogStatusDialog from '../../components/admin/shared/CatalogStatusDialog'
import { CatalogHeader, CatalogStats } from '../../components/admin/shared/CatalogOverview'

const PAGE_LIMIT = 10

const BrandsPageSkeleton = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
    </div>
    <div className="h-[440px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
  </div>
)

const BrandsPage = () => {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('nameAsc')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [formState, setFormState] = useState(null)
  const [statusBrand, setStatusBrand] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    const load = async () => {
      const items = []
      let nextPage = 1
      let totalPages = 1
      do {
        const { data } = await api.get('/brands', { params: { page: nextPage, limit: 100 }, signal: controller.signal })
        items.push(...data.data.map(mapBrand))
        totalPages = data.pagination.totalPages
        nextPage += 1
      } while (nextPage <= totalPages)
      return paginateCatalog(items, { search: deferredSearch, status, sortBy, page, limit: PAGE_LIMIT })
    }
    load()
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult(data)
          if (data.page !== page) setPage(data.page)
        }
      })
      .catch((requestError) => {
        if (!controller.signal.aborted && requestError.name !== 'AbortError') {
          setError(requestError.message || 'Không thể tải danh sách thương hiệu. Vui lòng thử lại.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [deferredSearch, status, sortBy, page, reloadKey])

  const updateFilter = (event) => {
    const setters = { search: setSearch, status: setStatus, sortBy: setSortBy }
    setters[event.target.name](event.target.value)
    setPage(1)
  }

  const isInitialLoading = loading && !result

  const saveBrand = async input => {
    const body = catalogBody(input, 'logo')
    const response = formState.mode === 'edit'
      ? await api.patch(`/brands/${encodeURIComponent(formState.brand.id)}`, body)
      : await api.post('/brands', body)
    return mapBrand(response.data.data)
  }
  const updateBrandStatus = async (id, status) => {
    const { data } = await api.patch(`/brands/${encodeURIComponent(id)}`, { status })
    return mapBrand(data.data)
  }

  const handleBrandSaved = (savedBrand) => {
    const wasEdit = formState.mode === 'edit'
    setFormState(null)
    if (!wasEdit) setPage(1)
    setReloadKey((value) => value + 1)
    setNotice({ type: 'success', message: `${wasEdit ? 'Đã cập nhật' : 'Đã thêm'} thương hiệu ${savedBrand.name}.` })
  }

  const handleStatusCompleted = (updatedBrand) => {
    setStatusBrand(null)
    setReloadKey((value) => value + 1)
    setNotice({
      type: 'success',
      message: updatedBrand.status === 'active'
        ? `Đã kích hoạt thương hiệu ${updatedBrand.name}.`
        : `Đã ẩn thương hiệu ${updatedBrand.name}.`,
    })
  }

  return (
    <section className="mx-auto max-w-[1600px]" aria-labelledby="brands-title" aria-busy={loading}>
      <CatalogHeader type="brand" titleId="brands-title" onCreate={() => setFormState({ mode: 'create', brand: null })} />

      {notice && (
        <div className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`} role={notice.type === 'success' ? 'status' : 'alert'} aria-atomic="true">
          {notice.message}
        </div>
      )}

      {error && !result ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center shadow-sm" role="alert">
          <p className="font-semibold text-red-700">{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <FiRefreshCw aria-hidden="true" /> Thử lại
          </button>
        </div>
      ) : isInitialLoading ? (
        <BrandsPageSkeleton />
      ) : result && (
        <div className="space-y-6">
          {error && (
            <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span>{error} Dữ liệu gần nhất vẫn được giữ lại.</span>
              <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-3 font-semibold hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <FiRefreshCw aria-hidden="true" /> Thử lại
              </button>
            </div>
          )}

          <CatalogStats type="brand" summary={result.summary} />

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="brand-list-title">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 id="brand-list-title" className="text-lg font-bold text-secondary">Danh sách thương hiệu</h2>
                  <p className="mt-1 text-sm text-slate-500">Số sản phẩm được tính từ dữ liệu sản phẩm hiện có.</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                  <label className="relative block md:min-w-72">
                    <span className="sr-only">Tìm thương hiệu</span>
                    <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input value={search} name="search" onChange={updateFilter} placeholder="Tìm theo tên hoặc slug..." className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                  <label>
                    <span className="sr-only">Lọc trạng thái</span>
                    <select value={status} name="status" onChange={updateFilter} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 md:w-auto">
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Đã ẩn</option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Sắp xếp thương hiệu</span>
                    <select value={sortBy} name="sortBy" onChange={updateFilter} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 md:w-auto">
                      <option value="nameAsc">Tên A–Z</option>
                      <option value="nameDesc">Tên Z–A</option>
                      <option value="newest">Ngày tạo mới nhất</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className={`relative transition-opacity ${loading ? 'opacity-60' : 'opacity-100'}`}>
              {loading && <p className="absolute right-5 top-3 z-10 rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-500 shadow-sm" aria-live="polite">Đang cập nhật...</p>}
              {result.items.length > 0 ? (
                <BrandsTable
                  brands={result.items}

                  onEdit={(brand) => setFormState({ mode: 'edit', brand })}
                  onStatusChange={setStatusBrand}
                />
              ) : <BrandsEmptyState />}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500">Tổng <strong className="text-secondary">{result.total}</strong> kết quả</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={result.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="min-h-11 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Trang trước</button>
                <span className="min-w-20 text-center font-semibold text-secondary">{result.totalPages ? `${result.page}/${result.totalPages}` : '0/0'}</span>
                <button type="button" disabled={result.page >= result.totalPages || loading} onClick={() => setPage((current) => current + 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Trang sau</button>
              </div>
            </div>
          </section>
        </div>
      )}


      {formState && (
        <CatalogFormModal type="brand"
          item={formState.brand}
          onClose={() => setFormState(null)}
          onSave={saveBrand}
          onSaved={handleBrandSaved}
        />
      )}

      {statusBrand && (
        <CatalogStatusDialog type="brand"
          item={statusBrand}
          onClose={() => setStatusBrand(null)}
          onConfirm={(nextStatus) => updateBrandStatus(statusBrand.id, nextStatus)}
          onCompleted={handleStatusCompleted}
        />
      )}
    </section>
  )
}

export default BrandsPage
