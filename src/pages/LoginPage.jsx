import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import AuthLayout from '../components/auth/AuthLayout'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../helpers/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, googleLogin } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState(() => location.state?.message ? { form: location.state.message } : {})
  const [submitting, setSubmitting] = useState(false)
  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.'
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = 'Email chưa đúng định dạng.'
    }

    if (!form.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const loginPayload = {
      email: form.email.trim(),
      password: form.password,
    }
    setSubmitting(true)
    const result = await login(loginPayload, form.remember)
    setSubmitting(false)
    if (!result.success) {
      setErrors({ form: result.message })
      return
    }

    const requested = location.state?.from?.pathname
    const destination = result.user.role === 'admin' ? requested || '/admin' : requested?.startsWith('/admin') ? '/' : requested || '/'
    navigate(destination, { replace: true })
  }

  const handleGoogleCredential = async credential => {
    if (submitting) return
    setSubmitting(true)
    setErrors({})
    const result = await googleLogin(credential, form.remember)
    setSubmitting(false)
    if (!result.success) { setErrors({ form: result.message }); return }
    const requested = location.state?.from?.pathname
    const destination = result.user.role === 'admin' ? requested || '/admin' : requested?.startsWith('/admin') ? '/' : requested || '/'
    navigate(destination, { replace: true })
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Sử dụng email và mật khẩu để truy cập tài khoản của bạn."
    >
      <form id="login-form" autoComplete="on" onSubmit={handleSubmit} noValidate className="space-y-5">
        {location.state?.registered && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Đăng ký thành công. Vui lòng đăng nhập bằng email của bạn.</p>}
        {location.state?.successMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{location.state.successMessage}</p>}
        {errors.form && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.form}</p>}
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              placeholder="example@gmail.com"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/15 ${
                errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'
              }`}
            />

          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
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
          disabled={submitting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>Hoặc</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton onCredential={handleGoogleCredential} disabled={submitting} onError={message => setErrors({ form: message })} />

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
