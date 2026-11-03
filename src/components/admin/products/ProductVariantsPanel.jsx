import { Fragment, useEffect, useId, useMemo, useState } from 'react'
import { FiChevronDown, FiEdit2, FiPackage, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi'
import { formatSkuCapacity, groupProductVariants } from '../../../utils/adminFormatters'
import SideDrawer from '../../common/SideDrawer'
import VariantEditor from './VariantEditor'
import { findSharedColorImage } from '../../../helpers/productAdapter'
import BulkVariantsEditor from './BulkVariantsEditor'
import api from '../../../lib/api.js'
import { invalidateProductCatalog } from '../../../hooks/useCatalog.js'
import { Field, actionClass } from './ProductFields'

const money = value => Number(value).toLocaleString('vi-VN') + '₫'
const placeholder = '/images/products/placeholder.svg'
const inventoryLabels = { in_stock: 'Còn hàng', low_stock: 'Sắp hết hàng', out_of_stock: 'Hết hàng' }
const rowAction = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40'
const imageFallback = event => { if (!event.currentTarget.src.endsWith(placeholder)) event.currentTarget.src = placeholder }
const ProductVariantsPanel = ({ product, onClose, onNotice }) => {
  const [items, setItems] = useState([])
  const [groupBy, setGroupBy] = useState('capacity')
  const [collapsed, setCollapsed] = useState({ capacity: {}, color: {} })
  const listId = useId()
  const displayItems = useMemo(() => items.map(item => ({ ...item, displayImage: item.color?.image?.url || findSharedColorImage(items, product._id, item.color, item._id)?.url })), [items, product._id])
  const groups = useMemo(() => groupProductVariants(displayItems, groupBy), [displayItems, groupBy])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState(null)
  const [bulk, setBulk] = useState(false)
  const [stockItem, setStockItem] = useState(null)
  const [stock, setStock] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    const load = async () => {
      const items = []
      let page = 1
      let totalPages = 1
      do {
        const { data } = await api.get('/product-variants', { params: { product: product._id, page, limit: 100 }, signal: controller.signal })
        items.push(...data.data)
        totalPages = data.pagination.totalPages
        page += 1
      } while (page <= totalPages)
      return items
    }
    load().then(data => { if (!controller.signal.aborted) setItems(data) })
      .catch(failure => { if (failure.name !== 'AbortError') setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [product._id, reload])
  const saved = () => { setEditor(null); setBulk(false); setReload(value => value + 1); onNotice('Đã lưu SKU.') }
  const changeStatus = async item => {
    if (busy) return
    setBusy(true); setError('')
    try { await api.patch(`/product-variants/${encodeURIComponent(item._id)}/status`, { status: item.status === 'active' ? 'inactive' : 'active' }); invalidateProductCatalog(); setReload(value => value + 1); onNotice('Đã cập nhật trạng thái SKU.') }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  const saveStock = async event => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setActionError('')
    try { await api.patch(`/product-variants/${encodeURIComponent(stockItem._id)}/stock`, { stock: Number(stock), expectedStock: stockItem.stock ?? null }); invalidateProductCatalog(); setStockItem(null); setReload(value => value + 1); onNotice('Đã cập nhật tồn kho.') }
    catch (failure) { setActionError(failure.message) }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (busy) return
    setBusy(true); setActionError('')
    try { await api.delete(`/product-variants/${encodeURIComponent(deleting._id)}`); invalidateProductCatalog(); setDeleting(null); setReload(value => value + 1); onNotice('Đã xóa mềm SKU.') }
    catch (failure) { setActionError(failure.message) }
    finally { setBusy(false) }
  }
  return <section className="space-y-5">
    <button type="button" onClick={onClose} className="min-h-11 text-sm font-semibold text-slate-500 hover:text-primary">← Danh sách sản phẩm</button>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">SKU — {product.name}</h1><p className="mt-2 text-sm text-slate-500">Quản lý phiên bản RAM, ROM, màu, giá và tồn kho.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setBulk(true)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold">Thêm phiên bản</button></div></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error} <button type="button" onClick={() => setReload(value => value + 1)} className="ml-2 font-semibold underline">Tải lại</button></p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 p-4">
        <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">Phân nhóm
          <select value={groupBy} onChange={event => setGroupBy(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal focus-visible:outline-primary">
            <option value="capacity">Nhóm theo RAM/ROM</option><option value="color">Nhóm theo màu sắc</option>
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="mr-2 text-slate-500" aria-live="polite">{groups.length} nhóm · {items.length} SKU</span>
          <button type="button" disabled={!groups.length} onClick={() => setCollapsed(current => ({ ...current, [groupBy]: Object.fromEntries(groups.map(group => [group.key, false])) }))} className="min-h-11 rounded-lg px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40">Mở tất cả</button>
          <button type="button" disabled={!groups.length} onClick={() => setCollapsed(current => ({ ...current, [groupBy]: Object.fromEntries(groups.map(group => [group.key, true])) }))} className="min-h-11 rounded-lg px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40">Thu gọn tất cả</button>
        </div>
      </div>
      <p className="px-4 pt-3 text-xs text-slate-500 sm:hidden">Vuốt ngang bảng để xem đầy đủ thông tin và thao tác.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <caption className="sr-only">SKU của {product.name}, nhóm theo {groupBy === 'capacity' ? 'RAM/ROM' : 'màu sắc'}</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th className="px-4 py-3">SKU</th><th className="px-4 py-3">{groupBy === 'capacity' ? 'Màu sắc' : 'RAM / ROM'}</th>
            <th className="px-4 py-3 text-right">Giá bán</th><th className="px-4 py-3">Tồn kho</th><th className="px-4 py-3">Kinh doanh</th><th className="w-56 px-4 py-3 text-right">Thao tác</th>
          </tr></thead>
          {groups.map((group, index) => {
            const closed = collapsed[groupBy][group.key] ?? index !== 0
            const rowsId = `${listId}-${groupBy}-${index}`
            return <Fragment key={`${groupBy}-${group.key}`}>
              <tbody><tr className="border-y border-slate-200 bg-slate-50/80"><th colSpan={6} scope="rowgroup" className="p-0">
                <button type="button" aria-expanded={!closed} aria-controls={rowsId} onClick={() => setCollapsed(current => ({ ...current, [groupBy]: { ...current[groupBy], [group.key]: !closed } }))} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 focus-visible:outline-primary">
                  <FiChevronDown aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform motion-reduce:transition-none ${closed ? '-rotate-90' : ''}`} />
                  {groupBy === 'color' && <img key={group.image || 'placeholder'} src={group.image || placeholder} onError={imageFallback} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1" />}
                  <span className="min-w-0"><span className="font-semibold text-secondary">{group.label}</span>{groupBy === 'color' && group.code && <span className="ml-3 inline-flex items-center gap-1.5 text-xs font-normal text-slate-500"><span className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: group.code }} />{group.code}</span>}
                    <span className="mt-1 block text-xs font-normal text-slate-500">{group.count} {groupBy === 'capacity' ? 'màu' : 'cấu hình'} · {group.items.length} SKU</span>
                  </span>
                  <span className="ml-auto text-xs font-normal text-slate-500">{closed ? 'Mở rộng' : 'Thu gọn'}</span>
                </button>
              </th></tr></tbody>
              <tbody id={rowsId} hidden={closed} className="divide-y divide-slate-100">
                {group.items.map(item => <tr key={item._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-4"><p className="max-w-56 break-words font-semibold">{item.sku}</p>{item.isDefault && <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">Mặc định</span>}</td>
                  <td className="px-4 py-4"><div className="flex items-center gap-3"><img key={item.displayImage || 'placeholder'} src={item.displayImage || placeholder} onError={imageFallback} alt={`Ảnh màu ${item.color?.name || ''}`} className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1" /><div><p className="whitespace-nowrap font-medium">{groupBy === 'capacity' ? item.color?.name : `${formatSkuCapacity(item.ram)} / ${formatSkuCapacity(item.storage)}`}</p>{groupBy === 'capacity' && item.color?.code && <p className="mt-1 text-xs text-slate-500">{item.color.code}</p>}</div></div></td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums">{money(item.price)}</td>
                  <td className="px-4 py-4"><p className="whitespace-nowrap tabular-nums">Kho: <strong>{item.stock ?? 'Chưa xác nhận'}</strong></p><p className="mt-1 text-xs tabular-nums text-slate-500">Đang giữ: {item.reservedStock ?? '—'}</p><span className={`mt-2 inline-block text-xs font-medium ${item.inventoryStatus === 'out_of_stock' ? 'text-red-600' : item.inventoryStatus === 'in_stock' ? 'text-emerald-700' : 'text-amber-700'}`}>{inventoryLabels[item.inventoryStatus] || 'Chưa rõ tồn kho'}</span></td>
                  <td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{item.status === 'active' ? 'Đang bán' : 'Ngừng bán'}</span></td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-2">
                    <button type="button" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { setEditor({ variant: (await api.get(`/product-variants/${encodeURIComponent(item._id)}`)).data.data }) } catch (failure) { setError(failure.message) } finally { setBusy(false) } }} aria-label={`Sửa SKU ${item.sku}`} title="Sửa SKU" className={rowAction}><FiEdit2 aria-hidden="true" /></button>
                    <button type="button" disabled={busy} onClick={() => { setStockItem(item); setStock(item.stock ?? ''); setActionError('') }} aria-label={`Cập nhật kho ${item.sku}`} title="Cập nhật kho" className={rowAction}><FiPackage aria-hidden="true" /></button>
                    <button type="button" disabled={busy} onClick={() => changeStatus(item)} aria-label={`${item.status === 'active' ? 'Ẩn' : 'Hiện'} SKU ${item.sku}`} title={item.status === 'active' ? 'Ẩn SKU' : 'Hiện SKU'} className={rowAction}>{item.status === 'active' ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button>
                    <button type="button" disabled={busy} onClick={() => { setDeleting(item); setActionError('') }} aria-label={`Xóa SKU ${item.sku}`} title="Xóa SKU" className={`${rowAction} text-red-600 hover:bg-red-50`}><FiTrash2 aria-hidden="true" /></button>
                  </div></td>
                </tr>)}
              </tbody>
            </Fragment>
          })}
        </table>
      </div>
      {loading && <p role="status" className="p-6 text-center text-sm text-slate-500">Đang tải SKU…</p>}
      {!loading && !items.length && <p className="p-10 text-center text-sm text-slate-500">Chưa có SKU. Thêm phiên bản để thiết lập màu, giá và tồn kho.</p>}
    </div>

    {editor && <VariantEditor product={product} variants={items} variant={editor.variant} onClose={() => setEditor(null)} onSaved={saved} />}
    {bulk && <BulkVariantsEditor product={product} variants={items} onClose={() => setBulk(false)} onSaved={saved} />}
    {stockItem && <SideDrawer title={`Tồn kho — ${stockItem.sku}`} onClose={() => setStockItem(null)} busy={busy}>
      <form onSubmit={saveStock} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-5 overflow-y-auto p-6"><p className="text-sm text-slate-500">Tồn kho hiện tại: {stockItem.stock ?? 'Chưa xác nhận'}. Đang giữ: {stockItem.reservedStock}.</p><Field label="Tổng tồn kho mới" type="number" required min={stockItem.reservedStock} step="1" value={stock} disabled={busy} onChange={event => setStock(event.target.value)} />{actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}</div><footer className="border-t border-slate-100 p-5"><button type="submit" disabled={busy} className={`${actionClass} w-full`}>{busy ? 'Đang lưu…' : 'Cập nhật tồn kho'}</button></footer></form>
    </SideDrawer>}
    {deleting && <SideDrawer title="Xóa SKU" busy={busy} onClose={() => setDeleting(null)}><div className="flex-1 space-y-4 p-6"><p className="text-sm leading-6">Xóa SKU <strong>{deleting.sku}</strong>? SKU sẽ được xóa mềm; dữ liệu đơn hàng được giữ nguyên. SKU đang giữ hàng không thể xóa.</p>{actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}</div><footer className="flex justify-end gap-3 border-t border-slate-100 p-5"><button type="button" disabled={busy} onClick={() => setDeleting(null)} className="min-h-11 px-4">Hủy</button><button type="button" disabled={busy} onClick={remove} className={actionClass}>{busy ? 'Đang xử lý…' : 'Xóa SKU'}</button></footer></SideDrawer>}
  </section>
}
export default ProductVariantsPanel
