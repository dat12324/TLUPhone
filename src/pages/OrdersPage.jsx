import { Link } from 'react-router-dom'
import { FiPackage } from 'react-icons/fi'

const OrdersPage = () => (
  <div className="min-h-[70vh] bg-slate-50 px-4 py-16">
    <div className="mx-auto max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-3xl text-primary">
        <FiPackage />
      </span>
      <h1 className="text-2xl font-bold text-secondary">Chưa có đơn hàng</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        Các đơn hàng của bạn sẽ được hiển thị tại đây sau khi đặt hàng thành công.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-rose-700 active:scale-95"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  </div>
)

export default OrdersPage
