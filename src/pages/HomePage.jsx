import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiAward, FiChevronRight } from 'react-icons/fi'
import HeroBanner from '../components/home/HeroBanner'
import ServicesCommitment from '../components/home/ServicesCommitment'
import BrandList from '../components/home/BrandList'
import PromoBanners from '../components/home/PromoBanners'
import BrandTabsSection from '../components/home/BrandTabsSection'
import ProductCard from '../components/products/ProductCard'
import useCatalog from '../hooks/useCatalog.js'

const CatalogStatus = ({ loading, error, onRetry }) => loading ? (
  <div className="my-10 grid grid-cols-2 gap-4 md:grid-cols-4" role="status" aria-label="Đang tải sản phẩm">
    {[0, 1, 2, 3].map(item => <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />)}
  </div>
) : error ? (
  <div role="alert" className="my-10 rounded-2xl border border-rose-200 bg-white p-6 text-center">
    <p className="text-sm text-gray-600">{error}</p>
    <button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Thử lại</button>
  </div>
) : null

const ProductSection = ({ products, loading, error, onRetry, title, description, icon: Icon, tone, highlighted = false }) => (products.length > 0 || loading || error) && (
  <section className={highlighted ? 'my-10 rounded-2xl border border-rose-700 bg-primary p-5 text-white md:p-7' : 'my-10'}>
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={highlighted
          ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl text-amber-300'
          : `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${tone}`}>
          <Icon aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-xl font-bold md:text-2xl ${highlighted ? 'text-white' : 'text-secondary'}`}>{title}</h2>
            {highlighted && <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold uppercase text-secondary">NEW</span>}
          </div>
          <p className={`mt-0.5 text-xs md:text-sm ${highlighted ? 'text-white/90' : 'text-gray-500'}`}>{description}</p>
        </div>
      </div>
      {!highlighted && (
        <Link to="/products" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline md:text-sm">
          <span>Xem tất cả</span><FiChevronRight className="text-sm" />
        </Link>
      )}
    </div>
    <CatalogStatus loading={loading} error={error} onRetry={onRetry} />
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 ${highlighted ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
      {products.map(product => <ProductCard key={product.databaseId || product.id} product={product} />)}
    </div>
    {highlighted && products.length > 0 && (
      <div className="mt-6 text-center">
        <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:text-sm">
          <span>Xem tất cả sản phẩm</span><FiChevronRight aria-hidden="true" className="text-base" />
        </Link>
      </div>
    )}
  </section>
)
const HomePage = () => {
  const [retryKey, setRetryKey] = useState(0)
  const featured = useCatalog({ isFeatured: true, sort: 'rating_desc', limit: 8 }, retryKey)
  const newest = useCatalog({ isNew: true, sort: 'newest', limit: 5 }, retryKey)
  const retryCatalog = () => setRetryKey(value => value + 1)
  const featuredProducts = featured.products
  const newProducts = newest.products

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        {/* 1. Hero Banner Slider */}
        <HeroBanner />

        {/* 2. Cam kết & Dịch vụ */}
        <ServicesCommitment />

        {/* 3. Danh mục / Hãng điện thoại */}
        <BrandList />

        <ProductSection
          products={newProducts}
          loading={newest.loading}
          error={newest.error}
          onRetry={retryCatalog}
          icon={FiAward}
          tone="bg-rose-100 text-primary"
          title="Điện thoại mới"
          description="Những mẫu điện thoại mới nhất tại TLUPhone"
          highlighted
        />
        {/* 5. Lối tắt khám phá sản phẩm */}
        <PromoBanners startIndex={0} count={2} />

        {/* 6. Section: Sản phẩm nổi bật */}
        <ProductSection products={featuredProducts} loading={featured.loading} error={featured.error} onRetry={retryCatalog} icon={FiStar} tone="bg-rose-100 text-primary" title="Sản phẩm nổi bật" description="Những mẫu smartphone được yêu thích và đánh giá cao nhất" />

        {/* 7. Section: Sản phẩm theo hãng (Tabs Apple / Samsung / Xiaomi / OPPO) */}
        <BrandTabsSection />

        {/* 8. Thông tin vận chuyển */}
        <PromoBanners startIndex={2} count={1} />

      </div>
    </div>
  )
}

export default HomePage
