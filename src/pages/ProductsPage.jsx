import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiStar,
  FiTag,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import products, { brands, priceRanges } from '../data/products'
import { filterAndSortProducts } from '../helpers/productFilters'

const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
]

// 5 rows on the desktop product grid (5 columns x 5 rows).
const PRODUCTS_PER_LOAD = 25

const formatBrandName = (brand) =>
  brand ? `${brand.charAt(0).toUpperCase()}${brand.slice(1)}` : brand

const ProductsPage = () => {
  const [searchParams] = useSearchParams()
  const brandQuery = searchParams.get('brand')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrands, setSelectedBrands] = useState(brandQuery ? [brandQuery] : [])
  const [selectedPriceRange, setSelectedPriceRange] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD)
  const hasMounted = useRef(false)

  // Đồng bộ hãng khi URL thay đổi
  useEffect(() => {
    if (brandQuery) {
      setSelectedBrands([brandQuery])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [brandQuery])

  // Xử lý chọn/bỏ chọn hãng
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    )
  }

  // Xử lý chọn khoảng giá
  const togglePriceRange = (index) => {
    setSelectedPriceRange((prev) => (prev === index ? null : index))
  }

  // Xóa tất cả bộ lọc
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrands([])
    setSelectedPriceRange(null)
    setSortBy('default')
  }

  // Kiểm tra có filter nào đang active không
  const hasActiveFilters =
    searchQuery || selectedBrands.length > 0 || selectedPriceRange !== null

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts({
      products,
      searchQuery,
      selectedBrands,
      selectedPriceRange,
      priceRanges,
      sortBy,
    })
  }, [searchQuery, selectedBrands, selectedPriceRange, sortBy])

  // Start again from four rows whenever search, filters, or sorting changes.
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_LOAD)
  }, [searchQuery, selectedBrands, selectedPriceRange, sortBy])

  useEffect(() => {
    if (
      hasMounted.current &&
      filteredProducts.length < 8 &&
      (selectedBrands.length > 0 || selectedPriceRange !== null)
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    hasMounted.current = true
  }, [selectedBrands, selectedPriceRange, filteredProducts.length])

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const remainingProducts = filteredProducts.length - visibleProducts.length

  // Component bộ lọc (dùng chung cho desktop sidebar & mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Lọc theo hãng */}
      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">
          Hãng sản xuất
        </h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 text-primary border-gray-300 rounded 
                           focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-secondary transition-colors">
                {formatBrandName(brand)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Lọc theo khoảng giá */}
      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">
          Khoảng giá
        </h3>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label
              key={range.label}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="priceRange"
                checked={selectedPriceRange === index}
                onChange={() => togglePriceRange(index)}
                className="w-4 h-4 text-primary border-gray-300 
                           focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-secondary transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Nút xóa bộ lọc */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm text-primary border border-primary rounded-lg
                     hover:bg-primary hover:text-white transition-colors font-medium"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tiêu đề trang */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary">
          Sản phẩm
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Tìm thấy {filteredProducts.length} sản phẩm
        </p>
      </div>

      {/* Thanh tìm kiếm + sắp xếp + nút lọc mobile */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, hãng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4
                       text-sm focus:outline-none focus:border-primary focus:ring-1 
                       focus:ring-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                         hover:text-secondary"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>

        {/* Sắp xếp trên mobile */}
        <div className="relative lg:hidden">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg 
                       py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary 
                       focus:ring-1 focus:ring-primary transition-colors cursor-pointer
                       w-full sm:w-auto min-w-[180px]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Nút mở filter trên mobile */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 border border-gray-300 
                     rounded-lg py-2.5 px-4 text-sm text-secondary hover:border-primary 
                     hover:text-primary transition-colors"
        >
          <FiFilter />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full 
                            flex items-center justify-center font-medium">
              !
            </span>
          )}
        </button>
      </div>

      {/* Bộ lọc và sắp xếp ngang trên desktop */}
      <div className="relative hidden lg:block mb-8">
        <h2 className="mb-5 text-2xl font-bold text-secondary">
          Chọn theo tiêu chí
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDesktopFilterOpen((open) => !open)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              isDesktopFilterOpen || hasActiveFilters
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 bg-white text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            <FiFilter />
            Bộ lọc
            {hasActiveFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-primary">
                {selectedBrands.length + (selectedPriceRange !== null ? 1 : 0)}
              </span>
            )}
          </button>

          {brands.slice(0, 6).map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => toggleBrand(brand)}
              className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                selectedBrands.includes(brand)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 bg-gray-50 text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {formatBrandName(brand)}
            </button>
          ))}
        </div>

        {isDesktopFilterOpen && (
          <div className="absolute left-0 top-full z-30 mt-2 w-[min(560px,calc(100vw-2rem))] rounded-xl border border-gray-100 bg-white p-5 shadow-xl">
            <FilterContent />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary">Sắp xếp theo</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSortBy('default')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors ${
                sortBy === 'default'
                  ? 'border-blue-500 bg-blue-50 text-blue-500'
                  : 'border-gray-200 bg-white text-secondary hover:border-blue-300'
              }`}
            >
              <FiStar />
              Phổ biến
            </button>
            <button
              type="button"
              onClick={() => setSortBy('hot')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors ${
                sortBy === 'hot'
                  ? 'border-blue-500 bg-blue-50 text-blue-500'
                  : 'border-gray-200 bg-white text-secondary hover:border-blue-300'
              }`}
            >
              <FiTag />
              Khuyến mãi HOT
            </button>
            <button
              type="button"
              onClick={() => setSortBy('price-asc')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors ${
                sortBy === 'price-asc'
                  ? 'border-blue-500 bg-blue-50 text-blue-500'
                  : 'border-gray-200 bg-white text-secondary hover:border-blue-300'
              }`}
            >
              <FiArrowUp />
              Giá thấp - Cao
            </button>
            <button
              type="button"
              onClick={() => setSortBy('price-desc')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors ${
                sortBy === 'price-desc'
                  ? 'border-blue-500 bg-blue-50 text-blue-500'
                  : 'border-gray-200 bg-white text-secondary hover:border-blue-300'
              }`}
            >
              <FiArrowDown />
              Giá cao - Thấp
            </button>
          </div>
        </div>
      </div>

      {/* Grid sản phẩm */}
      <div>
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {remainingProducts > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PRODUCTS_PER_LOAD)}
                    className="inline-flex min-w-64 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-7 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-100 active:scale-95"
                  >
                    <span>Xem thêm {remainingProducts} sản phẩm</span>
                    <FiChevronDown />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <button
                onClick={clearFilters}
                className="text-primary text-sm font-medium hover:underline"
              >
                Xóa bộ lọc và thử lại
              </button>
            </div>
          )}
      </div>

      {/* Mobile filter drawer (overlay) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl 
                         overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-secondary">Bộ lọc</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-gray-400 hover:text-secondary transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
