import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { heroBanners } from '../../data/banners'
import BannerCarousel from '../common/BannerCarousel'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const HeroSlide = ({ banner }) => (
  <div className="flex min-h-[360px] items-center bg-secondary p-6 text-white md:min-h-[420px] md:p-10 lg:p-12">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full">
      <div className="md:col-span-7 space-y-3 md:space-y-4 text-center md:text-left z-10">
        {banner.tag && <span className="inline-block rounded-md bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white md:text-sm">{banner.tag}</span>}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">{banner.title}</h2>
        <p className="text-sm md:text-base text-gray-300 max-w-lg mx-auto md:mx-0">{banner.subtitle}</p>
        <div className="text-lg md:text-2xl font-bold text-amber-400">{banner.priceText}</div>
        <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
          <Link to={banner.link} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:text-base">{banner.btnText}<FiArrowRight aria-hidden="true" /></Link>
          <Link to="/products" className="hidden sm:inline-flex items-center text-sm font-medium text-gray-300 hover:text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors">Xem tất cả máy</Link>
        </div>
      </div>
      <div className="md:col-span-5 flex justify-center items-center relative">
        <div className="flex h-48 w-48 items-center justify-center sm:h-60 sm:w-60 md:h-72 md:w-72 lg:h-80 lg:w-80">
          <img src={banner.image} alt={banner.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }} className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  </div>
)

const HeroBanner = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 md:rounded-3xl">
    <BannerCarousel items={heroBanners} interval={15000} ariaLabel="Banner trang chủ" renderSlide={(banner) => <HeroSlide banner={banner} />} />
  </div>
)

export default HeroBanner
