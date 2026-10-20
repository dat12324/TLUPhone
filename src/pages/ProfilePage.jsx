import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  FiCamera,
  FiCheckCircle,
  FiChevronRight,
  FiEdit2,
  FiGrid,
  FiLogOut,
  FiMapPin,
  FiPlus,
  FiSave,
  FiSettings,
  FiShoppingBag,
  FiTrash2,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
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
  { id: 'account', label: 'Thông tin tài khoản', icon: FiSettings },
]

const quickItems = [
  ...menuItems.filter((item) => ['orders', 'account'].includes(item.id)),
  { id: 'address-shortcut', view: 'account', label: 'Sổ địa chỉ', icon: FiMapPin },
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
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState(null)

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
    setPendingDeleteAddressId(null)
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
    setPendingDeleteAddressId(null)
  }

  const confirmDeleteAddress = (id) => {
    let next = addresses.filter((item) => item.id !== id)
    if (next.length && !next.some((item) => item.isDefault)) next = next.map((item, index) => ({ ...item, isDefault: index === 0 }))
    setAddresses(next)
    saveAddresses(user.phone, next)
    setPendingDeleteAddressId(null)
  }

  const setDefaultAddress = (id) => {
    const next = addresses.map((item) => ({ ...item, isDefault: item.id === id }))
    setAddresses(next)
    saveAddresses(user.phone, next)
  }

  const overview = (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-secondary sm:text-3xl">Tổng quan</h1>
      <Panel title="Quản lý tài khoản">
        <p className="text-sm leading-6 text-slate-500">
          Cập nhật thông tin nhận hàng, ảnh đại diện và các địa chỉ thường dùng của bạn.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => selectView('account')}
            className="flex min-h-14 items-center justify-between rounded-xl border border-slate-200 px-4 text-left text-sm font-semibold text-secondary transition-colors hover:border-rose-200 hover:bg-rose-50"
          >
            Thông tin tài khoản
            <FiChevronRight aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => handleMenuClick({ id: 'address-shortcut', view: 'account' })}
            className="flex min-h-14 items-center justify-between rounded-xl border border-slate-200 px-4 text-left text-sm font-semibold text-secondary transition-colors hover:border-rose-200 hover:bg-rose-50"
          >
            Sổ địa chỉ
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </Panel>
      <Panel
        title="Lịch sử mua hàng"
        action={<Link to="/orders" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">Xem đơn hàng <FiChevronRight aria-hidden="true" /></Link>}
      >
        <p className="text-sm leading-6 text-slate-500">
          Theo dõi trạng thái các đơn hàng đã đặt tại TLUPhone.
        </p>
      </Panel>
    </div>
  )

  const addressBook = (
    <div id="address-book" className="scroll-mt-24">
      <Panel
      title="Sổ địa chỉ"
      action={<button type="button" onClick={openNewAddress} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"><FiPlus aria-hidden="true" /> Thêm địa chỉ</button>}
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
          {addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{address.receiverName}</strong>
                    {address.isDefault && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-primary">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{address.phone}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {address.detailAddress}, {address.ward}, {address.district}, {address.province}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAddressForm({ ...address })
                      setPendingDeleteAddressId(null)
                      setIsAddressFormOpen(true)
                    }}
                    className="flex h-11 w-11 items-center justify-center text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Sửa địa chỉ của ${address.receiverName}`}
                  >
                    <FiEdit2 aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteAddressId(address.id)}
                    className="flex h-11 w-11 items-center justify-center text-slate-400 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`Xóa địa chỉ của ${address.receiverName}`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </div>
              </div>

              {pendingDeleteAddressId === address.id && (
                <div
                  role="alertdialog"
                  aria-labelledby={`delete-address-${address.id}`}
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3"
                >
                  <p id={`delete-address-${address.id}`} className="text-sm font-semibold text-red-700">
                    Bạn chắc chắn muốn xóa địa chỉ này?
                  </p>
                  <p className="mt-1 text-xs text-red-600">Thao tác này không thể hoàn tác.</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingDeleteAddressId(null)}
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600"
                    >
                      Giữ lại
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteAddress(address.id)}
                      className="min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Xóa địa chỉ
                    </button>
                  </div>
                </div>
              )}

              {!address.isDefault && pendingDeleteAddressId !== address.id && (
                <button
                  type="button"
                  onClick={() => setDefaultAddress(address.id)}
                  className="mt-3 min-h-11 text-xs font-semibold text-primary"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
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
        {addressBook}
      </div>
    )
    return overview
  }

  return (
    <section className="min-h-[75vh] bg-slate-100/80 py-5 sm:py-7">
      <div className="container mx-auto max-w-7xl px-4">
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="flex items-center gap-4 sm:gap-5">
              <Avatar user={user} preview={avatarPreview} />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-secondary">{user.fullName}</p>
                <p className="mt-0.5 text-sm text-slate-500">{user.phone}</p>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {user.email || 'Chưa cập nhật email'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-600">
                Hoàn thiện thông tin để mua hàng và nhận hàng thuận tiện hơn.
              </p>
              <button
                type="button"
                onClick={() => selectView('account')}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
              >
                <FiSettings aria-hidden="true" />
                Cập nhật
              </button>
            </div>
          </div>
        </section>

        <nav className="mb-6 flex snap-x gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:grid lg:grid-cols-3" aria-label="Truy cập nhanh">
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
