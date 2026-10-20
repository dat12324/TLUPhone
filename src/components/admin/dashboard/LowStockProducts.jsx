import { FiAlertTriangle, FiArrowUpRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const LowStockProducts = ({ products, threshold }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="low-stock-title">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 id="low-stock-title" className="flex items-center gap-2 text-lg font-bold text-secondary">
          <FiAlertTriangle className="text-amber-600" aria-hidden="true" />
          Cảnh báo tồn kho
        </h2>
        <p className="mt-1 text-sm text-slate-500">SKU đang bán còn dưới {threshold} sản phẩm</p>
      </div>
      <Link to="/admin/products" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Sản phẩm <FiArrowUpRight aria-hidden="true" />
      </Link>
    </div>

    {products.length === 0 ? (
      <p className="py-10 text-center text-sm text-slate-500">Không có SKU nào sắp hết hàng.</p>
    ) : (
      <ul className="divide-y divide-slate-100">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <img src={product.image} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 bg-white object-contain p-1" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-secondary">{product.productName}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{product.label}</p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
              Còn {product.stock}
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
)

export default LowStockProducts
