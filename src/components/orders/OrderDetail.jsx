import { FiCheck, FiPhone, FiShoppingBag, FiTruck, FiX } from 'react-icons/fi'
import { formatVnd } from '../../helpers/checkout'
import { formatSkuCapacity } from '../../utils/adminFormatters'

const steps = [
  ['pending', 'Đặt hàng thành công'],
  ['confirmed', 'Đã xác nhận đơn hàng'],
  ['shipping', 'Đang giao hàng'],
  ['delivered', 'Giao hàng thành công'],
]
const statusLabels = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' }
const paymentLabels = { unpaid: 'Chưa thanh toán', pending: 'Chờ thanh toán', paid: 'Đã thanh toán', failed: 'Thanh toán thất bại', refunded: 'Đã hoàn tiền' }
const placeholder = '/images/products/placeholder.svg'
const dateTime = value => value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : ''
const panel = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'

const InfoRow = ({ label, children, emphasis = false }) => (
  <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3.5 last:border-0">
    <dt className="shrink-0 text-slate-500">{label}</dt>
    <dd className={`min-w-0 break-words text-right ${emphasis ? 'font-bold text-primary' : 'font-medium text-secondary'}`}>{children}</dd>
  </div>
)

export default function OrderDetail({ order }) {
  const cancelled = order.status === 'cancelled'
  const currentStep = steps.findIndex(([status]) => status === order.status)
  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const address = order.shippingAddress || {}
  const badge = cancelled ? 'bg-red-50 text-red-700' : order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'

  return <div className="space-y-4 text-sm">
    <section className={panel} aria-labelledby="order-overview">
      <h2 id="order-overview" className="mb-4 text-base font-bold text-secondary">Tổng quan đơn hàng</h2>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 pb-4 text-slate-500">
        <p className="min-w-0">Đơn hàng: <strong className="break-all text-secondary">{order.orderCode}</strong></p>
        <p>Ngày đặt: <span className="font-medium text-secondary">{dateTime(order.createdAt)}</span></p>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${badge}`}>{statusLabels[order.status] || order.status}</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {order.items.map(item => {
          const capacity = [item.ram, item.storage].filter(value => value != null && value !== '').map(formatSkuCapacity).join(' / ')
          return <li key={item.productVariant} className="flex items-start gap-4 py-4 last:pb-0">
            <img src={item.imageUrl || placeholder} alt={item.productName} onError={event => { if (!event.currentTarget.src.endsWith(placeholder)) event.currentTarget.src = placeholder }} className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 bg-white object-contain p-1 sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-6 text-secondary">{item.productName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {capacity && <span>{capacity}</span>}
                {item.color && <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{item.color}</span>}
              </div>
              <p className="mt-2 font-medium text-secondary">{formatVnd(item.unitPrice)}<span className="ml-2 text-xs font-normal text-slate-500">/ sản phẩm</span></p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500">Số lượng: <strong className="text-secondary">{item.quantity}</strong></p>
              <p className="mt-2 font-semibold text-primary">{formatVnd(item.subtotal)}</p>
            </div>
          </li>
        })}
      </ul>
    </section>

    <section className={panel} aria-labelledby="order-progress">
      <h2 id="order-progress" className="mb-5 text-base font-bold text-secondary">Tiến trình đơn hàng</h2>
      {cancelled ? <div role="status" className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700">
        <FiX aria-hidden="true" className="mt-0.5 shrink-0 text-lg" />
        <div><p className="font-semibold">Đơn hàng đã được hủy</p>{order.cancelledAt && <p className="mt-1 text-xs">{dateTime(order.cancelledAt)}</p>}{order.cancelReason && <p className="mt-2 leading-6">{order.cancelReason}</p>}</div>
      </div> : <ol className="grid gap-5 sm:grid-cols-4 sm:gap-0">
        {steps.map(([status, label], index) => {
          const reached = index <= currentStep
          const timestamp = status === 'pending' ? order.createdAt : status === 'delivered' ? order.deliveredAt : null
          return <li key={status} aria-current={index === currentStep ? 'step' : undefined} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:px-2 sm:text-center">
            {index < steps.length - 1 && <span aria-hidden="true" className={`absolute left-3 top-6 h-[calc(100%+1.25rem)] w-px sm:left-1/2 sm:top-3 sm:h-px sm:w-full ${index < currentStep ? 'bg-primary' : 'bg-slate-200'}`} />}
            <span aria-hidden="true" className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${reached ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>{reached ? <FiCheck className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span>
            <div className="sm:mt-3"><p className={`leading-5 ${reached ? 'font-semibold text-secondary' : 'text-slate-500'}`}>{label}</p>{reached && timestamp && <p className="mt-1 text-xs text-slate-500">{dateTime(timestamp)}</p>}</div>
          </li>
        })}
      </ol>}
    </section>

    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <section className={panel}>
          <h2 className="mb-2 text-base font-bold text-secondary">Thông tin khách hàng</h2>
          <dl>
            <InfoRow label="Họ và tên">{address.fullName}</InfoRow>
            <InfoRow label="Số điện thoại">{address.phone}</InfoRow>
            <InfoRow label="Địa chỉ">{[address.detailAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}</InfoRow>
            <InfoRow label="Ghi chú">{order.note || 'Không có'}</InfoRow>
          </dl>
        </section>
        <section className={panel}>
          <h2 className="mb-3 text-base font-bold text-secondary">Cần hỗ trợ đơn hàng?</h2>
          <p className="leading-6 text-slate-500">Vui lòng cung cấp mã đơn hàng khi liên hệ để được hỗ trợ nhanh hơn.</p>
          <a href="tel:19001234" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 font-semibold text-secondary transition hover:border-primary hover:text-primary"><FiPhone aria-hidden="true" />1900 1234</a>
        </section>
      </div>
      <section className={panel}>
        <h2 className="mb-4 text-base font-bold text-secondary">Thông tin thanh toán</h2>
        <h3 className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 font-semibold text-secondary"><FiShoppingBag aria-hidden="true" />Sản phẩm</h3>
        <dl className="px-1">
          <InfoRow label="Số lượng sản phẩm">{quantity}</InfoRow>
          <InfoRow label="Tổng tiền hàng">{formatVnd(order.subtotal)}</InfoRow>
          <InfoRow label="Giảm giá">{order.discountAmount > 0 ? `−${formatVnd(order.discountAmount)}` : formatVnd(0)}</InfoRow>
          <InfoRow label="Phí vận chuyển">{order.shippingFee === 0 ? 'Miễn phí' : formatVnd(order.shippingFee)}</InfoRow>
        </dl>
        <h3 className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 font-semibold text-secondary"><FiTruck aria-hidden="true" />Thanh toán</h3>
        <dl className="px-1">
          <InfoRow label="Phương thức">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}</InfoRow>
          <InfoRow label="Trạng thái">{paymentLabels[order.paymentStatus] || order.paymentStatus}</InfoRow>
          <InfoRow label="Tổng thanh toán" emphasis>{formatVnd(order.totalAmount)}</InfoRow>
        </dl>
        {order.paymentMethod === 'COD' && order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">Bạn sẽ thanh toán khi nhận hàng.</p>}
      </section>
    </div>
  </div>
}
