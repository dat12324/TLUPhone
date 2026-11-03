import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Chuyển trang lên đầu ngay; đổi bộ lọc trong cùng trang do Page xử lý.
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  return null
}

export default ScrollToTop
