import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiBox,
  FiCamera,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiGrid,
  FiHeart,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiSave,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiTrash2,
  FiUser,
} from 'react-icons/fi'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../context/AuthContext'
import coupons from '../data/coupons'
import { buildDateOfBirth, isValidEmail } from '../helpers/auth'
import { getAddresses, saveAddresses } from '../helpers/profile'

const emptyAddress = (user) => ({
  id: '',
  receiverName: user?.fullName || '',
  phone: user?.phone || '',
  province: '',
  district: '',
  ward: '',
  detailAddress: '',
  isDefault: false,
})

const inputClass = (hasError = false) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:ring-2 focus:ring-primary/10 ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-primary'
  }`

const Field = ({ label, id, error, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    <input id={id} {...props} className={`${inputClass(error)} ${className}`} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
)

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'KH'

const Avatar = ({ user, preview, large = false }) => {
  const size = large ? 'h-24 w-24 text-2xl' : 'h-14 w-14 text-base'
  return preview ? (
    <img src={preview} alt={`Ảnh đại diện của ${user.fullName}`} className={`${size} rounded-full object-cover ring-4 ring-rose-50`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-700 font-bold text-white ring-4 ring-rose-50`}>
      {initialsOf(user.fullName)}
    </span>
  )
}

const menuItems = [
  { id: 'overview', label: 'Tổng quan', icon: FiGrid },
  { id: 'orders', label: 'Lịch sử mua hàng', icon: FiShoppingBag, to: '/orders' },
  { id: 'warranty', label: 'Tra cứu bảo hành', icon: FiShield },
  { id: 'membership', label: 'Hạng thành viên', icon: FiAward },
  { id: 'vouchers', label: 'Voucher của tôi', icon: FiTag },
  { id: 'favorites', label: 'Sản phẩm yêu thích', icon: FiHeart },
  { id: 'reviews', label: 'Đánh giá của tôi', icon: FiStar },
  { id: 'account', label: 'Thông tin tài khoản', icon: FiSettings },
]

const quickItems = [
  ...menuItems.filter((item) => ['membership', 'vouchers', 'orders'].includes(item.id)),
  { id: 'address-shortcut', view: 'account', label: 'Sổ địa chỉ', icon: FiMapPin },
  ...menuItems.filter((item) => ['warranty', 'favorites'].includes(item.id)),
]

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm"><Icon /></span>
    <p className="font-semibold text-secondary">{title}</p>
    {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
    {action}
  </div>
)

