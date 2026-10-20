import { useCallback, useState, useMemo, useEffect, useRef } from 'react'
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
import ProductsPromoHeader from '../components/products/ProductsPromoHeader'
import { usePromotion } from '../context/PromotionContext'
import { catalogSortMap, priceRanges } from '../config/catalog'
import { getProducts } from '../services/catalogService'
import useActiveBrands from '../hooks/useActiveBrands'

const sortOptions = [
  { value: 'default', label: 'Phổ biến' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
]

// 5 rows on the desktop product grid (5 columns x 5 rows).
const PRODUCTS_PER_LOAD = 25

const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB']
const capacityOptions = ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB']

const ProductsPage = () => {
  const { applyPromotionToProduct } = usePromotion()
  const { activeBrands } = useActiveBrands()
  const [searchParams, setSearchParams] = useSearchParams()
  const brandQuery = searchParams.get('brand')
  const searchQueryFromUrl = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl)
  const [selectedBrands, setSelectedBrands] = useState(brandQuery ? [brandQuery] : [])
  const [selectedPriceRange, setSelectedPriceRange] = useState(null)
  const [selectedStorage, setSelectedStorage] = useState([])
  const [selectedCapacity, setSelectedCapacity] = useState([])
  const [sortBy, setSortBy] = useState('default')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [desktopFilterPanel, setDesktopFilterPanel] = useState(null)
  const [catalogProducts, setCatalogProducts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PRODUCTS_PER_LOAD,
    totalItems: 0,
    totalPages: 0,
  })
  const [debouncedSearch, setDebouncedSearch] = useState(searchQueryFromUrl)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const filterContainerRef = useRef(null)
  const productResultsRef = useRef(null)
  const hasHandledInitialBrand = useRef(false)

  const scrollToResults = useCallback(() => {
    if (productResultsRef.current) {
      const stickyHeaderHeight = document.querySelector('header')?.getBoundingClientRect().height || 85
      const headerOffset = stickyHeaderHeight + 16
      const elementPosition = productResultsRef.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
    }
  }, [])

  const scrollAfterFilterChange = useCallback(() => {
    setDesktopFilterPanel(null)
    setIsMobileFilterOpen(false)

    // Wait for React to render the filtered loading/results state before scrolling.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToResults)
    })
  }, [scrollToResults])

  // Tự động cuộn/focus đến kết quả sản phẩm khi tìm kiếm
  useEffect(() => {
    if (searchQueryFromUrl) {
      const timer = setTimeout(() => {
        scrollToResults()
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [searchQueryFromUrl, scrollToResults])

  // Đồng bộ search query từ URL
  useEffect(() => {
    setSearchQuery(searchQueryFromUrl)
  }, [searchQueryFromUrl])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Xử lý đóng filter panel khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target)
      ) {
        setDesktopFilterPanel(null)
      }
    }

    if (desktopFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [desktopFilterPanel])

  // Cập nhật tìm kiếm và đồng bộ vào URL query
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value.trim()) {
        next.set('search', value)
      } else {
        next.delete('search')
      }
      return next
    }, { replace: true })
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('search')
      return next
    }, { replace: true })
  }

  // Đồng bộ hãng khi URL thay đổi
  useEffect(() => {
    if (brandQuery) {
      setSelectedBrands([brandQuery])
    } else {
      setSelectedBrands([])
    }

    if (hasHandledInitialBrand.current || brandQuery) {
      const timer = setTimeout(scrollAfterFilterChange, 80)
      hasHandledInitialBrand.current = true
      return () => clearTimeout(timer)
    }

    hasHandledInitialBrand.current = true
  }, [brandQuery, scrollAfterFilterChange])

  // Xử lý chọn khoảng giá
  const togglePriceRange = (index) => {
    setSelectedPriceRange((prev) => (prev === index ? null : index))
    scrollAfterFilterChange()
  }

  const toggleOption = (setter, option) => {
    setter((prev) =>
      prev.includes(option)
        ? prev.filter((value) => value !== option)
        : [...prev, option]
    )
    scrollAfterFilterChange()
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    scrollAfterFilterChange()
  }

  // Xóa tất cả bộ lọc
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrands([])
    setSelectedPriceRange(null)
    setSelectedStorage([])
    setSelectedCapacity([])
    setSortBy('default')
    setDesktopFilterPanel(null)
    setIsMobileFilterOpen(false)
    setSearchParams({}, { replace: true })
    scrollAfterFilterChange()
  }

  // Kiểm tra có filter nào đang active không
  const hasActiveFilters =
    searchQuery ||
    selectedBrands.length > 0 ||
    selectedPriceRange !== null ||
    selectedStorage.length > 0 ||
    selectedCapacity.length > 0

  const criteriaFilterCount =
    (selectedPriceRange !== null ? 1 : 0) +
    selectedStorage.length +
    selectedCapacity.length

  const buildRequestParams = useCallback((page) => {
    const priceRange = selectedPriceRange === null
      ? null
      : priceRanges[selectedPriceRange]

    return {
      page,
      limit: PRODUCTS_PER_LOAD,
      search: debouncedSearch || undefined,
      brand: selectedBrands[0] || undefined,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max ?? undefined,
      storage: selectedStorage,
      ram: selectedCapacity,
      sort: catalogSortMap[sortBy] || 'newest',
      hotDeal: sortBy === 'hot' ? true : undefined,
    }
  }, [
    debouncedSearch,
    selectedBrands,
    selectedPriceRange,
    selectedStorage,
    selectedCapacity,
    sortBy,
  ])

  const loadProducts = useCallback(async (page, { append = false, signal } = {}) => {
    if (append) setIsLoadingMore(true)
    else {
      setIsLoading(true)
      setCatalogProducts([])
    }
    setLoadError('')

    try {
      const result = await getProducts(buildRequestParams(page), { signal })
      setCatalogProducts((current) => (
        append ? [...current, ...result.items] : result.items
      ))
      setPagination(result.pagination)
    } catch (error) {
      if (error.name !== 'AbortError') {
        if (!append) setCatalogProducts([])
        setLoadError(error.message)
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [buildRequestParams])

  useEffect(() => {
    const controller = new AbortController()
    loadProducts(1, { signal: controller.signal })
    return () => controller.abort()
  }, [loadProducts, retryKey])

  const visibleProducts = useMemo(
    () => catalogProducts.map(applyPromotionToProduct),
    [catalogProducts, applyPromotionToProduct],
  )
  const remainingProducts = Math.max(
    pagination.totalItems - visibleProducts.length,
    0,
  )
  const selectedBrandName = activeBrands.find(
    (brand) => brand.slug === selectedBrands[0],
  )?.name || selectedBrands[0]

  const handleLoadMore = () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return
    loadProducts(pagination.page + 1, { append: true })
  }

  // Component bộ lọc (dùng chung cho desktop sidebar & mobile drawer)
  const FilterContent = () => (
    <div className="space-y-6">
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

      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">
          Bộ nhớ trong
        </h3>
        <div className="flex flex-wrap gap-2">
          {storageOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(setSelectedStorage, option)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                selectedStorage.includes(option)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">
          RAM
        </h3>
        <div className="flex flex-wrap gap-2">
          {capacityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(setSelectedCapacity, option)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                selectedCapacity.includes(option)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              {option}
            </button>
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
      <ProductsPromoHeader />
      {/* Tiêu đề trang & Khu vực kết quả tìm kiếm */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            {selectedBrands.length === 1 ? `Điện thoại ${selectedBrandName}` : 'Tất cả điện thoại'}
          </h1>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-primary">
              <FiSearch className="text-xs" />
              <span>Kết quả cho: "{searchQuery}"</span>
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {searchQuery
            ? `Tìm thấy ${pagination.totalItems} sản phẩm phù hợp với từ khóa "${searchQuery}"`
            : `Tìm thấy ${pagination.totalItems} sản phẩm chính hãng`}
        </p>
      </div>

      {/* Thanh tìm kiếm + sắp xếp + nút lọc mobile */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Ô tìm kiếm */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            scrollToResults()
          }}
          className="relative flex-1"
          role="search"
        >
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, hãng..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-10
                       text-sm focus:outline-none focus:border-primary focus:ring-1 
                       focus:ring-primary transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                         hover:text-secondary p-1"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </form>

        {/* Sắp xếp trên mobile */}
        <div className="relative lg:hidden">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
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
      <div ref={filterContainerRef} className="relative hidden lg:block mb-8">
        <h2 className="mb-5 text-2xl font-bold text-secondary">
          Chọn tiêu chí
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Nút Bộ lọc tổng hợp */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setDesktopFilterPanel((panel) => (panel === 'all' ? null : 'all'))
              }
              aria-expanded={desktopFilterPanel === 'all'}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-medium transition-colors ${
                desktopFilterPanel === 'all' || criteriaFilterCount > 0
                  ? 'border-primary bg-white text-primary'
                  : 'border-gray-200 bg-white text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <FiFilter />
              Bộ lọc
              {criteriaFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                  {criteriaFilterCount}
                </span>
              )}
            </button>

            {desktopFilterPanel === 'all' && (
              <div className="absolute left-0 top-full z-30 mt-2 w-[min(920px,calc(100vw-3rem))] rounded-xl border border-gray-100 bg-white p-5 shadow-xl animate-slide-up">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-gray-700">Giá</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {priceRanges.map((range, index) => (
                        <button
                          key={range.label}
                          type="button"
                          onClick={() => togglePriceRange(index)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            selectedPriceRange === index
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-base font-semibold text-gray-700">Bộ nhớ trong</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {storageOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption(setSelectedStorage, option)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            selectedStorage.includes(option)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-base font-semibold text-gray-700">RAM</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {capacityOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleOption(setSelectedCapacity, option)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            selectedCapacity.includes(option)
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDesktopFilterPanel(null)}
                  className="mt-6 w-full rounded-xl bg-primary/10 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/15 text-sm"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>

          {/* Nút Giá */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setDesktopFilterPanel((panel) => (panel === 'price' ? null : 'price'))
              }
              aria-expanded={desktopFilterPanel === 'price'}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${
                desktopFilterPanel === 'price' || selectedPriceRange !== null
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-gray-200 bg-gray-50 text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <span>Giá</span>
              <FiChevronDown className={`text-sm transition-transform ${desktopFilterPanel === 'price' ? 'rotate-180' : ''}`} />
            </button>

            {desktopFilterPanel === 'price' && (
              <div className="absolute left-0 top-full z-30 mt-2 w-80 sm:w-96 rounded-xl border border-gray-100 bg-white p-4 shadow-xl animate-slide-up">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Chọn khoảng giá</h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => togglePriceRange(index)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        selectedPriceRange === index
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDesktopFilterPanel(null)}
                  className="mt-4 w-full rounded-xl bg-primary/10 py-2 font-semibold text-primary transition-colors hover:bg-primary/15 text-xs"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>

          {/* Nút Bộ nhớ trong */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setDesktopFilterPanel((panel) => (panel === 'storage' ? null : 'storage'))
              }
              aria-expanded={desktopFilterPanel === 'storage'}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${
                desktopFilterPanel === 'storage' || selectedStorage.length > 0
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-gray-200 bg-gray-50 text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <span>Bộ nhớ trong</span>
              <FiChevronDown className={`text-sm transition-transform ${desktopFilterPanel === 'storage' ? 'rotate-180' : ''}`} />
            </button>

            {desktopFilterPanel === 'storage' && (
              <div className="absolute left-0 top-full z-30 mt-2 w-80 sm:w-96 rounded-xl border border-gray-100 bg-white p-4 shadow-xl animate-slide-up">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Chọn dung lượng lưu trữ</h3>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(setSelectedStorage, option)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        selectedStorage.includes(option)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDesktopFilterPanel(null)}
                  className="mt-4 w-full rounded-xl bg-primary/10 py-2 font-semibold text-primary transition-colors hover:bg-primary/15 text-xs"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>

          {/* Nút RAM */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setDesktopFilterPanel((panel) => (panel === 'capacity' ? null : 'capacity'))
              }
              aria-expanded={desktopFilterPanel === 'capacity'}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${
                desktopFilterPanel === 'capacity' || selectedCapacity.length > 0
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-gray-200 bg-gray-50 text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <span>RAM</span>
              <FiChevronDown className={`text-sm transition-transform ${desktopFilterPanel === 'capacity' ? 'rotate-180' : ''}`} />
            </button>

            {desktopFilterPanel === 'capacity' && (
              <div className="absolute left-0 top-full z-30 mt-2 w-80 sm:w-96 rounded-xl border border-gray-100 bg-white p-4 shadow-xl animate-slide-up">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Chọn dung lượng RAM</h3>
                <div className="flex flex-wrap gap-2">
                  {capacityOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(setSelectedCapacity, option)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        selectedCapacity.includes(option)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDesktopFilterPanel(null)}
                  className="mt-4 w-full rounded-xl bg-primary/10 py-2 font-semibold text-primary transition-colors hover:bg-primary/15 text-xs"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <FiX />
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary">Sắp xếp theo</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleSortChange('default')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all duration-200 ${
                sortBy === 'default'
                  ? 'border-primary bg-rose-50 text-primary font-semibold shadow-xs'
                  : 'border-gray-200 bg-white text-secondary hover:border-rose-300 hover:text-primary'
              }`}
            >
              <FiStar />
              Phổ biến
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('hot')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all duration-200 ${
                sortBy === 'hot'
                  ? 'border-primary bg-rose-50 text-primary font-semibold shadow-xs'
                  : 'border-gray-200 bg-white text-secondary hover:border-rose-300 hover:text-primary'
              }`}
            >
              <FiTag />
              Khuyến mãi HOT
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('price-asc')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all duration-200 ${
                sortBy === 'price-asc'
                  ? 'border-primary bg-rose-50 text-primary font-semibold shadow-xs'
                  : 'border-gray-200 bg-white text-secondary hover:border-rose-300 hover:text-primary'
              }`}
            >
              <FiArrowUp />
              Giá thấp - Cao
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('price-desc')}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all duration-200 ${
                sortBy === 'price-desc'
                  ? 'border-primary bg-rose-50 text-primary font-semibold shadow-xs'
                  : 'border-gray-200 bg-white text-secondary hover:border-rose-300 hover:text-primary'
              }`}
            >
              <FiArrowDown />
              Giá cao - Thấp
            </button>
          </div>
        </div>
      </div>

      {/* Grid sản phẩm */}
      <div id="search-results" ref={productResultsRef} className="scroll-mt-24">
          {isLoading && visibleProducts.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5" aria-label="Đang tải sản phẩm">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : loadError && visibleProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mb-3 text-base text-rose-600">{loadError}</p>
              <button
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Thử tải lại
              </button>
            </div>
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.databaseId} product={product} />
                ))}
              </div>

              {loadError && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-rose-600">{loadError}</p>
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="mt-2 text-sm font-semibold text-primary hover:underline"
                  >
                    Thử tải tiếp
                  </button>
                </div>
              )}

              {remainingProducts > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex min-w-64 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-7 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:border-rose-300 hover:bg-rose-100 active:scale-95 disabled:cursor-wait disabled:opacity-60"
                  >
                    <span>{isLoadingMore ? 'Đang tải...' : `Xem thêm ${remainingProducts} sản phẩm`}</span>
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
