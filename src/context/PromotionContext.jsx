import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../lib/api.js'
import { flashSaleProducts } from '../helpers/flashSale.js'

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

export const PromotionProvider = ({ children }) => {
  const [promotion, setPromotion] = useState(null)
  const [promotionProducts, setPromotionProducts] = useState([])
  const [phase, setPhase] = useState('inactive')

  useEffect(() => {
    let active = true
    let timer
    let controller
    const load = async () => {
      clearTimeout(timer)
      controller?.abort()
      controller = new AbortController()
      const signal = controller.signal
      try {
        const { data } = await api.get('/flash-sales', { skipAuth: true, signal })
        if (!active || signal.aborted) return
        const sale = data.data
        const products = flashSaleProducts(sale)
        setPromotionProducts(products)
        setPromotion(sale ? { id: sale._id, title: sale.name, description: sale.description, status: sale.isEnabled ? 'active' : 'inactive', startsAt: sale.startAt, endsAt: sale.endAt,
          products: products.map(product => ({ productId: product.id, price: product.price, originalPrice: product.originalPrice })) } : null)
        const nextTime = sale?.isEnabled ? [sale.startAt, sale.endAt].map(value => new Date(value).getTime()).filter(value => value > Date.now()).sort((a, b) => a - b)[0] : null
        const boundary = nextTime ? nextTime - Date.now() + 100 : 60000
        timer = setTimeout(load, Math.min(60000, Math.max(100, boundary)))
      } catch {
        if (!active || signal.aborted) return
        setPromotion(null)
        setPromotionProducts([])
        timer = setTimeout(load, 60000)
      }
    }
    load()
    window.addEventListener('flash-sales-updated', load)
    return () => { active = false; controller?.abort(); clearTimeout(timer); window.removeEventListener('flash-sales-updated', load) }
  }, [])

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

  const applyPromotionToProduct = useCallback(product => product, [])

  const value = useMemo(() => ({
    promotion,
    setPromotion,
    phase,
    isActive: phase === 'active',
    promotionItems,
    getPromotionItem,
    applyPromotionToProduct,
    promotionProducts,
  }), [promotion, phase, promotionItems, getPromotionItem, applyPromotionToProduct, promotionProducts])

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
