import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import couponsData from '../data/coupons'

const CartContext = createContext()

const CART_STORAGE_KEY = 'tluphone_cart'
const COUPON_STORAGE_KEY = 'tluphone_coupon'

export const CartProvider = ({ children }) => {
  // Lấy dữ liệu giỏ hàng ban đầu từ localStorage (nếu có)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Lỗi khi đọc giỏ hàng từ localStorage:', error)
      return []
    }
  })

  // State mã giảm giá đang áp dụng
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // State thông báo Toast khi thêm vào giỏ hàng
  const [toastMessage, setToastMessage] = useState(null)

  // Đồng bộ giỏ hàng vào localStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng vào localStorage:', error)
    }
  }, [cartItems])

  // Đồng bộ coupon vào localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon))
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Lỗi khi lưu coupon vào localStorage:', error)
    }
  }, [appliedCoupon])

  // Hiện thông báo toast ngắn
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} product - Sản phẩm gốc
   * @param {Object} selectedVariant - Phiên bản bộ nhớ (RAM/ROM)
   * @param {Object} selectedColor - Màu sắc
   * @param {number} quantity - Số lượng mua
   * @param {string} image - URL ảnh sản phẩm tương ứng
   * @param {number} stock - Tồn kho khả dụng
   */
  const addToCart = (product, selectedVariant, selectedColor, quantity = 1, image, stock = 10) => {
    if (!product) return false

    // Tạo ID duy nhất cho mỗi tổ hợp sản phẩm (productId + variantId + colorId)
    const variantId = selectedVariant?.id || 'default'
    const colorId = selectedColor?.id || 'default'
    const cartItemId = `${product.id}_${variantId}_${colorId}`

    const itemPrice = selectedVariant?.price || product.price
    const itemOriginalPrice = selectedVariant?.originalPrice || product.originalPrice || itemPrice
    const itemImage = image || selectedColor?.image || product.images?.[0] || product.image

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId)

      if (existingIndex > -1) {
        // Nếu đã tồn tại cùng tổ hợp -> tăng số lượng (không vượt quá tồn kho)
        const existingItem = prevItems[existingIndex]
        const newQuantity = Math.min(existingItem.quantity + quantity, stock)

        const updated = [...prevItems]
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          stock, // Cập nhật lại tồn kho mới nhất
          selected: true, // Tự động tick chọn khi thêm lại
        }
        return updated
      } else {
        // Nếu chưa có -> thêm dòng mới vào giỏ hàng
        const newItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          image: itemImage,
          selectedVariant: selectedVariant
            ? {
                id: selectedVariant.id,
                ram: selectedVariant.ram,
                storage: selectedVariant.storage,
                price: selectedVariant.price,
                originalPrice: selectedVariant.originalPrice,
              }
            : null,
          selectedColor: selectedColor
            ? {
                id: selectedColor.id,
                name: selectedColor.name,
                colorCode: selectedColor.colorCode,
              }
            : null,
          price: itemPrice,
          originalPrice: itemOriginalPrice,
          quantity: Math.min(quantity, stock),
          stock,
          selected: true, // Mặc định được chọn để tính tiền
        }
        return [newItem, ...prevItems]
      }
    })

    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`)
    return true
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  const updateQuantity = (cartItemId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          const validQty = Math.max(1, Math.min(newQuantity, item.stock || 99))
          return { ...item, quantity: validQty }
        }
        return item
      })
    )
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId))
    showToast('Đã xóa sản phẩm khỏi giỏ hàng')
  }

  /**
   * Chọn / Bỏ chọn một sản phẩm
   */
  const toggleSelectItem = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, selected: !item.selected } : item
      )
    )
  }

  /**
   * Chọn / Bỏ chọn tất cả sản phẩm
   */
  const toggleSelectAll = (selectAll) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => ({ ...item, selected: selectAll }))
    )
  }

  /**
   * Xóa tất cả các sản phẩm đang được chọn
   */
  const removeSelectedItems = () => {
    setCartItems((prevItems) => prevItems.filter((item) => !item.selected))
    showToast('Đã xóa các sản phẩm được chọn')
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = () => {
    setCartItems([])
    setAppliedCoupon(null)
  }

  // These values must be initialized before applyCoupon captures them.
  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => item.selected)
  }, [cartItems])

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedItems])

  /**
   * Áp dụng mã giảm giá
   * @param {string} code - Mã giảm giá nhập vào
   * @returns {{ success: boolean, message: string }}
   */
  const applyCoupon = useCallback((code) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Vui lòng nhập mã giảm giá' }
    }

    const normalizedCode = code.trim().toUpperCase()

    // Tìm coupon trong danh sách (sau này thay bằng API)
    const coupon = couponsData.find(
      (c) => c.code.toUpperCase() === normalizedCode && c.active
    )

    if (!coupon) {
      return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' }
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (selectedSubtotal < coupon.minOrder) {
      const minFormatted = coupon.minOrder.toLocaleString('vi-VN') + '₫'
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${minFormatted} để sử dụng mã này`,
      }
    }

    setAppliedCoupon(coupon)
    showToast(`Áp dụng mã "${coupon.code}" thành công!`)
    return { success: true, message: `Đã áp dụng mã "${coupon.code}"` }
  }, [selectedSubtotal])

  /**
   * Hủy mã giảm giá đang áp dụng
   */
  const removeCoupon = () => {
    setAppliedCoupon(null)
    showToast('Đã hủy mã giảm giá')
  }

  // ===== CÁC THÔNG SỐ TÍNH TOÁN (Computed Values) =====
  // 1. Tổng số lượng sản phẩm trong giỏ (cho Badge trên Header)
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  // 2. Danh sách các sản phẩm đang được tick chọn
  // 3. Kiểm tra xem có đang chọn tất cả không
  const isAllSelected = useMemo(() => {
    return cartItems.length > 0 && cartItems.every((item) => item.selected)
  }, [cartItems])

  // 4. Tổng tiền tạm tính của các sản phẩm đang chọn
  // 5. Tổng tiền gốc của các sản phẩm đang chọn
  const selectedOriginalSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0
    )
  }, [selectedItems])

  // 6. Tiết kiệm / Giảm giá sản phẩm (giá gốc - giá bán)
  const selectedDiscount = useMemo(() => {
    const diff = selectedOriginalSubtotal - selectedSubtotal
    return diff > 0 ? diff : 0
  }, [selectedOriginalSubtotal, selectedSubtotal])

  // 7. Số tiền giảm từ coupon
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0

    // Kiểm tra lại điều kiện đơn tối thiểu (phòng trường hợp user bỏ chọn SP)
    if (selectedSubtotal < appliedCoupon.minOrder) return 0

    if (appliedCoupon.type === 'percent') {
      const discount = Math.round((selectedSubtotal * appliedCoupon.value) / 100)
      return Math.min(discount, appliedCoupon.maxDiscount)
    }

    if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.value, selectedSubtotal)
    }

    return 0
  }, [appliedCoupon, selectedSubtotal])

  // 8. Tổng tiền cuối cùng sau coupon
  const finalTotal = useMemo(() => {
    return Math.max(0, selectedSubtotal - couponDiscount)
  }, [selectedSubtotal, couponDiscount])

  // 9. Tổng tiết kiệm (giảm giá SP + coupon)
  const totalSaved = useMemo(() => {
    return selectedDiscount + couponDiscount
  }, [selectedDiscount, couponDiscount])

  const value = {
    cartItems,
    toastMessage,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll,
    removeSelectedItems,
    clearCart,
    totalCartCount,
    selectedItems,
    isAllSelected,
    selectedSubtotal,
    selectedOriginalSubtotal,
    selectedDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponDiscount,
    finalTotal,
    totalSaved,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Toast thông báo góc màn hình */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-slide-up text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  )
}

// Hook tiện ích để sử dụng CartContext trong các component
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider')
  }
  return context
}
