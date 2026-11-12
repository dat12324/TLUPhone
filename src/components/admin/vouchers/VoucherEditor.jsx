import { useRef, useState } from 'react'
import SideDrawer from '../../common/SideDrawer'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

export const voucherDateInput = value => {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19)
}

export const voucherPayload = form => ({
  code: form.code.trim().toUpperCase(),
  description: form.description.trim(),
  discountType: form.discountType,
  discountValue: Number(form.discountValue),
  maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
  minOrderValue: Number(form.minOrderValue),
  usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
  startsAt: new Date(form.startsAt).toISOString(),
  endsAt: new Date(form.endsAt).toISOString(),
  status: form.status,
})

const VoucherEditor = ({ voucher, onSave, onClose }) => {
  const [form, setForm] = useState(() => ({
    code: voucher?.code ?? '',
    description: voucher?.description ?? '',
    discountType: voucher?.discountType ?? 'percentage',
    discountValue: voucher?.discountValue ?? '',
    maxDiscount: voucher?.maxDiscount ?? '',
    minOrderValue: voucher?.minOrderValue ?? 0,
    usageLimit: voucher?.usageLimit ?? '',
    startsAt: voucherDateInput(voucher?.startsAt),
    endsAt: voucherDateInput(voucher?.endsAt),
    status: voucher?.status ?? 'active',
  }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const savingRef = useRef(false)
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    if (savingRef.current) return
    setError('')
    if (new Date(form.endsAt) <= new Date(form.startsAt)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu.')
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      await onSave(voucherPayload(form))
      onClose()
    } catch (failure) {
      setError(failure.message || 'Không thể lưu voucher. Vui lòng thử lại.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return <SideDrawer title={voucher ? 'Chỉnh sửa voucher' : 'Thêm voucher'} busy={saving} onClose={onClose}>
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <fieldset disabled={saving} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <label className="block text-sm font-medium">Mã giảm giá <span className="text-primary">*</span>
          <input name="code" value={form.code} onChange={change} required maxLength={50} pattern="[A-Za-z0-9_-]+" autoComplete="off" placeholder="VD: GIAM10" className={`${inputClass} uppercase`} />
          <span className="mt-1 block text-xs font-normal text-slate-500">Chữ, số, dấu gạch ngang hoặc gạch dưới.</span>
        </label>
        <label className="block text-sm font-medium">Mô tả
          <textarea name="description" value={form.description} onChange={change} rows={2} className={inputClass} placeholder="Điều kiện hoặc nội dung ưu đãi" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Loại giảm giá
            <select name="discountType" value={form.discountType} onChange={change} className={inputClass}><option value="percentage">Theo phần trăm (%)</option><option value="fixed">Số tiền cố định (VND)</option></select>
          </label>
          <label className="block text-sm font-medium">{form.discountType === 'percentage' ? 'Mức giảm (%)' : 'Số tiền giảm (VND)'} <span className="text-primary">*</span>
            <input name="discountValue" type="number" min={1} max={form.discountType === 'percentage' ? 100 : Number.MAX_SAFE_INTEGER} step={1} required value={form.discountValue} onChange={change} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Giảm tối đa (VND)
            <input name="maxDiscount" type="number" min={0} max={Number.MAX_SAFE_INTEGER} step={1} value={form.maxDiscount} onChange={change} placeholder="Không giới hạn" className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Đơn hàng tối thiểu (VND)
            <input name="minOrderValue" type="number" min={0} max={Number.MAX_SAFE_INTEGER} step={1} required value={form.minOrderValue} onChange={change} className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Bắt đầu <span className="text-primary">*</span>
            <input name="startsAt" type="datetime-local" step={1} required value={form.startsAt} onChange={change} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Kết thúc <span className="text-primary">*</span>
            <input name="endsAt" type="datetime-local" step={1} required value={form.endsAt} onChange={change} className={inputClass} />
          </label>
        </div>
        <p className="text-xs text-slate-500">Thời gian theo múi giờ trên thiết bị của bạn.</p>
        <label className="block text-sm font-medium">Giới hạn lượt sử dụng
          <input name="usageLimit" type="number" min={Math.max(1, voucher?.usedCount ?? 0)} max={Number.MAX_SAFE_INTEGER} step={1} value={form.usageLimit} onChange={change} placeholder="Không giới hạn" className={inputClass} />
          {voucher && <span className="mt-1 block text-xs font-normal text-slate-500">Đã dùng: {voucher.usedCount ?? 0} lượt.</span>}
        </label>
        <label className="block text-sm font-medium">Trạng thái
          <select name="status" value={form.status} onChange={change} className={inputClass}><option value="active">Bật</option><option value="inactive">Tắt</option></select>
        </label>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </fieldset>
      <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 p-5">
        <button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold disabled:opacity-50">Hủy</button>
        <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
      </footer>
    </form>
  </SideDrawer>
}

export default VoucherEditor
