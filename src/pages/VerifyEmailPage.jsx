import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import AuthLayout from '../components/auth/AuthLayout'
import { isValidEmail } from '../helpers/auth'
import api, { getAccessToken } from '../lib/api.js'
import { useAuth } from '../context/AuthContext'

const VerifyEmailPage = () => {
  const location = useLocation()
  const { user, refreshUser } = useAuth()
  const link = useMemo(() => {
    const params = new URLSearchParams(location.hash.slice(1) || location.search)
    return { token: params.get('token') || '', email: params.get('email') || location.state?.email || '' }
  }, [location.hash, location.search, location.state?.email])
  const [email, setEmail] = useState(link.email || user?.email || '')
  const [status, setStatus] = useState(link.token ? 'checking' : 'idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(Date.now)
  const request = useRef(null)
  const cooldown = Math.max(0, Math.ceil((deadline - now) / 1000))

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => { if (user?.email) setEmail(current => current || user.email) }, [user?.email])

  useEffect(() => {
    if (!link.token) return
    let active = true
    window.history.replaceState(window.history.state, '', location.pathname)
    setEmail(link.email); setStatus('checking'); setError(''); setMessage('')
    if (!link.email) {
      setStatus('error'); setError('Liên kết thiếu email. Vui lòng yêu cầu liên kết mới.')
      return
    }
    const key = `${link.email}:${link.token}`
    // Giữ một Promise cho mỗi link, tránh dùng token hai lần trong React StrictMode.
    if (request.current?.key !== key) {
      request.current = { key, promise: api.get('/auth/verifyMail', { params: { token: link.token, email: link.email.trim() }, skipAuth: true }).then(async ({ data: result }) => {
        if (getAccessToken()) await refreshUser().catch(() => {})
        return result
      }) }
    }
    request.current.promise.then(result => {
      if (active) { setStatus('success'); setMessage(result.message) }
    }).catch(failure => {
      if (active) { setStatus('error'); setError(failure.message) }
    })
    return () => { active = false }
  }, [link, location.pathname, refreshUser])

  const send = async event => {
    event.preventDefault()
    if (busy || cooldown) return
    if (!isValidEmail(email)) { setError('Vui lòng nhập email hợp lệ.'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const { data: result } = await api.post('/auth/verifyAccount', { email: email.trim() }, { skipAuth: true })
      setMessage(result.message); setNow(Date.now()); setDeadline(Date.now() + 60000)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <AuthLayout title="Xác thực email" subtitle="Xác nhận email để hoàn thiện thông tin tài khoản TLUPhone.">
    {status === 'checking' ? <p role="status" className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">Đang xác thực liên kết…</p> : <>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {status === 'success' ? <div className="text-center">
        <FiCheckCircle className="mx-auto mb-4 text-4xl text-emerald-500" />
        <Link to={user ? '/profile' : '/login'} className="inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">{user ? 'Về tài khoản' : 'Đăng nhập'}</Link>
      </div> : <form onSubmit={send} noValidate className="space-y-5">
        <div>
          <label htmlFor="verification-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email đã đăng ký</label>
          <input id="verification-email" name="email" type="email" autoComplete="email" value={email}
            onChange={event => { setEmail(event.target.value); setError(''); setMessage('') }} disabled={busy}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </div>
        <button type="submit" disabled={busy || cooldown > 0}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? 'Đang gửi…' : cooldown ? `Gửi lại sau ${cooldown} giây` : 'Gửi liên kết xác thực'}
        </button>
        <p className="text-xs leading-5 text-slate-500">Kiểm tra hộp thư và thư rác. Liên kết có hiệu lực 15 phút và dùng một lần. Gửi lại cách nhau ít nhất 60 giây.</p>
      </form>}
    </>}
    {status !== 'checking' && status !== 'success' && <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-primary">Quay lại đăng nhập</Link>}
  </AuthLayout>
}

export default VerifyEmailPage
