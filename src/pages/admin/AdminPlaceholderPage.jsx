import { FiTool } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'
import { findAdminPage } from '../../config/adminNavigation'

const AdminPlaceholderPage = () => {
  const { pathname } = useLocation()
  const page = findAdminPage(pathname)
  const Icon = page.icon

  return (
    <section className="mx-auto max-w-7xl" aria-labelledby="admin-page-title">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-xl text-primary">
          <Icon aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Khu vực quản trị</p>
          <h1 id="admin-page-title" className="mt-1 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            {page.title}
          </h1>
        </div>
      </div>

      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
          <FiTool aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-secondary">Chức năng đang được phát triển</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Bố cục quản trị đã sẵn sàng. Nội dung nghiệp vụ sẽ được triển khai trong bước tiếp theo.
        </p>
      </div>
    </section>
  )
}

export default AdminPlaceholderPage
