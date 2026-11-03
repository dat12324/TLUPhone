import { useState } from 'react'
import { formatSkuCapacity } from '../../../utils/adminFormatters'
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import SideDrawer from '../../common/SideDrawer'
import { findSharedColorImage, getProductColorOptions } from '../../../helpers/productAdapter'
import api from '../../../lib/api.js'
import { invalidateProductCatalog } from '../../../hooks/useCatalog.js'
import { normalizeBrandSlug } from '../../../helpers/brandValidation'
import { Field, inputClass, actionClass, ImagePicker, capacityChoices, ColorPicker } from './ProductFields'

const newColor = () => ({ id: crypto.randomUUID(), name: '', code: '', useSharedImage: false, file: null, sku: '', stock: '', price: '', isDefault: false })
const newGroup = () => ({ id: crypto.randomUUID(), ram: '8', storage: '256', price: '', colors: [newColor()] })


const BulkVariantsEditor = ({ product, variants = [], onClose, onSaved }) => {
  const [groups, setGroups] = useState(() => [newGroup()])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const colorOptions = getProductColorOptions(variants, product._id)
  const selectColor = (groupId, colorId, option) => {
    setGroups(current => current.map(group => group.id === groupId ? { ...group, colors: group.colors.map(color => color.id === colorId ? { ...color, name: option.name, code: option.code, useSharedImage: false } : color) } : group))
  }
  const count = groups.reduce((sum, group) => sum + group.colors.length, 0)
  const update = (id, key, value) => setGroups(current => current.map(group => group.id === id ? { ...group, [key]: value } : group))
  const updateColor = (id, colorId, key, value) => setGroups(current => current.map(group => group.id === id ? { ...group, colors: group.colors.map(color => color.id === colorId ? { ...color, [key]: value, ...(['name', 'code', 'file'].includes(key) ? { useSharedImage: false } : {}), ...(key === 'useSharedImage' && value ? { file: null } : {}) } : color) } : group))
  const skuPreview = (group, color) => [normalizeBrandSlug(product.name), formatSkuCapacity(group.ram), formatSkuCapacity(group.storage), normalizeBrandSlug(color.name)].join('-').toUpperCase()
  const submit = async event => {
    event.preventDefault()
    if (busy) return
    const capacities = groups.map(group => `${group.ram}-${group.storage}`)
    if (new Set(capacities).size !== groups.length) { setError('RAM/ROM đang trùng. Hãy thêm màu trong cùng một phiên bản.'); return }
    const payload = groups.flatMap(group => group.colors.map(color => ({ product: product._id, ram: Number(group.ram), storage: Number(group.storage), sku: color.sku.trim() || undefined, color: { name: color.name.trim(), ...(color.code ? { code: color.code } : {}), ...(color.useSharedImage && findSharedColorImage(variants, product._id, color)?.publicId ? { image: findSharedColorImage(variants, product._id, color) } : {}) }, price: Number(color.price === '' ? group.price : color.price), stock: color.stock === '' ? null : Number(color.stock), isDefault: color.isDefault, status: 'active' })))
    if (payload.filter(item => item.isDefault).length > 1) { setError('Chỉ chọn một màu/SKU mặc định cho sản phẩm.'); return }
    const files = []
    const indexes = groups.flatMap(group => group.colors).map(color => {
      if (!color.file) return null
      files.push(color.file)
      return files.length - 1
    })
    if (files.length > 10) { setError('Mỗi lần lưu tối đa 10 ảnh màu mới.'); return }
    setBusy(true); setError('')
    try {
      let body = { variants: payload }
      if (files.length) {
        body = new FormData()
        body.append('variants', JSON.stringify(payload))
        body.append('colorImageIndexes', JSON.stringify(indexes))
        files.forEach(file => body.append('colorImages', file))
      }
      await api.post('/product-variants/bulk', body)
      invalidateProductCatalog()
      onSaved()
    }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <SideDrawer title="Thêm phiên bản sản phẩm" busy={busy} onClose={onClose}>
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" aria-busy={busy}>
      <fieldset disabled={busy} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <p className="text-sm text-slate-500">{product.name} · Mỗi phiên bản RAM/ROM có thể thêm nhiều màu.</p>
        {groups.map((group, index) => <section key={group.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">Phiên bản {index + 1}</span>{formatSkuCapacity(group.ram)} / {formatSkuCapacity(group.storage)}</h3>
            <button type="button" disabled={groups.length === 1} onClick={() => setGroups(current => current.filter(item => item.id !== group.id))} aria-label={`Xóa phiên bản ${index + 1}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><FiTrash2 /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['ram', 'storage'].map(key => <Field key={key} label={key === 'ram' ? 'RAM (GB) *' : 'ROM (GB) *'}><select required value={group[key]} onChange={event => update(group.id, key, event.target.value)} className={inputClass}>{capacityChoices[key].map(value => <option key={value} value={value}>{formatSkuCapacity(value)}</option>)}</select></Field>)}
          </div>
          <Field label="Giá bán chung (VND) *" type="number" min="0" step="1" required value={group.price} onChange={event => update(group.id, 'price', event.target.value)} />
          <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-semibold">Màu sắc & tồn kho</h4><button type="button" disabled={count >= 50} onClick={() => update(group.id, 'colors', [...group.colors, newColor()])} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40"><FiPlus />Thêm màu</button></div>
          <div className="space-y-2">
            {group.colors.map((color, colorIndex) => <div key={color.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-end gap-2">
                <ColorPicker name={color.name} code={color.code} options={colorOptions} disabled={busy} onChange={next => selectColor(group.id, color.id, next)} />
                <div className="w-20 shrink-0"><Field label="Tồn kho" type="number" min="0" step="1" value={color.stock} onChange={event => updateColor(group.id, color.id, 'stock', event.target.value)} /></div>
                <button type="button" disabled={group.colors.length === 1} onClick={() => update(group.id, 'colors', group.colors.filter(item => item.id !== color.id))} aria-label={`Xóa màu ${colorIndex + 1} của phiên bản ${index + 1}`} className="mb-0.5 flex h-11 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30"><FiX /></button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Mã SKU (tùy chọn)" placeholder={color.name.trim() ? skuPreview(group, color) : "Tự tạo khi lưu"} title={color.name.trim() ? skuPreview(group, color) : undefined} value={color.sku} onChange={event => updateColor(group.id, color.id, 'sku', event.target.value)} />
                <Field label="Giá riêng (nếu có)" type="number" min="0" step="1" placeholder={group.price || 'Dùng giá chung'} value={color.price} onChange={event => updateColor(group.id, color.id, 'price', event.target.value)} />
              </div>
              <div className="mt-3"><ImagePicker label="Ảnh màu" items={[]} onItemsChange={() => {}} files={color.file ? [color.file] : []} onFilesChange={files => updateColor(group.id, color.id, 'file', files[0] || null)} max={1} disabled={busy} /></div>
              {(() => {
                const image = findSharedColorImage(variants, product._id, { name: color.name, code: color.code })
                if (!image || color.file) return null
                return <div className="mt-3 flex items-center gap-3 rounded-lg bg-blue-50/60 p-3">
                  <img src={image.url} alt={`Ảnh gợi ý màu ${color.name}`} className="h-14 w-14 shrink-0 rounded-lg border border-blue-100 bg-white object-contain p-1" onError={event => { if (!event.currentTarget.src.endsWith('/images/products/placeholder.svg')) event.currentTarget.src = '/images/products/placeholder.svg' }} />
                  <div className="min-w-0 text-xs text-slate-600"><p>Ảnh màu đã có trong sản phẩm.</p>{image.publicId ? <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-2 font-medium text-blue-700"><input type="checkbox" className="accent-primary" checked={color.useSharedImage} onChange={event => updateColor(group.id, color.id, 'useSharedImage', event.target.checked)} />Dùng ảnh</label> : <p className="mt-1">Ảnh cũ thiếu publicId, chỉ dùng để xem trước.</p>}</div>
                </div>
              })()}

              <label className="mt-1 flex min-h-11 items-center gap-2 text-xs text-slate-500"><input type="checkbox" className="accent-primary" checked={color.isDefault} onChange={event => updateColor(group.id, color.id, 'isDefault', event.target.checked)} />Mặc định khi xem sản phẩm</label>
            </div>)}
          </div>
        </section>)}
        <button type="button" disabled={count >= 50} onClick={() => setGroups(current => [...current, newGroup()])} className={`${inputClass} inline-flex items-center justify-center gap-2 font-semibold text-primary disabled:opacity-40`}><FiPlus />Thêm phiên bản RAM/ROM</button>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      </fieldset>
      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 p-5"><span className="text-xs text-slate-500">{groups.length} phiên bản · {count} màu</span><div className="flex gap-2"><button type="button" disabled={busy} onClick={onClose} className="min-h-11 px-3 text-sm">Hủy</button><button type="submit" disabled={busy} className={actionClass}>{busy ? 'Đang lưu…' : 'Lưu phiên bản'}</button></div></footer>
    </form>
  </SideDrawer>
}
export default BulkVariantsEditor
