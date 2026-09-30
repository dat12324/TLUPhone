import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  FiStar,
  FiShoppingCart,
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import products from '../data/products'
import { useCart } from '../context/CartContext'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

// Format tiền tệ VND
const formatPrice = (price) => {
  return (price || 0).toLocaleString('vi-VN') + '₫'
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const productId = parseInt(id, 10)

  // Tìm sản phẩm theo id
  const product = useMemo(() => {
    return products.find((p) => p.id === productId)
  }, [productId])

  // State quản lý lựa chọn
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Đồng bộ state khi đổi sản phẩm
  useEffect(() => {
    if (product) {
      const initialVariant = product.variants?.[0] || null
      const initialColor = product.colors?.[0] || null
      setSelectedVariant(initialVariant)
      setSelectedColor(initialColor)
      setSelectedImage(
        initialColor?.image || product.images?.[0] || product.image || PLACEHOLDER_IMAGE
      )
      setQuantity(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [product])

  // Khi đổi màu sắc -> cập nhật ảnh nếu màu có ảnh riêng
  const handleSelectColor = (color) => {
    setSelectedColor(color)
    if (color.image) {
      setSelectedImage(color.image)
    }
    setQuantity(1)
  }

  // Khi đổi phiên bản
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant)
    setQuantity(1)
  }

  // Xử lý lỗi ảnh fallback
  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE
  }

  // Danh sách ảnh hiển thị (gồm ảnh chung + ảnh của các màu nếu có)
  const galleryImages = useMemo(() => {
    if (!product) return []
    const list = []
    if (product.images && product.images.length > 0) {
      list.push(...product.images)
    } else if (product.image) {
      list.push(product.image)
    }
    // Thêm ảnh từ các màu nếu chưa có
    product.colors?.forEach((c) => {
      if (c.image && !list.includes(c.image)) {
        list.push(c.image)
      }
    })
    return list.length > 0 ? list : [PLACEHOLDER_IMAGE]
  }, [product])

  // Tính toán tồn kho theo tổ hợp Phiên bản + Màu sắc
  const currentStock = useMemo(() => {
    if (!product) return 0
    if (selectedVariant && selectedColor && product.stockByCombination) {
      const key = `${selectedVariant.id}_${selectedColor.id}`
      return product.stockByCombination[key] ?? 0
    }
    return 10 // Mặc định nếu không phân tổ hợp
  }, [product, selectedVariant, selectedColor])

  const isOutOfStock = currentStock === 0

  // Giá hiện tại & Giá gốc theo phiên bản đang chọn
  const currentPrice = selectedVariant ? selectedVariant.price : product?.price || 0
  const currentOriginalPrice = selectedVariant
    ? selectedVariant.originalPrice
    : product?.originalPrice || currentPrice

  const discountPercent =
    currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0

  // Tăng / giảm số lượng mua
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncreaseQuantity = () => {
    if (quantity < currentStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (isOutOfStock) return
    addToCart(
      product,
      selectedVariant,
      selectedColor,
      quantity,
      selectedImage,
      currentStock
    )
  }

  // Mua ngay (Thêm vào giỏ và chuyển đến trang Cart)
  const handleBuyNow = () => {
    if (isOutOfStock) return
    addToCart(
      product,
      selectedVariant,
      selectedColor,
      quantity,
      selectedImage,
      currentStock
    )
    navigate('/cart')
  }

  // Sản phẩm liên quan cùng hãng
  const relatedProducts = useMemo(() => {
    if (!product) return []
    const sameBrand = products.filter(
      (p) => p.id !== product.id && p.brand === product.brand
    )
    if (sameBrand.length >= 4) {
      return sameBrand.slice(0, 4)
    }
    const others = products.filter(
      (p) => p.id !== product.id && p.brand !== product.brand
    )
    return [...sameBrand, ...others].slice(0, 4)
  }, [product])

  // Trường hợp không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white 
                       rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <FiChevronRight className="text-gray-400 shrink-0" />
            <Link to="/products" className="hover:text-primary transition-colors">
              Sản phẩm
            </Link>
            <FiChevronRight className="text-gray-400 shrink-0" />
            <span className="text-gray-400 hover:text-primary transition-colors">
              {product.brand}
            </span>
            <FiChevronRight className="text-gray-400 shrink-0" />
            <span className="text-secondary font-medium truncate max-w-[200px] md:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Phần 1: Ảnh + Thông tin mua hàng */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 lg:p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cột Trái: Gallery Ảnh (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              {/* Ảnh chính */}
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

              {/* Danh sách ảnh thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-16 h-16 rounded-lg border-2 p-1 bg-white shrink-0 transition-all overflow-hidden ${
                        selectedImage === imgUrl
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

            {/* Cột Phải: Thông tin & Lựa chọn mua hàng (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Tên & Thương hiệu */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <span className="inline-block bg-slate-100 text-secondary text-xs font-semibold px-2.5 py-1 rounded mb-2">
                  {product.brand}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-secondary">
                  {product.name}
                </h1>

                {/* Đánh giá & Số lượng đã bán/review */}
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
                  {/* Trạng thái còn hàng */}
                  <div className="flex items-center gap-1.5">
                    {isOutOfStock ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-rose-600">
                        <FiXCircle className="text-base" /> Tạm hết hàng
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                        <FiCheckCircle className="text-base" /> Còn hàng ({currentStock} máy có sẵn)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Khu vực Giá */}
              <div className="bg-slate-50 p-4 rounded-xl mb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-primary">
                    {formatPrice(currentPrice)}
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

              {/* Chọn Phiên bản (RAM / ROM) */}
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
                          onClick={() => handleSelectVariant(variant)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
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

              {/* Chọn Màu sắc */}
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
                          onClick={() => handleSelectColor(color)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
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

              {/* Số lượng & Nút Mua hàng */}
              <div className="mt-auto space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-secondary">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={handleDecreaseQuantity}
                      disabled={isOutOfStock || quantity <= 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      <FiMinus className="text-sm" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-secondary select-none">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncreaseQuantity}
                      disabled={isOutOfStock || quantity >= currentStock}
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
                </div>

                {/* Các nút hành động */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'border-2 border-primary text-primary bg-rose-50 hover:bg-primary hover:text-white cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <FiShoppingCart className="text-lg" />
                    Thêm vào giỏ hàng
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                      isOutOfStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-rose-700 active:scale-[0.98] cursor-pointer'
                    }`}
                  >
                    <FiZap className="text-lg" />
                    Mua ngay
                  </button>
                </div>

                {/* Chính sách bán hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-lg">
                    <FiTruck className="text-primary text-base shrink-0" />
                    <span>Giao hàng hỏa tốc 2h</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-lg">
                    <FiShield className="text-primary text-base shrink-0" />
                    <span>Bảo hành 12 tháng chính hãng</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-lg">
                    <FiRotateCcw className="text-primary text-base shrink-0" />
                    <span>1 đổi 1 trong 30 ngày lỗi NSX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần 2: Đặc điểm nổi bật & Thông số kỹ thuật */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Cột Trái: Đặc điểm nổi bật + Mô tả (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-gray-100">
                Đặc điểm nổi bật
              </h2>

              {/* Highlights cards */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="space-y-2.5 mb-6">
                  {product.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-gray-700 bg-rose-50/40 p-3 rounded-xl border border-rose-100/60"
                    >
                      <FiCheckCircle className="text-primary text-base mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Nội dung mô tả chi tiết */}
              {product.description && (
                <div>
                  <h3 className="text-base font-semibold text-secondary mb-3">
                    Đánh giá chi tiết {product.name}
                  </h3>
                  <div
                    className={`relative text-sm text-gray-600 leading-relaxed space-y-3 transition-all ${
                      !isDescriptionExpanded ? 'max-h-48 overflow-hidden' : ''
                    }`}
                  >
                    {product.description.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}

                    {!isDescriptionExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* Nút Xem thêm / Thu gọn */}
                  <div className="text-center mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-rose-700 transition-colors"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Thu gọn nội dung <FiChevronUp />
                        </>
                      ) : (
                        <>
                          Xem thêm bài viết <FiChevronDown />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải: Bảng thông số kỹ thuật (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-gray-100">
                Thông số kỹ thuật
              </h2>

              {product.specifications ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {Object.entries(product.specifications).map(([key, group]) => (
                    <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 px-3.5 py-2 font-semibold text-xs text-secondary uppercase tracking-wider">
                        {group.title}
                      </div>
                      <div className="divide-y divide-gray-100 text-xs">
                        {Object.entries(group.items).map(([specKey, specVal]) => (
                          <div
                            key={specKey}
                            className="grid grid-cols-12 px-3.5 py-2.5 hover:bg-slate-50 transition-colors"
                          >
                            <span className="col-span-5 text-gray-500 font-medium">
                              {specKey}
                            </span>
                            <span className="col-span-7 text-secondary font-semibold">
                              {specVal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Đang cập nhật thông số kỹ thuật...</p>
              )}
            </div>
          </div>
        </div>

        {/* Phần 3: Sản phẩm tương tự */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-secondary">
                  Sản phẩm tương tự
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                  Các dòng smartphone cùng phân khúc hoặc cùng thương hiệu {product.brand}
                </p>
              </div>
              <Link
                to="/products"
                className="text-xs md:text-sm font-semibold text-primary hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
