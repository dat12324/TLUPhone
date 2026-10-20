import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { heroBanners } from '../../data/banners'
import BannerCarousel from '../common/BannerCarousel'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const HeroContent = ({ banner }) => (
  <div className="relative z-10 space-y-4 text-center md:col-span-7 md:text-left lg:space-y-5">
    {banner.tag && (
      <span className="inline-flex min-h-8 items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-white shadow-sm sm:text-sm">
        {banner.tag}
      </span>
    )}

    <div className="space-y-2.5 lg:space-y-3">
      <h2 className="text-3xl font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl xl:text-6xl">
        {banner.title}
      </h2>
      <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base md:mx-0 lg:text-lg">
        {banner.subtitle}
      </p>
    </div>

    <p className="text-xl font-extrabold tracking-tight text-amber-400 no-underline decoration-transparent sm:text-2xl lg:text-3xl">
      {banner.priceText}
    </p>

    <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
      <Link
        to={banner.link}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-primary/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 sm:px-6 sm:text-base motion-reduce:transform-none"
      >
        {banner.btnText}
        <FiArrowRight aria-hidden="true" />
      </Link>
      <Link
        to="/products"
        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-[background-color,border-color,color] duration-200 hover:border-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-6 sm:text-base"
      >
        Xem tất cả máy
      </Link>
    </div>
  </div>
)

const ProductVisual = ({ banner }) => {
  return (
    <div className="relative z-10 flex items-center justify-center md:col-span-5">
      <div aria-hidden="true" className="absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl sm:h-56 sm:w-56 lg:h-72 lg:w-72" />
      <div aria-hidden="true" className="absolute h-28 w-52 rounded-full bg-white/10 blur-3xl sm:h-36 sm:w-64" />

      <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-56 sm:w-56 md:h-72 md:w-72 lg:h-[22rem] lg:w-[22rem]">
        <img
          src={banner.image}
          alt={banner.title}
          draggable="false"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
          className="h-full w-full object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  )
}

const HeroSlide = ({ banner }) => (
  <article className={`relative isolate overflow-hidden bg-gradient-to-br ${banner.bgColor || 'from-slate-950 via-slate-900 to-slate-800'} text-white`}>
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-white/[0.03]" />
    <div className="relative grid min-h-[560px] w-full grid-cols-1 items-center gap-5 px-6 pb-16 pt-8 sm:min-h-[540px] sm:px-20 sm:pb-16 sm:pt-12 md:min-h-[440px] md:grid-cols-12 md:gap-8 md:px-20 md:py-12 lg:min-h-[440px] lg:px-24 lg:py-10 xl:px-28">
      <HeroContent banner={banner} />
      <ProductVisual banner={banner} />
    </div>
  </article>
)

const HeroBanner = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-secondary shadow-sm md:rounded-3xl">
    <BannerCarousel
      items={heroBanners}
      interval={15000}
      ariaLabel="Banner trang chủ"
      variant="hero"
      renderSlide={(banner) => <HeroSlide banner={banner} />}
    />
  </div>
)

export default HeroBanner
