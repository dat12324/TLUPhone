import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../ProductCard'
import products, { brands } from '../../data/products'
import { FiChevronRight } from 'react-icons/fi'

const BrandTabsSection = () => {
  const availableBrands = useMemo(() => {
    return brands.length > 0 ? brands : ['Apple', 'Samsung', 'Xiaomi', 'OPPO']
  }, [])

  const [activeBrand, setActiveBrand] = useState(availableBrands[0] || 'Apple')

  const brandProducts = useMemo(() => {
    return products.filter((p) => p.brand === activeBrand).slice(0, 8)
  }, [activeBrand])

  return (
    <div className="my-10 bg-white rounded-2xl border border-gray-100 p-5 md:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-secondary">
            Sản phẩm theo hãng
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Khám phá bộ sưu tập smartphone theo từng thương hiệu yêu thích
          </p>
        </div>

        {/* Brand Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {availableBrands.map((brand) => {
            const isActive = activeBrand === brand
            return (
              <button
                key={brand}
                type="button"
                onClick={() => setActiveBrand(brand)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200 hover:text-secondary'
                }`}
              >
                {brand}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid sản phẩm */}
      {brandProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brandProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          Đang cập nhật sản phẩm cho thương hiệu {activeBrand}...
        </div>
      )}

      {/* Xem tất cả máy thuộc hãng */}
      <div className="text-center mt-6 pt-4 border-t border-gray-100">
        <Link
          to={`/products?brand=${encodeURIComponent(activeBrand)}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-rose-700 transition-colors"
        >
          <span>Xem tất cả điện thoại {activeBrand}</span>
          <FiChevronRight className="text-base" />
        </Link>
      </div>
    </div>
  )
}

export default BrandTabsSection
