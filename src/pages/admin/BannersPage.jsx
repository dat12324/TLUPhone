import { Fragment, useEffect, useState } from 'react'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'
import api from '../../lib/api.js'
import BannerEditor from '../../components/admin/banners/BannerEditor'
import SideDrawer from '../../components/common/SideDrawer'
import CatalogActions from '../../components/admin/shared/CatalogActions'
import { bannerPositions, bannerDisplayStatus, groupBannersByPosition } from '../../helpers/banner.js'
import { invalidateBanners } from '../../hooks/useBanners'

const controlClass = 'min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

const BannersPage = () => {
  const [filters, setFilters] = useState({ position: '', status: '', search: '', page: 1 })
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState(null)
  const [statusBanner, setStatusBanner] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const params = { page: filters.page, limit: 10 }
    for (const key of ['position', 'status', 'search']) if (filters[key]) params[key] = filters[key]
    api.get('/banners', { params, signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) {
        if (filters.page > 1 && !data.data.length) setFilters(current => ({ ...current, page: current.page - 1 }))
        else setResult(data)
      }
    }).catch(failure => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filters, reload])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const bannerGroups = groupBannersByPosition(result?.data || [])

  const saved = message => { invalidateBanners(); setReload(value => value + 1); setNotice(message) }
  const saveBanner = async body => {
    if (editor.banner) await api.patch(`/banners/${encodeURIComponent(editor.banner._id)}`, body)
    else await api.post('/banners', body)
    saved(editor.banner ? 'Đã cập nhật banner.' : 'Đã thêm banner.')
  }
  const changeStatus = async () => {
    if (saving) return
    setSaving(true)
    setStatusError('')
    try {
      await api.patch(`/banners/${encodeURIComponent(statusBanner._id)}`, { status: statusBanner.status === 'active' ? 'inactive' : 'active' })
      saved(statusBanner.status === 'active' ? 'Đã ẩn banner.' : 'Đã kích hoạt banner.')
      setStatusBanner(null)
    } catch (failure) { setStatusError(failure.message) }
    finally { setSaving(false) }
  }

  return (
    <section className="mx-auto max-w-[1600px] space-y-6" aria-busy={loading}>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Nội dung quảng cáo</p><h1 className="mt-2 text-3xl font-bold text-secondary">Quản lý banner</h1><p className="mt-2 text-sm text-slate-500">Quản lý ảnh, vị trí, thứ tự và lịch hiển thị.</p></div>
        <button type="button" onClick={() => setEditor({ banner: null })} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700"><FiPlus />Thêm banner</button>
      </header>
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="inline-flex min-h-11 items-center gap-2 font-semibold"><FiRefreshCw />Thử lại</button></div>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form onSubmit={event => { event.preventDefault(); setFilters(current => ({ ...current, search: search.trim(), page: 1 })) }} className="flex flex-wrap gap-3 border-b border-slate-200 p-5">
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tiêu đề..." aria-label="Tìm banner" maxLength={100} className={`${controlClass} min-w-0 flex-1`} />
          <select aria-label="Vị trí banner" value={filters.position} onChange={event => setFilters(current => ({ ...current, position: event.target.value, page: 1 }))} className={controlClass}>
            <option value="">Tất cả vị trí</option>{Object.entries(bannerPositions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select aria-label="Trạng thái banner" value={filters.status} onChange={event => setFilters(current => ({ ...current, status: event.target.value, page: 1 }))} className={controlClass}><option value="">Tất cả trạng thái</option><option value="active">Hoạt động</option><option value="inactive">Đã ẩn</option></select>
          <button className={`${controlClass} font-semibold`} type="submit">Tìm kiếm</button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Banner', 'Vị trí', 'Thứ tự', 'Lịch hiển thị', 'Trạng thái', 'Thao tác'].map(label => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {bannerGroups.map(group => <Fragment key={group.position}>
                <tr className="bg-slate-50">
                  <th scope="rowgroup" colSpan={6} className="border-y border-slate-200 px-5 py-3 text-sm font-semibold text-secondary">
                    {group.label}<span className="ml-3 text-xs font-normal text-slate-500">{group.items.length} banner trên trang này</span>
                  </th>
                </tr>
                {group.items.map(banner => <tr key={banner._id} className="hover:bg-slate-50/60">
                <td className="max-w-xs px-5 py-4"><div className="flex items-center gap-3">
                  {banner.image?.url ? <img src={banner.image.url} alt={banner.title} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/products/placeholder.svg' }} className="h-16 w-24 shrink-0 rounded-lg border border-slate-200 object-contain" /> : <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">Không có ảnh</span>}
                  <div className="min-w-0"><p className="font-semibold text-secondary">{banner.title}</p><p className="mt-1 truncate text-xs text-slate-500">{banner.link || 'Chưa đặt liên kết'}</p></div>
                </div></td>
                <td className="px-5 py-4">{bannerPositions[banner.position]}</td><td className="px-5 py-4">{banner.displayOrder}</td>
                <td className="px-5 py-4 text-xs leading-6 text-slate-500"><p>Từ: {banner.startsAt ? new Date(banner.startsAt).toLocaleString('vi-VN') : 'Không giới hạn'}</p><p>Đến: {banner.endsAt ? new Date(banner.endsAt).toLocaleString('vi-VN') : 'Không giới hạn'}</p></td>
                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${bannerDisplayStatus(banner) === 'Đang hiển thị' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{bannerDisplayStatus(banner)}</span></td>
                <td className="px-5 py-4"><CatalogActions item={{ ...banner, name: banner.title }} label="banner" onEdit={() => setEditor({ banner })} onStatusChange={() => { setStatusBanner(banner); setStatusError('') }} /></td>
                </tr>)}
              </Fragment>)}
              {!result?.data.length && <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500">{loading ? 'Đang tải banner...' : error ? 'Chưa tải được dữ liệu.' : 'Chưa có banner phù hợp.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm">
          <p className="text-slate-500">Tổng {result?.pagination.total ?? 0} banner</p>
          <div className="flex items-center gap-3"><button type="button" disabled={loading || filters.page <= 1} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))} className={`${controlClass} disabled:opacity-40`}>Trang trước</button><span>{filters.page}/{Math.max(1, result?.pagination.totalPages ?? 1)}</span><button type="button" disabled={loading || filters.page >= (result?.pagination.totalPages ?? 1)} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))} className={`${controlClass} disabled:opacity-40`}>Trang sau</button></div>
        </footer>
      </div>
      {editor && <BannerEditor banner={editor.banner} onSave={saveBanner} onClose={() => setEditor(null)} />}
      {statusBanner && <SideDrawer title={statusBanner.status === 'active' ? 'Ẩn banner' : 'Hiện banner'} busy={saving} onClose={() => { if (!saving) setStatusBanner(null) }}>
        <div className="flex-1 space-y-4 p-6"><p>Bạn muốn {statusBanner.status === 'active' ? 'ẩn' : 'kích hoạt'} banner <strong>{statusBanner.title}</strong>?</p><p className="text-sm text-slate-500">Banner hoạt động chỉ hiển thị khi nằm trong lịch đã đặt.</p>{statusError && <p role="alert" className="text-sm text-red-600">{statusError}</p>}</div>
        <footer className="flex justify-end gap-3 border-t p-5"><button type="button" disabled={saving} onClick={() => setStatusBanner(null)} className={controlClass}>Hủy</button><button type="button" disabled={saving} onClick={changeStatus} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Xác nhận'}</button></footer>
      </SideDrawer>}
    </section>
  )
}

export default BannersPage
