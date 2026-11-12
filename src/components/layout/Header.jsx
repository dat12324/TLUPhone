import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiPhone,
  FiSearch,
  FiShoppingCart,
  FiSmartphone,
  FiTruck,
  FiUser,
} from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../common/BrandLogo'
import NotificationBell from './NotificationBell'

const SearchBar = ({ mobile = false }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search') || ''
  const [keyword, setKeyword] = useState(currentSearch)

  useEffect(() => {
    setKeyword(currentSearch)
  }, [currentSearch])

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = keyword.trim()
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`)
      setTimeout(() => {
        const resultsEl = document.getElementById('search-results')
        if (resultsEl) {
          const headerOffset = 85
          const elementPosition = resultsEl.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset
          window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' })
        }
      }, 100)
    } else {
      navigate('/products')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={mobile ? 'relative mt-2.5 md:hidden' : 'relative hidden min-w-0 flex-1 md:block'}
      role="search"
    >
      <input
        type="text"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Tìm kiếm điện thoại..."
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm text-secondary outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
        aria-label="Tìm kiếm điện thoại"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary"
        aria-label="Tìm kiếm"
      >
        <FiSearch className="text-lg" />
      </button>
    </form>
  )
}

const Header = () => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const navigate = useNavigate()
  const { totalCartCount } = useCart()
  const { user, isAuthenticated, logout, authLoading } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setIsAccountMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setIsAccountMenuOpen(false)
    navigate('/')
  }

  const [failedAvatar, setFailedAvatar] = useState(null)
  const avatarText = user?.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'KH'

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Topbar */}
      <div className="bg-secondary py-1.5 text-xs text-slate-200 sm:text-sm">
        <div className="container mx-auto flex items-center justify-between px-4">
          <span className="flex items-center gap-1.5 font-medium">
            <FiPhone className="text-xs" />
            Hotline: 1900 1234
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <FiTruck className="text-sm" />
            Miễn phí vận chuyển đơn từ 500K
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex min-h-10 items-center gap-2.5 sm:gap-4">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex shrink-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-80"
            aria-label="TLUPhone - Trang chủ"
          >
            <BrandLogo size="sm" responsive />
          </Link>

          <SearchBar />

          <Link
            to="/products"
            onClick={handleNavClick}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-secondary transition hover:text-primary sm:px-2.5"
            aria-label="Sản phẩm"
          >
            <FiSmartphone className="text-lg" />
            <span className="hidden sm:inline">Sản phẩm</span>
          </Link>

          <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />

          <Link
            to="/cart"
            onClick={handleNavClick}
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-secondary transition hover:text-primary sm:px-2.5"
            aria-label="Giỏ hàng"
          >
            <div className="relative flex items-center">
              <FiShoppingCart className="text-xl" />
              {totalCartCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-xs">
                  {totalCartCount > 99 ? '99+' : totalCartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Giỏ hàng</span>
          </Link>

          <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden="true" />

          {!authLoading && isAuthenticated && <NotificationBell key={user?._id || user?.id} />}

          <div className="relative shrink-0" ref={accountMenuRef}>
            {authLoading ? <div role="status" className="flex h-11 w-28 items-center gap-2 rounded-lg px-2"><span className="h-8 w-8 animate-pulse rounded-full bg-slate-100" aria-hidden="true" /><span className="h-3 w-16 animate-pulse rounded bg-slate-100" aria-hidden="true" /><span className="sr-only">Đang khôi phục phiên đăng nhập…</span></div> : isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                  className="flex items-center gap-1.5 rounded-lg p-1.5 text-secondary transition hover:bg-slate-50 hover:text-primary"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                >
                  {user.avatar && user.avatar !== failedAvatar ? (
                    <img src={user.avatar} alt={`Ảnh đại diện của ${user.fullName}`} referrerPolicy="no-referrer" onError={() => setFailedAvatar(user.avatar)} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{avatarText}</span>
                  )}
                  <span className="max-w-20 truncate text-xs font-medium sm:max-w-28 sm:text-sm">
                    {user.fullName}
                  </span>
                  <FiChevronDown className={`hidden text-sm transition-transform sm:block ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl" role="menu">
                    <div className="border-b border-slate-100 px-4 py-2.5">
                      <p className="truncate text-sm font-semibold text-secondary">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{user.phone}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                      role="menuitem"
                    >
                      <FiUser />
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/orders"
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                      role="menuitem"
                    >
                      <FiPackage />
                      Đơn hàng của tôi
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                      role="menuitem"
                    >
                      <FiLogOut />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-secondary transition hover:text-primary sm:px-2.5"
              >
                <FiUser className="text-xl" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>

        <SearchBar mobile />
      </div>
    </header>
  )
}

export default Header
