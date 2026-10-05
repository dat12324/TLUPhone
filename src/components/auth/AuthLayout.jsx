import { Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiGift,
  FiPackage,
  FiPercent,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiSmartphone,
} from 'react-icons/fi'

const memberBenefits = [
  {
    icon: FiGift,
    title: 'Ưu đãi dành riêng',
    description: 'Dễ dàng theo dõi các chương trình dành cho khách hàng thành viên.',
  },
  {
    icon: FiPackage,
    title: 'Quản lý đơn hàng',
    description: 'Theo dõi thông tin mua sắm của bạn thuận tiện hơn.',
  },
  {
    icon: FiPercent,
    title: 'Nhận thông tin khuyến mãi',
    description: 'Không bỏ lỡ các ưu đãi mới từ TLUPhone.',
  },
  {
    icon: FiShield,
    title: 'Thông tin đồng bộ',
    description: 'Tự động điền hồ sơ khi mua hàng và thanh toán sau này.',
  },
]

const AuthLayout = ({ title, subtitle, children }) => (
  <section className="min-h-screen bg-white lg:flex lg:h-screen lg:overflow-hidden">
    <aside className="relative hidden w-[54%] overflow-hidden bg-[#f5f5f7] px-10 py-8 lg:flex lg:flex-col xl:px-16 xl:py-10">
      <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl flex-col">
        <Link to="/" className="flex w-fit items-center gap-3" aria-label="Về trang chủ TLUPhone">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-rose-200">
            <FiPhone className="text-xl" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-secondary">
            TLU<span className="text-primary">Phone</span>
          </span>
        </Link>

        <div className="mt-9 xl:mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Thành viên TLUPhone
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-secondary xl:text-4xl">
            Mua sắm dễ dàng hơn với tài khoản của riêng bạn
          </h2>
          <p className="mt-3 text-base text-slate-600 xl:text-lg">
            Đăng nhập để không bỏ lỡ thông tin và trải nghiệm mua sắm thuận tiện tại TLUPhone.
          </p>
        </div>

        <div className="relative z-10 mt-7 rounded-[28px] border-2 border-primary/80 bg-white/85 p-5 shadow-xl shadow-slate-300/30 backdrop-blur-sm xl:p-7">
          <div className="grid gap-4 xl:grid-cols-2 xl:gap-x-7 xl:gap-y-5">
            {memberBenefits.map(({ icon: Icon, title: benefitTitle, description }) => (
              <div key={benefitTitle} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-primary">
                  <Icon className="text-lg" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-secondary">{benefitTitle}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-auto h-40 min-h-32 xl:h-48">
          <div className="absolute bottom-[-90px] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 blur-sm xl:h-72 xl:w-72" />
          <div className="absolute bottom-[-72px] left-[22%] flex h-52 w-28 -rotate-12 items-center justify-center rounded-[28px] border-[7px] border-secondary bg-white shadow-2xl xl:left-[28%] xl:h-60 xl:w-32">
            <FiSmartphone className="text-5xl text-primary/80" />
          </div>
          <div className="absolute bottom-[-82px] left-1/2 z-10 flex h-56 w-32 -translate-x-1/2 rotate-6 items-center justify-center rounded-[30px] border-[7px] border-secondary bg-gradient-to-b from-primary to-rose-700 shadow-2xl xl:h-64 xl:w-36">
            <FiShoppingBag className="text-5xl text-white" />
          </div>
          <div className="absolute bottom-4 right-[17%] flex h-16 w-16 rotate-12 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-xl xl:right-[24%] xl:h-20 xl:w-20">
            <FiGift className="text-3xl xl:text-4xl" />
          </div>
        </div>
      </div>

      <div className="absolute -left-24 top-1/3 h-56 w-56 rounded-full border-[36px] border-rose-100/70" />
      <div className="absolute -right-16 top-10 h-44 w-44 rounded-full bg-orange-100/70 blur-2xl" />
    </aside>

    <div className="min-h-screen bg-white px-5 py-6 sm:px-10 lg:h-screen lg:flex-1 lg:overflow-y-auto lg:px-12 xl:px-20">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-xl flex-col">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="Về trang chủ TLUPhone">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <FiPhone />
            </span>
            <span className="text-lg font-extrabold text-secondary">
              TLU<span className="text-primary">Phone</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-primary"
          >
            <FiArrowLeft />
            <span className="hidden sm:inline">Về trang chủ</span>
          </Link>
        </div>

        <div className="my-auto w-full py-8 lg:py-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">{title}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>

        <p className="pb-2 text-center text-xs text-slate-400">
          © 2026 TLUPhone · Đại học Thăng Long
        </p>
      </div>
    </div>
  </section>
)

export default AuthLayout
