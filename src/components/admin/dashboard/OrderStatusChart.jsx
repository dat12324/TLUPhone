const STATUS_STYLES = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  shipping: 'bg-violet-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-slate-400',
}

const OrderStatusChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="order-status-title">
      <div className="mb-5">
        <h2 id="order-status-title" className="text-lg font-bold text-secondary">Trạng thái đơn hàng</h2>
        <p className="mt-1 text-sm text-slate-500">{total} đơn trong khoảng đã chọn</p>
      </div>
      <div className="space-y-4">
        {data.map((item) => {
          const percentage = total ? (item.count / total) * 100 : 0
          return (
            <div key={item.status}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[item.status]}`} aria-hidden="true" />
                  {item.label}
                </span>
                <strong className="text-secondary">{item.count}</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={item.label} aria-valuenow={item.count} aria-valuemin="0" aria-valuemax={total || 1}>
                <div className={`h-full rounded-full ${STATUS_STYLES[item.status]}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default OrderStatusChart
