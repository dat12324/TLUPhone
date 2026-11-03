import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import useActiveBrands from '../../hooks/useActiveBrands'

const BrandItem = ({ brand }) => {
  const [failedLogo, setFailedLogo] = useState(null)
  const showLogo = brand.logo && failedLogo !== brand.logo

  return (
    <Link
      to={`/products?brand=${encodeURIComponent(brand.slug)}`}
      aria-label={`Xem điện thoại ${brand.name}`}
      title={brand.name}
      className="flex h-16 min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 transition-colors hover:border-primary hover:bg-rose-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-[72px]"
    >
      {showLogo ? (
        <img
          src={brand.logo}
          alt=""
          loading="lazy"
          className="h-7 w-28 max-w-full object-contain sm:h-8"
          onError={() => setFailedLogo(brand.logo)}
        />
      ) : (
        <span className="truncate text-sm font-bold text-secondary sm:text-base">{brand.name}</span>
      )}
    </Link>
  )
}

const BrandList = () => {
  const { activeBrands, loading } = useActiveBrands()
  if (!loading && !activeBrands.length) return null

  return (
    <section className="my-8" aria-labelledby="home-brands-title" aria-busy={loading}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="home-brands-title" className="text-xl font-bold text-secondary md:text-2xl">Thương hiệu điện thoại</h2>
        <Link to="/products" className="inline-flex min-h-11 items-center gap-1 rounded text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm">
          Xem sản phẩm <FiChevronRight aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {loading ? Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white sm:h-[72px]" aria-hidden="true" />
        )) : activeBrands.map(brand => <BrandItem key={brand.id} brand={brand} />)}
      </div>
    </section>
  )
}

export default BrandList
