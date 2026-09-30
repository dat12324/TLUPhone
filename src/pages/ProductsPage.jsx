import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import products, { brands, priceRanges } from '../data/products'

const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
]

// 4 rows on the desktop product grid (4 columns x 4 rows).
const PRODUCTS_PER_LOAD = 16

const ProductsPage = () => {
  const [searchParams] = useSearchParams()
  const brandQuery = searchParams.get('brand')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrands, setSelectedBrands] = useState(brandQuery ? [brandQuery] : [])
  const [selectedPriceRange, setSelectedPriceRange] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD)

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
    let result = [...products]

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      )
    }

    // Lọc theo hãng
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand))
    }

    // Lọc theo khoảng giá
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange]
      result = result.filter((p) => p.price >= range.min && p.price < range.max)
    }

    // Sắp xếp
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [searchQuery, selectedBrands, selectedPriceRange, sortBy])

  // Start again from four rows whenever search, filters, or sorting changes.
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_LOAD)
  }, [searchQuery, selectedBrands, selectedPriceRange, sortBy])

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
                {brand}
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

        {/* Sắp xếp */}
        <div className="relative">
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

      {/* Layout chính: Sidebar + Grid sản phẩm */}
      <div className="flex gap-8">
        {/* Sidebar filter - desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-32 bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-secondary mb-4">
              Bộ lọc
            </h2>
            <FilterContent />
          </div>
        </aside>

        {/* Grid sản phẩm */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
