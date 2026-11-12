import { FiCheckCircle } from 'react-icons/fi'
import { formatVnd } from '../../helpers/checkout'

const OrderSuccessModal = ({ submittedOrder, cleanupWarning, busy, onViewOrders, onContinueShopping }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600"><FiCheckCircle /></span>
      <h2 className="mt-4 text-2xl font-extrabold text-secondary">Đặt hàng thành công</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">Đơn hàng của bạn đã được ghi nhận. Bạn có thể theo dõi trong lịch sử mua hàng.</p>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm">
        <div className="flex justify-between gap-4"><span className="text-gray-500">Mã tham chiếu</span><strong className="text-secondary">{submittedOrder.orderCode}</strong></div>
        <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Số lượng sản phẩm</span><strong className="text-secondary">{submittedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
        <div className="mt-2 flex justify-between gap-4"><span className="text-gray-500">Tổng thanh toán</span><strong className="text-primary">{formatVnd(submittedOrder.totalAmount)}</strong></div>
      </div>
      {cleanupWarning && <p role="status" className="mt-3 text-sm text-amber-700">{cleanupWarning}</p>}
      <button type="button" onClick={onViewOrders} className="mt-4 w-full rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold">Xem đơn hàng</button>
      <button type="button" disabled={busy} onClick={onContinueShopping} className="mt-5 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700">Tiếp tục mua sắm</button>
    </div>
  </div>
)

export default OrderSuccessModal
