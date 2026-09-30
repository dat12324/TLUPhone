import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Tự động cuộn mượt lên đầu trang mỗi khi chuyển trang (route change)
const ScrollToTop = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }, [pathname, search])

  return null
}

export default ScrollToTop
