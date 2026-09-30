import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiArrowLeft,
  FiChevronRight,
  FiShield,
  FiTruck,
  FiTag,
  FiX,
  FiGift,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import coupons from '../data/coupons'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const formatPrice = (price) => {
  return (price || 0).toLocaleString('vi-VN') + '₫'
}

const CartPage = () => {
  const navigate = useNavigate()
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll,
    removeSelectedItems,
    isAllSelected,
    selectedItems,
    selectedSubtotal,
    selectedDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    finalTotal,
    totalSaved,
  } = useCart()

  // State nhập mã giảm giá
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [selectedCouponCode, setSelectedCouponCode] = useState('')

  // Xử lý khi bấm nút "Tiến hành thanh toán"
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return
    navigate('/checkout')
  }

  // Tổng số lượng máy của các sản phẩm đang chọn
  const selectedTotalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = (code = couponCode) => {
    setCouponError('')
    const result = applyCoupon(code)
    if (result.success) {
      setCouponCode('')
      setSelectedCouponCode('')
      setShowCouponInput(false)
      setCouponError('')
    } else {
      setCouponError(result.message)
    }
  }

  // Xử lý hủy mã
  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponError('')
  }

  // Trường hợp Giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-[70vh] flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-rose-50 text-primary rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
              <FiShoppingBag />
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-2">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn mẫu smartphone chính hãng giá tốt ngay nhé!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-primary hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <FiArrowLeft />
              <span>Tiếp tục mua sắm</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <FiChevronRight className="text-gray-400" />
            <span className="text-secondary font-medium">Giỏ hàng ({cartItems.length})</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tiêu đề trang */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            Giỏ hàng của bạn
          </h1>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
          >
            <FiArrowLeft />
            <span>Tiếp tục chọn thêm sản phẩm</span>
          </Link>
        </div>

        {/* Layout: Danh sách giỏ hàng (Trái) + Tổng kết đơn hàng (Phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI: DANH SÁCH CART ITEMS (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Thanh thao tác chọn tất cả / Xóa đã chọn */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                />
                <span className="text-sm font-semibold text-secondary">
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </span>
              </label>

              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={removeSelectedItems}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Xóa các mục đã chọn ({selectedItems.length})</span>
                </button>
              )}
            </div>

            {/* Danh sách các sản phẩm trong giỏ */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const itemTotal = item.price * item.quantity
                const isMaxStock = item.quantity >= (item.stock || 99)

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                      item.selected
                        ? 'border-rose-200 bg-white'
                        : 'border-gray-100 bg-slate-50/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Checkbox chọn sản phẩm */}
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                        />
                      </div>

                      {/* Ảnh sản phẩm */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl p-2 shrink-0 border border-gray-100 flex items-center justify-center group overflow-hidden"
                      >
                        <img
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE
                          }}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </Link>

                      {/* Thông tin sản phẩm */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] sm:text-xs text-gray-400 uppercase font-semibold">
                              {item.brand}
                            </span>
                            <Link
                              to={`/products/${item.productId}`}
                              className="block text-sm sm:text-base font-bold text-secondary hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.name}
                            </Link>
                          </div>

                          {/* Nút xóa item */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Xóa sản phẩm"
                            title="Xóa sản phẩm"
                            className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            <FiTrash2 className="text-base" />
                          </button>
                        </div>

                        {/* Phân loại phiên bản & màu sắc */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {item.selectedVariant && (
                            <span className="inline-block bg-slate-100 text-secondary text-xs px-2 py-0.5 rounded border border-gray-200 font-medium">
                              {item.selectedVariant.storage}{' '}
                              {item.selectedVariant.ram
                                ? `(${item.selectedVariant.ram})`
                                : ''}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-secondary text-xs px-2 py-0.5 rounded border border-gray-200 font-medium">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor:
                                    item.selectedColor.colorCode || '#ccc',
                                }}
                              />
                              <span>{item.selectedColor.name}</span>
                            </span>
                          )}
                        </div>

                        {/* Giá đơn vị & Điều chỉnh số lượng */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                          {/* Đơn giá */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-base sm:text-lg font-extrabold text-primary">
                              {formatPrice(item.price)}
                            </span>
                            {item.originalPrice > item.price && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Bộ điều chỉnh số lượng */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              >
                                <FiMinus className="text-xs" />
                              </button>
                              <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-bold text-secondary select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={isMaxStock}
                                className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              >
                                <FiPlus className="text-xs" />
                              </button>
                            </div>

                            {/* Thành tiền */}
                            <span className="text-xs sm:text-sm font-bold text-secondary whitespace-nowrap min-w-[90px] text-right">
                              = {formatPrice(itemTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Cảnh báo tồn kho nếu chạm mốc */}
                        {isMaxStock && (
                          <div className="text-[11px] text-amber-600 mt-1">
                            * Đã đạt số lượng tồn kho khả dụng ({item.stock} máy)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (4 cols - Sticky) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-6 shadow-sm sticky top-24 space-y-4">
              <h2 className="text-lg font-bold text-secondary pb-3 border-b border-gray-100">
                Thông tin đơn hàng
              </h2>

              {/* Chi tiết tính tiền */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Số lượng sản phẩm</span>
                  <span className="font-semibold text-secondary">
                    {selectedTotalQuantity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-secondary">
                    {formatPrice(selectedSubtotal)}
                  </span>
                </div>

                {selectedDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Khuyến mãi giảm:</span>
                    <span className="font-semibold">
                      - {formatPrice(selectedDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
              </div>

              {/* Mã giảm giá */}
              <div className="pt-3 border-t border-gray-100">
                {appliedCoupon ? (
                  // Đang có mã được áp dụng
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiTag className="text-emerald-600" />
                        <div>
                          <span className="text-sm font-bold text-emerald-700">
                            {appliedCoupon.code}
                          </span>
                          <p className="text-[11px] text-emerald-600">
                            {appliedCoupon.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                        title="Hủy mã giảm giá"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                    {couponDiscount > 0 && (
                      <p className="text-xs font-semibold text-emerald-700 mt-1.5">
                        Giảm: -{formatPrice(couponDiscount)}
                      </p>
                    )}
                    {couponDiscount === 0 && selectedSubtotal < appliedCoupon.minOrder && (
                      <p className="text-[11px] text-amber-600 mt-1.5">
                        * Đơn tối thiểu {formatPrice(appliedCoupon.minOrder)} để áp dụng
                      </p>
                    )}
                  </div>
                ) : (
                  // Chưa có mã → hiện nút "Chọn" hoặc ô nhập
                  <div>
                    {!showCouponInput ? (
                      <button
                        type="button"
                        onClick={() => setShowCouponInput(true)}
                        className="flex items-center justify-between w-full py-2 text-sm group"
                      >
                        <span className="flex items-center gap-2 text-gray-600">
                          <FiTag className="text-primary" />
                          <span>Áp dụng mã giảm giá</span>
                        </span>
                        <span className="text-primary font-semibold group-hover:underline">
                          Chọn
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FiTag className="text-primary shrink-0" />
                          <span className="text-sm font-medium text-gray-600">
                            Nhập mã giảm giá
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase())
                              setCouponError('')
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Nhập mã tại đây..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                                       uppercase placeholder:normal-case transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            disabled={!couponCode.trim()}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shrink-0 ${
                              couponCode.trim()
                                ? 'bg-primary text-white hover:bg-rose-700 active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Áp dụng
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-rose-500 font-medium">
                            {couponError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowCouponInput(false)
                            setCouponCode('')
                            setCouponError('')
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Đóng
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Giảm giá coupon trong phần chi tiết */}
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-600">
                  <span>Mã giảm giá ({appliedCoupon?.code}):</span>
                  <span className="font-semibold">
                    - {formatPrice(couponDiscount)}
                  </span>
                </div>
              )}

              {/* Tổng thanh toán */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-base font-bold text-secondary">
                    Tổng thanh toán:
                  </span>
                  <span className="text-2xl font-extrabold text-primary">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 text-right">
                  (Đã bao gồm thuế VAT 10%)
                </p>
                {totalSaved > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold text-right mt-1">
                    Bạn đã tiết kiệm được {formatPrice(totalSaved)}
                  </p>
                )}
              </div>

              {/* Nút Tiến hành thanh toán */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={selectedItems.length === 0}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                  selectedItems.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-rose-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <span>Tiến hành thanh toán ({selectedTotalQuantity})</span>
                <FiChevronRight className="text-base" />
              </button>

              {selectedItems.length === 0 && (
                <p className="text-center text-xs text-rose-500 font-medium">
                  * Vui lòng chọn ít nhất 1 sản phẩm để thanh toán
                </p>
              )}

              {/* Chính sách hỗ trợ */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiTruck className="text-primary shrink-0" />
                  <span>Giao hàng hỏa tốc 2H trong nội thành</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiShield className="text-primary shrink-0" />
                  <span>Kiểm tra hàng trước khi thanh toán</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCouponInput && !appliedCoupon && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCouponInput(false)
          }}
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="relative border-b border-gray-100 px-6 py-5 text-center">
              <h2 className="text-xl font-bold text-secondary sm:text-2xl">
                Nhập hoặc chọn mã khuyến mãi
              </h2>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setShowCouponInput(false)}
                className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase())
                    setSelectedCouponCode('')
                    setCouponError('')
                  }}
                  onKeyDown={(event) => event.key === 'Enter' && couponCode.trim() && handleApplyCoupon()}
                  placeholder="Nhập mã khuyến mãi"
                  autoFocus
                  className="min-w-0 flex-1 px-4 py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-gray-400 sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  disabled={!couponCode.trim()}
                  className="border-l border-gray-200 px-5 font-semibold text-primary disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  Áp dụng
                </button>
              </div>

              {couponError && <p className="mt-2 text-sm font-medium text-rose-500">{couponError}</p>}

              <p className="mb-3 mt-5 text-sm font-semibold uppercase text-gray-600">Khả dụng</p>
              <div className="grid max-h-[42vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {coupons.filter((coupon) => coupon.active).map((coupon) => {
                  const eligible = selectedSubtotal >= coupon.minOrder
                  const selected = selectedCouponCode === coupon.code
                  return (
                    <button
                      type="button"
                      key={coupon.id}
                      onClick={() => {
                        setSelectedCouponCode(coupon.code)
                        setCouponCode(coupon.code)
                        setCouponError('')
                      }}
                      className={`flex min-h-32 items-center gap-4 rounded-xl border p-4 text-left transition ${
                        selected
                          ? 'border-primary bg-rose-50 ring-1 ring-primary'
                          : 'border-gray-200 bg-gray-50 hover:border-rose-300'
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl text-white">
                        <FiGift />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-sm text-secondary sm:text-base">{coupon.code}</strong>
                        <span className="mt-1 block text-sm text-blue-600">{coupon.description}</span>
                        <span className={`mt-2 block text-xs ${eligible ? 'text-gray-500' : 'text-amber-600'}`}>
                          {eligible
                            ? 'Có thể áp dụng cho đơn hàng'
                            : `Đơn tối thiểu ${formatPrice(coupon.minOrder)}`}
                        </span>
                      </span>
                      <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                        selected
                          ? 'border-primary bg-primary ring-4 ring-rose-100'
                          : 'border-gray-300 bg-white'
                      }`} />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:px-7">
              <span className="text-sm text-gray-500">
                {selectedCouponCode ? `Đã chọn: ${selectedCouponCode}` : 'Chưa chọn ưu đãi nào.'}
              </span>
              <button
                type="button"
                disabled={!selectedCouponCode}
                onClick={() => handleApplyCoupon(selectedCouponCode)}
                className="min-w-40 rounded-xl bg-primary px-8 py-3 font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
