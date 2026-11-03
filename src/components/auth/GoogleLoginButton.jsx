import { useEffect, useRef, useState } from 'react'

let googleScriptPromise
const loadGoogleIdentity = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.onload = () => {
        if (window.google?.accounts?.id) resolve(window.google.accounts.id)
        else reject(new Error('Không thể tải đăng nhập Google. Vui lòng tải lại trang.'))
      }
      script.onerror = () => { script.remove(); reject(new Error('Không thể kết nối Google. Vui lòng tải lại trang.')) }
      document.head.appendChild(script)
    }).catch(error => { googleScriptPromise = null; throw error })
  }
  return googleScriptPromise
}

const GoogleLoginButton = ({ onCredential, onError, disabled = false }) => {
  const container = useRef(null)
  const callbacks = useRef({ onCredential, onError, disabled })
  callbacks.current = { onCredential, onError, disabled }
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState('')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    let active = true
    if (!clientId) {
      setLoadError('Đăng nhập Google chưa được cấu hình.')
      return
    }
    loadGoogleIdentity().then(google => {
      if (!active) return
      google.initialize({
        client_id: clientId,
        auto_select: false,
        callback: response => {
          if (!active || callbacks.current.disabled) return
          if (!response.credential) { callbacks.current.onError?.('Chưa nhận được thông tin đăng nhập Google.'); return }
          callbacks.current.onCredential(response.credential)
        },
      })
      google.renderButton(container.current, {
        theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', locale: 'vi',
        width: Math.min(400, container.current.clientWidth || 400),
      })
      setReady(true)
    }).catch(error => { if (active) setLoadError(error.message) })
    return () => { active = false }
  }, [clientId])

  return <div aria-label="Đăng nhập bằng Google" aria-disabled={disabled} aria-busy={!ready && !loadError} inert={disabled || undefined} className={disabled ? 'pointer-events-none opacity-60' : ''}>
    <div ref={container} className="mx-auto w-full max-w-[400px]" />
    {!ready && <p role={loadError ? 'alert' : 'status'} className="py-2 text-center text-sm text-slate-500">{loadError || (clientId ? 'Đang tải đăng nhập Google…' : 'Đăng nhập Google chưa được cấu hình.')}</p>}
  </div>
}

export default GoogleLoginButton
