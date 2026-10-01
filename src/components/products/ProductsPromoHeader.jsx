import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import BannerCarousel from '../common/BannerCarousel'
import { productBrands, iphoneBanners, androidBanners } from '../../data/banners'

const PromoCard = ({ banner, android = false }) => (
  <Link to={banner.link} className={`group relative block w-full min-h-[126px] overflow-hidden rounded-xl border px-6 py-5 shadow-sm ${android ? 'border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-red-100' : 'border-slate-700 bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-950'}`}>
    <div className="relative z-10 max-w-[62%]">
      <p className={`text-xs font-bold uppercase tracking-wider ${android ? 'text-red-600' : 'text-slate-300'}`}>{android ? 'Android mới nhất' : 'iPhone mới nhất'}</p>
      <h2 className={`mt-1 text-2xl font-black tracking-tight ${android ? 'italic text-red-700' : 'text-white'}`}>{banner.title}</h2>
      <p className={`mt-1 text-sm font-semibold ${android ? 'text-red-600' : 'text-amber-300'}`}>{android ? 'Công nghệ mới, giá tốt' : 'Chính hãng - Ưu đãi hấp dẫn'}</p>
      <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${android ? 'bg-red-600 text-white' : 'bg-white text-slate-900'}`}>Xem ngay <FiArrowRight className="transition group-hover:translate-x-1" /></span>
    </div>
    <img src={banner.image} alt={banner.title} className="absolute -right-2 bottom-0 h-32 w-44 object-contain transition duration-500 group-hover:scale-105" />
  </Link>
)

const ProductsPromoHeader = () => (
  <section className="mb-8">
    <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
      <BannerCarousel items={iphoneBanners} interval={7000} ariaLabel="Banner iPhone" renderSlide={(banner) => <PromoCard banner={banner} />} />
      <BannerCarousel items={androidBanners} interval={7000} ariaLabel="Banner Android" renderSlide={(banner) => <PromoCard banner={banner} android />} />
    </div>
    <h1 className="mb-4 text-2xl font-bold text-secondary md:text-3xl">Điện thoại</h1>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
      {productBrands.map((brand) => <Link key={brand.name} to={`/products?brand=${encodeURIComponent(brand.name)}`} className="flex h-14 items-center justify-center rounded-lg border border-gray-200 bg-white px-2 text-center text-sm font-bold text-gray-800 shadow-sm transition hover:border-primary hover:text-primary hover:shadow-md"><span className={brand.name === 'OPPO' || brand.name === 'realme' ? 'text-xl font-medium' : ''}>{brand.logo}</span></Link>)}
    </div>
  </section>
)

export default ProductsPromoHeader