const Panel = ({ title, action, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-secondary">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

const ActionLink = ({ children, onClick }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-rose-700">
    {children}<FiChevronRight />
  </button>
)

const ProfilePage = () => {
  const { user, isAuthenticated, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('overview')
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', dateOfBirth: user?.dateOfBirth || '' })
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [profileErrors, setProfileErrors] = useState({})
  const [profileStatus, setProfileStatus] = useState('')
  const [addresses, setAddresses] = useState(() => (user ? getAddresses(user.phone) : []))
  const [addressForm, setAddressForm] = useState(() => emptyAddress(user))
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')

  const activeCoupons = useMemo(() => coupons.filter((coupon) => coupon.active), [])

  useEffect(() => {
    if (!user) return
    setProfileForm({ fullName: user.fullName || '', email: user.email || '', dateOfBirth: user.dateOfBirth || '' })
    setAvatarPreview(user.avatar || '')
    setAddresses(getAddresses(user.phone))
    setAddressForm(emptyAddress(user))
  }, [user])

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: { pathname: '/profile' } }} replace />
  }

  const selectView = (id) => {
    setActiveView(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMenuClick = (item) => {
    if (item.to) navigate(item.to)
    else {
      selectView(item.view || item.id)
      if (item.id === 'address-shortcut') {
        window.setTimeout(() => document.getElementById('address-book')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
    setProfileStatus('')
  }

  const handleProfileSubmit = (event) => {
    event.preventDefault()
    const errors = {}
    if (!profileForm.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên.'
    if (!profileForm.email.trim()) errors.email = 'Vui lòng nhập email.'
    else if (!isValidEmail(profileForm.email)) errors.email = 'Email chưa đúng định dạng.'
    if (!profileForm.dateOfBirth) errors.dateOfBirth = 'Vui lòng nhập ngày sinh.'
    else {
      const [year, month, day] = profileForm.dateOfBirth.split('-')
      if (!buildDateOfBirth(day, month, year)) errors.dateOfBirth = 'Ngày sinh không hợp lệ.'
    }
    if (Object.keys(errors).length) {
      setProfileErrors(errors)
      return
    }
    updateProfile({ ...profileForm, avatar: avatarPreview })
    setProfileErrors({})
    setProfileStatus('Đã lưu thay đổi thông tin.')
  }

  const openNewAddress = () => {
    setAddressForm({ ...emptyAddress(user), isDefault: addresses.length === 0 })
    setAddressError('')
    setIsAddressFormOpen(true)
  }

  const handleAddressSubmit = (event) => {
    event.preventDefault()
    const required = ['receiverName', 'phone', 'province', 'district', 'ward', 'detailAddress']
    if (required.some((field) => !addressForm[field]?.trim())) {
      setAddressError('Vui lòng điền đầy đủ thông tin địa chỉ.')
      return
    }
    const saved = { ...addressForm, id: addressForm.id || `address-${Date.now()}`, isDefault: addresses.length === 0 || addressForm.isDefault }
    let next = addressForm.id ? addresses.map((item) => item.id === saved.id ? saved : item) : [...addresses, saved]
    if (saved.isDefault) next = next.map((item) => ({ ...item, isDefault: item.id === saved.id }))
    setAddresses(next)
    saveAddresses(user.phone, next)
    setIsAddressFormOpen(false)
    setAddressError('')
  }

  const deleteAddress = (id) => {
    let next = addresses.filter((item) => item.id !== id)
    if (next.length && !next.some((item) => item.isDefault)) next = next.map((item, index) => ({ ...item, isDefault: index === 0 }))
    setAddresses(next)
    saveAddresses(user.phone, next)
  }

  const setDefaultAddress = (id) => {
    const next = addresses.map((item) => ({ ...item, isDefault: item.id === id }))
    setAddresses(next)
    saveAddresses(user.phone, next)
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) setPasswordError('Vui lòng nhập đầy đủ các trường mật khẩu.')
    else if (passwordForm.next.length < 8) setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.')
    else if (passwordForm.next !== passwordForm.confirm) setPasswordError('Xác nhận mật khẩu không trùng khớp.')
    else {
      setPasswordError('')
      setPasswordStatus('Thông tin hợp lệ. Tính năng sẽ hoạt động khi kết nối Backend.')
      setPasswordForm({ current: '', next: '', confirm: '' })
    }
  }

  const overview = (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Tổng quan</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: FiBox, value: 0, label: 'Đơn đang xử lý', color: 'bg-blue-50 text-blue-600' },
          { icon: FiTag, value: activeCoupons.length, label: 'Voucher khả dụng', color: 'bg-violet-50 text-violet-600' },
          { icon: FiStar, value: 0, label: 'Sản phẩm chờ đánh giá', color: 'bg-emerald-50 text-emerald-600' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${color}`}><Icon /></span>
            <div><strong className="block text-2xl leading-none text-secondary">{value}</strong><span className="mt-1 block text-sm text-slate-500">{label}</span></div>
          </div>
        ))}
      </div>
      <Panel title="Đơn hàng gần đây" action={<Link to="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">Xem tất cả <FiChevronRight /></Link>}>
        <EmptyState icon={FiShoppingBag} title="Chưa có đơn hàng nào" description="Đơn hàng gần nhất của bạn sẽ xuất hiện tại đây." action={<Link to="/products" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Mua sắm ngay</Link>} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Voucher của tôi" action={<ActionLink onClick={() => selectView('vouchers')}>Xem tất cả</ActionLink>}>
          <div className="flex items-center gap-3 text-sm text-slate-500"><FiTag /> Bạn có {activeCoupons.length} voucher đang khả dụng.</div>
        </Panel>
        <Panel title="Sản phẩm yêu thích" action={<ActionLink onClick={() => selectView('favorites')}>Xem tất cả</ActionLink>}>
          <div className="flex items-center gap-3 text-sm text-slate-500"><FiHeart /> Chưa có sản phẩm yêu thích.</div>
        </Panel>
      </div>
    </div>
  )

  const addressBook = (
    <div id="address-book" className="scroll-mt-24">
      <Panel
      title="Sổ địa chỉ"
      action={<button onClick={openNewAddress} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"><FiPlus /> Thêm địa chỉ</button>}
    >
      <p className="-mt-3 mb-5 text-sm text-slate-500">{addresses.length} địa chỉ đã lưu</p>
      {isAddressFormOpen && (
        <form onSubmit={handleAddressSubmit} className="mb-5 grid gap-4 rounded-xl border border-rose-100 bg-rose-50/40 p-4 sm:grid-cols-2">
          {[
            ['receiverName', 'Họ tên người nhận'], ['phone', 'Số điện thoại'], ['province', 'Tỉnh/Thành phố'], ['district', 'Quận/Huyện'], ['ward', 'Phường/Xã'], ['detailAddress', 'Địa chỉ cụ thể'],
          ].map(([name, label]) => <Field key={name} id={`address-${name}`} name={name} label={label} value={addressForm[name]} onChange={(e) => setAddressForm({ ...addressForm, [name]: e.target.value })} />)}
          <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-primary" /> Đặt làm địa chỉ mặc định</label>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsAddressFormOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500">Hủy</button><button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Lưu địa chỉ</button></div>
          {addressError && <p className="text-sm text-red-600 sm:col-span-2">{addressError}</p>}
        </form>
      )}
      {addresses.length === 0 ? (
        <EmptyState icon={FiMapPin} title="Chưa có địa chỉ giao hàng" description="Thêm địa chỉ để thanh toán nhanh hơn trong lần mua tiếp theo." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => <div key={address.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong>{address.receiverName}</strong>{address.isDefault && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-primary">Mặc định</span>}</div><p className="mt-1 text-sm text-slate-600">{address.phone}</p><p className="mt-2 text-sm leading-6 text-slate-500">{address.detailAddress}, {address.ward}, {address.district}, {address.province}</p></div><div className="flex shrink-0"><button onClick={() => { setAddressForm({ ...address }); setIsAddressFormOpen(true) }} className="h-9 w-9 text-slate-400 hover:text-primary" aria-label="Sửa"><FiEdit2 /></button><button onClick={() => deleteAddress(address.id)} className="h-9 w-9 text-slate-400 hover:text-red-600" aria-label="Xóa"><FiTrash2 /></button></div></div>{!address.isDefault && <button onClick={() => setDefaultAddress(address.id)} className="mt-4 text-xs font-semibold text-primary">Đặt làm mặc định</button>}</div>)}
        </div>
      )}
      </Panel>
    </div>
  )

  const renderContent = () => {
    if (activeView === 'overview') return overview
    if (activeView === 'account') return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Thông tin tài khoản</h1>
        <Panel title="Thông tin cá nhân">
          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="mb-6 flex flex-wrap items-center gap-5 border-b border-slate-100 pb-6">
              <Avatar user={{ ...user, fullName: profileForm.fullName }} preview={avatarPreview} large />
              <div><p className="font-semibold text-secondary">Ảnh đại diện</p><p className="mt-1 text-xs text-slate-500">JPG, PNG hoặc WEBP.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"><FiCamera /> Thay đổi ảnh<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="sr-only" /></label></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="full-name" name="fullName" label="Họ và tên" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} error={profileErrors.fullName} />
              <Field id="phone" label="Số điện thoại" value={user.phone} disabled className="cursor-not-allowed bg-slate-50 text-slate-500" />
              <Field id="email" name="email" type="email" label="Email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} error={profileErrors.email} />
              <Field id="birthday" name="dateOfBirth" type="date" label="Ngày sinh" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} error={profileErrors.dateOfBirth} />
            </div>
            <div className="mt-6 flex items-center gap-3"><button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700"><FiSave /> Lưu thay đổi</button>{profileStatus && <span className="flex items-center gap-1 text-sm text-emerald-600"><FiCheckCircle /> {profileStatus}</span>}</div>
          </form>
        </Panel>
        <Panel title="Đổi mật khẩu">
          <form onSubmit={handlePasswordSubmit} className="grid gap-4 sm:grid-cols-2">
            <PasswordInput id="current-password" name="current" label="Mật khẩu hiện tại" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
            <PasswordInput id="new-password" name="next" label="Mật khẩu mới" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} />
            <PasswordInput id="confirm-password" name="confirm" label="Xác nhận mật khẩu" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            <div className="flex items-end"><button className="rounded-xl border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-rose-50">Đổi mật khẩu</button></div>
            {passwordError && <p className="text-sm text-red-600 sm:col-span-2">{passwordError}</p>}{passwordStatus && <p className="text-sm text-emerald-600 sm:col-span-2">{passwordStatus}</p>}
          </form>
        </Panel>
        {addressBook}
      </div>
    )
    if (activeView === 'vouchers') return (
      <div className="space-y-5"><h1 className="text-2xl font-bold text-secondary sm:text-3xl">Voucher của tôi</h1><div className="grid gap-4 sm:grid-cols-2">{activeCoupons.map((coupon) => <div key={coupon.id} className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"><span className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary" /><div className="flex gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-xl text-primary"><FiTag /></span><div><strong className="text-lg text-secondary">{coupon.code}</strong><p className="mt-1 text-sm text-slate-600">{coupon.description}</p><p className="mt-2 text-xs text-slate-400">Đơn tối thiểu {coupon.minOrder.toLocaleString('vi-VN')}₫</p></div></div></div>)}</div></div>
    )
    const emptyViews = {
      warranty: [FiShield, 'Tra cứu bảo hành', 'Chưa có sản phẩm bảo hành', 'Sản phẩm đã mua và còn thời hạn bảo hành sẽ hiển thị tại đây.'],
      membership: [FiAward, 'Hạng thành viên', 'Bạn đang ở hạng New', 'Hoàn tất đơn hàng đầu tiên để bắt đầu tích điểm và lên hạng.'],
      favorites: [FiHeart, 'Sản phẩm yêu thích', 'Chưa có sản phẩm yêu thích', 'Nhấn biểu tượng trái tim ở sản phẩm để lưu lại tại đây.'],
      reviews: [FiStar, 'Đánh giá của tôi', 'Chưa có đánh giá nào', 'Sau khi nhận hàng, bạn có thể chia sẻ trải nghiệm về sản phẩm.'],
    }
    const [Icon, heading, title, description] = emptyViews[activeView]
    return <div className="space-y-5"><h1 className="text-2xl font-bold text-secondary sm:text-3xl">{heading}</h1><Panel title={heading}><EmptyState icon={Icon} title={title} description={description} /></Panel></div>
  }

  return (
    <section className="min-h-[75vh] bg-slate-100/80 py-5 sm:py-7">
      <div className="container mx-auto max-w-7xl px-4">
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar user={user} preview={avatarPreview} />
              <div className="min-w-36"><p className="text-lg font-bold text-secondary">{user.fullName}</p><p className="text-sm text-slate-500">{user.phone}</p><span className="mt-2 inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">New</span></div>
              <div className="border-l border-slate-100 pl-5"><p className="text-sm text-slate-500">Đơn đã mua</p><strong className="text-3xl text-secondary">0</strong></div>
              <div><p className="text-sm text-slate-500">Điểm tích lũy</p><strong className="text-3xl text-secondary">0 <span className="text-sm font-normal text-slate-500">điểm</span></strong><p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><FiClock /> Hết hạn 31/12/2027</p></div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4"><div className="h-2 overflow-hidden rounded-full bg-slate-200"><span className="block h-full w-[4%] rounded-full bg-primary" /></div><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><FiShoppingBag /> Mua đơn hàng đầu tiên để lên hạng <strong>Silver</strong></p></div>
          </div>
        </section>

        <nav className="mb-6 flex snap-x gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:grid lg:grid-cols-6" aria-label="Truy cập nhanh">
          {quickItems.map((item) => <button key={item.id} onClick={() => handleMenuClick(item)} className="flex min-w-max snap-start items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-secondary transition hover:bg-rose-50 hover:text-primary lg:justify-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-primary"><item.icon /></span>{item.label}</button>)}
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:block" aria-label="Menu tài khoản">
              {menuItems.map((item) => <button key={item.id} onClick={() => handleMenuClick(item)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition ${activeView === item.id && !item.to ? 'bg-rose-50 font-bold text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}><item.icon className="shrink-0 text-lg" /><span>{item.label}</span></button>)}
              <button onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-slate-100 px-3.5 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 lg:mt-2"><FiLogOut className="text-lg" /> Đăng xuất</button>
            </nav>
          </aside>
          <main className="min-w-0">{renderContent()}</main>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
