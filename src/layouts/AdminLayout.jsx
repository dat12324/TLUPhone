import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'
import { mockAdminUser } from '../data/mock/admin'

const SIDEBAR_STORAGE_KEY = 'tluphone_admin_sidebar_collapsed'

const readInitialCollapsedState = () => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const AdminLayout = () => {
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

  return (
    <div className="min-h-screen bg-slate-50 text-secondary">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />
      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <AdminHeader
          admin={mockAdminUser}
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
