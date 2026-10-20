import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const BannerCarousel = ({
  items,
  interval = 7000,
  renderSlide,
  ariaLabel = 'Banner',
  variant = 'default',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const touchStartXRef = useRef(null)
  const touchEndXRef = useRef(null)
  const isHero = variant === 'hero'

  const trackClassName = isHero
    ? 'flex w-full will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
    : 'flex w-full transition-transform duration-500 ease-out motion-reduce:transition-none'

  const navigationButtonClassName = isHero
    ? 'absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-slate-950/55 text-white opacity-0 shadow-lg backdrop-blur-md transition-[opacity,background-color,border-color,transform] duration-200 md:flex md:group-hover:opacity-100 hover:border-white/50 hover:bg-slate-950/80 active:scale-95 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
    : 'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-80 shadow-md backdrop-blur-md transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 hover:bg-black/70 active:scale-95 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

  const next = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % items.length)
  }, [items.length])

  const previous = useCallback(() => {
    setCurrentIndex((index) => (index - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (!isHero || typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [isHero])

  // Tự động chuyển slide, tạm dừng khi hover hoặc focus
  useEffect(() => {
    if (items.length < 2 || isPaused || (isHero && prefersReducedMotion)) return undefined
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [interval, isHero, isPaused, items.length, next, prefersReducedMotion])

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
        className={trackClassName}
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
            className={`${navigationButtonClassName} ${isHero ? 'left-4 lg:left-6' : 'left-2.5'}`}
          >
            <FiChevronLeft className="text-xl" aria-hidden="true" />
          </button>

          {/* Nút điều hướng Slide tiếp theo */}
          <button
            type="button"
            onClick={next}
            aria-label={`${ariaLabel} tiếp theo`}
            className={`${navigationButtonClassName} ${isHero ? 'right-4 lg:right-6' : 'right-2.5'}`}
          >
            <FiChevronRight className="text-xl" aria-hidden="true" />
          </button>

          {/* Chỉ báo slide (Dots) */}
          <div className={`absolute left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-md transition-opacity ${isHero ? 'bottom-4' : 'bottom-3'}`}>
            {items.map((item, index) => {
              const isActive = index === currentIndex
              return (
                <button
                  key={item.id ?? item.title ?? index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Chuyển đến slide ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
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
