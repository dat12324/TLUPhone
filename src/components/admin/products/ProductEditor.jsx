import { useState } from 'react'
import SideDrawer from '../../common/SideDrawer'
import { normalizeBrandSlug as makeSlug } from '../../../helpers/brandValidation'
import api from '../../../lib/api.js'
import { mutationBody, PRODUCT_FIELDS } from '../../../helpers/catalog.js'
import { invalidateProductCatalog } from '../../../hooks/useCatalog.js'
import { Field, inputClass, actionClass, ImagePicker, SpecificationsEditor } from './ProductFields'
import { getProductTechnicalSpecs } from '../../../helpers/productAdapter.js'

const ProductEditor = ({ product, brands, categories, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: product?.name || '', slug: product?.slug || '', brand: product?.brand || '', category: product?.category || '', shortDescription: product?.shortDescription || '', description: product?.description || '', status: product?.status || 'draft', tags: (product?.tags || []).join(', '), highlights: (product?.highlights || []).join('\n'), flags: product?.flags || { isNew: false, isFeatured: false, isHotDeal: false }, technicalSpecs: getProductTechnicalSpecs(product), specifications: (product?.specifications || []).map(group => ({ ...group, items: (group.items || []).map(item => ({ ...item })) })) })
  const [manualSlug, setManualSlug] = useState(false)
  const [images, setImages] = useState(product?.images || [])
  const [files, setFiles] = useState([])
  const [primaryFile, setPrimaryFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const update = event => { const { name, value } = event.target; setForm(current => ({ ...current, [name]: value, ...(name === 'name' && !manualSlug ? { slug: makeSlug(value) } : {}) })); setError('') }
  const save = async event => {
    event.preventDefault()
    if (busy) return
    if (!form.name.trim() || !form.brand || !form.category) { setError('Vui lòng nhập tên, chọn thương hiệu và danh mục.'); return }
    if (form.specifications.some(group => !group.title?.trim() || group.items.some(item => !item.label?.trim() || !item.value?.trim()))) {
      setError('Vui lòng nhập tên nhóm, tên thông số và giá trị hoặc xóa dòng không sử dụng.')
      return
    }
    setBusy(true); setError('')
    try {
      const data = { ...form, images, ...(files.includes(primaryFile) ? { primaryImageIndex: files.indexOf(primaryFile) } : {}), tags: form.tags.split(',').map(item => item.trim()).filter(Boolean), highlights: form.highlights.split('\n').map(item => item.trim()).filter(Boolean) }
      if (!product && files.length) delete data.images
      const body = mutationBody(data, PRODUCT_FIELDS, files)
      const response = product ? await api.patch(`/products/${encodeURIComponent(product._id)}`, body) : await api.post('/products', body)
      invalidateProductCatalog()
      onSaved(response.data.data)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <SideDrawer title={product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'} busy={busy} onClose={onClose}>
    <form onSubmit={save} className="flex min-h-0 flex-1 flex-col" aria-busy={busy}>
      <fieldset disabled={busy} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <Field label="Tên sản phẩm *" name="name" value={form.name} onChange={update} required />
        <Field label="Slug (tự tạo, có thể sửa)" name="slug" value={form.slug} onChange={event => { setManualSlug(Boolean(event.target.value)); update(event) }} placeholder="tu-dong-theo-ten" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        <Field label="Thương hiệu *"><select name="brand" required value={form.brand} onChange={update} className={inputClass}><option value="">Chọn thương hiệu</option>{brands.filter(item => item.status === 'active' || item._id === form.brand).map(item => <option key={item._id} value={item._id}>{item.name}{item.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}</select></Field>
        <Field label="Danh mục *"><select name="category" required value={form.category} onChange={update} className={inputClass}><option value="">Chọn danh mục</option>{categories.filter(item => item.status === 'active' || item._id === form.category).map(item => <option key={item._id} value={item._id}>{item.name}{item.status !== 'active' ? ' (đã ẩn)' : ''}</option>)}</select></Field>
        <Field label="Mô tả ngắn"><textarea name="shortDescription" value={form.shortDescription} onChange={update} rows={2} className={inputClass} /></Field>
        <Field label="Mô tả chi tiết"><textarea name="description" value={form.description} onChange={update} rows={5} className={inputClass} /></Field>
        <ImagePicker label="Ảnh sản phẩm" items={images} onItemsChange={setImages} files={files} onFilesChange={next => { setFiles(next); if (!next.includes(primaryFile)) setPrimaryFile(null) }} primary primaryFile={primaryFile} onPrimaryFileChange={setPrimaryFile} disabled={busy} />
        <Field label="Đặc điểm nổi bật (mỗi dòng một ý)"><textarea name="highlights" value={form.highlights} onChange={update} rows={3} className={inputClass} /></Field>
        <Field label="Tags (ngăn cách bằng dấu phẩy)" name="tags" value={form.tags} onChange={update} />
        <div className="border-t border-slate-100 pt-4"><h3 className="mb-4 text-sm font-semibold">Thông số cơ bản</h3><div className="grid grid-cols-2 gap-3">
          {[['chip', 'Chipset', 'text'], ['operatingSystem', 'Hệ điều hành', 'text'], ['network', 'Mạng', 'text'], ['screenSize', 'Màn hình (inch)', 'number'], ['batteryCapacity', 'Pin (mAh)', 'number'], ['refreshRate', 'Tần số quét (Hz)', 'number'], ['cameraMainMp', 'Camera chính (MP)', 'number']].map(([name, label, type]) => <Field key={name} label={label} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} value={form.technicalSpecs[name] ?? ''} onChange={event => setForm(current => ({ ...current, technicalSpecs: { ...current.technicalSpecs, [name]: type === 'number' ? event.target.value === '' ? null : Number(event.target.value) : event.target.value } }))} />)}
        </div></div>
        <SpecificationsEditor value={form.specifications} onChange={specifications => { setForm(current => ({ ...current, specifications })); setError('') }} />
        <div className="flex flex-wrap gap-4">{[['isNew', 'Mới'], ['isFeatured', 'Nổi bật'], ['isHotDeal', 'Hot deal']].map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.flags[key])} onChange={event => setForm(current => ({ ...current, flags: { ...current.flags, [key]: event.target.checked } }))} className="accent-primary" />{label}</label>)}</div>
        <Field label="Trạng thái"><select name="status" value={form.status} onChange={update} className={inputClass}><option value="draft">Bản nháp</option><option value="active">Đang bán</option><option value="inactive">Đã ẩn</option></select></Field>
        {!product && <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">Lưu thông tin chung trước, sau đó thêm SKU để thiết lập giá, màu sắc và tồn kho.</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      </fieldset>
      <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-100 p-5"><button type="button" disabled={busy} onClick={onClose} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm">Hủy</button><button type="submit" disabled={busy} className={actionClass}>{busy ? 'Đang lưu…' : 'Lưu sản phẩm'}</button></footer>
    </form>
  </SideDrawer>
}
export default ProductEditor
