import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiAlertCircle, FiPhone } from 'react-icons/fi'
import AuthLayout from '../components/auth/AuthLayout'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { isValidPhone, normalizePhone } from '../helpers/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ phone: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [googleMessage, setGoogleMessage] = useState('')

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!form.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.'
    } else if (!isValidPhone(form.phone)) {
      nextErrors.phone = 'Số điện thoại chưa đúng định dạng.'
    }

    if (!form.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const loginPayload = {
      phone: normalizePhone(form.phone),
      password: form.password,
    }
    const result = login(loginPayload, form.remember)
    if (!result.success) {
      setErrors({ phone: result.message })
      return
    }

    const destination = location.state?.from?.pathname || '/'
    navigate(destination, { replace: true })
  }

  const handleGoogleClick = () => {
    setGoogleMessage('Google Authentication hiện mới ở trạng thái giao diện và sẽ được tích hợp sau.')
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Sử dụng số điện thoại và mật khẩu để truy cập tài khoản của bạn."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Số điện thoại
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="login-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={updateField}
              placeholder="09xxxxxxxx"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/15 ${
                errors.phone ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'
              }`}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <PasswordInput
          id="login-password"
          name="password"
          label="Mật khẩu"
          value={form.password}
          onChange={updateField}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          error={errors.password}
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600">
            <input
              name="remember"
              type="checkbox"
              checked={form.remember}
              onChange={updateField}
              className="h-4 w-4 rounded border-slate-300 accent-primary"
            />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          Đăng nhập
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>Hoặc</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton onClick={handleGoogleClick} />
      {googleMessage && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          {googleMessage}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
