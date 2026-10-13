import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const BannerCarousel = ({ items, interval = 7000, renderSlide, ariaLabel = 'Banner' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartXRef = useRef(null)
  const touchEndXRef = useRef(null)

  const next = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % items.length)
  }, [items.length])

  const previous = useCallback(() => {
    setCurrentIndex((index) => (index - 1 + items.length) % items.length)
  }, [items.length])

  // Tự động chuyển slide, tạm dừng khi hover hoặc focus
  useEffect(() => {
    if (items.length < 2 || isPaused) return undefined
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [interval, isPaused, items.length, next])

  // Hỗ trợ thao tác vuốt trên thiết bị cảm ứng (Touch swipe)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX
    touchEndXRef.current = null
  }

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return
    const diff = touchStartXRef.current - touchEndXRef.current
    const minSwipeDistance = 45

    if (diff > minSwipeDistance) {
      next()
    } else if (diff < -minSwipeDistance) {
      previous()
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  if (!items.length) return null

  return (
    <div
      className="group relative w-full min-w-0 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className="flex w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div
            key={item.id ?? item.title ?? index}
            className="w-full min-w-full basis-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${items.length}`}
          >
            {renderSlide(item)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          {/* Nút điều hướng Slide trước */}
          <button
            type="button"
            onClick={previous}
            aria-label={`${ariaLabel} trước`}
            className="absolute left-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <FiChevronLeft className="text-xl" />
          </button>

          {/* Nút điều hướng Slide tiếp theo */}
          <button
            type="button"
            onClick={next}
            aria-label={`${ariaLabel} tiếp theo`}
            className="absolute right-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <FiChevronRight className="text-xl" />
          </button>

          {/* Chỉ báo slide (Dots) */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-md transition-opacity">
            {items.map((item, index) => {
              const isActive = index === currentIndex
              return (
                <button
                  key={item.id ?? item.title ?? index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Chuyển đến slide ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white ${
                    isActive ? 'w-6 bg-primary shadow-xs' : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default BannerCarousel
