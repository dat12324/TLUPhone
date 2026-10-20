export const priceRanges = [
  { label: 'Dưới 3 triệu', min: 0, max: 3000000 },
  { label: 'Từ 3-7 triệu', min: 3000000, max: 7000000 },
  { label: 'Từ 7-10 triệu', min: 7000000, max: 10000000 },
  { label: 'Từ 10-15 triệu', min: 10000000, max: 15000000 },
  { label: 'Trên 15 triệu', min: 15000000, max: null },
]

export const catalogSortMap = {
  default: 'popular',
  hot: 'newest',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
}
