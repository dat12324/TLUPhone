export const filterAndSortProducts = ({
  products,
  searchQuery = '',
  selectedBrands = [],
  selectedPriceRange = null,
  selectedStorage = [],
  selectedCapacity = [],
  priceRanges = [],
  sortBy = 'default',
}) => {
  let result = [...products]

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
    )
  }

  if (selectedBrands.length > 0) {
    result = result.filter((product) =>
      selectedBrands.includes(product.brand)
    )
  }

  if (selectedPriceRange !== null) {
    const range = priceRanges[selectedPriceRange]
    if (range) {
      result = result.filter(
        (product) => product.price >= range.min && product.price < range.max
      )
    }
  }

  const normalizeCapacity = (value = '') =>
    value.toString().replace(/\s+/g, '').toUpperCase()

  if (selectedStorage.length > 0) {
    result = result.filter((product) =>
      (product.variants || []).some((variant) =>
        selectedStorage.includes(normalizeCapacity(variant.storage))
      )
    )
  }

  if (selectedCapacity.length > 0) {
    result = result.filter((product) =>
      (product.variants || []).some((variant) =>
        selectedCapacity.includes(normalizeCapacity(variant.ram))
      )
    )
  }

  if (sortBy === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (sortBy === 'hot') {
    result.sort((a, b) => {
      const discountA = a.originalPrice ? a.originalPrice - a.price : 0
      const discountB = b.originalPrice ? b.originalPrice - b.price : 0
      return discountB - discountA
    })
  }

  return result
}
