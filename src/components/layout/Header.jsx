import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiChevronDown,
  FiLogOut,
  FiPackage,
  FiPhone,
  FiSearch,
  FiShoppingCart,
  FiSmartphone,
  FiUser,
} from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const SearchBar = ({ mobile = false }) => (
  <div className={mobile ? 'relative md:hidden' : 'relative hidden min-w-0 flex-1 md:block'}>
    <input
      type="text"
      placeholder="Tìm kiếm điện thoại..."
      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-sm text-secondary outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
      aria-label="Tìm kiếm điện thoại"
    />
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary"
      aria-label="Tìm kiếm"
    >
      <FiSearch className="text-lg" />
    </button>
  </div>
)

const Header = () => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const navigate = useNavigate()
  const { totalCartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

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

  const handleLogout = () => {
    logout()
    setIsAccountMenuOpen(false)
    navigate('/')
  }

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
      <div className="bg-secondary py-1.5 text-sm text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <span className="flex items-center gap-1.5">
            <FiPhone className="text-xs" />
            Hotline: 1900 1234
          </span>
          <span className="hidden sm:block">Miễn phí vận chuyển đơn từ 500K</span>
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
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FiPhone className="text-lg text-white" />
            </span>
            <span className="hidden text-xl font-bold text-secondary sm:block">
              TLU<span className="text-primary">Phone</span>
            </span>
          </Link>

          <SearchBar />

          <Link
            to="/products"
            onClick={handleNavClick}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-secondary transition hover:bg-rose-50 hover:text-primary sm:px-3"
            aria-label="Sản phẩm"
          >
            <FiSmartphone className="text-lg" />
            <span className="hidden sm:inline">Sản phẩm</span>
          </Link>

          <Link
            to="/cart"
            onClick={handleNavClick}
            className="relative flex shrink-0 items-center rounded-lg p-2 text-secondary transition hover:bg-rose-50 hover:text-primary"
            aria-label="Giỏ hàng"
          >
            <FiShoppingCart className="text-xl" />
            {totalCartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white shadow-sm">
                {totalCartCount > 99 ? '99+' : totalCartCount}
              </span>
            )}
          </Link>

          <div className="relative shrink-0" ref={accountMenuRef}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                  className="flex items-center gap-1.5 rounded-lg p-1.5 text-secondary transition hover:bg-slate-50 hover:text-primary"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {avatarText}
                  </span>
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
                className="flex items-center gap-1.5 rounded-lg p-2 text-secondary transition hover:bg-rose-50 hover:text-primary"
              >
                <FiUser className="text-xl" />
                <span className="hidden text-sm font-medium sm:inline">Đăng nhập</span>
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
