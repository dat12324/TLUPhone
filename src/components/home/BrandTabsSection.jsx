import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import ProductCard from '../ProductCard'
import useActiveBrands from '../../hooks/useActiveBrands'
import { getProducts } from '../../services/catalogService'

const BrandTabsSection = () => {
  const { activeBrands, loading: brandsLoading } = useActiveBrands()
  const availableBrands = useMemo(
    () => activeBrands.filter((brand) => brand.productCount > 0),
    [activeBrands],
  )
  const [activeBrandSlug, setActiveBrandSlug] = useState('')
  const [brandProducts, setBrandProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  const activeBrand = availableBrands.find(
    (brand) => brand.slug === activeBrandSlug,
  )

  useEffect(() => {
    if (!availableBrands.some((brand) => brand.slug === activeBrandSlug)) {
      setActiveBrandSlug(availableBrands[0]?.slug || '')
    }
  }, [activeBrandSlug, availableBrands])

  useEffect(() => {
    if (!activeBrandSlug) {
      setBrandProducts([])
      return undefined
    }

    const controller = new AbortController()
    setProductsLoading(true)
    setError('')

    getProducts(
      { brand: activeBrandSlug, page: 1, limit: 8, sort: 'newest' },
      { signal: controller.signal },
    )
      .then(({ items }) => setBrandProducts(items))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setBrandProducts([])
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductsLoading(false)
      })

    return () => controller.abort()
  }, [activeBrandSlug, retryKey])

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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {brandsLoading ? (
            <span className="text-xs text-slate-400">Đang tải thương hiệu...</span>
          ) : availableBrands.map((brand) => {
            const isActive = activeBrandSlug === brand.slug
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setActiveBrandSlug(brand.slug)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200 hover:text-secondary'
                }`}
              >
                {brand.name}
              </button>
            )
          })}
        </div>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" aria-label="Đang tải sản phẩm">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            Thử tải lại
          </button>
        </div>
      ) : brandProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brandProducts.map((product) => (
            <ProductCard key={product.databaseId} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          Chưa có sản phẩm cho thương hiệu {activeBrand?.name || ''}.
        </div>
      )}

      <div className="text-center mt-6 pt-4 border-t border-gray-100">
        {activeBrand && (
          <Link
            to={`/products?brand=${encodeURIComponent(activeBrand.slug)}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-rose-700 transition-colors"
          >
            <span>Xem tất cả điện thoại {activeBrand.name}</span>
            <FiChevronRight className="text-base" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default BrandTabsSection
