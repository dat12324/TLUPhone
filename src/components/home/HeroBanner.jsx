import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import { heroBanners } from '../../data/banners'

const PLACEHOLDER_IMAGE = '/images/products/placeholder.svg'

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)
  }, [])

  // Tự động chuyển banner sau 5 giây (tạm dừng khi hover)
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      handleNext()
    }, 10000)
    return () => clearInterval(timer)
  }, [isPaused, handleNext])

  const currentBanner = heroBanners[currentIndex]

  return (
    <div
      className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Slide Content */}
      <div
        className={`bg-gradient-to-r ${currentBanner.bgColor} text-white transition-all duration-700 p-6 md:p-10 lg:p-12 min-h-[360px] md:min-h-[420px] flex items-center`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full">
          {/* Cột trái: Nội dung Text & CTA */}
          <div className="md:col-span-7 space-y-3 md:space-y-4 text-center md:text-left z-10">
            {currentBanner.tag && (
              <span className="inline-block bg-primary/90 text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {currentBanner.tag}
              </span>
            )}

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {currentBanner.title}
            </h2>

            <p className="text-sm md:text-base text-gray-300 max-w-lg mx-auto md:mx-0">
              {currentBanner.subtitle}
            </p>

            <div className="text-lg md:text-2xl font-bold text-amber-400">
              {currentBanner.priceText}
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <Link
                to={currentBanner.link}
                className="inline-flex items-center gap-2 bg-primary hover:bg-rose-700 text-white font-semibold text-sm md:text-base px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <span>{currentBanner.btnText}</span>
                <FiArrowRight />
              </Link>
              <Link
                to="/products"
                className="hidden sm:inline-flex items-center text-sm font-medium text-gray-300 hover:text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
              >
                Xem tất cả máy
              </Link>
            </div>
          </div>

          {/* Cột phải: Ảnh sản phẩm nổi bật */}
          <div className="md:col-span-5 flex justify-center items-center relative">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
              {/* Hiệu ứng hào quang sau ảnh */}
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl transform scale-90" />
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE
                }}
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nút điều hướng Trái / Phải */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Banner trước"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100 hover:scale-110"
      >
        <FiChevronLeft className="text-xl" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Banner tiếp theo"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100 hover:scale-110"
      >
        <FiChevronRight className="text-xl" />
      </button>

      {/* Indicators (Dấu chấm chuyển slide) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {heroBanners.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Chuyển đến banner ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === idx
                ? 'w-7 h-2 bg-primary'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroBanner
