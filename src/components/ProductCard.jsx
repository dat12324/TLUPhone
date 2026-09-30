import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

// Format giá tiền VND
const formatPrice = (price) => {
  return price.toLocaleString('vi-VN') + '₫'
}

// Tính phần trăm giảm giá
const getDiscountPercent = (originalPrice, price) => {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

const ProductCard = ({ product }) => {
  const discount = getDiscountPercent(product.originalPrice, product.price)

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden 
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 
                 flex flex-col group block cursor-pointer"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-full object-contain p-4 
                     group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge giảm giá */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs 
                          font-semibold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-4 flex flex-col flex-1">
        {/* Hãng */}
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {product.brand}
        </span>

        {/* Tên sản phẩm */}
        <h3 className="text-sm font-semibold text-secondary mt-1 line-clamp-2 
                       group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Thông số */}
        <p className="text-xs text-gray-400 mt-1">{product.specs}</p>

        {/* Đánh giá */}
        <div className="flex items-center gap-1 mt-2">
          <FiStar className="text-amber-400 fill-amber-400 text-sm" />
          <span className="text-sm font-medium text-secondary">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Giá */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
