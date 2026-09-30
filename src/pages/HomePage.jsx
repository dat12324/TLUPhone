import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiZap, FiStar, FiAward, FiChevronRight, FiClock } from 'react-icons/fi'
import HeroBanner from '../components/home/HeroBanner'
import ServicesCommitment from '../components/home/ServicesCommitment'
import BrandList from '../components/home/BrandList'
import PromoBanners from '../components/home/PromoBanners'
import BrandTabsSection from '../components/home/BrandTabsSection'
import ProductCard from '../components/ProductCard'
import products from '../data/products'

// Thời gian kết thúc Flash Sale mặc định (đếm ngược đến 23:59:59 cuối ngày)
// Sau này khi có Backend API, bạn chỉ cần gán thời gian từ API vào đây
const getInitialTargetTime = () => {
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay.getTime()
}

const HomePage = () => {
  // Mốc thời gian kết thúc Flash Sale (chuẩn bị sẵn để nhận từ Backend API)
  const [flashSaleEndTime] = useState(getInitialTargetTime())

  // State lưu trữ thời gian còn lại (Giờ, Phút, Giây)
  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  // Effect chạy đếm ngược mỗi giây
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = flashSaleEndTime - now

      if (difference <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' })
        return
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / (1000 * 60)) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      })
    }

    // Cập nhật ngay lần đầu tiên
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [flashSaleEndTime])

  // 1. Sản phẩm khuyến mãi hấp dẫn (có giảm giá hoặc isHotDeal)
  const hotDealProducts = useMemo(() => {
    return products
      .filter((p) => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price))
      .slice(0, 5)
  }, [])

  // 2. Sản phẩm nổi bật (isFeatured)
  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.isFeatured || p.rating >= 4.6)
      .slice(0, 8)
  }, [])

  // 3. Sản phẩm mới ra mắt (isNew)
  const newProducts = useMemo(() => {
    return products
      .filter((p) => p.isNew || p.id <= 6)
      .slice(0, 4)
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 pt-4 md:pt-6">
        {/* 1. Hero Banner Slider */}
        <HeroBanner />

        {/* 2. Cam kết & Dịch vụ */}
        <ServicesCommitment />

        {/* 3. Danh mục / Hãng điện thoại */}
        <BrandList />

        {/* 4. Section: Khuyến mãi hấp dẫn (Flash Sale / Hot Deals) */}
        {hotDealProducts.length > 0 && (
          <section className="my-10 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 rounded-2xl md:rounded-3xl p-5 md:p-7 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300 text-2xl animate-pulse">
                  <FiZap />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                      Khuyến Mãi Hấp Dẫn
                    </h2>
                    <span className="bg-amber-400 text-secondary text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                      HOT DEAL
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 mt-0.5">
                    Giá sốc trong tuần - Số lượng có hạn
                  </p>
                </div>
              </div>

              {/* Countdown timer tự động đếm ngược theo thời gian thực */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-black/25 backdrop-blur-sm px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                <FiClock className="text-amber-300" />
                <span>Kết thúc sau:</span>
                <span className="bg-white text-secondary px-1.5 py-0.5 rounded font-mono font-bold">
                  {timeLeft.hours}
                </span>
                <span>:</span>
                <span className="bg-white text-secondary px-1.5 py-0.5 rounded font-mono font-bold">
                  {timeLeft.minutes}
                </span>
                <span>:</span>
                <span className="bg-white text-secondary px-1.5 py-0.5 rounded font-mono font-bold">
                  {timeLeft.seconds}
                </span>
              </div>
            </div>

            {/* Grid sản phẩm Khuyến mãi */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {hotDealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-rose-50 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-sm transition-all hover:scale-105"
              >
                <span>Xem tất cả khuyến mãi</span>
                <FiChevronRight className="text-base" />
              </Link>
            </div>
          </section>
        )}

        {/* 5. Banner khuyến mãi phụ 1 (Học sinh - Sinh viên & Thu cũ đổi mới) */}
        <PromoBanners startIndex={0} count={2} />

        {/* 6. Section: Sản phẩm nổi bật */}
        {featuredProducts.length > 0 && (
          <section className="my-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-primary flex items-center justify-center text-lg">
                  <FiStar />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-secondary">
                    Sản phẩm nổi bật
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Những mẫu smartphone được yêu thích và đánh giá cao nhất
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
              >
                <span>Xem tất cả</span>
                <FiChevronRight className="text-sm" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 7. Section: Sản phẩm theo hãng (Tabs Apple / Samsung / Xiaomi / OPPO) */}
        <BrandTabsSection />

        {/* 8. Banner khuyến mãi phụ 2 (Miễn phí vận chuyển) */}
        <PromoBanners startIndex={2} count={1} />

        {/* 9. Section: Điện thoại mới */}
        {newProducts.length > 0 && (
          <section className="my-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
                  <FiAward />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-secondary">
                    Điện thoại mới
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Các dòng smartphone công nghệ mới nhất vừa cập bến
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
              >
                <span>Xem tất cả</span>
                <FiChevronRight className="text-sm" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default HomePage
