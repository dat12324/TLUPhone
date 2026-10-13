import { Link } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin, FiFacebook } from 'react-icons/fi'
import BrandLogo from '../common/BrandLogo'

const Footer = () => {
  return (
    <footer className="bg-secondary text-gray-300 mt-auto">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Giới thiệu */}
          <div>
            <Link to="/" aria-label="TLUPhone - Trang chủ" className="mb-4 inline-flex transition-opacity hover:opacity-85">
              <BrandLogo variant="dark" size="sm" />
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Cửa hàng điện thoại trực tuyến uy tín, cung cấp các sản phẩm 
              smartphone chính hãng với giá tốt nhất thị trường.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook TLUPhone"
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
              >
                <FiFacebook className="text-sm" />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Liên kết
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Trang chủ', path: '/' },
                { label: 'Sản phẩm', path: '/products' },
                { label: 'Giỏ hàng', path: '/cart' },
                { label: 'Đơn hàng của tôi', path: '/orders' },
                { label: 'Tài khoản', path: '/profile' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Chính sách
            </h3>
            <ul className="space-y-2">
              {[
                'Chính sách bảo hành',
                'Chính sách đổi trả',
                'Chính sách vận chuyển',
                'Chính sách bảo mật',
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <FiMapPin className="text-primary mt-0.5 shrink-0" />
                <span>Đại học Thăng Long, đường Nguyễn Xiển, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FiPhone className="text-primary shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FiMail className="text-primary shrink-0" />
                <span>contact@tluphone.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-400">
            © 2026 TLUPhone.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
