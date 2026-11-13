import { useRef, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import SideDrawer from '../common/SideDrawer'
import api from '../../lib/api.js'

const ReviewEditor = ({ product, orderId, review, onClose, onSaved }) => {
  const [rating, setRating] = useState(review?.rating ?? 0)
  const [content, setContent] = useState(review?.content ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  const submit = async event => {
    event.preventDefault()
    if (submitting.current) return
    setError('')
    if (!rating || !content.trim()) {
      setError('Vui lòng chọn số sao và nhập nội dung đánh giá.')
      return
    }
    submitting.current = true
    setBusy(true)
    try {
      const body = { rating, content: content.trim() }
      const { data } = review
        ? await api.patch(`/reviews/${encodeURIComponent(review._id)}`, body)
        : await api.post('/reviews', { ...body, product: product.id, order: orderId })
      onSaved(data.data)
      onClose()
    } catch (failure) {
      setError(failure.message || 'Không thể lưu đánh giá. Vui lòng thử lại.')
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return <SideDrawer title={review ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'} onClose={onClose} busy={busy}>
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <fieldset disabled={busy} className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
        <div><p className="font-semibold text-secondary">{product.name}</p><p className="mt-1 text-sm text-slate-500">Chia sẻ trải nghiệm thực tế của bạn về sản phẩm.</p></div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Mức độ hài lòng</legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(value => <label key={value} className="cursor-pointer">
              <input type="radio" name="reviewRating" value={value} checked={rating === value} onChange={() => setRating(value)} className="peer sr-only" aria-label={`${value} sao`} />
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                <FiStar aria-hidden="true" className={`text-2xl ${rating >= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </span>
            </label>)}
          </div>
          <p className="mt-2 text-sm text-slate-500">{rating ? `${rating}/5 sao` : 'Chọn từ 1 đến 5 sao'}</p>
        </fieldset>
        <label className="block text-sm font-semibold">Nội dung đánh giá
          <textarea value={content} onChange={event => setContent(event.target.value)} maxLength={3000} rows={6} placeholder="Bạn hài lòng điều gì về sản phẩm?" className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          <span className="mt-1 block text-right text-xs font-normal text-slate-500">{content.length}/3000</span>
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </fieldset>
      <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
        <button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold disabled:opacity-50">Hủy</button>
        <button type="submit" disabled={busy} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{busy ? 'Đang gửi...' : review ? 'Lưu thay đổi' : 'Gửi đánh giá'}</button>
      </footer>
    </form>
  </SideDrawer>
}

export default ReviewEditor
