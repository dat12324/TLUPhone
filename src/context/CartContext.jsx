import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import couponsData from '../data/coupons'
import api from '../lib/api.js'
import { useAuth } from './AuthContext'
import { mapCartItems } from '../helpers/cart.js'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user, authLoading, isAuthenticated } = useAuth()
  const userId = user?._id || user?.id || null
  const owner = useRef(userId)
  owner.current = userId
  const [cartState, setCartState] = useState({ userId: null, items: [] })
  const cartItems = cartState.userId === userId ? cartState.items : []
  const [cartLoading, setCartLoading] = useState(false)
  const [cartBusy, setCartBusy] = useState(false)
  const [cartError, setCartError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const toastTimer = useRef(null)
  const loadController = useRef(null)
  const queue = useRef(Promise.resolve())
  const pending = useRef(0)

  const showToast = message => {
    clearTimeout(toastTimer.current)
    setToastMessage(message)
    toastTimer.current = setTimeout(() => setToastMessage(null), 2500)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const acceptCart = useCallback((data, requestOwner, selectedId) => {
    if (owner.current !== requestOwner) return false
    setCartState(current => ({ userId: requestOwner,
      items: mapCartItems(data, current.userId === requestOwner ? current.items : [], selectedId) }))
    return true
  }, [])

  const reloadCart = useCallback(async () => {
    if (!userId || pending.current) return false
    loadController.current?.abort()
    const controller = new AbortController()
    loadController.current = controller
    setCartLoading(true)
    setCartError('')
    try {
      const { data } = await api.get('/cart', { signal: controller.signal })
      if (controller.signal.aborted) return false
      return acceptCart(data.data, userId)
    } catch (error) {
      if (!controller.signal.aborted && owner.current === userId) setCartError(error.message)
      return false
    } finally {
      if (!controller.signal.aborted && owner.current === userId) setCartLoading(false)
    }
  }, [userId, acceptCart])

  useEffect(() => {
    setAppliedCoupon(null)
    setToastMessage(null)
    setCartError('')
    setCartLoading(false)
    if (!authLoading && userId) void reloadCart()
    if (!userId) setCartState({ userId: null, items: [] })
    return () => loadController.current?.abort()
  }, [userId, authLoading, reloadCart])

  useEffect(() => {
    const refresh = () => { if (!document.hidden) void reloadCart() }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [reloadCart])

  const mutateCart = (method, path, body, message, selectedId) => {
    if (!userId || authLoading) {
      showToast('Vui lòng đăng nhập để sử dụng giỏ hàng.')
      return Promise.resolve(false)
    }
    const requestOwner = userId
    pending.current += 1
    setCartBusy(true)
    loadController.current?.abort()
    setCartLoading(false)
    const task = queue.current.then(async () => {
      if (owner.current !== requestOwner) return false
      try {
        const { data } = await api.request({ method, url: path, data: body })
        if (!acceptCart(data.data, requestOwner, selectedId)) return false
        setCartError('')
        if (message) showToast(message)
        return true
      } catch (error) {
        if (owner.current === requestOwner) {
          setCartError(error.message)
          showToast(error.message)
        }
        return false
      }
    })
    queue.current = task
    return task.finally(() => {
      pending.current -= 1
      if (!pending.current) setCartBusy(false)
    })
  }

  const addToCart = (product, selectedVariant, selectedColor, quantity = 1) => {
    const sku = product?.skuByCombination?.[`${selectedVariant?.id}_${selectedColor?.id}`]
    const variantId = selectedVariant?._id || sku?._id || selectedVariant?.id
    if (!/^[a-f\d]{24}$/i.test(variantId || '')) {
      showToast('Vui lòng chọn phiên bản và màu sắc hợp lệ.')
      return Promise.resolve(false)
    }
    return mutateCart('post', '/cart/items', { productVariant: variantId, quantity }, 'Đã thêm sản phẩm vào giỏ hàng.', variantId)
  }
  const updateQuantity = (id, quantity) => mutateCart('patch', `/cart/items/${id}`, { quantity })
  const removeFromCart = id => mutateCart('delete', `/cart/items/${id}`, undefined, 'Đã xóa sản phẩm khỏi giỏ hàng.')
  const clearCart = async () => {
    const success = await mutateCart('delete', '/cart')
    if (success) setAppliedCoupon(null)
    return success
  }
  const setCartItems = updater => setCartState(current => current.userId === userId
    ? { ...current, items: updater(current.items) } : current)
  const toggleSelectItem = id => setCartItems(items => items.map(item =>
    item.id === id && item.isAvailable ? { ...item, selected: !item.selected } : item))
  const toggleSelectAll = selected => setCartItems(items => items.map(item =>
    ({ ...item, selected: item.isAvailable && selected })))
  const removeSelectedItems = async () => {
    const ids = cartItems.filter(item => item.selected).map(item => item.id)
    for (const id of ids) {
      if (!(await removeFromCart(id))) return false
    }
    return true
  }

  // These values must be initialized before applyCoupon captures them.
  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => item.selected && item.isAvailable)
  }, [cartItems])

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedItems])

  // Thu hồi coupon ngay khi giỏ hàng không còn đáp ứng giá trị đơn tối thiểu.
  // tránh để mã cũ tự xuất hiện lại ở bước thanh toán.
  useEffect(() => {
    if (!appliedCoupon || selectedSubtotal >= appliedCoupon.minOrder) return

    const couponCode = appliedCoupon.code
    const minFormatted = appliedCoupon.minOrder.toLocaleString('vi-VN') + '₫'

    setAppliedCoupon(null)
    showToast(`Mã "${couponCode}" đã được gỡ vì đơn hàng chưa đạt ${minFormatted}`)
  }, [appliedCoupon, selectedSubtotal])

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
    return cartItems.length > 0 && cartItems.filter(item => item.isAvailable).length > 0 && cartItems.filter(item => item.isAvailable).every((item) => item.selected)
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
    cartLoading: authLoading || cartLoading,
    cartBusy, cartError, reloadCart, isAuthenticated,
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
      {/* Toast thông báo góc trên màn hình */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-[70] bg-secondary text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-slide-up text-sm font-medium"
        >
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
