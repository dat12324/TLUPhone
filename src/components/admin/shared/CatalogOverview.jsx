import { FiBox, FiCheckCircle, FiEyeOff, FiFolder, FiPlus, FiTag } from 'react-icons/fi'
import StatCard from '../dashboard/StatCard'

const content = {
  brand: {
    label: 'thương hiệu', description: 'Quản lý các thương hiệu điện thoại được kinh doanh tại TLUPhone.',
    totalIcon: FiTag, activeIcon: FiBox,
    totalNote: 'Tất cả thương hiệu trong hệ thống', activeNote: 'Thương hiệu đang được kinh doanh', inactiveNote: 'Thương hiệu tạm thời không hiển thị',
  },
  category: {
    label: 'danh mục', description: 'Quản lý các nhóm sản phẩm được kinh doanh tại TLUPhone.',
    totalIcon: FiFolder, activeIcon: FiCheckCircle,
    totalNote: 'Các nhóm sản phẩm trong hệ thống', activeNote: 'Danh mục đang hiển thị', inactiveNote: 'Danh mục tạm thời không hiển thị',
  },
}

export const CatalogHeader = ({ type, titleId, onCreate }) => {
  const { label, description } = content[type]
  return <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Danh mục sản phẩm</p>
      <h1 id={titleId} className="mt-1 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">Quản lý {label}</h1>
      <p className="mt-2 text-sm text-slate-500 sm:text-base">{description}</p>
    </div>
    <div className="shrink-0">
      <button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"><FiPlus aria-hidden="true" /> Thêm {label}</button>
    </div>
  </div>
}

export const CatalogStats = ({ type, summary }) => {
  const { label, totalIcon, activeIcon, totalNote, activeNote, inactiveNote } = content[type]
  return <div className="grid gap-4 sm:grid-cols-3">
    <StatCard icon={totalIcon} label={`Tổng ${label}`} value={summary.total.toLocaleString('vi-VN')} note={totalNote} tone="blue" />
    <StatCard icon={activeIcon} label="Đang hoạt động" value={summary.active.toLocaleString('vi-VN')} note={activeNote} tone="emerald" />
    <StatCard icon={FiEyeOff} label="Đã ẩn" value={summary.inactive.toLocaleString('vi-VN')} note={inactiveNote} tone="amber" />
  </div>
}
