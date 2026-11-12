import { useEffect, useRef, useState } from 'react'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'
import api from '../../lib/api.js'
import SideDrawer from '../../components/common/SideDrawer'
import CatalogActions from '../../components/admin/shared/CatalogActions'
import VoucherEditor from '../../components/admin/vouchers/VoucherEditor'
import { formatVnd } from '../../utils/adminFormatters'

const controlClass = 'min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
const formatTime = value => new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

export const voucherAvailability = (voucher, now = Date.now()) => {
  if (voucher.status !== 'active') return 'Đã tắt'
  if (new Date(voucher.endsAt).getTime() <= now) return 'Hết hạn'
  if (new Date(voucher.startsAt).getTime() > now) return 'Chưa bắt đầu'
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) return 'Hết lượt'
  return 'Có thể sử dụng'
}

const VouchersPage = () => {
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState(null)
  const [statusVoucher, setStatusVoucher] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api.get('/vouchers', { params: filters, signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return
      if (filters.page > 1 && !data.data.length) {
        setFilters(current => ({ ...current, page: Math.max(1, data.pagination.totalPages) }))
      } else setResult(data)
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [filters, reload])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const saved = message => {
    setReload(current => current + 1)
    setNotice(message)
  }

  const saveVoucher = async body => {
    if (editor.voucher) await api.patch(`/vouchers/${encodeURIComponent(editor.voucher._id)}`, body)
    else await api.post('/vouchers', body)
    saved(editor.voucher ? 'Đã cập nhật voucher.' : 'Đã thêm voucher.')
  }

  const changeStatus = async () => {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setStatusError('')
    try {
      const status = statusVoucher.status === 'active' ? 'inactive' : 'active'
      await api.patch(`/vouchers/${encodeURIComponent(statusVoucher._id)}`, { status })
      saved(status === 'active' ? 'Đã bật voucher.' : 'Đã tắt voucher.')
      setStatusVoucher(null)
    } catch (failure) {
      setStatusError(failure.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const pagination = result?.pagination
  return <section className="mx-auto max-w-[1600px] space-y-6" aria-labelledby="vouchers-title">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Ưu đãi khách hàng</p>
        <h1 id="vouchers-title" className="mt-2 text-3xl font-bold text-secondary">Quản lý voucher</h1>
        <p className="mt-2 text-sm text-slate-500">Quản lý mã giảm giá, thời gian áp dụng và lượt sử dụng.</p>
      </div>
      <button type="button" onClick={() => setEditor({ voucher: null })} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700"><FiPlus aria-hidden="true" />Thêm voucher</button>
    </header>
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
    {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(current => current + 1)} className="inline-flex min-h-11 items-center gap-2 font-semibold"><FiRefreshCw aria-hidden="true" />Thử lại</button></div>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <form onSubmit={event => { event.preventDefault(); setFilters(current => ({ ...current, search: search.trim(), page: 1 })) }} className="flex flex-wrap gap-3 border-b border-slate-200 p-5">
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo mã giảm giá..." aria-label="Tìm voucher" className={`${controlClass} min-w-0 flex-1`} />
        <select aria-label="Trạng thái voucher" value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value, page: 1 }))} className={controlClass}><option value="">Tất cả trạng thái</option><option value="active">Đang bật</option><option value="inactive">Đã tắt</option></select>
        <button type="submit" className={`${controlClass} font-semibold`}>Tìm kiếm</button>
      </form>
      <div className="overflow-x-auto" aria-busy={loading}>
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Mã giảm giá', 'Ưu đãi', 'Đơn tối thiểu', 'Thời gian áp dụng', 'Lượt sử dụng', 'Trạng thái', 'Thao tác'].map(label => <th scope="col" key={label} className="px-5 py-4">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && !error && result?.data.map(voucher => {
              const availability = voucherAvailability(voucher)
              return <tr key={voucher._id} className="hover:bg-slate-50/60">
                <td className="max-w-xs px-5 py-5"><p className="break-words font-semibold text-secondary">{voucher.code}</p>{voucher.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500" title={voucher.description}>{voucher.description}</p>}</td>
                <td className="px-5 py-5"><p className="whitespace-nowrap font-semibold text-primary">{voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : formatVnd(voucher.discountValue)}</p>{voucher.maxDiscount != null && <p className="mt-1 whitespace-nowrap text-xs text-slate-500">Tối đa {formatVnd(voucher.maxDiscount)}</p>}</td>
                <td className="whitespace-nowrap px-5 py-5">{formatVnd(voucher.minOrderValue)}</td>
                <td className="whitespace-nowrap px-5 py-5 text-xs leading-6 text-slate-500"><p>Từ: {formatTime(voucher.startsAt)}</p><p>Đến: {formatTime(voucher.endsAt)}</p></td>
                <td className="px-5 py-5"><p className="whitespace-nowrap">{voucher.usedCount ?? 0} / {voucher.usageLimit ?? 'Không giới hạn'}</p></td>
                <td className="px-5 py-5"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${availability === 'Có thể sử dụng' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{availability}</span><p className="mt-1 text-xs text-slate-500">{voucher.status === 'active' ? 'Đang bật' : 'Đã tắt'}</p></td>
                <td className="px-5 py-5"><CatalogActions item={{ ...voucher, name: voucher.code }} label="voucher" onEdit={() => setEditor({ voucher })} onStatusChange={() => { setStatusVoucher(voucher); setStatusError('') }} /></td>
              </tr>
            })}
            {(loading || error || !result?.data.length) && <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-500" role="status">{loading ? 'Đang tải voucher...' : error ? 'Chưa tải được dữ liệu.' : 'Không có voucher phù hợp.'}</td></tr>}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm">
        <p className="text-slate-500">Tổng {pagination?.total ?? 0} voucher</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-slate-500">Số dòng<select value={filters.limit} onChange={event => setFilters(current => ({ ...current, limit: Number(event.target.value), page: 1 }))} className={controlClass}>{[10, 20, 50].map(limit => <option key={limit} value={limit}>{limit}</option>)}</select></label>
          <button type="button" disabled={loading || !!error || filters.page <= 1} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))} className={`${controlClass} disabled:opacity-40`}>Trang trước</button>
          <span>{filters.page}/{Math.max(1, pagination?.totalPages ?? 1)}</span>
          <button type="button" disabled={loading || !!error || filters.page >= (pagination?.totalPages ?? 1)} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))} className={`${controlClass} disabled:opacity-40`}>Trang sau</button>
        </div>
      </footer>
    </div>
    {editor && <VoucherEditor voucher={editor.voucher} onSave={saveVoucher} onClose={() => setEditor(null)} />}
    {statusVoucher && <SideDrawer title={statusVoucher.status === 'active' ? 'Tắt voucher' : 'Bật voucher'} busy={saving} onClose={() => { if (!savingRef.current) setStatusVoucher(null) }}>
      <div className="flex-1 space-y-4 p-6">
        <p>Bạn muốn {statusVoucher.status === 'active' ? 'tắt' : 'bật'} mã giảm giá <strong>{statusVoucher.code}</strong>?</p>
        <p className="text-sm leading-6 text-slate-500">Voucher chỉ được áp dụng khi đang bật, còn hạn và còn lượt sử dụng. Các đơn hàng đã áp dụng mã không bị thay đổi.</p>
        {statusError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{statusError}</p>}
      </div>
      <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
        <button type="button" disabled={saving} onClick={() => setStatusVoucher(null)} className={controlClass}>Hủy</button>
        <button type="button" disabled={saving} onClick={changeStatus} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Xác nhận'}</button>
      </footer>
    </SideDrawer>}
  </section>
}

export default VouchersPage
