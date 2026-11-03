import { useCallback, useEffect, useRef, useState } from 'react'
import { FiSearch, FiFilter, FiX, FiChevronDown, FiStar, FiTag, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { priceRanges } from '../../config/catalog'

const filterGroups = [
  {
    key: 'priceRange', label: 'Giá', mobileLabel: 'Khoảng giá', title: 'Chọn khoảng giá',
    options: priceRanges.map((range, index) => ({ value: index, label: range.label })),
  },
  {
    key: 'storage', label: 'Bộ nhớ trong', title: 'Chọn dung lượng lưu trữ',
    options: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'].map(value => ({ value, label: value })),
  },
  {
    key: 'capacity', label: 'RAM', title: 'Chọn dung lượng RAM',
    options: ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB'].map(value => ({ value, label: value })),
  },
]

const sortOptions = [
  { value: 'default', label: 'Phổ biến', Icon: FiStar },
  { value: 'newest', label: 'Mới nhất', desktop: false },
  { value: 'hot', label: 'Khuyến mãi HOT', Icon: FiTag, mobile: false },
  { value: 'price-asc', label: 'Giá: Thấp → Cao', desktopLabel: 'Giá thấp - Cao', Icon: FiArrowUp },
  { value: 'price-desc', label: 'Giá: Cao → Thấp', desktopLabel: 'Giá cao - Thấp', Icon: FiArrowDown },
]

const FilterOptions = ({ group, value, onToggle, mobile = false, all = false }) => (
  <div className={mobile && group.key === 'priceRange' ? 'space-y-2' : all ? 'flex flex-wrap gap-2.5' : 'flex flex-wrap gap-2'}>
    {group.options.map(option => {
      const selected = group.key === 'priceRange' ? value === option.value : value.includes(option.value)
      if (mobile && group.key === 'priceRange') {
        return (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="priceRange"
              checked={selected}
              onChange={() => onToggle(group.key, option.value)}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-gray-600 group-hover:text-secondary transition-colors">{option.label}</span>
          </label>
        )
      }
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(group.key, option.value)}
          aria-pressed={selected}
          className={`${mobile ? 'rounded-lg border px-3 py-2 text-sm transition-colors' : 'rounded-xl border px-3 py-2 text-xs font-medium transition-colors'} ${
            selected
              ? 'border-primary bg-primary/10 text-primary'
              : mobile ? 'border-gray-200 bg-gray-50 text-gray-600' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary'
          }`}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)

const ProductsFilters = ({
  searchQuery, onSearchChange, onClearSearch, onSearchSubmit,
  brandQuery, selectedBrandName, total, appliedFilters, activeFilterGroups,
  onApply, onRemoveGroup, onClear, sortBy, onSortChange,
}) => {
  const [draftFilters, setDraftFilters] = useState(appliedFilters)
  const [openPanel, setOpenPanel] = useState(null)
  const filterContainerRef = useRef(null)
  const desktopFilterPanel = openPanel === 'mobile' ? null : openPanel
  const isMobileFilterOpen = openPanel === 'mobile'
  const hasActiveFilters = searchQuery || activeFilterGroups.length > 0
  const criteriaFilterCount = (appliedFilters.priceRange !== null ? 1 : 0)
    + appliedFilters.storage.length + appliedFilters.capacity.length

  const closeFilters = useCallback(() => {
    setDraftFilters(appliedFilters)
    setOpenPanel(null)
  }, [appliedFilters])

  const openFilterPanel = (panel) => {
    setDraftFilters(appliedFilters)
    setOpenPanel(current => current === panel ? null : panel)
  }

  const toggleOption = (key, value) => {
    setDraftFilters(current => {
      const selected = current[key]
      let next
      if (key === 'priceRange') {
        next = selected === value ? null : value
      } else {
        next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]
      }
      return { ...current, [key]: next }
    })
  }

  const applyFilters = () => {
    onApply(draftFilters)
    setOpenPanel(null)
  }

  useEffect(() => {
    setOpenPanel(null)
  }, [brandQuery, appliedFilters])

  useEffect(() => {
    if (!openPanel) return
    const handleClickOutside = (event) => {
      if (desktopFilterPanel && !filterContainerRef.current?.contains(event.target)) closeFilters()
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeFilters()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openPanel, desktopFilterPanel, closeFilters])

  const handleSortChange = (value) => {
    closeFilters()
    onSortChange(value)
  }

  const clearFilters = () => {
    closeFilters()
    onClear()
  }

  const removeFilterGroup = (key) => {
    closeFilters()
    onRemoveGroup(key)
  }

  const activeFiltersContent = activeFilterGroups.length > 0 && (
    <section className="my-6" aria-label="Bộ lọc đã áp dụng">
      <h2 className="mb-3 text-lg font-bold text-secondary">Đang lọc theo</h2>
      <div className="flex flex-wrap items-center gap-2.5">
        {activeFilterGroups.map(group => (
          <div key={group.key} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 py-1.5 pl-3.5 pr-1.5 text-sm">
            <div className="min-w-0 break-words leading-6">
              <span className="font-medium text-secondary">{group.label}: </span>
              <span className="text-primary">{group.values.join(' | ')}</span>
            </div>
            <button type="button" onClick={() => removeFilterGroup(group.key)}
              aria-label={'Bỏ lọc ' + group.label.toLowerCase()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <FiX aria-hidden="true" />
            </button>
          </div>
        ))}
        <button type="button" onClick={clearFilters}
          className="min-h-10 rounded-lg px-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Bỏ chọn tất cả
        </button>
      </div>
    </section>
  )

  const filterActions = (
    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 lg:flex lg:justify-end">
      <button type="button" onClick={closeFilters}
        className="min-h-11 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:min-w-32">
        Đóng
      </button>
      <button type="button" onClick={applyFilters}
        className="min-h-11 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:min-w-36">
        Xem kết quả
      </button>
    </div>
  )

  const filterContent = (
    <div className="space-y-6">
      {filterGroups.map(group => (
        <div key={group.key}>
          <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wider">
            {group.mobileLabel || group.label}
          </h3>
          <FilterOptions group={group} value={draftFilters[group.key]} onToggle={toggleOption} mobile />
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Tiêu đề trang & Khu vực kết quả tìm kiếm */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            {brandQuery ? `Điện thoại ${selectedBrandName}` : 'Tất cả điện thoại'}
          </h1>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-primary">
              <FiSearch className="text-xs" />
              <span>Kết quả cho: "{searchQuery}"</span>
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {searchQuery
            ? `Tìm thấy ${total} sản phẩm phù hợp với từ khóa "${searchQuery}"`
            : `Tìm thấy ${total} sản phẩm chính hãng`}
        </p>
      </div>

      {/* Thanh tìm kiếm + sắp xếp + nút lọc mobile */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Ô tìm kiếm */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearchSubmit()
          }}
          className="relative flex-1"
          role="search"
        >
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, hãng..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-10
                       text-sm focus:outline-none focus:border-primary focus:ring-1 
                       focus:ring-primary transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                         hover:text-secondary p-1"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </form>

        {/* Sắp xếp trên mobile */}
        <div className="relative lg:hidden">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg 
                       py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary 
                       focus:ring-1 focus:ring-primary transition-colors cursor-pointer
                       w-full sm:w-auto min-w-[180px]"
          >
            {sortOptions.filter(option => option.mobile !== false).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Nút mở filter trên mobile */}
        <button
          onClick={() => openFilterPanel('mobile')}
          className="lg:hidden flex items-center justify-center gap-2 border border-gray-300 
                     rounded-lg py-2.5 px-4 text-sm text-secondary hover:border-primary 
                     hover:text-primary transition-colors"
        >
          <FiFilter />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full 
                            flex items-center justify-center font-medium">
              !
            </span>
          )}
        </button>
      </div>

      <div className="lg:hidden">{activeFiltersContent}</div>

      {/* Bộ lọc và sắp xếp ngang trên desktop */}
      <div ref={filterContainerRef} className="relative hidden lg:block mb-8">
        <h2 className="mb-5 text-2xl font-bold text-secondary">Chọn tiêu chí</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => openFilterPanel('all')}
              aria-expanded={desktopFilterPanel === 'all'}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base font-medium transition-colors ${
                desktopFilterPanel === 'all' || criteriaFilterCount > 0
                  ? 'border-primary bg-white text-primary'
                  : 'border-gray-200 bg-white text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              <FiFilter />
              Bộ lọc
              {criteriaFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                  {criteriaFilterCount}
                </span>
              )}
            </button>
            {desktopFilterPanel === 'all' && (
              <div className="absolute left-0 top-full z-30 mt-2 w-[min(920px,calc(100vw-3rem))] rounded-xl border border-gray-100 bg-white p-5 shadow-xl animate-slide-up">
                <div className="grid grid-cols-3 gap-8">
                  {filterGroups.map(group => (
                    <div key={group.key}>
                      <h3 className="mb-3 text-base font-semibold text-gray-700">{group.label}</h3>
                      <FilterOptions group={group} value={draftFilters[group.key]} onToggle={toggleOption} all />
                    </div>
                  ))}
                </div>
                {filterActions}
              </div>
            )}
          </div>
          {filterGroups.map(group => {
            const selected = group.key === 'priceRange'
              ? draftFilters.priceRange !== null
              : draftFilters[group.key].length > 0
            const expanded = desktopFilterPanel === group.key
            return (
              <div key={group.key} className="relative">
                <button
                  type="button"
                  onClick={() => openFilterPanel(group.key)}
                  aria-expanded={expanded}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-base transition-colors ${
                    expanded || selected
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-gray-200 bg-gray-50 text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  <span>{group.label}</span>
                  <FiChevronDown className={`text-sm transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="absolute left-0 top-full z-30 mt-2 w-80 sm:w-96 rounded-xl border border-gray-100 bg-white p-4 shadow-xl animate-slide-up">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">{group.title}</h3>
                    <FilterOptions group={group} value={draftFilters[group.key]} onToggle={toggleOption} />
                    {filterActions}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {activeFiltersContent}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary">Sắp xếp theo</h2>
          <div className="flex flex-wrap items-center gap-3">
            {sortOptions.filter(option => option.desktop !== false).map(({ value, label, desktopLabel, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSortChange(value)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all duration-200 ${
                  sortBy === value
                    ? 'border-primary bg-rose-50 text-primary font-semibold shadow-xs'
                    : 'border-gray-200 bg-white text-secondary hover:border-rose-300 hover:text-primary'
                }`}
              >
                <Icon />
                {desktopLabel || label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer (overlay) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeFilters}
          />
          {/* Drawer */}
          <div role="dialog" aria-modal="true" aria-label="Bộ lọc sản phẩm"
            className="absolute right-0 top-0 flex h-full w-80 max-w-[90vw] flex-col bg-white shadow-xl animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-secondary">Bộ lọc</h2>
              <button
                onClick={closeFilters}
                aria-label="Đóng bộ lọc"
                className="p-1 text-gray-400 hover:text-secondary transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {filterContent}
            </div>
            <div className="shrink-0 border-t border-gray-100 px-4 pb-5 [&>div]:mt-0 [&>div]:border-0">{filterActions}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductsFilters
