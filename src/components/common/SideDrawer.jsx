import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

const SideDrawer = ({ title, onClose, busy = false, children }) => {
  const dialogRef = useRef(null)
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current.showModal()
    return () => { document.body.style.overflow = overflow; previous?.focus?.() }
  }, [])

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
      onPointerDown={event => {
        if (event.button !== 0 || event.target !== dialogRef.current || busy) return
        const rect = dialogRef.current.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
      }}
      className="fixed inset-y-3 left-auto right-3 m-0 h-[calc(100dvh-24px)] max-h-none w-[calc(100%-24px)] max-w-xl overflow-hidden rounded-2xl border-0 bg-white p-0 text-secondary shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm open:flex open:flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 id={titleId} className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} disabled={busy} aria-label={`Đóng ${title.toLowerCase()}`} className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"><FiX className="text-xl" aria-hidden="true" /></button>
      </header>
      {children}
    </dialog>, document.body,
  )
}

export default SideDrawer
