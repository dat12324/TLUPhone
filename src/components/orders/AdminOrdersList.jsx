import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiClock, FiEye, FiPackage, FiSearch, FiShoppingCart, FiTruck, FiXCircle } from 'react-icons/fi'
import StatCard from '../admin/dashboard/StatCard'
import { formatVnd } from '../../helpers/checkout'

const statuses = {
  pending: ['Chờ xác nhận', 'bg-amber-50 text-amber-700', FiClock],
  confirmed: ['Đã xác nhận', 'bg-indigo-50 text-indigo-700', FiCheckCircle],
  shipping: ['Đang giao', 'bg-blue-50 text-blue-700', FiTruck],
  delivered: ['Đã giao', 'bg-emerald-50 text-emerald-700', FiCheckCircle],
  cancelled: ['Đã hủy', 'bg-red-50 text-red-700', FiXCircle],
}
const paymentStatuses = {
  unpaid: ['Chưa thanh toán', 'bg-amber-50 text-amber-700', FiClock],
  pending: ['Chờ thanh toán', 'bg-amber-50 text-amber-700', FiClock],
  paid: ['Đã thanh toán', 'bg-emerald-50 text-emerald-700', FiCheckCircle],
  failed: ['Thanh toán thất bại', 'bg-red-50 text-red-700', FiXCircle],
  refunded: ['Đã hoàn tiền', 'bg-slate-100 text-slate-600', FiCheckCircle],
}
const control = 'min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-40'
const Badge = ({ value, options }) => {
  const [label, tone, Icon] = options[value] || [value, 'bg-slate-100 text-slate-600', FiClock]
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${tone}`}><Icon aria-hidden="true" />{label}</span>
}

export default function AdminOrdersList({ orders, pagination, page, search, status, paymentMethod, loading, error, busy, onFilterChange, onPageChange, onRetry, onDetail }) {
  const totalPages = Math.max(1, pagination.totalPages || 0)
  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pages = Array.from({length:Math.min(5,totalPages)}, (_,index) => startPage + index)
  const counts = orders.reduce((result, order) => ({...result,[order.status]:(result[order.status] || 0) + 1}), {})
  const unavailable = loading || Boolean(error)
  return <div className="space-y-5">
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-secondary">Quản lý đơn hàng</h1>
      <p className="mt-1.5 text-sm text-slate-500">Theo dõi và xử lý các đơn hàng của cửa hàng.</p>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard icon={FiShoppingCart} label="Tổng đơn phù hợp" value={unavailable ? '—' : pagination.total} note="Theo bộ lọc hiện tại" />
      {[
        ['pending',FiClock,'amber'], ['shipping',FiTruck,'blue'], ['delivered',FiCheckCircle,'emerald'], ['cancelled',FiXCircle,'rose'],
      ].map(([key,icon,tone]) => <StatCard key={key} icon={icon} tone={tone} label={statuses[key][0]} value={unavailable ? '—' : counts[key] || 0} note="Trên trang hiện tại" />)}
    </div>
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row">
      <div className="relative min-w-0 flex-1">
        <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input aria-label="Tìm mã đơn hàng" value={search} onChange={event => onFilterChange('search',event.target.value)} placeholder="Tìm theo mã đơn hàng…" className={`${control} w-full pl-10`} />
      </div>
      <select aria-label="Lọc trạng thái đơn hàng" value={status} onChange={event => onFilterChange('status',event.target.value)} className={control}>
        <option value="">Tất cả trạng thái</option>{Object.entries(statuses).map(([key,[label]]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <select aria-label="Lọc phương thức thanh toán" value={paymentMethod} onChange={event => onFilterChange('paymentMethod',event.target.value)} className={control}>
        <option value="">Tất cả thanh toán</option><option value="COD">COD</option><option value="VNPAY">VNPay</option>
      </select>
    </div>
    <section aria-label="Danh sách đơn hàng" aria-busy={loading} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {loading ? <p role="status" className="p-12 text-center text-sm text-slate-500">Đang tải đơn hàng…</p> : error ? <div role="alert" className="p-8 text-center text-sm text-red-600"><p>{error}</p><button type="button" onClick={onRetry} className={`${control} mt-4`}>Thử lại</button></div> : orders.length ? <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr>{['#','Mã đơn hàng','Khách hàng','Ngày đặt','Tổng tiền','Thanh toán','Trạng thái thanh toán','Trạng thái đơn hàng','Thao tác'].map(label => <th scope="col" key={label} className="whitespace-nowrap px-4 py-4 font-semibold">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{orders.map((order,index) => <tr key={order._id} className="transition hover:bg-slate-50/70">
            <td className="px-4 py-4 text-xs text-slate-400">{(page-1)*10+index+1}</td>
            <td className="min-w-40 max-w-64 break-all px-4 py-4 font-semibold text-secondary">{order.orderCode}</td>
            <td className="min-w-36 px-4 py-4"><p className="font-medium text-secondary">{order.shippingAddress?.fullName}</p><p className="mt-1 text-xs text-slate-500">{order.shippingAddress?.phone}</p></td>
            <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">{new Date(order.createdAt).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'})}</td>
            <td className="whitespace-nowrap px-4 py-4 font-semibold tabular-nums text-secondary">{formatVnd(order.totalAmount)}</td>
            <td className="px-4 py-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${order.paymentMethod === 'VNPAY' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{order.paymentMethod}</span></td>
            <td className="px-4 py-4"><Badge value={order.paymentStatus} options={paymentStatuses} /></td>
            <td className="px-4 py-4"><Badge value={order.status} options={statuses} /></td>
            <td className="px-4 py-4"><button type="button" disabled={busy} onClick={() => onDetail(order._id)} aria-label={`Chi tiết đơn ${order.orderCode}`} className={`${control} inline-flex items-center gap-2 hover:border-primary hover:text-primary`}>Chi tiết<FiEye aria-hidden="true" /></button></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="p-12 text-center"><FiPackage aria-hidden="true" className="mx-auto mb-3 text-3xl text-slate-400" /><p className="font-semibold text-secondary">Không có đơn hàng phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử đổi mã đơn hoặc bộ lọc.</p></div>}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-4 py-4 text-xs text-slate-500">
        <p>{unavailable ? 'Đang cập nhật kết quả' : `Hiển thị ${orders.length ? (page-1)*10+1 : 0}–${orders.length ? (page-1)*10+orders.length : 0} trên ${pagination.total} đơn hàng`}</p>
        <nav aria-label="Phân trang đơn hàng" className="flex flex-wrap items-center gap-1.5">
          <button type="button" aria-label="Trang trước" disabled={loading || busy || page <= 1} onClick={() => onPageChange(page-1)} className={`${control} flex w-11 items-center justify-center px-0`}><FiChevronLeft aria-hidden="true" /></button>
          {pages.map(number => <button type="button" key={number} aria-label={`Trang ${number}`} aria-current={page === number ? 'page' : undefined} disabled={loading || busy} onClick={() => onPageChange(number)} className={`${control} w-11 px-0 font-semibold ${page === number ? '!border-primary !bg-primary !text-white' : 'hover:bg-slate-50'}`}>{number}</button>)}
          <button type="button" aria-label="Trang sau" disabled={loading || busy || page >= totalPages} onClick={() => onPageChange(page+1)} className={`${control} flex w-11 items-center justify-center px-0`}><FiChevronRight aria-hidden="true" /></button>
        </nav>
      </footer>
    </section>
  </div>
}
