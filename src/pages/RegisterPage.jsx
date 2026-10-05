import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { buildDateOfBirth, isValidEmail, isValidPhone, normalizePhone } from '../helpers/auth'

const currentYear = new Date().getFullYear()
const days = Array.from({ length: 31 }, (_, index) => index + 1)
const months = Array.from({ length: 12 }, (_, index) => index + 1)
const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index)

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    day: '',
    month: '',
    year: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState({})

  const dateOfBirth = useMemo(
    () => buildDateOfBirth(form.day, form.month, form.year),
    [form.day, form.month, form.year]
  )

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({
      ...current,
      [name]: '',
      ...(name === 'day' || name === 'month' || name === 'year' ? { dateOfBirth: '' } : {}),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!form.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên.'

    if (!form.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.'
    } else if (!isValidPhone(form.phone)) {
      nextErrors.phone = 'Số điện thoại chưa đúng định dạng.'
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.'
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = 'Email chưa đúng định dạng.'
    }

    if (!dateOfBirth) {
      nextErrors.dateOfBirth = 'Vui lòng chọn ngày sinh hợp lệ và không ở tương lai.'
    }

    if (!form.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.'
    }

    if (!form.acceptedTerms) nextErrors.acceptedTerms = 'Bạn cần đồng ý với điều khoản sử dụng.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    register({
      fullName: form.fullName.trim(),
      phone: normalizePhone(form.phone),
      email: form.email.trim(),
      dateOfBirth,
      password: form.password,
    })
    navigate('/', { replace: true })
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/15 ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'
    }`

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Đăng ký bằng số điện thoại. Email chỉ được dùng làm thông tin liên hệ."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label>
          <input
            id="register-name"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={updateField}
            placeholder="Nguyễn Văn An"
            className={inputClass(errors.fullName)}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              id="register-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="09xxxxxxxx"
              className={inputClass(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              placeholder="ban@example.com"
              className={inputClass(errors.email)}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Ngày sinh</legend>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <select name="day" value={form.day} onChange={updateField} className={inputClass(errors.dateOfBirth)} aria-label="Ngày sinh">
              <option value="">Ngày</option>
              {days.map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
            <select name="month" value={form.month} onChange={updateField} className={inputClass(errors.dateOfBirth)} aria-label="Tháng sinh">
              <option value="">Tháng</option>
              {months.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
            <select name="year" value={form.year} onChange={updateField} className={inputClass(errors.dateOfBirth)} aria-label="Năm sinh">
              <option value="">Năm</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            id="register-password"
            name="password"
            label="Mật khẩu"
            value={form.password}
            onChange={updateField}
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            error={errors.password}
          />
          <PasswordInput
            id="register-confirm-password"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            value={form.confirmPassword}
            onChange={updateField}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            error={errors.confirmPassword}
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-600">
            <input
              name="acceptedTerms"
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={updateField}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
            />
            <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của TLUPhone.</span>
          </label>
          {errors.acceptedTerms && <p className="mt-1 text-xs text-red-600">{errors.acceptedTerms}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          Đăng ký
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage

