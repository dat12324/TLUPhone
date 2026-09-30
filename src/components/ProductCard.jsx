import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiStar, FiHeart, FiTruck } from 'react-icons/fi'

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
  const [isFavorite, setIsFavorite] = useState(false)
  const discount = getDiscountPercent(product.originalPrice, product.price)

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE
  }

  // Xử lý bấm Yêu thích (ngăn không cho nhảy sang trang chi tiết)
  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite((prev) => !prev)
    // Sau này khi có API / Authentication: gọi API add/remove wishlist tại đây
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden 
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 
                 flex flex-col group block cursor-pointer relative"
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
          <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[11px] 
                          font-bold px-2 py-0.5 rounded-md shadow-xs">
            -{discount}%
          </span>
        )}

        {/* Badge Trả góp 0% */}
        <span className="absolute top-2.5 right-2.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] 
                        font-semibold px-1.5 py-0.5 rounded">
          Trả góp 0%
        </span>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Hãng */}
        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
          {product.brand}
        </span>

        {/* Tên sản phẩm */}
        <h3 className="text-xs sm:text-sm font-bold text-secondary mt-1 line-clamp-2 
                       group-hover:text-primary transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Thông số (hiển thị dạng pill tag gọn gàng) */}
        {product.specs && (
          <div className="mt-1.5">
            <span className="inline-block bg-slate-100 text-gray-600 text-[11px] px-2 py-0.5 rounded border border-gray-200/60">
              {product.specs}
            </span>
          </div>
        )}

        {/* Đánh giá */}
        <div className="flex items-center gap-1 mt-2">
          <FiStar className="text-amber-400 fill-amber-400 text-xs" />
          <span className="text-xs font-bold text-secondary">{product.rating}</span>
          <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Giá */}
        <div className="mt-2 pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-extrabold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through block">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Bottom bar: Tag giao 2h & Nút Trái tim Yêu thích */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            <FiTruck className="text-xs" />
            <span>Giao 2H</span>
          </span>

          {/* Nút Trái tim yêu thích */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            className="p-1.5 rounded-full hover:bg-rose-50 transition-all text-base focus:outline-none"
          >
            <FiHeart
              className={`transition-all duration-200 ${
                isFavorite
                  ? 'text-primary fill-primary scale-110'
                  : 'text-gray-400 hover:text-primary hover:scale-110'
              }`}
            />
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
