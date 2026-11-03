import { useCallback, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductsPromoHeader from '../components/products/ProductsPromoHeader'
import ProductsFilters from '../components/products/ProductsFilters'
import ProductsResults from '../components/products/ProductsResults'
import { catalogSortMap, priceRanges } from '../config/catalog'
import api from '../lib/api.js'
import { mapCatalogProduct } from '../helpers/productAdapter.js'
import { skuCapacityGb } from '../utils/adminFormatters.js'
import useActiveBrands from '../hooks/useActiveBrands'

// 5 rows on the desktop product grid (5 columns x 5 rows).
const PRODUCTS_PER_LOAD = 25

const ProductsPage = () => {
  const { activeBrands, loading: brandsLoading } = useActiveBrands()
  const [searchParams, setSearchParams] = useSearchParams()
  const brandQuery = searchParams.get('brand')
  const categoryQuery = searchParams.get('category')
  const searchQueryFromUrl = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl)
  const [appliedFilters, setAppliedFilters] = useState({ priceRange: null, storage: [], capacity: [] })
  const [sortBy, setSortBy] = useState('default')
  const [catalogProducts, setCatalogProducts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PRODUCTS_PER_LOAD,
    total: 0,
    totalPages: 0,
  })
  const [debouncedSearch, setDebouncedSearch] = useState(searchQueryFromUrl)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const requestRef = useRef(null)
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
    // Wait for React to render the filtered loading/results state before scrolling.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToResults)
    })
  }, [scrollToResults])

  useEffect(() => {
    setSearchQuery(searchQueryFromUrl)
    if (searchQueryFromUrl) {
      const timer = setTimeout(scrollToResults, 120)
      return () => clearTimeout(timer)
    }
  }, [searchQueryFromUrl, scrollToResults])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  // Đồng bộ hãng khi URL thay đổi
  useEffect(() => {
    if (hasHandledInitialBrand.current || brandQuery) {
      const timer = setTimeout(scrollAfterFilterChange, 80)
      hasHandledInitialBrand.current = true
      return () => clearTimeout(timer)
    }

    hasHandledInitialBrand.current = true
  }, [brandQuery, scrollAfterFilterChange])

  const handleSortChange = (value) => {
    setSortBy(value)
    scrollAfterFilterChange()
  }

  // Xóa tất cả bộ lọc
  const clearFilters = () => {
    setSearchQuery('')
    setAppliedFilters({ priceRange: null, storage: [], capacity: [] })
    setSortBy('default')
    setSearchParams({}, { replace: true })
    scrollAfterFilterChange()
  }

  const buildRequestParams = useCallback((page) => {
    const priceRange = appliedFilters.priceRange === null
      ? null
      : priceRanges[appliedFilters.priceRange]

    return {
      page,
      limit: PRODUCTS_PER_LOAD,
      search: debouncedSearch || undefined,
      brand: brandQuery || undefined,
      category: categoryQuery || undefined,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max ?? undefined,
      storage: appliedFilters.storage.map(skuCapacityGb).join(',') || undefined,
      ram: appliedFilters.capacity.map(skuCapacityGb).join(',') || undefined,
      sort: catalogSortMap[sortBy] || 'newest',
    }
  }, [
    debouncedSearch,
    categoryQuery,
    brandQuery,
    appliedFilters,
    sortBy,
  ])

  const loadProducts = useCallback(async (page, { append = false } = {}) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    if (append) setIsLoadingMore(true)
    else {
      setIsLoading(true)
      setIsLoadingMore(false)
      setCatalogProducts([])
    }
    setLoadError('')

    try {
      // This is the customer storefront, including when an Admin visits it.
      const { data: result } = await api.get('/products', {
        params: buildRequestParams(page), signal: controller.signal, skipAuth: true,
      })
      if (controller.signal.aborted) return
      const items = result.data.map(product => ({
        ...mapCatalogProduct(product, product.skus, [product.brandInfo].filter(Boolean), [product.categoryInfo].filter(Boolean)),
        price: product.price,
        originalPrice: product.compareAtPrice ?? product.price,
      }))
      setCatalogProducts(current => append
        ? [...new Map([...current, ...items].map(item => [item.databaseId, item])).values()]
        : items)
      setPagination(result.pagination)
    } catch (error) {
      if (!controller.signal.aborted && error.name !== 'AbortError') {
        if (!append) setCatalogProducts([])
        setLoadError(error.message)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [buildRequestParams])

  useEffect(() => {
    loadProducts(1)
    return () => requestRef.current?.abort()
  }, [loadProducts, retryKey])

  const selectedBrandName = activeBrands.find(
    (brand) => brand.slug === brandQuery,
  )?.name || brandQuery

  const handleLoadMore = () => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return
    loadProducts(pagination.page + 1, { append: true })
  }

  const applyFilters = (filters) => {
    setAppliedFilters(filters)
    scrollAfterFilterChange()
  }

  const removeFilterGroup = (key) => {
    if (['priceRange', 'storage', 'capacity'].includes(key)) {
      const value = key === 'priceRange' ? null : []
      setAppliedFilters(current => ({ ...current, [key]: value }))
    } else if (key === 'search') handleSearchChange('')
    else {
      setSearchParams(current => {
        const next = new URLSearchParams(current)
        next.delete(key)
        return next
      }, { replace: true })
    }
    scrollAfterFilterChange()
  }

  const activeFilterGroups = [
    brandQuery && { key: 'brand', label: 'Thương hiệu', values: [selectedBrandName] },
    categoryQuery && { key: 'category', label: 'Danh mục', values: [categoryQuery] },
    debouncedSearch && { key: 'search', label: 'Từ khóa', values: [debouncedSearch] },
    appliedFilters.priceRange !== null && { key: 'priceRange', label: 'Giá', values: [priceRanges[appliedFilters.priceRange].label] },
    appliedFilters.capacity.length > 0 && { key: 'capacity', label: 'Dung lượng RAM', values: appliedFilters.capacity },
    appliedFilters.storage.length > 0 && { key: 'storage', label: 'Bộ nhớ trong', values: appliedFilters.storage },
  ].filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductsPromoHeader activeBrands={activeBrands} loading={brandsLoading} />
      <ProductsFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={() => handleSearchChange('')}
        onSearchSubmit={scrollToResults}
        brandQuery={brandQuery}
        selectedBrandName={selectedBrandName}
        total={pagination.total}
        appliedFilters={appliedFilters}
        activeFilterGroups={activeFilterGroups}
        onApply={applyFilters}
        onRemoveGroup={removeFilterGroup}
        onClear={clearFilters}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      <div id="search-results" ref={productResultsRef} className="scroll-mt-24">
        <ProductsResults
          products={catalogProducts}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          error={loadError}
          remaining={Math.max(pagination.total - catalogProducts.length, 0)}
          onRetry={() => setRetryKey(value => value + 1)}
          onLoadMore={handleLoadMore}
          onClear={clearFilters}
        />
      </div>
    </div>
  )
}

export default ProductsPage
