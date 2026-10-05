import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiPhone } from 'react-icons/fi'
import AuthLayout from '../components/auth/AuthLayout'
import { isValidPhone, normalizePhone } from '../helpers/auth'

const ForgotPasswordPage = () => {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submittedPhone, setSubmittedPhone] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmittedPhone('')

    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }
    if (!isValidPhone(phone)) {
      setError('Số điện thoại chưa đúng định dạng.')
      return
    }

    setError('')
    setSubmittedPhone(normalizePhone(phone))
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập số điện thoại của tài khoản để bắt đầu khôi phục mật khẩu."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="forgot-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Số điện thoại
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="forgot-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value)
                setError('')
                setSubmittedPhone('')
              }}
              placeholder="09xxxxxxxx"
              className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/15 ${
                error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'
              }`}
            />
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
        >
          Tiếp tục
        </button>
      </form>

      {submittedPhone && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />
            <p>
              Đã ghi nhận yêu cầu cho <strong>{submittedPhone}</strong>. Đây là trạng thái mock;
              bước gửi và xác minh OTP sẽ được Backend triển khai sau.
            </p>
          </div>
        </div>
      )}

      <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline">
        <FiArrowLeft />
        Quay lại đăng nhập
      </Link>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
