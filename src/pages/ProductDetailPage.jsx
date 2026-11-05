import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { FiChevronRight } from 'react-icons/fi'
import ProductPurchase from '../components/products/ProductPurchase'
import ProductInformation from '../components/products/ProductInformation'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api.js'
import { mapCatalogProduct } from '../helpers/productAdapter.js'
import { loadCatalogReferences } from '../helpers/catalog.js'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, cartBusy } = useCart()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  // State quản lý lựa chọn
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isSpecificationsOpen, setIsSpecificationsOpen] = useState(false)
  const modalCloseBtnRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadProduct = async () => {
      setIsLoading(true)
      setLoadError('')
      setProduct(null)
      setRelatedProducts([])

      try {
        const { data } = await api.get(`/products/${encodeURIComponent(slug)}`, { skipAuth: true, signal: controller.signal })
        if (controller.signal.aborted) return
        const loadVariants = async () => {
          const items = []
          let page = 1
          let totalPages = 1
          do {
            const { data: result } = await api.get('/product-variants', {
              params: { product: data.data._id, page, limit: 100 }, skipAuth: true, signal: controller.signal,
            })
            if (controller.signal.aborted) return []
            items.push(...result.data)
            totalPages = result.pagination.totalPages
            page += 1
          } while (page <= totalPages)
          return items
        }
        const [variants, brands, categories] = await Promise.all([
          loadVariants(), loadCatalogReferences('brands'), loadCatalogReferences('categories'),
        ])
        if (controller.signal.aborted) return
        const detail = mapCatalogProduct(data.data, variants, brands, categories)
        const related = await api.get('/products', {
          params: { brand: detail.brandInfo?.slug, page: 1, limit: 5, sort: 'popular' },
          skipAuth: true,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setProduct(detail)
        setRelatedProducts(related.data.data
          .filter(item => item.slug !== detail.slug)
          .slice(0, 4)
          .map(item => mapCatalogProduct(item, item.skus, [item.brandInfo].filter(Boolean), [item.categoryInfo].filter(Boolean))))
      } catch (error) {
        if (!controller.signal.aborted && error.name !== 'AbortError') {
          setLoadError(
            error.status === 404
              ? 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.'
              : error.message || 'Không thể tải thông tin sản phẩm.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadProduct()
    return () => controller.abort()
  }, [slug, retryKey])

  // Khóa cuộn trang nền và lắng nghe phím Escape khi Modal thông số mở
  useEffect(() => {
    if (!isSpecificationsOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus tự động vào nút đóng khi mở modal để hỗ trợ bàn phím / accessibility
    const focusTimer = setTimeout(() => {
      modalCloseBtnRef.current?.focus()
    }, 50)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSpecificationsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSpecificationsOpen])

  // Đồng bộ state khi đổi sản phẩm
  useEffect(() => {
    if (product) {
      const initialVariant = product.variants?.[0] || null
      const initialColor = product.colors?.[0] || null
      setSelectedVariant(initialVariant)
      setSelectedColor(initialColor)
      setSelectedImage(
        product.images?.includes(product.image) ? product.image : product.images?.[0] || PLACEHOLDER_IMAGE
      )
      setQuantity(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [product])

  // Khi đổi màu sắc -> cập nhật ảnh nếu màu có ảnh riêng
  const handleSelectColor = (color) => {
    setSelectedColor(color)
    setSelectedImage(color.image || (product.images?.includes(product.image) ? product.image : product.images?.[0]) || PLACEHOLDER_IMAGE)
    setQuantity(1)
  }

  // Khi đổi phiên bản
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant)
    if (!product.skuByCombination?.[`${variant.id}_${selectedColor?.id}`]) {
      const color = product.colors.find(item => product.skuByCombination?.[`${variant.id}_${item.id}`])
      setSelectedColor(color || null)
      setSelectedImage((product.images?.includes(product.image) ? product.image : product.images?.[0]) || PLACEHOLDER_IMAGE)
    }
    setQuantity(1)
  }

  const combinationKey = selectedVariant && selectedColor ? selectedVariant.id + '_' + selectedColor.id : null
  const currentSku = product?.skuByCombination?.[combinationKey] || null
  const rawStock = combinationKey ? product?.stockByCombination?.[combinationKey] : null
  const stock = rawStock == null ? null : Number(rawStock)
  const currentStock = stock !== null && Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : null

  const isInventoryUnknown = currentStock === null
  const isOutOfStock = currentStock === 0
  const isPurchaseUnavailable = isInventoryUnknown || isOutOfStock
  const purchaseLimit = currentStock ?? 0

  // Giá hiện tại & Giá gốc theo phiên bản đang chọn
  const currentPrice = currentSku?.price ?? (selectedVariant ? selectedVariant.price : product?.price || 0)
  const currentOriginalPrice = currentSku
    ? currentSku.originalPrice
    : selectedVariant
      ? selectedVariant.originalPrice
    : product?.originalPrice || currentPrice

  const discountPercent =
    currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0

  const purchase = {
    currentSku, currentStock, currentPrice, currentOriginalPrice, discountPercent,
    isInventoryUnknown, isOutOfStock, isPurchaseUnavailable: isPurchaseUnavailable || cartBusy, purchaseLimit,
  }

  // Tăng / giảm số lượng mua
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncreaseQuantity = () => {
    if (quantity < purchaseLimit) {
      setQuantity((prev) => prev + 1)
    }
  }

  // Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (isPurchaseUnavailable) return false
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/products/' + slug } } })
      return false
    }
    return addToCart(
      product,
      currentSku ? { ...selectedVariant, ...currentSku } : selectedVariant,
      selectedColor,
      quantity,
      selectedImage,
      purchaseLimit
    )
  }

  // Mua ngay (Thêm vào giỏ và chuyển đến trang Cart)
  const handleBuyNow = async () => {
    if (isPurchaseUnavailable) return
    if (await handleAddToCart()) navigate('/cart')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-[60vh] px-4 py-16" aria-label="Đang tải sản phẩm">
        <div className="mx-auto grid max-w-5xl animate-pulse gap-8 rounded-2xl bg-white p-8 md:grid-cols-2">
          <div className="aspect-square rounded-xl bg-slate-100" />
          <div className="space-y-4 pt-4">
            <div className="h-7 w-3/4 rounded bg-slate-100" />
            <div className="h-5 w-1/3 rounded bg-slate-100" />
            <div className="h-16 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  // Trường hợp API lỗi hoặc không tìm thấy sản phẩm
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
            {loadError || 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.'}
          </p>
          {loadError && (
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="mb-3 mr-2 inline-flex items-center justify-center rounded-lg border border-primary px-6 py-2.5 text-sm font-medium text-primary"
            >
              Thử lại
            </button>
          )}
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
        <ProductPurchase
          product={product}
          selectedVariant={selectedVariant}
          selectedColor={selectedColor}
          selectedImage={selectedImage}
          quantity={quantity}
          purchase={purchase}
          onSelectVariant={handleSelectVariant}
          onSelectColor={handleSelectColor}
          onSelectImage={setSelectedImage}
          onDecreaseQuantity={handleDecreaseQuantity}
          onIncreaseQuantity={handleIncreaseQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
        <ProductInformation
          product={product}
          selectedVariant={selectedVariant}
          isDescriptionExpanded={isDescriptionExpanded}
          onToggleDescription={() => setIsDescriptionExpanded(value => !value)}
          isSpecificationsOpen={isSpecificationsOpen}
          onSpecsToggle={setIsSpecificationsOpen}
          modalCloseBtnRef={modalCloseBtnRef}
        />

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
                <ProductCard key={relProduct.databaseId || relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
