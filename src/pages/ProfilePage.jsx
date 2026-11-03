import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  FiCamera,
  FiCheckCircle,
  FiEdit2,
  FiLogOut,
  FiSettings,
  FiShoppingBag,
  FiX,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import SideDrawer from '../components/common/SideDrawer'
import { ProfilePanel as Panel, ProfileAddressBook } from '../components/profile/ProfileSections'
import PasswordChangeDrawer from '../components/auth/PasswordChangeDrawer'
import { buildDateOfBirth, isValidPhone } from '../helpers/auth'
import { mapAddress, toAddressPayload } from '../helpers/profile'
import api from '../lib/api.js'

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
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:ring-2 focus:ring-primary/10 disabled:cursor-default disabled:bg-slate-50 disabled:text-slate-500 ${
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
  const [failedUrl, setFailedUrl] = useState(null)
  const size = large ? 'h-24 w-24 text-2xl' : 'h-14 w-14 text-base'
  return preview && preview !== failedUrl ? (
    <img src={preview} referrerPolicy="no-referrer" onError={() => setFailedUrl(preview)} alt={`Ảnh đại diện của ${user.fullName}`} className={`${size} rounded-full object-cover ring-4 ring-rose-50`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-700 font-bold text-white ring-4 ring-rose-50`}>
      {initialsOf(user.fullName)}
    </span>
  )
}

const menuItems = [
  { id: 'orders', label: 'Lịch sử mua hàng', icon: FiShoppingBag, to: '/orders' },
  { id: 'account', label: 'Thông tin tài khoản', icon: FiSettings },
]

const profileValues = (user) => ({
  fullName: user?.fullName || '',
  phoneNumber: user?.phone || '',
  gender: user?.gender || '',
  dateOfBirth: user?.dateOfBirth || '',
})

const ProfilePage = () => {
  const { user, isAuthenticated, authLoading, authError, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [profileForm, setProfileForm] = useState(() => profileValues(user))
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [profileErrors, setProfileErrors] = useState({})
  const [profileNotice, setProfileNotice] = useState({ message: '', saved: false })
  const { message: profileStatus, saved: profileSaved } = profileNotice
  const showProfileNotice = (message = '', saved = false) => setProfileNotice({ message, saved })
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressesError, setAddressesError] = useState('')
  const [addressesRetry, setAddressesRetry] = useState(0)
  const [addressBusy, setAddressBusy] = useState(false)
  const [addressForm, setAddressForm] = useState(() => emptyAddress(user))
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState(null)

  useEffect(() => {
    if (!user) return
    setProfileForm(profileValues(user))
    setAvatarPreview(user.avatar || '')
    setAddressForm(emptyAddress(user))
  }, [user])

  useEffect(() => {
    if (!user?.id) return
    const controller = new AbortController()
    const loadAddresses = async () => {
      setAddressesLoading(true)
      setAddressesError('')
      setAddresses([])
      try {
        const { data } = await api.get('/users/getAddresses', { signal: controller.signal })
        if (!controller.signal.aborted) setAddresses(data.data.map(mapAddress))
      } catch (error) {
        if (!controller.signal.aborted) setAddressesError(error.message)
      } finally {
        if (!controller.signal.aborted) setAddressesLoading(false)
      }
    }
    loadAddresses()
    return () => controller.abort()
  }, [user?.id, addressesRetry])

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(user?.avatar || ''); return }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile, user?.avatar])

  useEffect(() => {
    if (!profileSaved || !profileStatus) return
    const timer = setTimeout(() => showProfileNotice(), 4000)
    return () => clearTimeout(timer)
  }, [profileSaved, profileStatus])

  if (authLoading) return <p role="status" className="p-6 text-center">Đang khôi phục phiên đăng nhập…</p>

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: { pathname: '/profile' }, message: authError }} replace />
  }

  const cancelProfileEdit = () => {
    setAvatarFile(null)
    setProfileForm(profileValues(user))
    setAvatarPreview(user.avatar || '')
    setProfileErrors({})
    showProfileNotice()
    setProfileEditing(false)
  }

  const handleMenuClick = (item) => {
    if (profileSaving) return
    if (item.to) navigate(item.to)
    else cancelProfileEdit()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleAvatarChange = (event) => {
    if (!profileEditing || profileSaving) return
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setProfileErrors(current => ({ ...current, avatar: 'Chọn ảnh JPG, PNG hoặc WebP, tối đa 5 MB.' }))
      event.target.value = ''
      return
    }
    setAvatarFile(file)
    setProfileErrors(current => ({ ...current, avatar: '' }))
    showProfileNotice()
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    if (!profileEditing || profileSaving) return
    showProfileNotice()
    const errors = {}
    if (profileErrors.avatar) errors.avatar = profileErrors.avatar
    if (!profileForm.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên.'
    if (profileForm.phoneNumber.trim() && !isValidPhone(profileForm.phoneNumber)) errors.phoneNumber = 'Số điện thoại không hợp lệ.'
    if (profileForm.dateOfBirth) {
      const [year, month, day] = profileForm.dateOfBirth.split('-')
      if (!buildDateOfBirth(day, month, year)) errors.dateOfBirth = 'Ngày sinh không hợp lệ.'
    }
    if (Object.keys(errors).length) {
      setProfileErrors(errors)
      return
    }
    setProfileSaving(true)
    try {
      const result = await updateProfile({ fullName: profileForm.fullName, phoneNumber: profileForm.phoneNumber.trim(), dateOfBirth: profileForm.dateOfBirth, gender: profileForm.gender }, avatarFile)
      if (!result.success) { showProfileNotice(result.message); return }
      setProfileErrors({})
      setAvatarFile(null)
      setProfileEditing(false)
      showProfileNotice(result.message || 'Đã lưu thay đổi thông tin.', true)
    } catch (error) { showProfileNotice(error.message || 'Không thể lưu thông tin. Vui lòng thử lại.') }
    finally { setProfileSaving(false) }
  }

  const openAddress = (address) => {
    if (addressBusy || addressesLoading || addressesError) return
    setAddressForm(address ? { ...address } : { ...emptyAddress(user), isDefault: addresses.length === 0 })
    if (!address) setAddressError('')
    setPendingDeleteAddressId(null)
    setIsAddressFormOpen(true)
  }

  const handleProfileChange = (event) => {
    setProfileForm(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleAddressChange = (event) => {
    const { name, type, checked, value } = event.target
    setAddressForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAddressSubmit = async (event) => {
    event.preventDefault()
    if (addressBusy || addressesLoading) return
    const required = ['receiverName', 'phone', 'province', 'ward', 'detailAddress']
    if (required.some(field => !addressForm[field]?.trim())) {
      setAddressError('Vui lòng điền đầy đủ thông tin địa chỉ.')
      return
    }
    if (!isValidPhone(addressForm.phone)) {
      setAddressError('Số điện thoại người nhận không hợp lệ.')
      return
    }
    setAddressBusy(true)
    setAddressError('')
    try {
      const payload = toAddressPayload({ ...addressForm, isDefault: addresses.length === 0 || addressForm.isDefault })
      const { data } = addressForm.id
        ? await api.patch('/users/updateAddresses/' + encodeURIComponent(addressForm.id), payload)
        : await api.post('/users/addAddresses', payload)
      setAddresses(data.user.addresses.map(mapAddress))
      setIsAddressFormOpen(false)
      setPendingDeleteAddressId(null)
      setAddressesError('')
    } catch (error) {
      setAddressError(error.message)
    } finally {
      setAddressBusy(false)
    }
  }

  const confirmDeleteAddress = async (id) => {
    if (addressBusy || addressesLoading) return
    setAddressBusy(true)
    setAddressesError('')
    let deleted = false
    try {
      const { data } = await api.delete('/users/deleteAddresses/' + encodeURIComponent(id))
      const next = data.user.addresses.map(mapAddress)
      setAddresses(next)
      setPendingDeleteAddressId(null)
      deleted = true
      // Preserve the current UI rule: promote one remaining address after deleting the default.
      if (next.length && !next.some(address => address.isDefault)) {
        const result = await api.patch('/users/updateAddresses/' + encodeURIComponent(next[0].id), { isDefault: true })
        setAddresses(result.data.user.addresses.map(mapAddress))
      }
    } catch (error) {
      setAddressesError(deleted ? 'Đã xóa địa chỉ nhưng chưa đặt được địa chỉ mặc định. ' + error.message : error.message)
    } finally {
      setAddressBusy(false)
    }
  }

  const setDefaultAddress = async (id) => {
    if (addressBusy || addressesLoading) return
    setAddressBusy(true)
    setAddressesError('')
    try {
      const { data } = await api.patch('/users/updateAddresses/' + encodeURIComponent(id), { isDefault: true })
      setAddresses(data.user.addresses.map(mapAddress))
    } catch (error) {
      setAddressesError(error.message)
    } finally {
      setAddressBusy(false)
    }
  }

  const defaultAddress = addresses.find(item => item.isDefault)
  const defaultAddressLabel = defaultAddress
    ? [defaultAddress.detailAddress, defaultAddress.ward, defaultAddress.district, defaultAddress.province].filter(Boolean).join(', ')
    : '—'

  const accountOverview = (
    <div className="space-y-4">
      <h1 className="sr-only">Thông tin tài khoản</h1>
      <Panel title="Thông tin cá nhân" action={<button type="button" onClick={() => { setProfileEditing(true); showProfileNotice() }} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-primary hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiEdit2 aria-hidden="true" />Cập nhật</button>}>
        <dl className="grid gap-x-8 sm:grid-cols-2">
          {[
            ['Họ và tên', user.fullName],
            ['Số điện thoại', user.phone || '—'],
            ['Giới tính', ({ male: 'Nam', female: 'Nữ', other: 'Khác' })[user.gender] || '—'],
            ['Email', user.email || '—'],
            ['Ngày sinh', user.dateOfBirth ? user.dateOfBirth.slice(0, 10).split('-').reverse().join('/') : '—'],
            ['Địa chỉ mặc định', defaultAddressLabel],
          ].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 border-b border-slate-100 py-4 last:border-0 sm:[&:nth-last-child(2)]:border-0">
            <dt className="shrink-0 text-sm text-slate-500">{label}:</dt>
            <dd className="min-w-0 break-words text-right text-sm font-medium text-secondary [overflow-wrap:anywhere]">{value}</dd>
          </div>)}
        </dl>
        {!user.emailVerified && <Link to="/verify-email" state={{ email: user.email }} className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:underline">Xác thực địa chỉ email</Link>}
      </Panel>

      <ProfileAddressBook
        addresses={addresses}
        loading={addressesLoading}
        busy={addressBusy}
        error={addressesError}
        onRetry={() => setAddressesRetry(value => value + 1)}
        pendingDeleteAddressId={pendingDeleteAddressId}
        onOpenAddress={openAddress}
        onDelete={setPendingDeleteAddressId}
        onCancelDelete={() => setPendingDeleteAddressId(null)}
        onConfirmDelete={confirmDeleteAddress}
        onSetDefault={setDefaultAddress}
      />

      <Panel title="Mật khẩu" action={<button type="button" onClick={() => setPasswordOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-primary hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiEdit2 aria-hidden="true" />Thay đổi mật khẩu</button>}>
        <p className="text-sm leading-6 text-slate-500">Sử dụng mật khẩu riêng cho tài khoản để bảo vệ thông tin của bạn.</p>
      </Panel>
    </div>
  )

  const profileDrawer = profileEditing && (
    <SideDrawer title="Cập nhật thông tin cá nhân" onClose={cancelProfileEdit} busy={profileSaving}>
      <form onSubmit={handleProfileSubmit} noValidate aria-busy={profileSaving} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <Avatar user={{ ...user, fullName: profileForm.fullName }} preview={avatarPreview} />
            <div><p className="text-sm font-semibold">Ảnh đại diện</p><label className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg text-sm font-medium text-primary hover:underline"><FiCamera aria-hidden="true" />Thay đổi ảnh<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} disabled={profileSaving} className="sr-only" /></label></div>
          </div>
          {profileErrors.avatar && <p role="alert" className="text-xs text-red-600">{profileErrors.avatar}</p>}
          <Field id="full-name" disabled={profileSaving} name="fullName" autoComplete="name" label="Họ và tên" value={profileForm.fullName} onChange={handleProfileChange} error={profileErrors.fullName} />
          <div>
            <label htmlFor="profile-gender" className="mb-1.5 block text-sm font-medium text-slate-700">Giới tính</label>
            <select name="gender" id="profile-gender" value={profileForm.gender} disabled={profileSaving} onChange={handleProfileChange} className={inputClass()}>
              <option value="">Chưa cung cấp</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option>
            </select>
          </div>
          <Field id="birthday" disabled={profileSaving} name="dateOfBirth" type="date" label="Ngày sinh" value={profileForm.dateOfBirth} onChange={handleProfileChange} error={profileErrors.dateOfBirth} />
          <Field id="phone" name="phoneNumber" type="tel" autoComplete="tel" label="Số điện thoại" value={profileForm.phoneNumber} disabled={profileSaving} onChange={handleProfileChange} error={profileErrors.phoneNumber} />
          <Field id="email" type="email" label="Email" value={user.email || ''} disabled />
          {profileStatus && <p role={profileSaved ? 'status' : 'alert'} className={`text-sm leading-6 ${profileSaved ? 'text-emerald-600' : 'text-red-600'}`}>{profileStatus}</p>}
        </div>
        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-100 bg-white p-5 sm:p-6">
          <button type="button" onClick={cancelProfileEdit} disabled={profileSaving} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy</button>
          <button type="submit" disabled={profileSaving} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{profileSaving ? 'Đang lưu…' : 'Cập nhật thông tin'}</button>
        </footer>
      </form>
    </SideDrawer>
  )

  const addressDrawer = isAddressFormOpen && (
    <SideDrawer title={addressForm.id ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'} busy={addressBusy} onClose={() => { if (addressBusy) return; setIsAddressFormOpen(false); setAddressError('') }}>
      <form onSubmit={handleAddressSubmit} aria-busy={addressBusy} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <h3 className="text-sm font-semibold">Thông tin người nhận</h3>
          <Field disabled={addressBusy} name="receiverName" id="address-receiverName" label="Họ tên người nhận" autoComplete="shipping name" value={addressForm.receiverName} onChange={handleAddressChange} />
          <Field disabled={addressBusy} name="phone" id="address-phone" type="tel" label="Số điện thoại" autoComplete="shipping tel" value={addressForm.phone} onChange={handleAddressChange} />
          <h3 className="border-t border-slate-100 pt-5 text-sm font-semibold">Địa chỉ nhận hàng</h3>
          {[
            ['province', 'Tỉnh/Thành phố', 'shipping address-level1'],
            ['district', 'Quận/Huyện (nếu có)', 'shipping address-level2'],
            ['ward', 'Phường/Xã', 'shipping address-level3'],
            ['detailAddress', 'Số nhà, tên đường', 'shipping address-line1'],
          ].map(([name, label, autoComplete]) => <Field disabled={addressBusy} key={name} name={name} id={`address-${name}`} label={label} autoComplete={autoComplete} value={addressForm[name]} onChange={handleAddressChange} />)}
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-700">
            Đặt làm địa chỉ mặc định
            <input disabled={addressBusy} name="isDefault" type="checkbox" role="switch" checked={addressForm.isDefault} onChange={handleAddressChange} className="h-5 w-5 accent-primary" />
          </label>
          {addressError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm leading-6 text-red-600">{addressError}</p>}
        </div>
        <footer className="shrink-0 border-t border-slate-100 bg-white p-5 sm:p-6">
          <button type="submit" disabled={addressBusy} className="min-h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{addressBusy ? 'Đang lưu…' : addressForm.id ? 'Lưu thay đổi' : 'Thêm địa chỉ'}</button>
        </footer>
      </form>
    </SideDrawer>
  )

  return (
    <section className="min-h-[75vh] bg-slate-50 py-6 sm:py-10">
      {profileSaved && profileStatus && <div role="status" aria-live="polite" className="fixed inset-x-4 top-5 z-[60] mx-auto flex w-auto max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/10 sm:left-auto sm:right-6 sm:mx-0 sm:w-full">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-600"><FiCheckCircle aria-hidden="true" /></span>
        <p className="min-w-0 flex-1 py-1 text-sm font-medium leading-6 text-slate-700">{profileStatus}</p>
        <button type="button" onClick={() => { showProfileNotice() }} aria-label="Đóng thông báo" className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiX aria-hidden="true" /></button>
      </div>}
      {profileDrawer}
      {addressDrawer}
      {passwordOpen && <PasswordChangeDrawer onClose={() => setPasswordOpen(false)} onSuccess={message => { setPasswordOpen(false); showProfileNotice(message, true) }} />}
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-28">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-br from-white to-rose-50/50 px-5 py-6">
              <Avatar user={user} preview={avatarPreview} />
              <div className="min-w-0">
                <p className="break-words text-sm font-bold leading-6 text-secondary">{user.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">Tài khoản cá nhân</p>
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3 lg:grid-cols-1 lg:p-3" aria-label="Menu tài khoản">
              {menuItems.map(item => <button key={item.id} type="button" onClick={() => handleMenuClick(item)} aria-current={!item.to ? 'page' : undefined}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!item.to ? 'bg-rose-50 font-semibold text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-secondary'}`}>
                <item.icon className="shrink-0 text-lg" aria-hidden="true" /><span>{item.label}</span>
              </button>)}
              <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:mt-3 lg:border-t lg:border-slate-100 lg:pt-4"><FiLogOut className="text-lg" aria-hidden="true" />Đăng xuất</button>
            </nav>
          </aside>
          <div className="min-w-0">{accountOverview}</div>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
