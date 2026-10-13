import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiZap, FiStar, FiAward, FiChevronRight } from 'react-icons/fi'
import HeroBanner from '../components/home/HeroBanner'
import ServicesCommitment from '../components/home/ServicesCommitment'
import BrandList from '../components/home/BrandList'
import PromoBanners from '../components/home/PromoBanners'
import BrandTabsSection from '../components/home/BrandTabsSection'
import PromotionCountdown from '../components/home/PromotionCountdown'
import ProductCard from '../components/ProductCard'
import products from '../data/products'
import { usePromotion } from '../context/PromotionContext'

const HomePage = () => {
  const {
    promotion,
    phase: promotionPhase,
    promotionItems,
    applyPromotionToProduct,
  } = usePromotion()

  // 1. Sản phẩm khuyến mãi hấp dẫn (có giảm giá hoặc isHotDeal)
  const hotDealProducts = useMemo(() => {
    if (promotionItems.length > 0) {
      if (promotionPhase !== 'active') return []

      return promotionItems
        .map((item) => products.find((product) => String(product.id) === String(item.productId)))
        .filter(Boolean)
        .map(applyPromotionToProduct)
        .slice(0, 5)
    }

    return products
      .filter((p) => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price))
      .slice(0, 5)
  }, [promotionItems, promotionPhase, applyPromotionToProduct])

  // 2. Sản phẩm nổi bật (isFeatured)
  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.isFeatured || p.rating >= 4.6)
      .slice(0, 8)
  }, [])

  // 3. Sản phẩm mới ra mắt (isNew)
  const newProducts = useMemo(() => {
    return products
      .filter((p) => p.isNew || p.id <= 6)
      .slice(0, 4)
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        {/* 1. Hero Banner Slider */}
        <HeroBanner />

        {/* 2. Cam kết & Dịch vụ */}
        <ServicesCommitment />

        {/* 3. Danh mục / Hãng điện thoại */}
        <BrandList />

        {/* 4. Section: Khuyến mãi hấp dẫn (Flash Sale / Hot Deals) */}
        {hotDealProducts.length > 0 && (
          <section className="my-10 rounded-2xl border border-rose-700 bg-primary p-5 text-white md:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-2xl text-amber-300">
                  <FiZap aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                      {promotionItems.length > 0 ? promotion.title : 'Khuyến Mãi Hấp Dẫn'}
                    </h2>
                    <span className="bg-amber-400 text-secondary text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                      HOT DEAL
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 mt-0.5">
                    {promotionItems.length > 0
                      ? promotion.description
                      : 'Các sản phẩm đang có giá thấp hơn giá niêm yết'}
                  </p>
                </div>
              </div>
              {promotionItems.length > 0 && (
                <PromotionCountdown promotion={promotion} />
              )}
            </div>

            {/* Grid sản phẩm Khuyến mãi */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {hotDealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
              >
                <span>Xem tất cả khuyến mãi</span>
                <FiChevronRight className="text-base" />
              </Link>
            </div>
          </section>
        )}

        {/* 5. Lối tắt khám phá sản phẩm */}
        <PromoBanners startIndex={0} count={2} />

        {/* 6. Section: Sản phẩm nổi bật */}
        {featuredProducts.length > 0 && (
          <section className="my-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-primary flex items-center justify-center text-lg">
                  <FiStar />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-secondary">
                    Sản phẩm nổi bật
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Những mẫu smartphone được yêu thích và đánh giá cao nhất
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
              >
                <span>Xem tất cả</span>
                <FiChevronRight className="text-sm" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 7. Section: Sản phẩm theo hãng (Tabs Apple / Samsung / Xiaomi / OPPO) */}
        <BrandTabsSection />

        {/* 8. Thông tin vận chuyển */}
        <PromoBanners startIndex={2} count={1} />

        {/* 9. Section: Điện thoại mới */}
        {newProducts.length > 0 && (
          <section className="my-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
                  <FiAward />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-secondary">
                    Điện thoại mới
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Các dòng smartphone công nghệ mới nhất vừa cập bến
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
              >
                <span>Xem tất cả</span>
                <FiChevronRight className="text-sm" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default HomePage
