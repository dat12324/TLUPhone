import { useEffect, useState } from 'react'
import { FiCheck, FiMinus, FiPlus, FiSave, FiSearch, FiTrash2 } from 'react-icons/fi'
import api from '../../../lib/api.js'
import { localBannerDate } from '../../../helpers/banner.js'
import { flashSaleBody } from '../../../helpers/flashSale.js'
import { formatSkuCapacity } from '../../../utils/adminFormatters.js'

const fieldClass = 'mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

const FlashSaleEditor = ({ sale, onSave }) => {
  const [values, setValues] = useState(() => ({ name: sale?.name || '', startAt: localBannerDate(sale?.startAt), endAt: localBannerDate(sale?.endAt),
    isEnabled: sale?.isEnabled ?? true, items: (sale?.items || []).map(item => ({ ...item, productVariant: String(item.productVariant) })) }))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState(-1)
  const [searching, setSearching] = useState(false)
  const [skuSearch, setSkuSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchError, setSearchError] = useState('')
  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }))
  useEffect(() => {
    setProducts([])
    if (!search.trim() || !suggestionsOpen) { setSearching(false); return undefined }
    setSearching(true)
    const controller = new AbortController()
    const timer = setTimeout(() => {
      api.get('/products', { params: { search: search.trim(), status: 'active', page: 1, limit: 20 }, signal: controller.signal })
        .then(({ data }) => { if (!controller.signal.aborted) setProducts(data.data) })
        .catch(failure => { if (!controller.signal.aborted) setSearchError(failure.message) })
        .finally(() => { if (!controller.signal.aborted) setSearching(false) })
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }
  }, [search, suggestionsOpen])
  useEffect(() => {
    setVariants([])
    if (!selectedProduct) { setLoading(false); return undefined }
    const controller = new AbortController()
    setLoading(true)
    setSearchError('')
    const load = async () => {
      const items = []
      let page = 1
      let totalPages = 1
      do {
        const { data } = await api.get('/product-variants', { params: { product: selectedProduct._id, status: 'active', page, limit: 100 }, signal: controller.signal })
        if (controller.signal.aborted) return
        items.push(...data.data)
        totalPages = data.pagination.totalPages
        page++
      } while (page <= totalPages)
      setVariants(items)
    }
    load().catch(failure => { if (!controller.signal.aborted) setSearchError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [selectedProduct])

  const selectProduct = product => {
    setSelectedProduct(product)
    setSearch(product.name)
    setSuggestionsOpen(false)
    setActiveProduct(-1)
    setSkuSearch('')
    setSearchError('')
  }
  const addSku = sku => {
    setValues(current => {
      if (current.items.length >= 50 || current.items.some(item => item.productVariant === String(sku._id))) return current
      return { ...current, items: [...current.items, {
        productVariant: String(sku._id), discountPercent: 10,
        sku: { ...sku, product: selectedProduct || sku.product },
      }] }
    })
  }
  const availableVariants = variants.filter(sku =>
    !values.items.some(item => item.productVariant === String(sku._id)) &&
    [sku.sku, sku.color?.name, sku.ram, sku.storage].join(' ').toLowerCase().includes(skuSearch.trim().toLowerCase()))

  const editItem = (index, field, value) => setValues(current => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }))
  const hasChanges = values.name !== (sale.name || '') ||
    values.startAt !== localBannerDate(sale.startAt) || values.endAt !== localBannerDate(sale.endAt) ||
    values.isEnabled !== sale.isEnabled || values.items.length !== sale.items.length ||
    values.items.some((item, index) => String(item.productVariant) !== String(sale.items[index]?.productVariant) ||
      Number(item.discountPercent) !== Number(sale.items[index]?.discountPercent))
  const submit = async event => {
    event.preventDefault()
    if (saving || !hasChanges) return
    if (values.isEnabled && !values.items.length) { setError('Vui lòng chọn ít nhất một SKU.'); return }
    if (new Date(values.endAt) <= new Date(values.startAt)) { setError('Thời gian kết thúc phải sau thời gian bắt đầu.'); return }
    setSaving(true)
    setError('')
    try { await onSave(flashSaleBody(values)) }
    catch (failure) { setError(failure.message || 'Không thể lưu Flash Sale.') }
    finally { setSaving(false) }
  }
  const resetForm = () => {
    setValues({ name: sale.name, startAt: localBannerDate(sale.startAt), endAt: localBannerDate(sale.endAt),
      isEnabled: sale.isEnabled, items: sale.items.map(item => ({ ...item, productVariant: String(item.productVariant) })) })
    setError('')
    setPickerOpen(false)
    setSuggestionsOpen(false)
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div className="grid gap-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="sale-info-title">
            <h2 id="sale-info-title" className="mb-5 text-base font-bold text-secondary">Thông tin chương trình</h2>
            <div className="space-y-5">
              <label className="block text-sm font-semibold">Tên chương trình <span className="text-primary">*</span>
                <input name="name" required value={values.name} onChange={update} className={fieldClass} placeholder="Ví dụ: Flash Sale cuối tuần" />
              </label>
              <div>
                <p className="mb-2 text-sm font-semibold">Thời gian diễn ra <span className="text-primary">*</span></p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[['startAt', 'Bắt đầu'], ['endAt', 'Kết thúc']].map(([field, label]) => (
                    <label key={field} className="min-w-0 text-xs text-slate-500">{label}
                      <input type="datetime-local" name={field} required value={values[field]} onChange={update} className={fieldClass} />
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <span><span className="block text-sm font-semibold">Kích hoạt chương trình</span><span className="mt-1 block text-xs text-slate-500">Tự áp dụng theo thời gian đã chọn.</span></span>
                <span className="relative inline-flex shrink-0">
                  <input type="checkbox" role="switch" checked={values.isEnabled} onChange={event => setValues(current => ({ ...current, isEnabled: event.target.checked }))} className="peer sr-only" />
                  <span aria-hidden="true" className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2" />
                </span>
              </label>
            </div>
          </section>
        </div>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="sale-items-title">
          <header className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <h2 id="sale-items-title" className="text-base font-bold text-secondary">Danh sách SKU tham gia <span className="text-slate-500">({values.items.length})</span></h2>
            <button type="button" aria-expanded={pickerOpen} aria-controls="sale-sku-picker" onClick={() => { setPickerOpen(value => !value); setSuggestionsOpen(false) }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 px-4 text-sm font-semibold text-primary hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-primary"><FiPlus aria-hidden="true" />{pickerOpen ? 'Đóng chọn sản phẩm' : 'Thêm sản phẩm'}</button>
          </header>
          {pickerOpen && <div id="sale-sku-picker" className="mx-5 mb-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:mx-6">
            <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false) }}>
              <label htmlFor="sale-product-search" className="text-sm font-semibold text-secondary">Tìm và chọn sản phẩm</label>
              <div className="relative mt-2">
                <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <input id="sale-product-search" type="text" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={suggestionsOpen && !!search.trim()} aria-controls="sale-product-results" aria-activedescendant={suggestionsOpen && products[activeProduct] ? `sale-product-${products[activeProduct]._id}` : undefined}
                  value={search} maxLength={100} placeholder="Nhập tên điện thoại..."
                  onFocus={() => setSuggestionsOpen(true)}
                  onChange={event => { setSearch(event.target.value); setSuggestionsOpen(true); setActiveProduct(-1); setSearchError('') }}
                  onKeyDown={event => {
                    if (event.key === 'Escape') { event.preventDefault(); setSuggestionsOpen(false); return }
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      if (suggestionsOpen && products[activeProduct]) selectProduct(products[activeProduct])
                    }
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      event.preventDefault()
                      setSuggestionsOpen(true)
                      const index = event.key === 'ArrowDown' ? Math.min(activeProduct + 1, products.length - 1) : Math.max(activeProduct - 1, 0)
                      setActiveProduct(index)
                      document.getElementById(`sale-product-${products[index]?._id}`)?.scrollIntoView({ block: 'nearest' })
                    }
                  }}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>
              {suggestionsOpen && search.trim() && <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
                {searching && <p role="status" className="p-4 text-sm text-slate-500">Đang tìm sản phẩm...</p>}
                {!searching && !searchError && !products.length && <p role="status" className="p-4 text-sm text-slate-500">Không tìm thấy sản phẩm phù hợp.</p>}
                <ul id="sale-product-results" role="listbox" aria-label="Sản phẩm phù hợp" className="max-h-64 overflow-y-auto">
                  {!searching && products.map((product, index) => <li key={product._id} role="none">
                    <button id={`sale-product-${product._id}`} type="button" role="option" tabIndex={-1} aria-selected={index === activeProduct}
                      onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActiveProduct(index)} onClick={() => selectProduct(product)}
                      className={`flex min-h-16 w-full items-center gap-3 px-3 py-2.5 text-left ${index === activeProduct ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                      <img src={product.images?.find(image => image.isPrimary)?.url || product.images?.[0]?.url || '/images/products/placeholder.svg'} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-slate-100 bg-white object-contain p-1" onError={event => { if (!event.currentTarget.src.endsWith('/images/products/placeholder.svg')) event.currentTarget.src = '/images/products/placeholder.svg' }} />
                      <span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold text-secondary">{product.name}</span>
                        {(product.skuCount ?? product.skus?.length) != null && <span className="mt-1 block text-xs text-slate-500">{product.skuCount ?? product.skus.length} SKU</span>}
                      </span>
                      {selectedProduct?._id === product._id && <FiCheck aria-hidden="true" className="shrink-0 text-primary" />}
                    </button>
                  </li>)}
                </ul>
              </div>}
            </div>
            {searchError && <p role="alert" className="text-sm text-red-600">{searchError}</p>}
            {selectedProduct && <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="min-w-0 break-words text-sm font-semibold text-secondary">{selectedProduct.name}</h3>
                <span className="text-xs text-slate-500">{loading ? 'Đang tải SKU...' : `${availableVariants.length} SKU có thể chọn`}</span>
              </div>
              <input aria-label="Tìm SKU" type="search" placeholder="Lọc theo RAM, ROM, màu hoặc mã SKU..." value={skuSearch} onChange={event => setSkuSearch(event.target.value)} className={fieldClass} />
              <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2" aria-busy={loading}>
                {!loading && availableVariants.map(sku => <button key={sku._id} type="button" disabled={values.items.length >= 50} onClick={() => addSku(sku)}
                  className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40">
                  <img src={sku.color?.image?.url || selectedProduct.images?.[0]?.url || '/images/products/placeholder.svg'} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-contain p-1" onError={event => { if (!event.currentTarget.src.endsWith('/images/products/placeholder.svg')) event.currentTarget.src = '/images/products/placeholder.svg' }} />
                  <span className="min-w-0 flex-1"><strong className="block break-words text-sm text-secondary">{formatSkuCapacity(sku.ram)} / {formatSkuCapacity(sku.storage)} · {sku.color?.name}</strong>
                    <span className="mt-1 block text-sm font-semibold">{sku.price.toLocaleString('vi-VN')}đ</span>
                    <span className="mt-1 block text-xs text-slate-500">Tồn kho: {sku.stock ?? 'Chưa xác định'}{sku.reservedStock > 0 ? ` · Đang giữ: ${sku.reservedStock}` : ''}</span>
                    <span className="mt-1 block break-all text-xs text-slate-400">{sku.sku}</span>
                  </span><FiPlus aria-hidden="true" className="mt-1 shrink-0 text-slate-500" />
                </button>)}
              </div>
              {!loading && !searchError && !availableVariants.length && <p role="status" className="py-3 text-sm text-slate-500">Không còn SKU phù hợp chưa được chọn.</p>}
              {values.items.length >= 50 && <p className="text-sm text-slate-500">Đã chọn tối đa 50 SKU cho chương trình.</p>}
            </div>}
          </div>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500"><tr>
                <th scope="col" className="px-5 py-3 sm:px-6">Sản phẩm / Phiên bản (SKU)</th>
                <th scope="col" className="px-4 py-3 text-right">Giá thường</th>
                <th scope="col" className="px-4 py-3 text-center">Giảm giá (%)</th>
                <th scope="col" className="px-4 py-3 text-right">Giá sau giảm</th>
                <th scope="col" className="px-5 py-3 text-right sm:px-6">Thao tác</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {values.items.map((item, index) => <tr key={item.productVariant} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3">
                    <img src={item.sku?.color?.image?.url || item.sku?.product?.images?.[0]?.url || '/images/products/placeholder.svg'} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-slate-100 bg-white object-contain p-1" onError={event => { if (!event.currentTarget.src.endsWith('/images/products/placeholder.svg')) event.currentTarget.src = '/images/products/placeholder.svg' }} />
                    <div className="min-w-0"><p className="font-semibold text-secondary">{item.sku?.product?.name || item.sku?.sku || item.productVariant}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.sku ? `${formatSkuCapacity(item.sku.ram)} / ${formatSkuCapacity(item.sku.storage)} · ${item.sku.color?.name || ''}` : 'SKU không còn khả dụng'}</p>
                      <p className="mt-1 break-all text-xs text-slate-400">{item.sku?.sku}</p>
                    </div>
                  </div></td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-medium">{item.sku?.price?.toLocaleString('vi-VN') ?? '—'}đ</td>
                  <td className="px-4 py-4">
                    <label htmlFor={`discount-${item.productVariant}`} className="sr-only">Giảm giá (%) cho {item.sku?.sku || item.productVariant}</label>
                    <div className="mx-auto flex w-fit items-center overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                      <button type="button" aria-label={`Giảm phần trăm cho ${item.sku?.sku || item.productVariant}`} disabled={Number(item.discountPercent) <= 1} onClick={() => editItem(index, 'discountPercent', Math.max(1, Number(item.discountPercent || 1) - 1))} className="flex h-11 w-9 items-center justify-center hover:bg-slate-100 disabled:opacity-30"><FiMinus aria-hidden="true" /></button>
                      <input id={`discount-${item.productVariant}`} type="number" required min={1} max={99} step={1} value={item.discountPercent ?? ''} onChange={event => editItem(index, 'discountPercent', event.target.value)} className="h-11 w-12 bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                      <span aria-hidden="true" className="pr-1 text-slate-500">%</span>
                      <button type="button" aria-label={`Tăng phần trăm cho ${item.sku?.sku || item.productVariant}`} disabled={Number(item.discountPercent) >= 99} onClick={() => editItem(index, 'discountPercent', Math.min(99, Number(item.discountPercent || 0) + 1))} className="flex h-11 w-9 items-center justify-center hover:bg-slate-100 disabled:opacity-30"><FiPlus aria-hidden="true" /></button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-primary"><output aria-live="polite">{item.sku && Number.isInteger(Number(item.discountPercent)) && Number(item.discountPercent) >= 1 && Number(item.discountPercent) <= 99 ? Math.round(item.sku.price * (1 - Number(item.discountPercent) / 100)).toLocaleString('vi-VN') + 'đ' : '—'}</output></td>
                  <td className="px-5 py-4 text-right sm:px-6"><button type="button" onClick={() => setValues(current => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Bỏ SKU ${item.sku?.sku || item.productVariant}`}><FiTrash2 aria-hidden="true" /></button></td>
                </tr>)}
                {!values.items.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Chưa có SKU tham gia. Nhấn “Thêm sản phẩm” để chọn.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        {hasChanges && <footer className="flex flex-wrap justify-end gap-3 pb-2">
          <button type="button" onClick={resetForm} className="min-h-11 rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy thay đổi</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-rose-700"><FiSave aria-hidden="true" />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
        </footer>}
      </fieldset>
    </form>
  )
}

export default FlashSaleEditor
