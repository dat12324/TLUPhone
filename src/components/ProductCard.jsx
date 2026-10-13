import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiHeart, FiStar } from 'react-icons/fi'
import { usePromotion } from '../context/PromotionContext'

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
  const { applyPromotionToProduct } = usePromotion()
  const displayedProduct = applyPromotionToProduct(product)
  const discount = getDiscountPercent(displayedProduct.originalPrice, displayedProduct.price)

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
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-[border-color,box-shadow] duration-200 hover:border-rose-200 hover:shadow-sm"
    >
      <Link
        to={`/products/${displayedProduct.id}`}
        className="flex flex-col flex-1 cursor-pointer"
        aria-label={displayedProduct.name}
      >
        {/* Ảnh sản phẩm */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={displayedProduct.image || PLACEHOLDER_IMAGE}
            alt={displayedProduct.name}
            onError={handleImageError}
            className="h-full w-full object-contain p-4"
          />
          {/* Badge giảm giá */}
          {discount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[11px]
                            font-bold px-2 py-0.5 rounded-md shadow-xs">
              -{discount}%
            </span>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-3.5 sm:p-4 pb-0 sm:pb-0 flex flex-col flex-1">
          {/* Hãng */}
          <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
            {displayedProduct.brand}
          </span>

          {/* Tên sản phẩm */}
          <h3 className="text-xs sm:text-sm font-bold text-secondary mt-1 line-clamp-2
                         group-hover:text-primary transition-colors leading-snug">
            {displayedProduct.name}
          </h3>

          {/* Thông số (hiển thị dạng pill tag gọn gàng) */}
          {displayedProduct.specs && (
            <div className="mt-1.5">
              <span className="inline-block bg-slate-100 text-gray-600 text-[11px] px-2 py-0.5 rounded border border-gray-200/60">
                {displayedProduct.specs}
              </span>
            </div>
          )}

          {/* Đánh giá */}
          <div className="flex items-center gap-1 mt-2">
            <FiStar className="text-amber-400 fill-amber-400 text-xs" />
            <span className="text-xs font-bold text-secondary">{displayedProduct.rating}</span>
            <span className="text-[11px] text-gray-500">({displayedProduct.reviewCount})</span>
          </div>

          {/* Giá */}
          <div className="mt-2 pt-2 border-t border-gray-50">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-primary">
                {formatPrice(displayedProduct.price)}
              </span>
            </div>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through block">
                {formatPrice(displayedProduct.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Thao tác phụ đặt ngoài Link sản phẩm */}
      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-3 mt-auto flex items-center justify-between">
        <Link
          to={`/products/${displayedProduct.id}`}
          className="inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-rose-700"
        >
          <span>Xem chi tiết</span>
          <FiArrowRight className="text-sm" aria-hidden="true" />
        </Link>

        {/* Nút Trái tim yêu thích */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          className="flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FiHeart
            className={`transition-colors duration-200 ${
              isFavorite
                ? 'fill-primary text-primary'
                : 'text-gray-400 hover:text-primary'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export default ProductCard
