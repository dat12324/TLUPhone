import { Link } from 'react-router-dom'
import { homeBrands } from '../../data/banners'
import { FiChevronRight } from 'react-icons/fi'

const BrandList = () => {
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
        {homeBrands.map((b) => (
          <Link
            key={b.id}
            to={`/products?brand=${encodeURIComponent(b.name)}`}
            className="group bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center text-center hover:border-primary hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <img
                src={b.logo}
                alt={b.name}
                className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
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
