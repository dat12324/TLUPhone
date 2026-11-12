import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiCheck, FiPackage, FiX } from 'react-icons/fi'
import api from '../../lib/api.js'

const NotificationBell = () => {
  const navigate = useNavigate()
  const button = useRef(null)
  const dialog = useRef(null)
  const action = useRef(false)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (open) return
    let controller
    const refreshCount = () => {
      if (document.visibilityState === 'hidden') return
      controller?.abort()
      controller = new AbortController()
      const request = controller
      api.get('/notifications/unread-count', { signal: request.signal })
        .then(({ data }) => { if (!request.signal.aborted) setUnread(data.data.unreadCount) })
        .catch(() => {}) // Lỗi được hiển thị khi mở popup, không chặn Header.
    }
    refreshCount()
    const timer = setInterval(refreshCount, 30000)
    window.addEventListener('focus', refreshCount)
    document.addEventListener('visibilitychange', refreshCount)
    return () => {
      controller?.abort()
      clearInterval(timer)
      window.removeEventListener('focus', refreshCount)
      document.removeEventListener('visibilitychange', refreshCount)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const position = () => {
      const rect = button.current.getBoundingClientRect()
      const node = dialog.current
      const top = Math.min(rect.bottom + 12, window.innerHeight - 120)
      const width = Math.min(400, window.innerWidth - 24)
      const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))
      Object.assign(node.style, { top: `${Math.max(12, top)}px`, left: `${left}px`, width: `${width}px`, maxHeight: `${window.innerHeight - Math.max(12, top) - 12}px` })
      node.style.setProperty('--arrow-left', `${Math.max(20, Math.min(rect.left + rect.width / 2 - left, width - 20))}px`)
    }
    position()
    dialog.current.showModal()
    window.addEventListener('resize', position)
    return () => {
      window.removeEventListener('resize', position)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    Promise.all([
      api.get('/notifications', { params: { page, limit: 20 }, signal: controller.signal }),
      api.get('/notifications/unread-count', { signal: controller.signal }),
    ]).then(([list, count]) => {
      if (controller.signal.aborted) return
      setItems(current => page === 1 ? list.data.data : [...current, ...list.data.data.filter(item => !current.some(old => old._id === item._id))])
      setTotalPages(list.data.pagination.totalPages)
      setUnread(count.data.data.unreadCount)
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure.message)
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, page, reload])

  const markAll = async () => {
    if (action.current) return
    action.current = true
    setBusy(true)
    setError('')
    try {
      await api.patch('/notifications/read-all')
      setItems(current => current.map(item => ({ ...item, isRead: true })))
      setUnread(0)
    } catch (failure) { setError(failure.message) }
    finally { action.current = false; setBusy(false) }
  }

  const viewNotification = async item => {
    if (action.current) return
    action.current = true
    setBusy(true)
    setError('')
    try {
      if (!item.isRead) {
        await api.patch(`/notifications/${item._id}/read`)
        setItems(current => current.map(row => row._id === item._id ? { ...row, isRead: true } : row))
        setUnread(current => Math.max(0, current - 1))
      }
      setOpen(false)
      navigate(item.order ? `/orders?orderId=${encodeURIComponent(item.order._id || item.order)}` : '/orders')
    } catch (failure) { setError(failure.message) }
    finally { action.current = false; setBusy(false) }
  }

  const visible = tab === 'order' ? items.filter(item => item.type === 'order') : items
  return <>
    <button ref={button} type="button" aria-label={unread ? `Thông báo: ${unread} chưa đọc` : 'Thông báo'} aria-haspopup="dialog" aria-expanded={open}
      onClick={() => { setPage(1); setTab('all'); setOpen(true) }}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-slate-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
      <FiBell className="text-xl" aria-hidden="true" />
      {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[10px] font-bold leading-none text-white">{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && createPortal(<dialog ref={dialog} aria-labelledby="notifications-title" onCancel={event => { event.preventDefault(); if (!busy) setOpen(false) }}
      onPointerDown={event => {
        if (busy || event.button !== 0 || event.target !== dialog.current) return
        const rect = dialog.current.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false)
      }}
      className="fixed m-0 overflow-visible rounded-2xl border border-slate-200 bg-white p-0 text-secondary shadow-lg backdrop:bg-slate-900/25 open:flex open:flex-col">
      <span aria-hidden="true" style={{ left: 'var(--arrow-left)' }} className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
      <header className="relative flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 id="notifications-title" className="text-lg font-bold">Thông báo</h2>
        <button type="button" disabled={busy || unread === 0 || loading} onClick={markAll} className="flex min-h-10 items-center gap-1 text-xs font-medium text-primary focus-visible:ring-2 focus-visible:ring-primary disabled:text-slate-400"><FiCheck aria-hidden="true" />Đánh dấu đã đọc tất cả</button>
      </header>
      <div className="flex shrink-0 gap-5 border-b border-slate-100 px-4" aria-label="Lọc thông báo">
        {[['all', 'Tất cả'], ['order', 'Đơn hàng']].map(([value, label]) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => setTab(value)} className={`min-h-11 border-b-2 px-1 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary ${tab === value ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}>{label}</button>)}
      </div>
      {error && <div role="alert" className="shrink-0 bg-red-50 px-4 py-3 text-sm text-red-600">{error}<button type="button" disabled={busy || loading} onClick={() => setReload(value => value + 1)} className="ml-2 underline">Thử lại</button></div>}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ maxHeight: 'min(420px, 55dvh)' }} aria-busy={loading || busy}>
        {loading && page === 1 ? <p role="status" className="p-8 text-center text-sm text-slate-500">Đang tải thông báo…</p> : <>
          {!error && visible.length === 0 && <div className="px-4 py-12 text-center text-sm text-slate-500"><FiBell aria-hidden="true" className="mx-auto mb-3 text-3xl text-slate-300" />Không có thông báo</div>}
          <ul>{visible.map(item => <li key={item._id}><button type="button" disabled={busy || loading} onClick={() => viewNotification(item)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-60 ${item.isRead ? 'bg-white' : 'bg-blue-50/70'}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-primary"><FiPackage aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2"><p className="break-words text-sm font-semibold">{item.title || 'Đơn hàng'}</p>{!item.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc" />}</div>
              <p className="mt-1 break-words text-sm leading-5 text-slate-600">{item.message}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <time dateTime={item.createdAt} className="text-xs text-slate-400">{item.createdAt && new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</time>
                <span className="inline-flex min-h-8 items-center text-xs font-medium text-primary">Xem chi tiết</span>
              </div>
            </div>
          </button></li>)}</ul>
          {page < totalPages && <button type="button" disabled={loading || busy} onClick={() => setPage(value => value + 1)} className="min-h-11 w-full text-sm text-primary disabled:text-slate-400">{loading ? 'Đang tải…' : 'Xem thêm thông báo'}</button>}
        </>}
      </div>
      <footer className="shrink-0 border-t border-slate-100 p-3"><button type="button" disabled={busy} onClick={() => setOpen(false)} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"><FiX aria-hidden="true" />Đóng</button></footer>
    </dialog>, document.body)}
  </>
}

export default NotificationBell
