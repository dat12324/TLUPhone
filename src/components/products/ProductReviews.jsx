import { useEffect, useRef, useState } from 'react'
import { FiEdit2, FiMessageSquare, FiStar, FiTrash2 } from 'react-icons/fi'
import api from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext'
import ReviewEditor from './ReviewEditor'

const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40'

const ProductReviews = ({ product, onRatingUpdated }) => {
  const { user } = useAuth()
  const userId = user?._id || user?.id
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [editor, setEditor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const deletingRef = useRef(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api.get(`/products/${encodeURIComponent(product.databaseId)}/reviews`, {
      params: { page, limit: 5 }, skipAuth: true, signal: controller.signal,
    }).then(({ data }) => {
      if (controller.signal.aborted) return
      if (page > 1 && !data.data.length) setPage(Math.max(1, data.pagination.totalPages))
      else setResult(data)
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure.message)
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [product.databaseId, page, reload])

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const refresh = async message => {
    setNotice(message)
    setReload(value => value + 1)
    try {
      const { data } = await api.get(`/products/${encodeURIComponent(product.slug)}`, { skipAuth: true })
      if (active.current) onRatingUpdated(data.data.ratingAverage, data.data.reviewCount)
    } catch {
      if (active.current) setNotice(`${message} Chưa tải lại được điểm tổng hợp; vui lòng tải lại trang.`)
    }
  }

  const remove = async () => {
    if (deletingRef.current) return
    deletingRef.current = true
    setDeleting(true)
    setActionError('')
    try {
      await api.delete(`/reviews/${encodeURIComponent(deleteTarget._id)}`)
      if (!active.current) return
      setDeleteTarget(null)
      void refresh('Đã xóa đánh giá.')
    } catch (failure) {
      if (active.current) setActionError(failure.message)
    } finally {
      deletingRef.current = false
      if (active.current) setDeleting(false)
    }
  }

  return <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="product-reviews-title">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 id="product-reviews-title" className="text-xl font-bold text-secondary">Đánh giá từ khách hàng</h2></div>
    </header>
    <p className="mt-3 text-sm text-slate-500">Bạn có thể viết đánh giá khi mua sản phẩm.</p>
    {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    {loading ? <p role="status" className="py-10 text-center text-sm text-slate-500">Đang tải đánh giá...</p> : error ? <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="mt-2 min-h-11 font-semibold underline">Thử lại</button></div> : !result?.data.length ? <div className="py-10 text-center text-slate-500"><FiMessageSquare aria-hidden="true" className="mx-auto mb-3 text-3xl text-slate-300" /><p className="text-sm">Chưa có đánh giá cho sản phẩm này.</p></div> : <ul className="mt-5 divide-y divide-slate-100">
      {result.data.map(review => {
        const owner = user?.role === 'user' && String(review.user?._id || review.user) === String(userId)
        return <li key={review._id} className="py-5 first:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-secondary">{review.user?.fullName || 'Khách hàng'}{owner && <span className="ml-2 text-xs font-normal text-slate-500">(Bạn)</span>}</p>
            <time dateTime={review.createdAt} className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</time>
          </div>
          <div className="mt-2 flex gap-1" aria-label={`${review.rating}/5 sao`}>{[1, 2, 3, 4, 5].map(value => <FiStar key={value} aria-hidden="true" className={value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}</div>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{review.content}</p>
          {owner && <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={deleting} onClick={() => setEditor(review)} className={buttonClass}><FiEdit2 aria-hidden="true" />Sửa</button><button type="button" disabled={deleting} onClick={() => { setDeleteTarget(review); setActionError('') }} className={`${buttonClass} text-red-600`}><FiTrash2 aria-hidden="true" />Xóa</button></div>}
          {owner && deleteTarget?._id === review._id && <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm" role="group" aria-label="Xác nhận xóa đánh giá">
            <p>Xóa đánh giá này? Thao tác không thể hoàn tác.</p>
            {actionError && <p role="alert" className="mt-2 text-red-700">{actionError}</p>}
            <div className="mt-3 flex gap-2"><button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className={buttonClass}>Giữ lại</button><button type="button" disabled={deleting} onClick={remove} className={`${buttonClass} text-red-700`}>{deleting ? 'Đang xóa...' : 'Xác nhận xóa'}</button></div>
          </div>}
        </li>
      })}
    </ul>}
    {!error && (result?.pagination.totalPages ?? 0) > 1 && <nav aria-label="Phân trang đánh giá" className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 text-sm">
      <button type="button" disabled={loading || deleting || page <= 1} onClick={() => setPage(value => value - 1)} className={buttonClass}>Trước</button>
      <span>{page}/{result.pagination.totalPages}</span>
      <button type="button" disabled={loading || deleting || page >= result.pagination.totalPages} onClick={() => setPage(value => value + 1)} className={buttonClass}>Sau</button>
    </nav>}
    {editor && <ReviewEditor product={{ id: product.databaseId, name: product.name }} review={editor} onClose={() => setEditor(null)} onSaved={() => { void refresh('Đã cập nhật đánh giá.') }} />}
  </section>
}

export default ProductReviews
