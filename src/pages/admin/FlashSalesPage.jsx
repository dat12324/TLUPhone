import { useEffect, useState } from 'react'
import { FiRefreshCw, FiZap } from 'react-icons/fi'
import api from '../../lib/api.js'
import FlashSaleEditor from '../../components/admin/flash-sales/FlashSaleEditor'

const labels = { active: 'Đang diễn ra', upcoming: 'Sắp diễn ra', ended: 'Đã kết thúc', disabled: 'Đã tắt' }

const FlashSalesPage = () => {
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setError('')
    setLoading(true)
    api.get('/flash-sales', { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setSale(data.data) })
      .catch(failure => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reloadKey])

  useEffect(() => {
    if (!sale?.isEnabled) return undefined
    const boundary = [sale.startAt, sale.endAt].map(value => new Date(value).getTime())
      .filter(value => value > Date.now()).sort((a, b) => a - b)[0]
    if (!boundary) return undefined
    const timer = setTimeout(() => setReloadKey(value => value + 1), Math.min(boundary - Date.now() + 100, 2147483647))
    return () => clearTimeout(timer)
  }, [sale])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const saveSale = async body => {
    const { data } = await api.patch('/flash-sales', body)
    setSale(data.data)
    setNotice('Đã lưu thay đổi Flash Sale.')
    window.dispatchEvent(new Event('flash-sales-updated'))
  }

  return (
    <section className="mx-auto max-w-[1400px] space-y-6" aria-labelledby="flash-sale-title">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Marketing</p>
          <h1 id="flash-sale-title" className="mt-1 text-2xl font-bold text-secondary sm:text-3xl">Quản lý Flash Sale</h1>
          <p className="mt-2 text-sm text-slate-500">Chỉnh sửa và tái sử dụng chương trình cho đợt giảm giá tiếp theo.</p>
        </div>
        {sale && <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${sale.computedStatus === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><FiZap aria-hidden="true" />{labels[sale.computedStatus]}</span>}
      </header>
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
      {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setReloadKey(value => value + 1)} className="inline-flex min-h-11 items-center gap-2 px-3 font-semibold"><FiRefreshCw aria-hidden="true" />Thử lại</button></div>}
      {!loading && !error && (sale ? <FlashSaleEditor key={sale.updatedAt || sale._id} sale={sale} onSave={saveSale} /> : <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Chưa có cấu hình Flash Sale.</p>)}
      {loading && <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Đang tải cấu hình Flash Sale...</p>}
    </section>
  )
}

export default FlashSalesPage
