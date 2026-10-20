import { useDeferredValue, useEffect, useState } from 'react'
import { FiCheckCircle, FiEyeOff, FiFolder, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi'
import CategoriesTable, { CategoriesEmptyState } from '../../components/admin/categories/CategoriesTable'
import CategoryDeleteDialog from '../../components/admin/categories/CategoryDeleteDialog'
import CategoryDetailModal from '../../components/admin/categories/CategoryDetailModal'
import CategoryFormModal from '../../components/admin/categories/CategoryFormModal'
import CategoryStatusDialog from '../../components/admin/categories/CategoryStatusDialog'
import StatCard from '../../components/admin/dashboard/StatCard'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategoryStatus,
} from '../../services/categoryService'

const PAGE_LIMIT = 10

const CategoriesPageSkeleton = () => (
  <div className="space-y-6" aria-hidden="true">
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
    </div>
    <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
  </div>
)

const CategoriesPage = () => {
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
  const [detailCategory, setDetailCategory] = useState(null)
  const [statusCategory, setStatusCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setLoading(true)
    setError('')

    getCategories({ search: deferredSearch, status, sortBy, page, limit: PAGE_LIMIT, signal: controller.signal })
      .then((data) => {
        if (!active) return
        setResult(data)
        if (data.page !== page) setPage(data.page)
      })
      .catch((requestError) => {
        if (active && requestError.name !== 'AbortError') {
          setError('Không thể tải danh sách danh mục. Vui lòng thử lại.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [deferredSearch, status, sortBy, page, reloadKey])

  const updateSearch = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const updateStatus = (event) => {
    setStatus(event.target.value)
    setPage(1)
  }

  const updateSort = (event) => {
    setSortBy(event.target.value)
    setPage(1)
  }

  const isInitialLoading = loading && !result

  const saveCategory = (data) => formState.mode === 'edit'
    ? updateCategory(formState.category.id, data)
    : createCategory(data)

  const handleCategorySaved = (savedCategory) => {
    const wasEdit = formState.mode === 'edit'
    setFormState(null)
    if (!wasEdit) setPage(1)
    setReloadKey((value) => value + 1)
    setNotice({
      type: 'success',
      message: `${wasEdit ? 'Đã cập nhật' : 'Đã thêm'} danh mục ${savedCategory.name}.`,
    })
  }

  const handleSaveFailed = (requestError) => {
    setNotice({ type: 'error', message: requestError.message || 'Không thể lưu danh mục. Vui lòng thử lại.' })
  }

  const handleStatusCompleted = (updatedCategory) => {
    setStatusCategory(null)
    setReloadKey((value) => value + 1)
    setNotice({
      type: 'success',
      message: updatedCategory.status === 'active'
        ? `Đã kích hoạt danh mục ${updatedCategory.name}.`
        : `Đã ẩn danh mục ${updatedCategory.name}.`,
    })
  }

  const handleDeleteCompleted = (deletedCategory) => {
    setDeleteTarget(null)
    setReloadKey((value) => value + 1)
    setNotice({ type: 'success', message: `Đã xóa danh mục ${deletedCategory.name}.` })
  }

  return (
    <section className="mx-auto max-w-[1600px]" aria-labelledby="categories-title" aria-busy={loading}>
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Danh mục sản phẩm</p>
          <h1 id="categories-title" className="mt-1 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">Quản lý danh mục</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Quản lý các nhóm sản phẩm được kinh doanh tại TLUPhone.</p>
        </div>
        <div className="shrink-0">
          <button type="button" onClick={() => setFormState({ mode: 'create', category: null })} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <FiPlus aria-hidden="true" /> Thêm danh mục
          </button>
        </div>
      </div>

      {notice && (
        <div className={`fixed left-4 right-4 top-4 z-[70] rounded-xl border px-4 py-3 text-sm font-medium shadow-lg sm:left-auto sm:max-w-md ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`} role={notice.type === 'success' ? 'status' : 'alert'} aria-atomic="true">
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
        <CategoriesPageSkeleton />
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

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={FiFolder} label="Tổng danh mục" value={result.summary.total.toLocaleString('vi-VN')} note="Các nhóm sản phẩm trong hệ thống" tone="blue" />
            <StatCard icon={FiCheckCircle} label="Đang hoạt động" value={result.summary.active.toLocaleString('vi-VN')} note="Danh mục đang hiển thị" tone="emerald" />
            <StatCard icon={FiEyeOff} label="Đã ẩn" value={result.summary.inactive.toLocaleString('vi-VN')} note="Danh mục tạm thời không hiển thị" tone="amber" />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="category-list-title">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 id="category-list-title" className="text-lg font-bold text-secondary">Danh sách danh mục</h2>
                  <p className="mt-1 text-sm text-slate-500">Số sản phẩm được tổng hợp từ dữ liệu sản phẩm hiện có.</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                  <label className="relative block md:min-w-72">
                    <span className="sr-only">Tìm danh mục</span>
                    <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input value={search} onChange={updateSearch} placeholder="Tìm theo tên, mã hoặc slug..." className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                  <label>
                    <span className="sr-only">Lọc trạng thái</span>
                    <select value={status} onChange={updateStatus} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 md:w-auto">
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Đã ẩn</option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Sắp xếp danh mục</span>
                    <select value={sortBy} onChange={updateSort} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 md:w-auto">
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
                <CategoriesTable
                  categories={result.items}
                  onView={setDetailCategory}
                  onEdit={(category) => setFormState({ mode: 'edit', category })}
                  onStatusChange={setStatusCategory}
                  onDelete={setDeleteTarget}
                />
              ) : <CategoriesEmptyState />}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500">Tổng <strong className="text-secondary">{result.total}</strong> kết quả</p>
              {result.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button type="button" disabled={result.page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="min-h-11 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Trang trước</button>
                  <span className="min-w-20 text-center font-semibold text-secondary">{result.page}/{result.totalPages}</span>
                  <button type="button" disabled={result.page >= result.totalPages || loading} onClick={() => setPage((current) => current + 1)} className="min-h-11 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">Trang sau</button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {statusCategory && (
        <CategoryStatusDialog
          category={statusCategory}
          onClose={() => setStatusCategory(null)}
          onConfirm={(nextStatus) => updateCategoryStatus(statusCategory.id, nextStatus)}
          onCompleted={handleStatusCompleted}
        />
      )}

      {formState && (
        <CategoryFormModal
          category={formState.category}
          onClose={() => setFormState(null)}
          onSave={saveCategory}
          onSaved={handleCategorySaved}
          onFailed={handleSaveFailed}
        />
      )}

      {detailCategory && <CategoryDetailModal category={detailCategory} onClose={() => setDetailCategory(null)} />}

      {deleteTarget && (
        <CategoryDeleteDialog
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteCategory(deleteTarget.id)}
          onCompleted={handleDeleteCompleted}
        />
      )}
    </section>
  )
}

export default CategoriesPage
