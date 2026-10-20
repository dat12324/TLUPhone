import { formatVnd } from '../../../utils/adminFormatters'

const TopProducts = ({ products }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="top-products-title">
    <div className="mb-5">
      <h2 id="top-products-title" className="text-lg font-bold text-secondary">Sản phẩm bán chạy</h2>
      <p className="mt-1 text-sm text-slate-500">Tính từ đơn hàng đã hoàn thành</p>
    </div>

    {products.length === 0 ? (
      <p className="py-10 text-center text-sm text-slate-500">Chưa có sản phẩm đã bán trong kỳ.</p>
    ) : (
      <ol className="divide-y divide-slate-100">
        {products.map((product, index) => (
          <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="w-5 shrink-0 text-center text-xs font-bold text-slate-400">{index + 1}</span>
            <img src={product.image} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 bg-white object-contain p-1" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-secondary">{product.name}</p>
              <p className="mt-1 text-xs text-slate-500">Đã bán {product.quantity} sản phẩm</p>
            </div>
            <strong className="shrink-0 text-right text-xs text-slate-700 sm:text-sm">{formatVnd(product.revenue)}</strong>
          </li>
        ))}
      </ol>
    )}
  </section>
)

export default TopProducts
