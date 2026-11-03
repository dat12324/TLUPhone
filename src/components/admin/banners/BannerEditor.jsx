import { useState } from 'react'
import SideDrawer from '../../common/SideDrawer'
import ImageUploadInput from '../../common/ImageUploadInput'
import BannerLinkField from './BannerLinkField'
import { bannerPositions, bannerThemes, bannerBody, localBannerDate, getBannerProductSlug } from '../../../helpers/banner.js'

const fieldClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

const BannerEditor = ({ banner, onSave, onClose }) => {
  const [values, setValues] = useState(() => ({
    title: banner?.title || '', subtitle: banner?.subtitle || '', tag: banner?.tag || '',
    priceText: banner?.priceText || '', btnText: banner?.btnText || 'Xem ngay',
    link: getBannerProductSlug(banner?.link) ? banner.link : '/products', position: banner?.position || 'hero',
    theme: banner?.theme || 'slate', tone: banner?.tone || 'rose', icon: banner?.icon || 'phone',
    displayOrder: banner?.displayOrder ?? 0, status: banner?.status || 'active',
    image: banner?.image || null, startsAt: localBannerDate(banner?.startsAt), endsAt: localBannerDate(banner?.endsAt),
  }))
  const [file, setFile] = useState(null)
  const [imageError, setImageError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const update = event => { setValues(current => ({ ...current, [event.target.name]: event.target.value })); setError('') }
  const close = () => { if (!saving) onClose() }
  const submit = async event => {
    event.preventDefault()
    if (saving) return
    if (imageError) return
    if (values.position !== 'promo' && !file && !values.image) {
      setImageError('Vui lòng chọn ảnh cho banner này.')
      return
    }
    if (values.startsAt && values.endsAt && new Date(values.endsAt) <= new Date(values.startsAt)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu.')
      return
    }
    setSaving(true)
    setError('')
    try { await onSave(bannerBody(values, file)); onClose() }
    catch (failure) { setError(failure.message || 'Không thể lưu banner.') }
    finally { setSaving(false) }
  }
  return (
    <SideDrawer title={banner ? 'Chỉnh sửa banner' : 'Thêm banner'} onClose={close} busy={saving}>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <fieldset disabled={saving} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <label className="block text-sm font-semibold">Vị trí hiển thị
            <select name="position" value={values.position} onChange={event => { update(event); setImageError('') }} className={`${fieldClass} mt-2`}>
              {Object.entries(bannerPositions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          {[
            ['title', 'Tiêu đề', true], ['subtitle', 'Mô tả ngắn'], ['tag', 'Nhãn nổi bật'],
            ['priceText', 'Nội dung giá / ưu đãi'], ['btnText', 'Chữ trên nút'],
          ].map(([name, label, required]) => (
            <label key={name} className="block text-sm font-semibold">{label}{required ? ' *' : ''}
              <input name={name} value={values[name]} onChange={update} required={required} className={`${fieldClass} mt-2`} />
            </label>
          ))}
          <BannerLinkField value={values.link} onChange={link => { setValues(current => ({ ...current, link })); setError('') }} />
          <ImageUploadInput id="banner-image" label={`Ảnh banner${values.position === 'promo' ? ' (không bắt buộc)' : ' *'}`}
            imageName={values.title} imageUrl={values.image?.url} file={file} error={imageError}
            onSelect={(selected, message) => { setFile(selected); setImageError(message || '') }}
            onRemove={() => { setFile(null); setValues(current => ({ ...current, image: null })); setImageError('') }} />
          {values.position !== 'promo' && <label className="block text-sm font-semibold">Mẫu nền
            <select name="theme" value={values.theme} onChange={update} className={`${fieldClass} mt-2`}>
              {Object.keys(bannerThemes).map(theme => <option key={theme} value={theme}>{({ slate: 'Xám – đỏ', indigo: 'Chàm', zinc: 'Xám – xanh', amber: 'Vàng', purple: 'Tím' })[theme]}</option>)}
            </select>
            <span className={`mt-2 flex min-h-14 items-center rounded-xl bg-gradient-to-r px-4 text-sm font-semibold text-white ${bannerThemes[values.theme] || bannerThemes.slate}`}>Xem trước màu nền</span>
          </label>}
          {values.position === 'promo' && <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Tông màu<select name="tone" value={values.tone} onChange={update} className={`${fieldClass} mt-2`}>
              <option value="rose">Hồng</option><option value="slate">Xám</option><option value="emerald">Xanh lá</option>
            </select></label>
            <label className="text-sm font-semibold">Biểu tượng<select name="icon" value={values.icon} onChange={update} className={`${fieldClass} mt-2`}>
              <option value="phone">Điện thoại</option><option value="brands">Thương hiệu</option><option value="shipping">Vận chuyển</option>
            </select></label>
          </div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Thứ tự<input name="displayOrder" type="number" min="0" step="1" required value={values.displayOrder} onChange={update} className={`${fieldClass} mt-2`} /></label>
            <label className="text-sm font-semibold">Trạng thái<select name="status" value={values.status} onChange={update} className={`${fieldClass} mt-2`}>
              <option value="active">Hoạt động</option><option value="inactive">Đã ẩn</option>
            </select></label>
            <label className="text-sm font-semibold">Bắt đầu<input name="startsAt" type="datetime-local" value={values.startsAt} onChange={update} className={`${fieldClass} mt-2`} /></label>
            <label className="text-sm font-semibold">Kết thúc<input name="endsAt" type="datetime-local" value={values.endsAt} onChange={update} className={`${fieldClass} mt-2`} /></label>
          </div>
          <p className="text-xs text-slate-500">Để trống lịch để không giới hạn thời gian. Thời gian nhập theo múi giờ trên thiết bị.</p>
        </fieldset>
        <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 p-5">
          <button type="button" disabled={saving} onClick={close} className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu banner'}</button>
        </footer>
      </form>
    </SideDrawer>
  )
}

export default BannerEditor
