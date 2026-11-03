import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import BannerCarousel from '../common/BannerCarousel'
import BannerLink from '../common/BannerLink'
import { productBrands } from '../../data/banners'
import useBanners from '../../hooks/useBanners'
import { bannerThemes } from '../../helpers/banner.js'

const PromoCard = ({ banner, android = false }) => (
  <BannerLink to={banner.link || '/products'} className={`group relative block w-full min-h-[126px] overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-r px-6 py-5 shadow-sm ${bannerThemes[banner.theme] || bannerThemes.slate}`}>
    <div className="relative z-10 max-w-[62%]">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{banner.tag || (android ? 'Android mới nhất' : 'iPhone mới nhất')}</p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{banner.title}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-300">{banner.subtitle || (android ? 'Công nghệ mới, giá tốt' : 'Chính hãng - Ưu đãi hấp dẫn')}</p>
      {banner.priceText && <p className="mt-1 text-sm font-bold text-amber-300">{banner.priceText}</p>}
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">{banner.btnText || 'Xem ngay'} <FiArrowRight className="transition group-hover:translate-x-1" /></span>
    </div>
    <img src={banner.image?.url} alt={banner.title} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/products/placeholder.svg' }} className="absolute -right-2 bottom-0 h-32 w-44 object-contain transition duration-500 group-hover:scale-105" />
  </BannerLink>
)

const ProductsPromoHeader = ({ activeBrands, loading }) => {
  const iphone = useBanners('product-iphone')
  const android = useBanners('product-android')
  const [searchParams] = useSearchParams()
  const selectedBrand = searchParams.get('brand')
  const visibleBrands = activeBrands.map(brand => ({
    ...brand,
    wordmark: productBrands.find(item => item.name.toLocaleLowerCase('vi-VN') === brand.name.toLocaleLowerCase('vi-VN'))?.logo || brand.name,
  }))

  return (
    <section className="mb-8">
      {(iphone.loading || android.loading) ? <div className="mb-8 h-40 animate-pulse rounded-xl bg-slate-200" aria-label="Đang tải banner sản phẩm" /> : (iphone.banners.length > 0 || android.banners.length > 0) && (
        <div className={`mb-8 grid grid-cols-1 gap-3 ${iphone.banners.length && android.banners.length ? 'lg:grid-cols-2' : ''}`}>
          {iphone.banners.length > 0 && <BannerCarousel items={iphone.banners} interval={7000} ariaLabel="Banner iPhone" renderSlide={banner => <PromoCard banner={banner} />} />}
          {android.banners.length > 0 && <BannerCarousel items={android.banners} interval={7000} ariaLabel="Banner Android" renderSlide={banner => <PromoCard banner={banner} android />} />}
        </div>
      )}
      <h2 className="mb-4 text-2xl font-bold text-secondary md:text-3xl">Hãng</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
        {loading ? Array.from({ length: 10 }).map((_, index) => (
          <span key={index} className="h-14 animate-pulse rounded-lg border border-slate-200 bg-white" aria-hidden="true" />
        )) : visibleBrands.map((brand) => {
          const isSelected = selectedBrand?.toLowerCase() === brand.slug.toLowerCase()

          return (
            <Link
              key={brand.name}
              to={isSelected ? '/products' : `/products?brand=${encodeURIComponent(brand.slug)}`}
              aria-current={isSelected ? 'true' : undefined}
              className={`flex h-14 items-center justify-center rounded-lg border px-2 text-center text-sm font-bold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'scale-[1.02] border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/15'
                  : 'border-gray-200 bg-white text-gray-800 shadow-sm hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md'
              }`}
            >
              <span className={brand.name === 'OPPO' || brand.name === 'realme' ? 'text-xl font-medium' : ''}>
                {brand.wordmark}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default ProductsPromoHeader
