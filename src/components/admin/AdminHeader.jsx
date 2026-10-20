import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiMenu, FiSidebar, FiSmartphone, FiUser } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { findAdminPage } from '../../config/adminNavigation'

const getInitials = (fullName = '') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AD'

const AdminHeader = ({ admin, collapsed, onToggleSidebar, onOpenMobile }) => {
  const { pathname } = useLocation()
  const currentPage = findAdminPage(pathname)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          aria-label="Mở menu quản trị"
        >
          <FiMenu className="text-xl" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:flex"
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          aria-pressed={collapsed}
        >
          <FiSidebar className="text-xl" aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-sm">
            <li className="hidden text-slate-400 sm:block">Quản trị</li>
            <li className="hidden text-slate-300 sm:block" aria-hidden="true">/</li>
            <li className="truncate font-semibold text-secondary" aria-current="page">
              {currentPage.label}
            </li>
          </ol>
        </nav>
      </div>

      <div className="relative" ref={accountRef}>
        <button
          type="button"
          onClick={() => setAccountOpen((current) => !current)}
          className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-3"
          aria-expanded={accountOpen}
          aria-haspopup="menu"
        >
          {admin.avatarUrl ? (
            <img
              src={admin.avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
              {getInitials(admin.fullName)}
            </span>
          )}
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold leading-tight text-secondary">{admin.fullName}</span>
            <span className="block text-xs text-slate-500">{admin.roleLabel}</span>
          </span>
          <FiChevronDown className={`hidden text-sm text-slate-400 transition-transform sm:block ${accountOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {accountOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg" role="menu">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5" role="presentation">
              <FiUser className="text-lg text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-secondary">Thông tin tài khoản</p>
                <p className="text-xs text-slate-500">Tài khoản quản trị mẫu</p>
              </div>
            </div>
            <Link
              to="/"
              onClick={() => setAccountOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              role="menuitem"
            >
              <FiSmartphone className="text-lg" aria-hidden="true" />
              Về trang bán hàng
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminHeader
