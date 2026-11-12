import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  const [couponBusy, setCouponBusy] = useState(false)
  const couponRequest = useRef(false)
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

  const couponSelectionKey = JSON.stringify(selectedItems.map(item => [item.id, item.quantity, item.price]))
  const couponSelection = useRef(couponSelectionKey)
  couponSelection.current = couponSelectionKey

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.selectionKey !== couponSelectionKey) {
      setAppliedCoupon(null)
      showToast('Giỏ hàng đã thay đổi. Vui lòng áp dụng lại mã giảm giá.')
    }
  }, [appliedCoupon, couponSelectionKey])

  const applyCoupon = useCallback(async code => {
    if (!userId || !selectedItems.length) return { success: false, message: 'Vui lòng chọn sản phẩm trong giỏ hàng.' }
    if (!code?.trim()) return { success: false, message: 'Vui lòng nhập mã giảm giá.' }
    if (couponRequest.current) return { success: false, message: 'Đang kiểm tra mã giảm giá.' }
    const requestOwner = userId
    const selectionKey = couponSelectionKey
    couponRequest.current = true
    setCouponBusy(true)
    try {
      const { data } = await api.post('/vouchers/check', {
        code: code.trim().toUpperCase(),
        variantIds: selectedItems.map(item => item.productVariantId || item.id),
      })
      if (owner.current !== requestOwner || couponSelection.current !== selectionKey) {
        return { success: false, message: 'Giỏ hàng đã thay đổi. Vui lòng thử lại.' }
      }
      if (data.data.subtotal !== selectedSubtotal) {
        void reloadCart()
        return { success: false, message: 'Giá giỏ hàng đã thay đổi. Vui lòng kiểm tra lại.' }
      }
      setAppliedCoupon({ ...data.data, selectionKey,
        description: `Giảm ${data.data.discountAmount.toLocaleString('vi-VN')}₫`,
      })
      showToast(`Đã áp dụng mã "${data.data.code}".`)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      couponRequest.current = false
      setCouponBusy(false)
    }
  }, [userId, selectedItems, selectedSubtotal, couponSelectionKey, reloadCart])

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
  const couponDiscount = appliedCoupon?.selectionKey === couponSelectionKey
    ? appliedCoupon.discountAmount : 0

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
    appliedCoupon: appliedCoupon?.selectionKey === couponSelectionKey ? appliedCoupon : null,
    couponBusy,
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
