import { useState } from 'react'
import SideDrawer from '../../common/SideDrawer'
import { normalizeBrandSlug } from '../../../helpers/brandValidation'
import { skuCapacityGb, formatSkuCapacity } from '../../../utils/adminFormatters'
import { findSharedColorImage, getProductColorOptions, colorKey } from '../../../helpers/productAdapter'
import api from '../../../lib/api.js'
import { mutationBody, VARIANT_FIELDS } from '../../../helpers/catalog.js'
import { invalidateProductCatalog } from '../../../hooks/useCatalog.js'
import { Field, inputClass, actionClass, ImagePicker, capacityChoices, ColorPicker } from './ProductFields'

const VariantEditor = ({ product, variant, variants = [], onClose, onSaved }) => {
  const [form, setForm] = useState({ sku: variant?.sku || '', ram: skuCapacityGb(variant?.ram) ?? '', storage: skuCapacityGb(variant?.storage) ?? '', colorName: variant?.color?.name || '', colorCode: variant?.color?.code || '', price: variant?.price ?? '', compareAtPrice: variant?.compareAtPrice ?? '', stock: variant?.stock ?? '', lowStockThreshold: variant?.lowStockThreshold ?? 5, isDefault: variant?.isDefault || false, status: variant?.status || 'active' })
  const [colorImages, setColorImages] = useState(variant?.color?.image ? [variant.color.image] : [])
  const [colorFiles, setColorFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [usingShared, setUsingShared] = useState(false)
  const sharedImage = findSharedColorImage(variants, product._id, { name: form.colorName, code: form.colorCode }, variant?._id)
  const update = event => {
    const { name, type, checked, value } = event.target
    if (usingShared && ['colorName', 'colorCode'].includes(name)) { setColorImages([]); setUsingShared(false) }
    setForm(current => {
      const updated = { ...current, [name]: type === 'checkbox' ? checked : value }
      if (['ram', 'storage', 'colorName'].includes(name)) {
        updated.sku = [normalizeBrandSlug(product.name), formatSkuCapacity(updated.ram), formatSkuCapacity(updated.storage), normalizeBrandSlug(updated.colorName)].join('-').toUpperCase()
      }
      return updated
    })
  }
  const save = async event => {
    event.preventDefault()
    if (busy) return
    if (form.compareAtPrice !== '' && Number(form.compareAtPrice) < Number(form.price)) { setError('Giá gốc phải lớn hơn hoặc bằng giá bán.'); return }
    setBusy(true); setError('')
    try {
      const color = { name: form.colorName, ...(form.colorCode ? { code: form.colorCode } : {}) }
      if (!colorFiles.length) color.image = colorImages[0] || null
      const data = { sku: form.sku.trim() || undefined, ram: Number(form.ram), storage: Number(form.storage), price: Number(form.price), compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice), lowStockThreshold: Number(form.lowStockThreshold), isDefault: form.isDefault, status: form.status, color }
      const input = variant ? data : { ...data, product: product._id, stock: form.stock === '' ? null : Number(form.stock) }
      const body = mutationBody(input, variant ? VARIANT_FIELDS : ['product', 'stock', ...VARIANT_FIELDS], [], colorFiles[0])
      const response = variant ? await api.patch(`/product-variants/${encodeURIComponent(variant._id)}`, body) : await api.post('/product-variants', body)
      invalidateProductCatalog()
      onSaved(response.data.data)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <SideDrawer title={variant ? 'Chỉnh sửa SKU' : 'Thêm SKU'} onClose={onClose} busy={busy}>
    <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
      <fieldset disabled={busy} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <p className="text-sm font-semibold text-slate-600">{product.name}</p>
        <Field label={variant ? "Mã SKU *" : "Mã SKU (tùy chọn)"} name="sku" value={form.sku} onChange={update} required={Boolean(variant)} placeholder="Để trống để tự tạo khi lưu" />
        <div className="grid grid-cols-2 gap-3">
          {['ram', 'storage'].map(name => <Field key={name} label={name === 'ram' ? 'RAM (GB) *' : 'ROM (GB) *'}>
            <select name={name} required value={form[name]} onChange={update} className={inputClass}>
              <option value="" disabled hidden>{name === 'ram' ? 'Chọn RAM' : 'Chọn ROM'}</option>
              {[...new Set([...capacityChoices[name], ...(form[name] !== '' ? [Number(form[name])] : [])])].sort((a, b) => a - b).map(value => <option key={value} value={value}>{formatSkuCapacity(value)}</option>)}
            </select>
          </Field>)}
        </div>
        <ColorPicker name={form.colorName} code={form.colorCode} options={getProductColorOptions(variants, product._id)} disabled={busy} onChange={next => {
          const nameChanged = colorKey(next.name) !== colorKey(form.colorName)
          if (nameChanged || usingShared) { setColorImages([]); setColorFiles([]); setUsingShared(false) }
          setForm(current => ({
            ...current, colorName: next.name, colorCode: next.code,
            ...(nameChanged ? { sku: [normalizeBrandSlug(product.name), formatSkuCapacity(current.ram), formatSkuCapacity(current.storage), normalizeBrandSlug(next.name)].join('-').toUpperCase() } : {}),
          }))
        }} />
        <div className="grid grid-cols-2 gap-3"><Field label="Giá bán (VND) *" type="number" min="0" step="1" required name="price" value={form.price} onChange={update} /><Field label="Giá gốc (VND)" type="number" min="0" step="1" name="compareAtPrice" value={form.compareAtPrice} onChange={update} /></div>
        {!variant && <Field label="Tồn kho (để trống nếu chưa xác nhận)" type="number" min="0" step="1" name="stock" value={form.stock} onChange={update} />}
        <Field label="Ngưỡng cảnh báo tồn kho" type="number" min="0" step="1" required name="lowStockThreshold" value={form.lowStockThreshold} onChange={update} />
        <ImagePicker label="Ảnh đại diện màu" items={colorImages} onItemsChange={setColorImages} files={colorFiles} onFilesChange={setColorFiles} max={1} disabled={busy} />
        {!colorFiles.length && !colorImages.length && sharedImage && <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <img src={sharedImage.url} alt={`Ảnh gợi ý màu ${form.colorName}`} className="h-16 w-16 shrink-0 rounded-lg bg-white object-contain p-1" onError={event => { if (!event.currentTarget.src.endsWith('/images/products/placeholder.svg')) event.currentTarget.src = '/images/products/placeholder.svg' }} />
          <div className="text-xs text-slate-600"><p>Đã có ảnh màu này ở SKU cùng sản phẩm.</p><button type="button" onClick={() => { setColorImages([sharedImage]); setUsingShared(true) }} className="mt-1 min-h-11 font-semibold text-blue-700">Dùng ảnh đã có</button></div>
        </div>}

        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="isDefault" checked={form.isDefault} onChange={update} className="accent-primary" />SKU mặc định</label>
        <Field label="Trạng thái"><select name="status" value={form.status} onChange={update} className={inputClass}><option value="active">Đang bán</option><option value="inactive">Đã ẩn</option></select></Field>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      </fieldset>
      <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-100 p-5"><button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm">Hủy</button><button type="submit" disabled={busy} className={actionClass}>{busy ? 'Đang lưu…' : 'Lưu SKU'}</button></footer>
    </form>
  </SideDrawer>
}
export default VariantEditor
