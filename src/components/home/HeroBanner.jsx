import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { heroBanners } from '../../data/banners'
import BannerCarousel from '../common/BannerCarousel'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const HeroSlide = ({ banner }) => (
  <div className={`bg-gradient-to-r ${banner.bgColor} p-6 md:p-10 lg:p-12 min-h-[360px] md:min-h-[420px] flex items-center text-white`}>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full">
      <div className="md:col-span-7 space-y-3 md:space-y-4 text-center md:text-left z-10">
        {banner.tag && <span className="inline-block bg-primary/90 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">{banner.tag}</span>}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">{banner.title}</h2>
        <p className="text-sm md:text-base text-gray-300 max-w-lg mx-auto md:mx-0">{banner.subtitle}</p>
        <div className="text-lg md:text-2xl font-bold text-amber-400">{banner.priceText}</div>
        <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
          <Link to={banner.link} className="inline-flex items-center gap-2 bg-primary hover:bg-rose-700 text-white font-semibold text-sm md:text-base px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95">{banner.btnText}<FiArrowRight /></Link>
          <Link to="/products" className="hidden sm:inline-flex items-center text-sm font-medium text-gray-300 hover:text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors">Xem tất cả máy</Link>
        </div>
      </div>
      <div className="md:col-span-5 flex justify-center items-center relative">
        <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-90" />
          <img src={banner.image} alt={banner.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE }} className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    </div>
  </div>
)

const HeroBanner = () => (
  <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
    <BannerCarousel items={heroBanners} interval={15000} ariaLabel="Banner trang chủ" renderSlide={(banner) => <HeroSlide banner={banner} />} />
  </div>
)

export default HeroBanner
