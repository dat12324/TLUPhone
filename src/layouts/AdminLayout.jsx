import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'
import { useAuth } from '../context/AuthContext'

const SIDEBAR_STORAGE_KEY = 'tluphone_admin_sidebar_collapsed'

const readInitialCollapsedState = () => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const AdminLayout = () => {
  const { user, authLoading, authError } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readInitialCollapsedState)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
    } catch {
      // Layout vẫn hoạt động nếu trình duyệt chặn localStorage.
    }
  }, [collapsed])

  if (authLoading) return <p role="status" className="p-6">Đang khôi phục phiên đăng nhập…</p>
  if (!user) return <Navigate to="/login" state={{ from: location, message: authError }} replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-slate-50 text-secondary">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />
      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <AdminHeader
          admin={{ ...user, avatarUrl: user.avatar, roleLabel: "Admin" }}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((current) => !current)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
