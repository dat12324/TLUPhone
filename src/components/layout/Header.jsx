import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiPhone } from 'react-icons/fi'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-secondary text-white text-sm py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <FiPhone className="text-xs" />
            Hotline: 1900 1234
          </span>
          <span className="hidden sm:block">Miễn phí vận chuyển đơn từ 500K</span>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <FiPhone className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-secondary">
              TLU<span className="text-primary">Phone</span>
            </span>
          </Link>

          {/* Search bar - ẩn trên mobile */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm điện thoại..."
                className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 
                           focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                           text-sm transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                <FiSearch className="text-lg" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search icon - chỉ hiện trên mobile */}
            <button className="md:hidden p-2 text-secondary hover:text-primary transition-colors">
              <FiSearch className="text-xl" />
            </button>

            <Link
              to="/gio-hang"
              onClick={handleNavClick}
              className="relative p-2 text-secondary hover:text-primary transition-colors"
            >
              <FiShoppingCart className="text-xl" />
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs 
                              w-4.5 h-4.5 rounded-full flex items-center justify-center font-medium
                              min-w-[18px] h-[18px]">
                0
              </span>
            </Link>

            <Link
              to="/tai-khoan"
              onClick={handleNavClick}
              className="hidden sm:flex items-center gap-1.5 p-2 text-secondary hover:text-primary transition-colors"
            >
              <FiUser className="text-xl" />
              <span className="text-sm font-medium hidden lg:block">Tài khoản</span>
            </Link>

            {/* Menu mobile toggle */}
            <button
              className="md:hidden p-2 text-secondary hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {[
              { label: 'Trang chủ', path: '/' },
              { label: 'Sản phẩm', path: '/products' },
              { label: 'Khuyến mãi', path: '/khuyen-mai' },
              { label: 'Tin tức', path: '/tin-tuc' },
              { label: 'Liên hệ', path: '/lien-he' },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 text-sm font-medium text-secondary 
                             hover:text-primary transition-colors relative
                             after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 
                             after:w-0 after:h-0.5 after:bg-primary after:transition-all
                             hover:after:w-full"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          {/* Mobile search */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm điện thoại..."
                className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 
                           focus:outline-none focus:border-primary text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiSearch />
              </button>
            </div>
          </div>

          <ul className="py-2">
            {[
              { label: 'Trang chủ', path: '/' },
              { label: 'Sản phẩm', path: '/products' },
              { label: 'Khuyến mãi', path: '/khuyen-mai' },
              { label: 'Tin tức', path: '/tin-tuc' },
              { label: 'Liên hệ', path: '/lien-he' },
              { label: 'Tài khoản', path: '/tai-khoan' },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block px-4 py-2.5 text-sm font-medium text-secondary 
                             hover:text-primary hover:bg-gray-50 transition-colors"
                  onClick={handleNavClick}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Header
