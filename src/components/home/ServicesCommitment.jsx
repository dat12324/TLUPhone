import { FiShield, FiRotateCcw, FiTruck, FiCreditCard } from 'react-icons/fi'

const services = [
  {
    icon: <FiShield className="text-xl text-primary" />,
    title: '100% Chính Hãng',
    desc: 'Bảo hành chính hãng VAT',
  },
  {
    icon: <FiRotateCcw className="text-xl text-primary" />,
    title: '1 Đổi 1 Trong 30 Ngày',
    desc: 'Nếu phát sinh lỗi NSX',
  },
  {
    icon: <FiTruck className="text-xl text-primary" />,
    title: 'Giao Siêu Tốc 2H',
    desc: 'Miễn phí đơn từ 500K',
  },
  {
    icon: <FiCreditCard className="text-xl text-primary" />,
    title: 'Trả Góp 0% Lãi Suất',
    desc: 'Thủ tục online nhanh 5 phút',
  },
]

const ServicesCommitment = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 my-6">
      {services.map((s, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-gray-100 p-3.5 sm:p-4 flex items-center gap-3 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            {s.icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-secondary truncate">
              {s.title}
            </h4>
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
