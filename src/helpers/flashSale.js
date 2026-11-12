import { mapCatalogProduct } from './productAdapter.js'

export const flashSaleProducts = sale => {
  const groups = new Map()
  for (const item of sale?.items || []) {
    const sku = item.sku
    if (!sku?.product?._id) continue
    const product = sku.product
    if (!groups.has(product._id)) groups.set(product._id, { product, skus: [] })
    groups.get(product._id).skus.push({ ...sku, product: product._id })
  }
  return [...groups.values()].map(({ product, skus }) => mapCatalogProduct(product, skus))
}

export const flashSaleBody = values => ({
  name: values.name.trim(),
  startAt: new Date(values.startAt).toISOString(), endAt: new Date(values.endAt).toISOString(), isEnabled: values.isEnabled,
  items: values.items.map(item => ({ productVariant: item.productVariant, discountPercent: Number(item.discountPercent) })),
})
