import { capacityKey, colorKey } from './productAdapter.js'
import { formatSkuCapacity } from '../utils/adminFormatters.js'

export const mapCartItems = (cart, previous = [], selectedId) => {
  const selections = new Map(previous.map(item => [item.id, item.selected]))
  return (cart?.items || []).map(item => {
    const sku = item.productVariant
    const product = sku?.product
    const id = String(item.variantId)
    return {
      id, productVariantId: id, productId: product?._id, slug: product?.slug,
      name: product?.name || sku?.sku || 'Sản phẩm không còn khả dụng',
      image: sku?.color?.image?.url || product?.images?.find(image => image.isPrimary)?.url || product?.images?.[0]?.url || '/images/products/placeholder.svg',
      price: sku?.price ?? 0, originalPrice: sku?.compareAtPrice ?? sku?.price ?? 0,
      quantity: item.quantity, stock: item.availableStock, isAvailable: item.isAvailable,
      selected: item.isAvailable && (id === selectedId || (selections.get(id) ?? true)),
      selectedVariant: sku ? { id: capacityKey(sku), ram: formatSkuCapacity(sku.ram), storage: formatSkuCapacity(sku.storage), price: sku.price } : null,
      selectedColor: sku?.color ? { id: colorKey(sku.color.name), name: sku.color.name, colorCode: sku.color.code } : null,
    }
  })
}
