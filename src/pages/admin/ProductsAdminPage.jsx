import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBox, FiChevronLeft, FiChevronRight, FiEdit2, FiExternalLink, FiEye, FiEyeOff, FiFilter, FiGrid, FiList, FiPlus, FiSearch, FiX } from 'react-icons/fi'
import ProductEditor from '../../components/admin/products/ProductEditor'
import ProductVariantsPanel from '../../components/admin/products/ProductVariantsPanel'
import { actionClass, inputClass } from '../../components/admin/products/ProductFields'
import api from '../../lib/api.js'
import { invalidateProductCatalog } from '../../hooks/useCatalog.js'
import { summarizeAdminProduct } from '../../helpers/productAdapter.js'
import { formatVnd } from '../../utils/adminFormatters.js'

const statusLabels = { draft: 'Bản nháp', active: 'Đang bán', inactive: 'Tạm ẩn' }
const placeholder = '/images/products/placeholder.svg'
const iconButton = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-primary/30 hover:bg-rose-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40'
const imageFallback = event => { if (!event.currentTarget.src.endsWith(placeholder)) event.currentTarget.src = placeholder }

const ProductsAdminPage = () => {
  const [filters, setFilters] = useState({ search: '', brand: '', category: '', status: '', minPrice: '', maxPrice: '', inventory: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('list')
  const [advanced, setAdvanced] = useState(false)
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState(null)
  const [skuProduct, setSkuProduct] = useState(null)

  useEffect(() => { const timer = setTimeout(() => { setFilters(current => ({ ...current, search: search.trim() })); setPage(1) }, 350); return () => clearTimeout(timer) }, [search])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(timer) }, [notice])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    Promise.all(['products', 'product-variants', 'brands', 'categories'].map(async resource => {
      const items = []
      let page = 1
      let totalPages = 1
      do {
        const { data } = await api.get(`/${resource}`, { params: { page, limit: 100 }, signal: controller.signal })
        items.push(...data.data)
        totalPages = data.pagination.totalPages
        page += 1
      } while (page <= totalPages)
      return items
    })).then(([items, skus, brands, categories]) => {
      if (controller.signal.aborted) return
      setProducts(items); setVariants(skus); setBrands(brands); setCategories(categories)
    }).catch(failure => { if (failure.name !== 'AbortError') setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])

  const rows = useMemo(() => {
    const byProduct = new Map()
    for (const sku of variants) {
      const id = String(sku.product?._id ?? sku.product)
      if (!byProduct.has(id)) byProduct.set(id, [])
      byProduct.get(id).push(sku)
    }
    return products.map(product => summarizeAdminProduct(product, byProduct.get(String(product._id)) || []))
  }, [products, variants])
  const filtered = useMemo(() => {
    const brandId = brands.find(item => item.slug === filters.brand)?._id
    const categoryId = categories.find(item => item.slug === filters.category)?._id
    const term = filters.search.toLocaleLowerCase('vi-VN')
    const items = rows.filter(item =>
      (!term || `${item.name} ${item.slug} ${item.skuSearch}`.toLocaleLowerCase('vi-VN').includes(term)) &&
      (!filters.brand || String(item.brand?._id ?? item.brand) === String(brandId)) &&
      (!filters.category || String(item.category?._id ?? item.category) === String(categoryId)) &&
      (!filters.status || (filters.status === 'out' ? item.status === 'active' && item.inventory === 'out' : item.status === filters.status)) &&
      (!filters.inventory || item.inventory === filters.inventory) &&
      (filters.minPrice === '' || item.sellingPrice !== null && item.sellingPrice >= Number(filters.minPrice)) &&
      (filters.maxPrice === '' || item.sellingPrice !== null && item.sellingPrice <= Number(filters.maxPrice)))
    return items.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'vi')
      if (sort === 'priceAsc' || sort === 'priceDesc') {
        if (a.sellingPrice === null) return b.sellingPrice === null ? 0 : 1
        if (b.sellingPrice === null) return -1
        return (a.sellingPrice - b.sellingPrice) * (sort === 'priceDesc' ? -1 : 1)
      }
      return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)
    })
  }, [rows, brands, categories, filters, sort])
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit)
  const stats = [
    { label: 'Tổng số sản phẩm', value: filtered.length, tone: 'bg-primary' },
    { label: 'Đang bán', value: filtered.filter(item => item.status === 'active' && item.inventory !== 'out').length, tone: 'bg-emerald-500' },
    { label: 'Tạm ẩn / Nháp', value: filtered.filter(item => item.status !== 'active').length, tone: 'bg-amber-500' },
    { label: 'Hết hàng', value: filtered.filter(item => item.status === 'active' && item.inventory === 'out').length, tone: 'bg-rose-500' },
  ]
  const filter = event => { const { name, value } = event.target; setFilters(current => ({ ...current, [name]: value })); setPage(1) }
  const edit = async item => { setBusy(true); setError(''); try { setEditor({ product: (await api.get(`/products/getByID/${encodeURIComponent(item._id)}`)).data.data }) } catch (failure) { setError(failure.message) } finally { setBusy(false) } }
  const status = async item => {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const { data: { data: updated } } = await api.patch(`/products/${encodeURIComponent(item._id)}/status`, { status: item.status === 'active' ? 'inactive' : 'active' })
      invalidateProductCatalog()
      setProducts(current => current.map(product => product._id === updated._id ? { ...product, ...updated } : product))
      setNotice(updated.status === 'inactive' ? 'Đã tạm ẩn sản phẩm.' : 'Đã kích hoạt sản phẩm.')
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  const saved = product => { const created = !editor.product; setEditor(null); setReload(value => value + 1); setNotice(created ? 'Đã tạo sản phẩm. Tiếp tục thêm SKU để thiết lập giá và tồn kho.' : 'Đã cập nhật sản phẩm.'); if (created) setSkuProduct(product) }
  const badge = item => {
    const empty = item.status === 'active' && item.inventory === 'out'
    return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium ${empty ? 'bg-rose-50 text-rose-600' : item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{empty ? 'Hết hàng' : statusLabels[item.status] || item.status}</span>
  }
  const actions = item => <div className="flex items-center justify-end gap-2">
    <button type="button" disabled={busy || loading} onClick={() => edit(item)} className={iconButton} title="Sửa sản phẩm" aria-label={`Sửa ${item.name}`}><FiEdit2 aria-hidden="true" /></button>
    <button type="button" disabled={loading} onClick={() => setSkuProduct(item)} className={iconButton} title="Quản lý SKU" aria-label={`Quản lý SKU ${item.name}`}><FiBox aria-hidden="true" /></button>
    <details className="relative"><summary className={`${iconButton} cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden`} aria-label={`Thao tác khác với ${item.name}`}>···</summary><div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
      <button type="button" disabled={busy || loading} onClick={event => { event.currentTarget.closest('details').open = false; void status(item) }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40">{item.status === 'active' ? <FiEyeOff /> : <FiEye />}{item.status === 'active' ? 'Tạm ẩn sản phẩm' : 'Kích hoạt'}</button>
      {item.status === 'active' && <Link to={`/products/${item.slug}`} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-50"><FiExternalLink />Xem trang bán hàng</Link>}
    </div></details>
  </div>
  const price = item => item.sellingPrice === null ? <span className="text-xs text-slate-400">Chưa có giá SKU</span> : <div className="whitespace-nowrap tabular-nums"><p className="font-semibold">{formatVnd(item.sellingPrice)}</p>{item.originalPrice > item.sellingPrice && <p className="mt-1 text-xs text-slate-400 line-through">{formatVnd(item.originalPrice)}</p>}</div>
  const colors = item => <div><p className="font-medium">{item.configurationCount} phiên bản <span className="text-xs font-normal text-slate-400">· {item.skuCount} SKU</span></p><p className="mt-1 text-xs text-slate-400">{item.colorOptions.length} màu sắc</p><div className="mt-1.5 flex items-center gap-1.5">{item.colorOptions.slice(0, 5).map(color => <span key={color.key} title={color.name} aria-label={color.name} className="h-3 w-3 rounded-full border border-black/10 bg-slate-200" style={/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(color.code || '') ? { backgroundColor: color.code } : undefined} />)}{item.colorOptions.length > 5 && <span className="text-[10px] text-slate-400">+{item.colorOptions.length - 5}</span>}</div></div>

  return <div className="mx-auto max-w-[1600px] space-y-5">
    {notice && <p role="status" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md rounded-xl border border-emerald-200 bg-white p-4 text-sm text-emerald-700 shadow-lg">{notice}</p>}
    {skuProduct ? <ProductVariantsPanel product={skuProduct} onClose={() => { setSkuProduct(null); setReload(value => value + 1) }} onNotice={setNotice} /> : <>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1><p className="mt-1.5 text-sm text-slate-500">Danh sách sản phẩm, hình ảnh và các phiên bản bán hàng.</p></div><button type="button" onClick={() => setEditor({ product: null })} className={`${actionClass} gap-2 shadow-sm shadow-rose-200`}><FiPlus />Thêm sản phẩm</button></div>
      <section aria-label="Bộ lọc sản phẩm" className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4">
        <div className="grid items-center gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.5fr)_1fr_1fr_1fr_auto]">
          <label className="relative"><span className="sr-only">Tìm sản phẩm hoặc SKU</span><FiSearch className="pointer-events-none absolute left-3 top-3.5 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} className={`${inputClass} pl-9`} placeholder="Tìm tên sản phẩm, SKU…" /></label>
          <label><span className="sr-only">Thương hiệu</span><select name="brand" value={filters.brand} onChange={filter} className={inputClass}><option value="">Mọi thương hiệu</option>{brands.map(item => <option key={item._id} value={item.slug}>{item.name}</option>)}</select></label>
          <label><span className="sr-only">Danh mục</span><select name="category" value={filters.category} onChange={filter} className={inputClass}><option value="">Mọi danh mục</option>{categories.map(item => <option key={item._id} value={item.slug}>{item.name}</option>)}</select></label>
          <label><span className="sr-only">Trạng thái</span><select name="status" value={filters.status} onChange={filter} className={inputClass}><option value="">Mọi trạng thái</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option value="out">Hết hàng</option></select></label>
          <button type="button" aria-expanded={advanced} aria-controls="product-advanced-filters" onClick={() => setAdvanced(value => !value)} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"><FiFilter />Bộ lọc nâng cao</button>
        </div>
        {advanced && <div id="product-advanced-filters" className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-xs text-slate-500"><span>Giá SKU thấp nhất từ (đ)</span><input type="number" min="0" name="minPrice" value={filters.minPrice} onChange={filter} placeholder="Không giới hạn" className={inputClass} /></label>
          <label className="space-y-1.5 text-xs text-slate-500"><span>Đến (đ)</span><input type="number" min="0" name="maxPrice" value={filters.maxPrice} onChange={filter} placeholder="Không giới hạn" className={inputClass} /></label>
          <label className="space-y-1.5 text-xs text-slate-500"><span>Tồn kho SKU đang bán</span><select name="inventory" value={filters.inventory} onChange={filter} className={inputClass}><option value="">Mọi tồn kho</option><option value="available">Còn hàng</option><option value="out">Hết hàng</option><option value="unknown">Chưa xác nhận</option></select></label>
          <button type="button" onClick={() => { setSearch(''); setFilters({ search: '', brand: '', category: '', status: '', minPrice: '', maxPrice: '', inventory: '' }); setPage(1) }} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary"><FiX />Xóa bộ lọc</button>
        </div>}
      </section>
      {error && <div role="alert" className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-lg"><p className="min-w-0 flex-1">{error} <button type="button" onClick={() => setReload(value => value + 1)} className="ml-2 font-semibold underline">Tải lại</button></p><button type="button" onClick={() => setError('')} aria-label="Đóng thông báo lỗi" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-red-50"><FiX /></button></div>}
      <section aria-label="Danh sách sản phẩm" aria-busy={loading} className="rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="grid w-full grid-cols-2 gap-x-6 gap-y-4 lg:w-auto lg:flex lg:gap-0">{stats.map((stat, index) => <div key={stat.label} className={`flex items-center gap-2.5 lg:px-5 ${index ? 'lg:border-l lg:border-slate-100' : 'lg:pl-0'}`}><span className={`h-2 w-2 rounded-full ${stat.tone}`} /><div><p className="text-xs text-slate-500">{stat.label}</p><p className="mt-0.5 text-base font-bold tabular-nums">{loading ? '—' : stat.value}</p></div></div>)}</div>
          <div className="ml-auto flex items-center gap-3"><label><span className="sr-only">Sắp xếp sản phẩm</span><select value={sort} onChange={event => { setSort(event.target.value); setPage(1) }} className={`${inputClass} w-auto`}><option value="newest">Mới nhất</option><option value="name">Tên A–Z</option><option value="priceAsc">Giá tăng dần</option><option value="priceDesc">Giá giảm dần</option></select></label><div className="flex gap-1 rounded-xl bg-slate-50 p-1">{[['list', FiList, 'Dạng bảng'], ['grid', FiGrid, 'Dạng lưới']].map(([value, Icon, label]) => <button key={value} type="button" onClick={() => setView(value)} title={label} aria-label={label} aria-pressed={view === value} className={`flex h-10 w-10 items-center justify-center rounded-lg ${view === value ? 'bg-rose-50 text-primary' : 'text-slate-400 hover:bg-slate-100'}`}><Icon /></button>)}</div></div>
        </div>
        {loading ? <div role="status" className="space-y-4 p-5"><span className="sr-only">Đang tải sản phẩm…</span>{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-50" />)}</div> : !visible.length ? <div className="py-16 text-center"><FiBox className="mx-auto mb-3 text-3xl text-slate-300" /><p className="font-medium">Không có sản phẩm phù hợp</p><p className="mt-1 text-sm text-slate-400">Thử thay đổi từ khóa hoặc bộ lọc.</p></div> : view === 'list' ? <div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500"><tr>{['Sản phẩm', 'Thương hiệu / Danh mục', 'Giá bán', 'Phiên bản (SKU)', 'Trạng thái', 'Thao tác'].map(label => <th key={label} className={`px-4 py-3 font-semibold ${label === 'Thao tác' ? 'text-right' : ''}`}>{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map(item => <tr key={item._id} className="transition-colors hover:bg-slate-50/60">
          <td className="px-4 py-4"><div className="flex items-center gap-3"><img src={item.displayImage} onError={imageFallback} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-slate-100 bg-white object-contain p-1" /><div className="max-w-[250px]"><p className="line-clamp-2 font-semibold leading-5">{item.name}</p><p className="mt-1 max-w-[240px] truncate text-xs text-slate-400" title={item.slug}>{item.slug}</p></div></div></td>
          <td className="px-4 py-4"><p>{brands.find(brand => String(brand._id) === String(item.brand?._id ?? item.brand))?.name || '—'}</p><p className="mt-1 text-xs text-slate-400">{categories.find(category => String(category._id) === String(item.category?._id ?? item.category))?.name || '—'}</p></td>
          <td className="px-4 py-4">{price(item)}</td><td className="px-4 py-4">{colors(item)}</td><td className="px-4 py-4">{badge(item)}</td><td className="px-4 py-4">{actions(item)}</td>
        </tr>)}</tbody></table></div> : <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map(item => <article key={item._id} className="space-y-4 rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><img src={item.displayImage} onError={imageFallback} alt="" className="h-24 w-24 rounded-xl bg-slate-50 object-contain p-2" />{badge(item)}</div><div><p className="line-clamp-2 min-h-10 text-sm font-semibold">{item.name}</p><p className="mt-1 truncate text-xs text-slate-400">{item.slug}</p></div>{price(item)}{colors(item)}<div className="border-t border-slate-100 pt-3">{actions(item)}</div></article>)}</div>}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 text-xs text-slate-500 sm:px-5"><span>{loading ? 'Đang tải…' : `Hiển thị ${filtered.length ? (currentPage - 1) * limit + 1 : 0}–${Math.min(currentPage * limit, filtered.length)} trong ${filtered.length} sản phẩm`}</span><div className="flex flex-wrap items-center gap-2"><label className="mr-3 flex items-center gap-2">Số dòng:<select value={limit} onChange={event => { setLimit(Number(event.target.value)); setPage(1) }} className="min-h-10 rounded-lg border border-slate-200 bg-white px-2">{[6, 12, 24, 48].map(value => <option key={value}>{value}</option>)}</select></label><button type="button" disabled={currentPage <= 1 || loading} onClick={() => setPage(currentPage - 1)} aria-label="Trang trước" className={`${iconButton} disabled:opacity-30`}><FiChevronLeft /></button>{Array.from({ length: Math.min(5, totalPages) }, (_, index) => Math.min(Math.max(1, currentPage - 2), Math.max(1, totalPages - 4)) + index).map(value => <button key={value} type="button" disabled={loading} aria-current={currentPage === value ? 'page' : undefined} onClick={() => setPage(value)} className={`h-10 min-w-10 rounded-lg border px-2 font-medium ${currentPage === value ? 'border-primary/30 bg-rose-50 text-primary' : 'border-slate-200 hover:bg-slate-50'}`}>{value}</button>)}<button type="button" disabled={currentPage >= totalPages || loading} onClick={() => setPage(currentPage + 1)} aria-label="Trang sau" className={`${iconButton} disabled:opacity-30`}><FiChevronRight /></button></div></footer>
      </section>
    </>}
    {editor && <ProductEditor product={editor.product} brands={brands} categories={categories} onClose={() => setEditor(null)} onSaved={saved} />}
  </div>
}
export default ProductsAdminPage
