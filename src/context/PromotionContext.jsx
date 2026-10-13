import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { homePromotion } from '../data/banners'

const PromotionContext = createContext(null)
const MAX_TIMEOUT = 2_147_483_647

const parseTime = (value) => {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

const getPromotionPhase = (promotion, now = Date.now()) => {
  if (!promotion || promotion.status !== 'active') return 'inactive'

  const startsAt = parseTime(promotion.startsAt)
  const endsAt = parseTime(promotion.endsAt)

  if (promotion.startsAt && startsAt === null) return 'invalid'
  if (promotion.endsAt && endsAt === null) return 'invalid'
  if (startsAt !== null && endsAt !== null && endsAt <= startsAt) return 'invalid'
  if (startsAt !== null && now < startsAt) return 'upcoming'
  if (endsAt !== null && now >= endsAt) return 'expired'
  return 'active'
}

const validPrice = (value) => Number.isFinite(value) && value >= 0

export const PromotionProvider = ({ children }) => {
  // Sau này thay homePromotion bằng dữ liệu GET /api/promotions/active.
  const [promotion, setPromotion] = useState(homePromotion)
  const [phase, setPhase] = useState(() => getPromotionPhase(homePromotion))

  useEffect(() => {
    let timeoutId

    const syncPhaseAndSchedule = () => {
      const now = Date.now()
      setPhase(getPromotionPhase(promotion, now))

      if (!promotion || promotion.status !== 'active') return

      const startsAt = parseTime(promotion.startsAt)
      const endsAt = parseTime(promotion.endsAt)
      const nextBoundary = [startsAt, endsAt]
        .filter((timestamp) => timestamp !== null && timestamp > now)
        .sort((a, b) => a - b)[0]

      if (!nextBoundary) return

      timeoutId = window.setTimeout(
        syncPhaseAndSchedule,
        Math.min(nextBoundary - now + 50, MAX_TIMEOUT)
      )
    }

    syncPhaseAndSchedule()

    return () => window.clearTimeout(timeoutId)
  }, [promotion])

  const promotionItems = useMemo(
    () => (Array.isArray(promotion?.products) ? promotion.products : []),
    [promotion]
  )

  const getPromotionItem = useCallback(
    (productId) => promotionItems.find(
      (item) => String(item.productId) === String(productId)
    ) || null,
    [promotionItems]
  )

  const applyPromotionToProduct = useCallback((product) => {
    if (!product || phase !== 'active') return product

    const promotionItem = getPromotionItem(product.id)
    if (!promotionItem) return product

    const promotionalPrice = validPrice(promotionItem.price)
      ? promotionItem.price
      : product.price
    const variantPromotions = Array.isArray(promotionItem.variants)
      ? promotionItem.variants
      : []

    const variants = product.variants?.map((variant) => {
      const variantPromotion = variantPromotions.find(
        (item) => String(item.variantId) === String(variant.id)
      )

      if (!variantPromotion || !validPrice(variantPromotion.price)) return variant

      return {
        ...variant,
        price: variantPromotion.price,
        originalPrice: validPrice(variantPromotion.originalPrice)
          ? variantPromotion.originalPrice
          : variant.price,
      }
    })

    return {
      ...product,
      price: promotionalPrice,
      originalPrice: validPrice(promotionItem.originalPrice)
        ? promotionItem.originalPrice
        : product.price,
      variants,
      activePromotionId: promotion.id,
    }
  }, [getPromotionItem, phase, promotion?.id])

  const value = useMemo(() => ({
    promotion,
    setPromotion,
    phase,
    isActive: phase === 'active',
    promotionItems,
    getPromotionItem,
    applyPromotionToProduct,
  }), [promotion, phase, promotionItems, getPromotionItem, applyPromotionToProduct])

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  )
}

export const usePromotion = () => {
  const context = useContext(PromotionContext)
  if (!context) {
    throw new Error('usePromotion phải được sử dụng bên trong PromotionProvider')
  }
  return context
}

export { getPromotionPhase }
