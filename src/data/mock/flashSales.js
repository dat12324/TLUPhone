import { homePromotion } from '../banners'

// Adapter tạm thời cho chương trình đang hiển thị trên HomePage.
// Dữ liệu Product hiện chưa có skuId duy nhất nên không tạo SKU giả cho items.
export const mockFlashSales = [
  {
    id: homePromotion.id,
    name: homePromotion.title,
    description: homePromotion.description,
    startAt: homePromotion.startsAt,
    endAt: homePromotion.endsAt,
    isEnabled: homePromotion.status === 'active',
    items: [],
    createdAt: null,
    source: 'legacy-home-promotion',
    legacyProductCount: Array.isArray(homePromotion.products) ? homePromotion.products.length : 0,
  },
]

