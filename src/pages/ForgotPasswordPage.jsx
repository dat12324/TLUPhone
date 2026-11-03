import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import AuthLayout from '../components/auth/AuthLayout'
import PasswordInput from '../components/auth/PasswordInput'
import { isValidEmail } from '../helpers/auth'
import api from '../lib/api.js'
import { useAuth } from '../context/AuthContext'

const fieldClass = 'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50'
const buttonClass = 'w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60'

const ForgotPasswordPage = () => {
  const { logout } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm: '' })
  const [resetToken, setResetToken] = useState('')
  const [resendDeadline, setResendDeadline] = useState(0)
  const [now, setNow] = useState(Date.now)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const email = form.email.trim().toLowerCase()
  const cooldown = Math.max(0, Math.ceil((resendDeadline - now) / 1000))

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const update = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.name === 'otp' ? event.target.value.replace(/\D/g, '').slice(0, 5) : event.target.value }))
    setError(''); setErrorField('')
  }
  const sendCode = async () => {
    if (busy) return
    if (!isValidEmail(email)) { setErrorField('email'); setMessage(''); setError('Vui lòng nhập email hợp lệ.'); return }
    setBusy(true); setError(''); setErrorField(''); setMessage('')
    try {
      setSending(true)
      await api.post('/auth/forgotPassword', { email: email.trim() }, { skipAuth: true })
      setForm(current => ({ ...current, email, otp: '', password: '', confirm: '' }))
      setResetToken('')
      setMessage('Đã gửi mã. Vui lòng kiểm tra hộp thư.'); setStep(1)
      setNow(Date.now()); setResendDeadline(Date.now() + 60000)
    } catch (failure) { setErrorField(step === 0 && [400, 404].includes(failure.status) ? 'email' : ''); setError(failure.message) }
    finally { setBusy(false); setSending(false) }
  }
  const submit = async event => {
    event.preventDefault()
    if (busy) return
    if (step === 0) return sendCode()
    setMessage(''); setErrorField('')
    if (step === 1 && !/^\d{5}$/.test(form.otp)) { setErrorField('otp'); setError('Mã OTP phải gồm đúng 5 chữ số.'); return }
    if (step === 2) {
      if (form.password.length < 8 || !form.password.trim() || new TextEncoder().encode(form.password).length > 72) {
        setErrorField('password'); setError('Mật khẩu phải có ít nhất 8 ký tự và tối đa 72 byte UTF-8.'); return
      }
      if (form.password !== form.confirm) { setErrorField('confirm'); setError('Mật khẩu xác nhận không khớp.'); return }
    }
    setBusy(true); setError(''); setErrorField(''); setMessage('')
    try {
      if (step === 1) {
        const { data: result } = await api.post('/auth/verifyCode', { email: email.trim(), otpCode: form.otp }, { skipAuth: true })
        if (!result.resetToken || !Number.isFinite(result.expiresIn)) throw new Error('Phản hồi xác thực không hợp lệ.')
        setResetToken(result.resetToken)
        setNow(Date.now()); setForm(current => ({ ...current, otp: '' })); setMessage(''); setStep(2)
      } else {
        const { data: result } = await api.patch('/auth/resetPassword', { email: email.trim(), resetToken, newPassword: form.password }, { skipAuth: true })
        setResetToken(''); setForm(current => ({ ...current, password: '', confirm: '' }))
        await logout()
        setMessage(result.message); setStep(3)
      }
    } catch (failure) { setErrorField(step === 1 && failure.status === 400 ? 'otp' : ''); setError(failure.message) }
    finally { setBusy(false) }
  }

  return (
    <AuthLayout title={['Quên mật khẩu', 'Xác nhận mã OTP', 'Tạo mật khẩu mới', 'Đặt lại thành công'][step]}
      subtitle={['Nhập email đã đăng ký để nhận mã khôi phục.', 'Nhập mã OTP gồm 5 chữ số để tiếp tục.', 'Tạo mật khẩu mới cho tài khoản của bạn.', 'Bạn có thể đăng nhập bằng mật khẩu mới.'][step]}>
      <div className="mx-auto w-full max-w-md">
        {step < 3 ? <form onSubmit={submit} noValidate aria-busy={busy} className="space-y-5">
          {step === 0 ? <div>
            <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input id="recovery-email" name="email" type="email" autoComplete="email" value={form.email} onChange={update}
              disabled={busy} aria-invalid={errorField === 'email'} aria-describedby={errorField === 'email' ? 'recovery-email-error' : undefined}
              className={`${fieldClass} ${errorField === 'email' ? 'border-red-400' : 'border-slate-300'}`} placeholder="ban@example.com" />
            {errorField === 'email' && <p id="recovery-email-error" role="alert" className="mt-2 text-xs leading-5 text-red-600">{error}</p>}
          </div> : step === 1 ? <div className="pb-2 text-center">
            <p className="text-xs text-slate-500">Email nhận mã xác thực</p>
            <p className="mt-1 break-all text-sm font-semibold text-secondary">{email}</p>
            {message && !error && <p role="status" className="mt-2 flex items-start justify-center gap-1.5 text-xs leading-5 text-emerald-700"><FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" />{message}</p>}
          </div> : null}

          {step === 1 && <div className="text-center">
            <label htmlFor="recovery-otp" className="sr-only">Mã OTP gồm 5 chữ số</label>
            <div className={`group relative mx-auto w-fit rounded-xl ${busy ? 'opacity-60' : ''}`}>
              <input id="recovery-otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={5}
                value={form.otp} onChange={update} disabled={busy} aria-invalid={errorField === 'otp'}
                aria-describedby={errorField === 'otp' ? 'recovery-otp-error recovery-otp-hint' : 'recovery-otp-hint'}
                className="absolute inset-0 z-10 h-full w-full cursor-text rounded-xl border-0 bg-transparent opacity-0" />
              <div aria-hidden="true" className="flex justify-center gap-2.5 sm:gap-3">
                {Array.from({ length: 5 }, (_, index) => <span key={index}
                  className={`flex h-14 w-12 items-center justify-center rounded-xl border bg-white text-xl font-semibold transition-colors sm:h-16 sm:w-14 ${errorField === 'otp' ? 'border-red-400 bg-red-50/40' : 'border-slate-300'} ${index === Math.min(form.otp.length, 4) ? 'group-focus-within:border-primary group-focus-within:ring-2 group-focus-within:ring-primary/15' : ''}`}>
                  {form.otp[index] || <span className="font-normal text-slate-300">–</span>}
                </span>)}
              </div>
            </div>
            {errorField === 'otp' && <p id="recovery-otp-error" role="alert" className="mt-3 text-xs leading-5 text-red-600">{error}</p>}
            <p id="recovery-otp-hint" className="mt-4 text-xs leading-5 text-slate-500">Mã có hiệu lực 5 phút. Kiểm tra hộp thư đến hoặc thư rác.</p>
          </div>}

          {step === 2 && <>
            <div>
              <PasswordInput id="reset-password" name="password" label="Mật khẩu mới" autoComplete="new-password" placeholder="Nhập mật khẩu mới" aria-describedby="reset-password-hint" value={form.password} onChange={update} disabled={busy} error={errorField === 'password' ? error : ''} />
              <p id="reset-password-hint" className="mt-2 text-xs leading-5 text-slate-500">Mật khẩu có ít nhất 8 ký tự.</p>
            </div>
            <PasswordInput id="reset-confirm" name="confirm" label="Nhập lại mật khẩu mới" placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" value={form.confirm} onChange={update} disabled={busy} error={errorField === 'confirm' ? error : ''} />
          </>}

          {error && !errorField && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-700">{error}</p>}
          <div className="grid grid-cols-2 gap-3 pt-3 sm:gap-4">
            <Link to="/login" aria-disabled={busy} onClick={event => { if (busy) event.preventDefault() }} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiArrowLeft aria-hidden="true" />Quay lại</Link>
            <button type="submit" disabled={busy || (step === 0 && cooldown > 0)} className={buttonClass}>
              {busy ? (sending ? 'Đang gửi mã OTP…' : step === 1 ? 'Đang xác thực…' : 'Đang lưu mật khẩu…') : ['Gửi mã OTP', 'Xác nhận', 'Xác nhận'][step]}
            </button>
          </div>
          {step === 1 && <div className="text-center">
            <span className="text-xs text-slate-500">Chưa nhận được mã? </span>
            <button type="button" onClick={sendCode} disabled={busy || cooldown > 0} className="min-h-11 rounded px-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline">
              {sending ? 'Đang gửi…' : cooldown ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã'}
            </button>
          </div>}
          {step === 0 && cooldown > 0 && <p className="text-center text-xs text-slate-500">Vui lòng đợi {cooldown} giây trước khi gửi lại.</p>}
        </form> : <div className="text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600"><FiCheckCircle aria-hidden="true" /></span>
          <p role="status" className="mb-6 text-sm leading-6 text-slate-600">{message}</p>
          <Link to="/login" className={`${buttonClass} inline-block`}>Đăng nhập</Link>
        </div>}
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
