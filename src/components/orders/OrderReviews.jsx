import { useEffect, useState } from 'react'
import { FiEdit2 } from 'react-icons/fi'
import ReviewEditor from '../products/ReviewEditor'

const OrderReviews = ({ order }) => {
  const [target, setTarget] = useState(null)
  const [notice, setNotice] = useState('')
  const [reviewedIds, setReviewedIds] = useState([])
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])
  if (order.status !== 'delivered') return null
  const products = [...new Map(order.items.map(item => {
    const id = item.product?._id || item.product
    return [String(id), { id, name: item.productName }]
  })).values()].filter(product => product.id)

  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="order-review-title">
    <h2 id="order-review-title" className="font-bold text-secondary">Đánh giá sản phẩm đã nhận</h2>
    <p className="mt-1 text-sm text-slate-500">Cảm ơn bạn đã đánh giá.</p>
    {notice && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    <ul className="mt-4 divide-y divide-slate-100">{products.map(product => <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
      <p className="min-w-0 text-sm font-medium text-secondary">{product.name}</p>
      {!reviewedIds.includes(String(product.id)) && <button type="button" onClick={() => setTarget(product)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-primary hover:bg-rose-50"><FiEdit2 aria-hidden="true" />Viết đánh giá</button>}
    </li>)}</ul>
    {target && <ReviewEditor key={target.id} product={target} orderId={order._id} onClose={() => setTarget(null)} onSaved={() => { setReviewedIds(current => [...current, String(target.id)]); setNotice('Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ trải nghiệm!') }} />}
  </section>
}

export default OrderReviews
