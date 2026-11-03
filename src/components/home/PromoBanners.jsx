import BannerLink from '../common/BannerLink'
import { FiArrowRight, FiGrid, FiSmartphone, FiTruck } from 'react-icons/fi'
import useBanners from '../../hooks/useBanners'

const bannerStyles = {
  rose: {
    card: 'border-rose-200 bg-rose-50',
    tag: 'bg-rose-100 text-primary',
    icon: 'bg-white text-primary ring-rose-200',
  },
  slate: {
    card: 'border-slate-200 bg-slate-100',
    tag: 'bg-white text-secondary',
    icon: 'bg-white text-secondary ring-slate-200',
  },
  emerald: {
    card: 'border-emerald-200 bg-emerald-50',
    tag: 'bg-emerald-100 text-emerald-700',
    icon: 'bg-white text-emerald-700 ring-emerald-200',
  },
}

const bannerIcons = {
  phone: FiSmartphone,
  brands: FiGrid,
  shipping: FiTruck,
}

const PromoBanners = ({ startIndex = 0, count = 2 }) => {
  const { banners, loading, error } = useBanners('promo')
  const selectedBanners = banners.slice(startIndex, startIndex + count)
  if (loading) return <div className="my-8 h-36 animate-pulse rounded-2xl bg-slate-200" aria-label="Đang tải banner phụ" />
  if (error || !selectedBanners.length) return null

  return (
    <div className={`my-8 grid grid-cols-1 gap-4 ${count === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {selectedBanners.map((banner) => {
        const styles = bannerStyles[banner.tone] || bannerStyles.rose
        const Icon = bannerIcons[banner.icon] || FiSmartphone

        return (
          <BannerLink
            key={banner.id}
            to={banner.link || '/products'}
            className={`group flex flex-col justify-between rounded-2xl border p-5 transition-colors hover:border-primary sm:p-6 ${styles.card}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${styles.tag}`}>
                  {banner.tag}
                </span>
                <h3 className="pt-1 text-lg font-bold leading-snug text-secondary sm:text-xl">
                  {banner.title}
                </h3>
                <p className="text-xs text-slate-600 sm:text-sm">{banner.subtitle}</p>
              </div>
              {banner.image?.url ? <img src={banner.image.url} alt="" className="h-16 w-20 shrink-0 rounded-lg object-contain" /> : (
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ring-1 ${styles.icon}`}>
                  <Icon aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-4 text-xs font-semibold text-primary transition-colors group-hover:text-rose-700">
              <span>{banner.btnText || 'Khám phá ngay'}</span>
              <FiArrowRight className="text-sm" aria-hidden="true" />
            </div>
          </BannerLink>
        )
      })}
    </div>
  )
}

export default PromoBanners
