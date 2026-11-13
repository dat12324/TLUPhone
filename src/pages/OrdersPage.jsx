import OrderReviews from '../components/orders/OrderReviews'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext'
import SideDrawer from '../components/common/SideDrawer'
import OrderDetail from '../components/orders/OrderDetail'
import AdminOrdersList from '../components/orders/AdminOrdersList'
import CustomerOrdersList from '../components/orders/CustomerOrdersList'
import CancelOrderModal from '../components/orders/CancelOrderModal'

const labels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' }
const nextStatuses = { pending: ['confirmed', 'cancelled'], confirmed: ['shipping', 'cancelled'], shipping: ['delivered'] }
const buttonClass = 'min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40'

const OrdersPage = ({ admin = false }) => {
  const { user, isAuthenticated, authLoading, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const action = useRef(false)
  const detailRequest = useRef(null)
  const userId = user?._id || user?.id
  const [searchParams] = useSearchParams()
  const notificationOrderId = searchParams.get('orderId')

  useEffect(() => {
    setDetail(null)
    setCancelTarget(null)
    setNotice('')
    return () => detailRequest.current?.abort()
  }, [userId])

  useEffect(() => {
    if (authLoading || !isAuthenticated || (admin && user?.role !== 'admin')) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/orders', { params: { page, limit: 10, status: status || undefined, paymentMethod: paymentMethod || undefined, search: search.trim() || undefined }, signal: controller.signal })
        if (!controller.signal.aborted) { setOrders(data.data); setPagination(data.pagination) }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [authLoading, isAuthenticated, userId, admin, user?.role, page, status, search, paymentMethod, reload])

  const openDetail = async id => {
    detailRequest.current?.abort()
    const controller = new AbortController()
    detailRequest.current = controller
    setActionError('')
    try {
      const { data } = await api.get(`/orders/${id}`, { signal: controller.signal })
      if (!controller.signal.aborted) setDetail(data.data)
    } catch (failure) { if (!controller.signal.aborted) setActionError(failure.message) }
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated || !notificationOrderId) return
    openDetail(notificationOrderId)
    return () => detailRequest.current?.abort()
  }, [authLoading, isAuthenticated, userId, notificationOrderId])

  const changeStatus = async (order, target, cancelReason) => {
    if (action.current) return
    if (admin && !window.confirm(target === 'cancelled' ? 'Bạn muốn hủy đơn hàng này?' : `Chuyển đơn hàng sang "${labels[target]}"?`)) return
    action.current = true
    setBusy(true)
    setActionError('')
    try {
      const { data } = admin
        ? await api.patch(`/orders/${order._id}/status`, { status: target })
        : await api.patch(`/orders/${order._id}/cancel`, { ...(cancelReason ? { cancelReason } : {}) })
      if (!data.data) throw new Error('Đơn hàng đã thay đổi. Vui lòng tải lại.')
      setDetail(current => current?._id === order._id ? data.data : current)
      setCancelTarget(null)
      setNotice('Đã cập nhật đơn hàng.')
      setReload(value => value + 1)
    } catch (failure) {
      // Trong modal khách hàng: re-throw để modal tự hiển thị lỗi
      if (!admin) throw failure
      setActionError(failure.message)
    }
    finally { action.current = false; setBusy(false) }
  }

  if (authLoading) return <p className="p-8 text-center text-slate-500">Đang tải tài khoản…</p>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: { pathname: '/orders' } }} />
  if (admin && user?.role !== 'admin') return <Navigate to="/" replace />

  if (detail && !admin) return <div className="min-h-[70vh] bg-slate-100/70 py-6 sm:py-8">
    <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" disabled={busy} onClick={() => { detailRequest.current?.abort(); setDetail(null); setActionError('') }} className="mb-2 inline-flex min-h-10 items-center gap-2 text-sm text-slate-600 transition hover:text-primary disabled:opacity-40"><FiArrowLeft aria-hidden="true" />Lịch sử mua hàng</button>
          <h1 className="text-2xl font-bold text-secondary">Chi tiết đơn hàng</h1>
        </div>
        {['pending', 'confirmed'].includes(detail.status) && <button type="button" disabled={busy} onClick={() => setCancelTarget(detail)} className={`${buttonClass} text-red-600 hover:border-red-300 hover:bg-red-50`}>{busy ? 'Đang xử lý…' : 'Hủy đơn hàng'}</button>}
      </header>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
      {actionError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{actionError}</p>}
      <OrderDetail order={detail} />
      {user?.role === 'user' && <OrderReviews key={detail._id} order={detail} />}
    </div>
    {cancelTarget && <CancelOrderModal order={cancelTarget} busy={busy} onClose={() => setCancelTarget(null)} onConfirm={(order, reason) => changeStatus(order, 'cancelled', reason)} />}
  </div>

  return <div className={admin ? 'space-y-6' : 'container mx-auto min-h-[70vh] space-y-6 px-4 py-8'}>
    {admin ? <>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
      {actionError && !detail && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{actionError}</p>}
      <AdminOrdersList orders={orders} pagination={pagination} page={page} search={search} status={status} paymentMethod={paymentMethod} loading={loading} error={error} busy={busy}
        onFilterChange={(name,value) => { if (name === 'search') setSearch(value); else if (name === 'status') setStatus(value); else setPaymentMethod(value); setPage(1) }}
        onPageChange={setPage} onRetry={() => setReload(value => value + 1)} onDetail={openDetail} />
    </> : <CustomerOrdersList user={user} orders={orders} pagination={pagination} page={page} search={search} status={status} loading={loading} error={error} busy={busy} notice={notice} actionError={actionError}
      onSearch={value=>{setSearch(value);setPage(1)}} onStatus={value=>{setStatus(value);setPage(1)}} onPage={setPage}
      onRetry={()=>setReload(value=>value+1)} onDetail={openDetail} onCancel={order=>setCancelTarget(order)} onLogout={logout} />}
    {detail && <SideDrawer title="Chi tiết đơn hàng" busy={busy} onClose={() => { detailRequest.current?.abort(); setDetail(null); setActionError('') }}>
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
        <OrderDetail order={detail} />
        {actionError && <p role="alert" className="mt-4 text-sm text-red-600">{actionError}</p>}
      </div>
      <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-5">{(admin ? nextStatuses[detail.status] || [] : ['pending', 'confirmed'].includes(detail.status) ? ['cancelled'] : []).map(target => <button key={target} type="button" disabled={busy} onClick={() => admin ? changeStatus(detail, target) : setCancelTarget(detail)} className={`${buttonClass} ${target === 'cancelled' ? 'text-red-600' : 'text-primary'}`}>{busy ? 'Đang xử lý…' : target === 'cancelled' ? 'Hủy đơn hàng' : labels[target]}</button>)}</footer>
    </SideDrawer>}
    {cancelTarget && <CancelOrderModal order={cancelTarget} busy={busy} onClose={() => setCancelTarget(null)} onConfirm={(order, reason) => changeStatus(order, 'cancelled', reason)} />}
  </div>
}

export default OrdersPage
