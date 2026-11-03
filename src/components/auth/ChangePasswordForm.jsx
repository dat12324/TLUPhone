import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiCheckCircle, FiX } from 'react-icons/fi'
import { Navigate, useLocation } from 'react-router-dom'
import PasswordInput from './PasswordInput'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api.js'

const ChangePasswordForm = ({ drawer = false, onBusyChange, onSuccess }) => {
  const { user, authLoading } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { onBusyChange?.(busy) }, [busy, onBusyChange])

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(timer)
  }, [success])

  if (authLoading) return <p role="status" className="p-6 text-center">Đang khôi phục phiên đăng nhập…</p>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const update = event => { setForm(current => ({ ...current, [event.target.name]: event.target.value })); setError(''); setSuccess('') }
  const submit = async event => {
    event.preventDefault()
    if (busy) return
    if (!form.currentPassword) { setError('Vui lòng nhập mật khẩu hiện tại.'); return }
    if (form.newPassword.length < 8 || !form.newPassword.trim() || new TextEncoder().encode(form.newPassword).length > 72) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự và tối đa 72 byte UTF-8.'); return
    }
    if (form.newPassword !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return }
    setBusy(true); setError(''); setSuccess('')
    try {
      const { currentPassword, newPassword, confirmPassword } = form
      await api.patch('/auth/changePassword', { currentPassword, newPassword, confirmPassword })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Đổi mật khẩu thành công.')
      onSuccess?.('Đổi mật khẩu thành công.')
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} noValidate aria-busy={busy} className={drawer ? 'flex min-h-0 flex-1 flex-col' : 'space-y-5'}>
      <div className={drawer ? 'min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6' : 'space-y-5'}>
        {success && !onSuccess && createPortal(
          <div role="status" aria-live="polite" className="fixed inset-x-4 top-5 z-[60] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-slate-900/10 sm:left-auto sm:right-6 sm:mx-0 sm:w-full">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-600"><FiCheckCircle aria-hidden="true" /></span>
            <p className="min-w-0 flex-1 py-1 text-sm font-medium leading-6 text-slate-700">{success}</p>
            <button type="button" onClick={() => setSuccess('')} aria-label="Đóng thông báo" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiX aria-hidden="true" /></button>
          </div>, document.body,
        )}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <PasswordInput id="change-current" name="currentPassword" label="Mật khẩu cũ" autoComplete="current-password" placeholder="Nhập mật khẩu hiện tại" value={form.currentPassword} onChange={update} disabled={busy} />
        <div>
          <PasswordInput id="change-new" name="newPassword" label="Mật khẩu mới" autoComplete="new-password" placeholder="Nhập mật khẩu mới" aria-describedby="change-password-hint" value={form.newPassword} onChange={update} disabled={busy} />
          <p id="change-password-hint" className="mt-2 text-xs leading-5 text-slate-500">Mật khẩu có ít nhất 8 ký tự, tối đa 72 byte UTF-8.</p>
        </div>
        <PasswordInput id="change-confirm" name="confirmPassword" label="Nhập lại mật khẩu mới" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={form.confirmPassword} onChange={update} disabled={busy} />
      </div>
      <div className={drawer ? 'shrink-0 border-t border-slate-100 bg-white p-5 sm:p-6' : ''}>
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{busy ? 'Đang cập nhật…' : 'Đổi mật khẩu'}</button>
      </div>
    </form>
  )
}

export default ChangePasswordForm
