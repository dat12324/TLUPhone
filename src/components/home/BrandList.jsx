import { Link } from 'react-router-dom'
import { homeBrands } from '../../data/banners'
import { FiChevronRight } from 'react-icons/fi'
import useActiveBrands from '../../hooks/useActiveBrands'

const BrandList = () => {
  const { activeBrands, loading } = useActiveBrands()
  const activeByName = new Map(
    activeBrands.map((brand) => [brand.name.toLocaleLowerCase('vi-VN'), brand]),
  )
  const visibleBrands = homeBrands
    .filter((brand) => activeByName.has(brand.name.toLocaleLowerCase('vi-VN')))
    .map((brand) => ({
      ...brand,
      ...activeByName.get(brand.name.toLocaleLowerCase('vi-VN')),
      logo: activeByName.get(brand.name.toLocaleLowerCase('vi-VN'))?.logo || brand.logo,
    }))

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-secondary">
            Thương hiệu điện thoại
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Các hãng smartphone hàng đầu chính hãng tại TLUPhone
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
        >
          <span>Tất cả thương hiệu</span>
          <FiChevronRight className="text-sm" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {loading ? Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" aria-hidden="true" />
        )) : visibleBrands.map((b) => (
          <Link
            key={b.id}
            to={`/products?brand=${encodeURIComponent(b.slug)}`}
            className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition-colors duration-200 hover:border-primary"
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center">
              <img
                src={b.logo}
                alt={b.name}
                className="max-h-full max-w-full object-contain opacity-90 transition-opacity group-hover:opacity-100"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <span className="text-sm font-bold text-secondary group-hover:text-primary transition-colors">
              {b.name}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 hidden sm:block truncate max-w-full">
              {b.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BrandList
