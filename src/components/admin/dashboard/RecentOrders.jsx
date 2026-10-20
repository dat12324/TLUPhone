import { FiArrowUpRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatAdminDate, formatVnd } from '../../../utils/adminFormatters'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-200',
  shipping: 'bg-violet-50 text-violet-700 ring-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const RecentOrders = ({ orders }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="recent-orders-title">
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>
        <h2 id="recent-orders-title" className="text-lg font-bold text-secondary">Đơn hàng gần đây</h2>
        <p className="mt-1 text-sm text-slate-500">5 đơn mới nhất trong khoảng đã chọn</p>
      </div>
      <Link to="/admin/orders" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Xem tất cả <FiArrowUpRight aria-hidden="true" />
      </Link>
    </div>

    {orders.length === 0 ? (
      <p className="px-6 py-12 text-center text-sm text-slate-500">Chưa có đơn hàng trong khoảng thời gian này.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">Mã đơn</th>
              <th className="px-4 py-3 font-semibold">Khách hàng</th>
              <th className="px-4 py-3 font-semibold">Ngày đặt</th>
              <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
              <th className="px-6 py-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4 font-bold text-secondary">{order.code}</td>
                <td className="px-4 py-4 font-medium text-slate-700">{order.customerName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-500">{formatAdminDate(order.createdAt)}</td>
                <td className="px-4 py-4 text-right font-semibold whitespace-nowrap text-secondary">{formatVnd(order.total)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[order.status]}`}>
                    {order.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)

export default RecentOrders
