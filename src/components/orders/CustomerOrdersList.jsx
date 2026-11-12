import { Link } from 'react-router-dom'
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiClock, FiLogOut, FiPackage, FiSearch, FiTruck, FiUser, FiX, FiXCircle } from 'react-icons/fi'
import { formatVnd } from '../../helpers/checkout'
import { formatSkuCapacity } from '../../utils/adminFormatters'

const states = {
  pending: ['Chờ xác nhận', 'bg-amber-50 text-amber-700', FiClock],
  confirmed: ['Đã xác nhận', 'bg-blue-50 text-blue-700', FiCheckCircle],
  shipping: ['Đang giao', 'bg-blue-50 text-blue-700', FiTruck],
  delivered: ['Đã giao', 'bg-emerald-50 text-emerald-700', FiTruck],
  cancelled: ['Đã hủy', 'bg-red-50 text-red-700', FiXCircle],
}
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-secondary transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
const placeholder = '/images/products/placeholder.svg'

export default function CustomerOrdersList({user, orders, pagination, page, search, status, loading, error, busy, onSearch, onStatus, onPage, onRetry, onDetail, onCancel, onLogout, notice, actionError}) {
  const totalPages = Math.max(1,pagination.totalPages || 0)
  const startPage = Math.max(1,Math.min(page-2,totalPages-4))
  const pages = Array.from({length:Math.min(5,totalPages)},(_,index)=>startPage+index)
  return <div className="space-y-5">
    <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><Link to="/" className="hover:text-primary">Trang chủ</Link><span>/</span><Link to="/profile" className="hover:text-primary">Tài khoản</Link><span>/</span><span className="text-secondary">Lịch sử mua hàng</span></nav>
    <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
      <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-28">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xl font-bold text-primary" aria-hidden="true">{user?.fullName?.trim().slice(0,1).toUpperCase() || <FiUser />}</span>
          <div className="min-w-0"><p className="truncate text-sm font-bold text-secondary">{user?.fullName}</p><p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p></div>
        </div>
        <nav aria-label="Menu tài khoản" className="grid gap-1 p-3 sm:grid-cols-3 lg:grid-cols-1">
          <Link to="/profile" className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-50"><FiUser aria-hidden="true" />Thông tin tài khoản</Link>
          <Link to="/orders" aria-current="page" className="flex min-h-11 items-center gap-3 rounded-xl bg-rose-50 px-3 py-3 text-sm font-semibold text-primary"><FiPackage aria-hidden="true" />Lịch sử mua hàng</Link>
          <button type="button" onClick={onLogout} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 lg:mt-3 lg:border-t lg:border-slate-100"><FiLogOut aria-hidden="true" />Đăng xuất</button>
        </nav>
      </aside>

      <div className="min-w-0 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-secondary">Lịch sử mua hàng</h1>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1"><FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Tìm theo mã đơn hàng" value={search} onChange={event=>onSearch(event.target.value)} placeholder="Tìm theo mã đơn hàng…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
          <select aria-label="Lọc trạng thái đơn hàng" value={status} onChange={event=>onStatus(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="">Tất cả trạng thái</option>{Object.entries(states).map(([key,[label]])=><option key={key} value={key}>{label}</option>)}</select>
        </div>
        {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
        {actionError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}
        {loading ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Đang tải đơn hàng…</p> : error ? <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><button type="button" onClick={onRetry} className={`${button} mt-3`}>Thử lại</button></div> : orders.length ? <>
          <div className="space-y-4">{orders.map(order=>{
            const [label,tone,Icon]=states[order.status] || [order.status,'bg-slate-100 text-slate-600',FiClock]
            return <article key={order._id} aria-label={`Đơn hàng ${order.orderCode}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1"><h2 className="break-all text-sm font-bold text-secondary">{order.orderCode}</h2><p className="text-xs text-slate-500">Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'})}</p></div>
                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}><Icon aria-hidden="true" />{label}</span>
              </header>
              <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto]">
                <ul className="min-w-0 space-y-3">{order.items.map(item=><li key={item.productVariant} className="flex items-start gap-3">
                  <img src={item.imageUrl || placeholder} alt={item.productName} onError={event=>{if(!event.currentTarget.src.endsWith(placeholder))event.currentTarget.src=placeholder}} className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 bg-white object-contain p-1" />
                  <div className="min-w-0 pt-1"><p className="text-sm font-semibold leading-6 text-secondary">{item.productName}</p><p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">{[item.ram,item.storage].filter(value=>value!=null&&value!=='').length>0 && <span>{[item.ram,item.storage].filter(value=>value!=null&&value!=='').map(formatSkuCapacity).join(' / ')}</span>}{item.color && <span>{item.color}</span>}<span>Số lượng: {item.quantity}</span></p></div>
                </li>)}</ul>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 xl:justify-end xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                  <div><p className="text-xs text-slate-500">Tổng tiền:</p><p className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums text-primary">{formatVnd(order.totalAmount)}</p></div>
                  <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>onDetail(order._id)} className={button}>Xem chi tiết</button>{['pending','confirmed'].includes(order.status) && <button type="button" disabled={busy} onClick={()=>onCancel(order)} aria-label={`Hủy đơn ${order.orderCode}`} className={`${button} border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50`}><FiX aria-hidden="true" />Hủy đơn</button>}</div>
                </div>
              </div>
            </article>
          })}</div>
          <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500"><p>Hiển thị {(page-1)*10+1}–{(page-1)*10+orders.length} trên {pagination.total} đơn hàng</p><nav aria-label="Phân trang lịch sử mua hàng" className="flex gap-1.5"><button type="button" disabled={busy||page<=1} onClick={()=>onPage(page-1)} aria-label="Trang trước" className={button}><FiChevronLeft aria-hidden="true" /></button>{pages.map(number=><button type="button" key={number} disabled={busy} onClick={()=>onPage(number)} aria-current={number===page?'page':undefined} aria-label={`Trang ${number}`} className={`${button} w-11 px-0 ${number===page?'!border-primary !bg-primary !text-white':''}`}>{number}</button>)}<button type="button" disabled={busy||page>=totalPages} onClick={()=>onPage(page+1)} aria-label="Trang sau" className={button}><FiChevronRight aria-hidden="true" /></button></nav></footer>
        </> : <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><FiPackage aria-hidden="true" className="mx-auto mb-3 text-3xl text-slate-400" /><h2 className="font-semibold text-secondary">Không có đơn hàng phù hợp</h2><Link to="/products" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary">Tiếp tục mua sắm</Link></div>}
      </div>
    </div>
  </div>
}
