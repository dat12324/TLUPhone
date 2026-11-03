import { useMemo } from 'react'
import { FiStar, FiShoppingCart, FiZap, FiCheckCircle, FiXCircle, FiTruck, FiShield, FiRotateCcw, FiMinus, FiPlus } from 'react-icons/fi'
import { getProductGallery } from '../../helpers/productAdapter.js'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'
const formatPrice = price => (price || 0).toLocaleString('vi-VN') + '₫'

const ProductPurchase = ({
  product, selectedVariant, selectedColor, selectedImage, quantity, purchase,
  onSelectVariant, onSelectColor, onSelectImage, onDecreaseQuantity, onIncreaseQuantity, onAddToCart, onBuyNow,
}) => {
  const { currentSku, currentStock, currentPrice, currentOriginalPrice, discountPercent,
    isInventoryUnknown, isOutOfStock, isPurchaseUnavailable, purchaseLimit } = purchase
  const galleryImages = useMemo(() => getProductGallery(product), [product])
  const handleImageError = event => {
    if (!event.currentTarget.src.endsWith(PLACEHOLDER_IMAGE)) event.currentTarget.src = PLACEHOLDER_IMAGE
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 lg:p-8 mb-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col">
          <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-6 mb-4">
            <img
              src={selectedImage || PLACEHOLDER_IMAGE}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                GIẢM {discountPercent}%
              </span>
            )}
          </div>
          {galleryImages.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  aria-pressed={selectedImage === imgUrl}
                  aria-label={`Xem ảnh ${idx + 1}`}
                  onClick={() => onSelectImage(imgUrl)}
                  className={`relative w-16 h-16 rounded-lg border-2 p-1 bg-white shrink-0 transition-all overflow-hidden ${selectedImage === imgUrl
                      ? 'border-primary shadow-sm scale-105'
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumb ${idx}`}
                    onError={handleImageError}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <span className="inline-block bg-slate-100 text-secondary text-xs font-semibold px-2.5 py-1 rounded mb-2">
              {product.brand}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md">
                <FiStar className="text-amber-500 fill-amber-500 text-sm" />
                <span className="text-sm font-bold text-amber-700">
                  {product.rating}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviewCount} đánh giá từ khách hàng)
              </span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1.5">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-rose-600">
                    <FiXCircle className="text-base" /> Tạm hết hàng
                  </span>
                ) : isInventoryUnknown ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-700">
                    <FiCheckCircle className="text-base" /> Liên hệ xác nhận tồn kho
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <FiCheckCircle className="text-base" /> Còn hàng ({currentStock} máy có sẵn)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl mb-6">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-primary">
                {currentSku ? formatPrice(currentPrice) : 'Chưa có giá'}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(currentOriginalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-primary bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Tiết kiệm {formatPrice(currentOriginalPrice - currentPrice)}
                  </span>
                </>
              )}
            </div>
            {product.shortDescription && (
              <p className="text-xs md:text-sm text-gray-600 mt-2">
                {product.shortDescription}
              </p>
            )}
          </div>
          {product.variants && product.variants.length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-secondary mb-2">
                Chọn phiên bản bộ nhớ:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onSelectVariant(variant)}
                      className={`p-3 rounded-xl border text-left transition-all ${isSelected
                          ? 'border-primary bg-rose-50/50 ring-1 ring-primary text-secondary'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                      <div className="font-semibold text-sm">
                        {variant.storage} {variant.ram ? `(${variant.ram})` : ''}
                      </div>
                      <div className="text-xs text-primary font-medium mt-0.5">
                        {formatPrice(variant.price)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-secondary">
                  Chọn màu sắc:{' '}
                  <span className="font-normal text-primary">
                    {selectedColor?.name}
                  </span>
                </label>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor?.id === color.id
                  return (
                    <button
                      key={color.id}
                      type="button"
                      disabled={!product.skuByCombination?.[`${selectedVariant?.id}_${color.id}`]}
                      onClick={() => onSelectColor(color)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isSelected
                          ? 'border-primary bg-rose-50/50 ring-1 ring-primary text-secondary'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-inner"
                        style={{ backgroundColor: color.colorCode || '#ccc' }}
                      />
                      <span>{color.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="mt-auto space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-secondary">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={onDecreaseQuantity}
                  disabled={isPurchaseUnavailable || quantity <= 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <FiMinus className="text-sm" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-secondary select-none">
                  {isInventoryUnknown ? '—' : isOutOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  onClick={onIncreaseQuantity}
                  disabled={isPurchaseUnavailable || quantity >= purchaseLimit}
                  className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <FiPlus className="text-sm" />
                </button>
              </div>
              {isOutOfStock && (
                <span className="text-xs text-rose-500 font-medium">
                  Tổ hợp này hiện đã hết hàng, vui lòng chọn màu hoặc phiên bản khác!
                </span>
              )}
              {isInventoryUnknown && (
                <span className="text-xs font-medium text-amber-700">
                  Sản phẩm này chưa có dữ liệu tồn kho, vui lòng liên hệ cửa hàng để xác nhận.
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={isPurchaseUnavailable}
                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all shadow-sm ${isPurchaseUnavailable
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'border-2 border-primary text-primary bg-rose-50 hover:bg-primary hover:text-white cursor-pointer active:scale-[0.98]'
                  }`}
              >
                <FiShoppingCart className="text-lg" />
                Thêm vào giỏ hàng
              </button>

              <button
                type="button"
                onClick={onBuyNow}
                disabled={isPurchaseUnavailable}
                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all shadow-sm ${isPurchaseUnavailable
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-rose-700 active:scale-[0.98] cursor-pointer'
                  }`}
              >
                <FiZap className="text-lg" />
                Mua ngay
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
              {[
                [FiTruck, 'Giao hàng hỏa tốc 2h'],
                [FiShield, 'Bảo hành 12 tháng chính hãng'],
                [FiRotateCcw, '1 đổi 1 trong 30 ngày lỗi NSX'],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-lg">
                  <Icon className="text-primary text-base shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default ProductPurchase
