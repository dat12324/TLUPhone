import { useEffect, useState } from 'react'
import api from '../../../lib/api.js'
import { getBannerProductSlug } from '../../../helpers/banner.js'

const BannerLinkField = ({ value, onChange }) => {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [selectedName, setSelectedName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const selectedSlug = getBannerProductSlug(value)

  useEffect(() => {
    setProducts([])
    setError('')
    if (!search.trim()) { setLoading(false); return undefined }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      api.get('/products', { params: { search: search.trim(), page: 1, limit: 20 }, skipAuth: true, signal: controller.signal })
        .then(({ data }) => { if (!controller.signal.aborted) setProducts(data.data) })
        .catch(failure => { if (!controller.signal.aborted) setError(failure.message || 'Không thể tìm sản phẩm.') })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [search, retry])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">Sản phẩm liên kết (không bắt buộc)
        <input type="search" maxLength={100} value={search} placeholder="Tìm tên sản phẩm..." onChange={event => {
          setSearch(event.target.value)
          setSelectedName('')
          onChange('/products')
        }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
      </label>
      {loading && <p role="status" className="text-sm text-slate-500">Đang tìm sản phẩm...</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}<button type="button" onClick={() => setRetry(current => current + 1)} className="ml-2 min-h-11 px-2 font-semibold underline">Thử lại</button></p>}
      {!loading && !error && search.trim() && !products.length && <p role="status" className="text-sm text-slate-500">Không tìm thấy sản phẩm.</p>}
      {products.length > 0 && <ul aria-label="Kết quả tìm sản phẩm" className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {products.map(product => <li key={product._id}>
          <button type="button" className="min-h-11 w-full px-4 py-3 text-left text-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary" onClick={() => {
            onChange(`/products/${encodeURIComponent(product.slug)}`)
            setSelectedName(product.name)
            setSearch('')
            setProducts([])
          }}>{product.name}</button>
        </li>)}
      </ul>}
      {selectedSlug ? <div className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-2 text-sm">
        <span className="min-w-0 break-words font-medium text-secondary">Đã chọn: {selectedName || selectedSlug}</span>
        <button type="button" className="min-h-11 shrink-0 px-2 font-semibold text-primary" onClick={() => { onChange('/products'); setSelectedName(''); setSearch('') }}>Bỏ chọn</button>
      </div> : <p className="text-xs text-slate-500">Không chọn sản phẩm: banner mở trang tất cả sản phẩm.</p>}
    </div>
  )
}

export default BannerLinkField
