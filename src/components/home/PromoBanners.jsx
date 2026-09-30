import { Link } from 'react-router-dom'
import { promoBanners } from '../../data/banners'
import { FiArrowRight } from 'react-icons/fi'

const PromoBanners = ({ startIndex = 0, count = 2 }) => {
  const selectedBanners = promoBanners.slice(startIndex, startIndex + count)

  return (
    <div className={`grid grid-cols-1 ${count === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 my-8`}>
      {selectedBanners.map((banner) => (
        <Link
          key={banner.id}
          to={banner.link}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bgGradient} p-5 sm:p-6 text-white shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {banner.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-bold pt-1 leading-snug">
                {banner.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                {banner.subtitle}
              </p>
            </div>
            <span className="text-3xl sm:text-4xl filter drop-shadow group-hover:scale-125 transition-transform shrink-0">
              {banner.iconText}
            </span>
          </div>

          <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
            <span>Khám phá ngay</span>
            <FiArrowRight className="text-sm" />
          </div>
        </Link>
      ))}
    </div>
  )
}

export default PromoBanners
