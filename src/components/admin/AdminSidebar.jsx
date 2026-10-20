import { useEffect, useRef } from 'react'
import { FiArrowLeft, FiX } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import { adminNavigation } from '../../config/adminNavigation'

const AdminSidebar = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!mobileOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseMobile()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Điều hướng quản trị"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className={`flex h-[72px] items-center border-b border-slate-200 px-4 ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <Link
            to="/admin/dashboard"
            onClick={onCloseMobile}
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="TLUPhone Admin"
          >
            <span className="lg:hidden"><BrandLogo size="sm" /></span>
            <span className="hidden lg:inline-flex"><BrandLogo size="sm" compact={collapsed} /></span>
            {!collapsed && (
              <span className="hidden min-w-0 lg:block">
                <span className="block truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Admin Panel
                </span>
              </span>
            )}
            <span className="min-w-0 lg:hidden">
              <span className="block truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Admin Panel
              </span>
            </span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCloseMobile}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            aria-label="Đóng menu"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Menu Admin">
          <div className="space-y-6">
            {adminNavigation.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <p className={`mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 ${collapsed ? 'lg:sr-only' : ''}`}>
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isActive
                            ? 'bg-rose-50 text-primary'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-secondary'
                        } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                      >
                        <Icon className="shrink-0 text-lg" aria-hidden="true" />
                        <span className={collapsed ? 'lg:sr-only' : ''}>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link
            to="/"
            onClick={onCloseMobile}
            title={collapsed ? 'Về trang bán hàng' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <FiArrowLeft className="shrink-0 text-lg" aria-hidden="true" />
            <span className={collapsed ? 'lg:sr-only' : ''}>Về trang bán hàng</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
