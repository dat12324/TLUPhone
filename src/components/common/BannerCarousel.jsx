import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const BannerCarousel = ({ items, interval = 7000, renderSlide, ariaLabel = 'Banner' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % items.length)
  }, [items.length])

  const previous = useCallback(() => {
    setCurrentIndex((index) => (index - 1 + items.length) % items.length)
  }, [items.length])

  useEffect(() => {
    if (items.length < 2) return undefined
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [interval, items.length, next])

  if (!items.length) return null

  return (
    <div className="group relative w-full min-w-0 overflow-hidden">
      <div className="flex w-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {items.map((item, index) => (
          <div key={item.id ?? item.title ?? index} className="w-full min-w-full basis-full shrink-0">
            {renderSlide(item)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button type="button" onClick={previous} aria-label={`${ariaLabel} trước`} className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60">
            <FiChevronLeft />
          </button>
          <button type="button" onClick={next} aria-label={`${ariaLabel} tiếp theo`} className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60">
            <FiChevronRight />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 opacity-0 transition group-hover:opacity-100">
            {items.map((item, index) => <span key={item.id ?? item.title ?? index} className={`h-1.5 rounded-full transition-all ${index === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-white/70'}`} />)}
          </div>
        </>
      )}
    </div>
  )
}

export default BannerCarousel
