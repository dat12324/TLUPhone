import { FiChevronDown } from 'react-icons/fi'
import ProductCard from '../ProductCard'

const ProductsResults = ({ products, isLoading, isLoadingMore, error, remaining, onRetry, onLoadMore, onClear }) => {
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" aria-label="Đang tải sản phẩm">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    )
  }
  if (error && products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-3 text-base text-rose-600">{error}</p>
        <button type="button" onClick={onRetry} className="text-sm font-semibold text-primary hover:underline">
          Thử tải lại
        </button>
      </div>
    )
  }
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm phù hợp</p>
        <button onClick={onClear} className="text-primary text-sm font-medium hover:underline">
          Xóa bộ lọc và thử lại
        </button>
      </div>
    )
  }
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {products.map(product => <ProductCard key={product.databaseId} product={product} />)}
      </div>
      {error && (
        <div className="mt-6 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button type="button" onClick={onLoadMore} className="mt-2 text-sm font-semibold text-primary hover:underline">
            Thử tải tiếp
          </button>
        </div>
      )}
      {remaining > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex min-w-64 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-7 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100 active:scale-95 disabled:cursor-wait disabled:opacity-60"
          >
            <span>{isLoadingMore ? 'Đang tải...' : `Xem thêm ${remaining} sản phẩm`}</span>
            <FiChevronDown />
          </button>
        </div>
      )}
    </>
  )
}

export default ProductsResults
