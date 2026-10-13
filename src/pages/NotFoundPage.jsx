import { Link } from 'react-router-dom'
import { FiHome, FiSmartphone, FiSearch } from 'react-icons/fi'

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-20 h-20 bg-rose-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-3">
          Không tìm thấy trang
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn bị thay đổi.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            <FiHome className="text-base" />
            <span>Về trang chủ</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-secondary font-semibold text-sm rounded-xl transition-colors active:scale-95"
          >
            <FiSmartphone className="text-base" />
            <span>Xem sản phẩm</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
