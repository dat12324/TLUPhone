import { useEffect, useId, useState } from 'react'
import { colorKey } from '../../../helpers/productAdapter.js'
import { FiX, FiUpload } from 'react-icons/fi'

export const capacityChoices = { ram: [3, 4, 6, 8, 12, 16, 24], storage: [32, 64, 128, 256, 512, 1024, 2048] }

export const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-secondary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50'
export const Field = ({ label, children, ...props }) => <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">{label}</span>{children || <input {...props} className={inputClass} />}</label>
export const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50'

export const SpecificationsEditor = ({ value, onChange }) => {
  const updateGroup = (index, changes) => onChange(value.map((group, i) => i === index ? { ...group, ...changes } : group))
  return <section className="space-y-4 border-t border-slate-100 pt-4" aria-label="Thông số chi tiết">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-semibold">Thông số chi tiết</h3>
      <button type="button" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm" onClick={() => onChange([...value, { key: crypto.randomUUID(), title: '', items: [] }])}>+ Thêm nhóm</button>
    </div>
    {!value.length && <p className="text-sm text-slate-500">Thêm nhóm như Màn hình, Camera hoặc Pin và sạc.</p>}
    {value.map((group, index) => <div key={group.key} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1"><Field label="Tên nhóm *" value={group.title} required placeholder="Ví dụ: Màn hình" onChange={event => updateGroup(index, { title: event.target.value })} /></div>
        <button type="button" aria-label={`Xóa nhóm ${group.title || index + 1}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-red-600 hover:bg-red-50" onClick={() => onChange(value.filter((_, i) => i !== index))}><FiX aria-hidden="true" /></button>
      </div>
      {group.items.map((item, row) => <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Field label="Tên thông số *" value={item.label} required placeholder="Ví dụ: Tần số quét" onChange={event => updateGroup(index, { items: group.items.map((entry, i) => i === row ? { ...entry, label: event.target.value } : entry) })} />
        <div className="col-start-1 sm:col-start-auto"><Field label="Giá trị *" value={item.value} required placeholder="Ví dụ: 120 Hz" onChange={event => updateGroup(index, { items: group.items.map((entry, i) => i === row ? { ...entry, value: event.target.value } : entry) })} /></div>
        <button type="button" aria-label={`Xóa thông số ${item.label || row + 1}`} className="col-start-2 row-start-1 row-span-2 flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 sm:col-start-auto sm:row-start-auto sm:row-span-1" onClick={() => updateGroup(index, { items: group.items.filter((_, i) => i !== row) })}><FiX aria-hidden="true" /></button>
      </div>)}
      <button type="button" className="min-h-11 px-2 text-sm font-medium text-primary" onClick={() => updateGroup(index, { items: [...group.items, { key: crypto.randomUUID(), label: '', value: '' }] })}>+ Thêm thông số</button>
    </div>)}
  </section>
}

export const ImagePicker = ({ label, items, onItemsChange, files, onFilesChange, max = 10, primary = false, primaryFile = null, onPrimaryFileChange, disabled }) => {
  const primaryGroup = useId()
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [files])
  const select = event => {
    const selected = [...event.target.files]
    event.target.value = ''
    if (!selected.length) return
    if ((max === 1 ? selected.length : items.length + files.length + selected.length) > max) { setError(`Tối đa ${max} ảnh.`); return }
    if (selected.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError('Chọn JPG, PNG hoặc WebP, tối đa 5 MB/ảnh.'); return }
    setError('')
    if (max === 1) { onItemsChange([]); onFilesChange(selected) }
    else onFilesChange([...files, ...selected])
  }
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{label}</span><label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"><FiUpload aria-hidden="true" />Chọn ảnh<input type="file" accept="image/jpeg,image/png,image/webp" multiple={max > 1} disabled={disabled} onChange={select} className="sr-only" /></label></div>
    {(items.length > 0 || files.length > 0) && <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((image, index) => <div key={`${image.publicId}-${index}`} className="relative rounded-xl border border-slate-200 p-2"><img src={image.url} alt="" className="aspect-square w-full object-contain" /><button type="button" disabled={disabled} aria-label={`Bỏ ảnh ${index + 1}`} onClick={() => onItemsChange(items.filter((_, i) => i !== index))} className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow"><FiX /></button>{primary && <label className="mt-2 flex items-center gap-1 text-[11px]"><input type="radio" name={primaryGroup} checked={Boolean(image.isPrimary) && !primaryFile} disabled={disabled} onChange={() => { onPrimaryFileChange?.(null); onItemsChange(items.map((item, i) => ({ ...item, isPrimary: i === index }))) }} />Ảnh chính</label>}</div>)}
      {files.map((file, index) => <div key={`${file.name}-${index}`} className="relative rounded-xl border border-dashed border-primary/40 p-2"><img src={previews[index]} alt="" className="aspect-square w-full object-contain" /><button type="button" disabled={disabled} aria-label={`Bỏ ảnh mới ${index + 1}`} onClick={() => onFilesChange(files.filter((_, i) => i !== index))} className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow"><FiX /></button><span className="text-[11px] text-primary">Ảnh mới</span>{primary && <label className="mt-2 flex items-center gap-1 text-[11px]"><input type="radio" name={primaryGroup} checked={primaryFile === file} disabled={disabled} onChange={() => { onPrimaryFileChange?.(file); onItemsChange(items.map(item => ({ ...item, isPrimary: false }))) }} />Ảnh chính</label>}</div>)}
    </div>}
    <p className="text-xs text-slate-500">JPG, PNG, WebP · Tối đa {max} ảnh, 5 MB/ảnh.</p>
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
  </div>
}

export const ColorPicker = ({ name, code, options = [], onChange, disabled = false }) => {
  const [open, setOpen] = useState(false)
  const pickerId = useId()
  const matches = options.filter(option => colorKey(option.name).includes(colorKey(name || '')))
  const pickerCode = /^#[a-f\d]{3}$/i.test(code || '') ? '#' + [...code.slice(1)].map(char => char + char).join('')
    : /^#[a-f\d]{6}$/i.test(code || '') ? code : '#222222'
  return <div className="flex min-w-0 flex-1 items-end gap-2">
    <label className="mb-0.5 flex h-11 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white" title={code || 'Chọn mã màu'}>
      <span className="sr-only">Chọn mã màu</span>
      <input type="color" disabled={disabled} value={pickerCode} onChange={event => onChange({ name, code: event.target.value })} className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed" />
    </label>
    <div className="relative min-w-0 flex-1" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }} onKeyDown={event => { if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false) } }}>
      <Field label="Màu *" required disabled={disabled} autoComplete="off" placeholder="Nhập hoặc chọn màu đã có" value={name} aria-expanded={open && options.length > 0} aria-controls={open && options.length ? pickerId : undefined} onFocus={() => setOpen(true)} onChange={event => { onChange({ name: event.target.value, code }); setOpen(true) }} />
      {open && options.length > 0 && <div id={pickerId} className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg" role="group" aria-label="Màu đã có của sản phẩm">
        <p className="px-2 py-2 text-[11px] font-medium text-slate-500">Màu đã có trong sản phẩm</p>
        {matches.map(option => <button key={option.key} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { onChange({ name: option.name, code: option.code }); setOpen(false) }} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="h-5 w-5 shrink-0 rounded-full border border-slate-300" style={{ backgroundColor: option.code || '#f1f5f9' }} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{option.name}</span><span className="text-[10px] text-slate-500">{option.code || 'Chưa có mã'}</span>
        </button>)}
        {!matches.length && <p className="px-2 py-2 text-xs text-slate-500">Màu mới — bạn có thể nhập tên và chọn mã màu bên cạnh.</p>}
      </div>}
    </div>
  </div>
}
