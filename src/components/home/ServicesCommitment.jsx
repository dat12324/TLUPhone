import { FiInfo, FiPhoneCall, FiSmartphone, FiTruck } from 'react-icons/fi'

const services = [
  {
    icon: <FiSmartphone className="text-xl text-primary" />,
    title: 'Chuyên điện thoại',
    desc: 'Tập trung vào các dòng smartphone',
  },
  {
    icon: <FiInfo className="text-xl text-primary" />,
    title: 'Thông tin rõ ràng',
    desc: 'Giá bán và cấu hình minh bạch',
  },
  {
    icon: <FiTruck className="text-xl text-primary" />,
    title: 'Miễn phí vận chuyển',
    desc: 'Áp dụng cho đơn hàng từ 500K',
  },
  {
    icon: <FiPhoneCall className="text-xl text-primary" />,
    title: 'Hỗ trợ mua hàng',
    desc: 'Hotline 1900 1234',
  },
]

const ServicesCommitment = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-6">
      {services.map((s, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-rose-200 sm:p-4"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            {s.icon}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold text-secondary sm:text-sm">
              {s.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              {s.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ServicesCommitment
