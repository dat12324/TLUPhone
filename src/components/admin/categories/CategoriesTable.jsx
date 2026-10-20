import { FiEdit2, FiEye, FiEyeOff, FiFolder, FiTrash2 } from 'react-icons/fi'
import { formatAdminDate } from '../../../utils/adminFormatters'

const ActionButton = ({ label, tone = 'default', onClick, children }) => {
  const tones = {
    default: 'text-slate-500 hover:bg-slate-100 hover:text-secondary',
    edit: 'text-slate-500 hover:bg-rose-50 hover:text-primary',
    warning: 'text-emerald-600 hover:bg-amber-50 hover:text-amber-700',
    success: 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700',
    danger: 'text-slate-500 hover:bg-red-50 hover:text-red-700',
  }
  return <button type="button" onClick={onClick} className={`flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${tones[tone]}`} aria-label={label} title={label}>{children}</button>
}

const CategoriesTable = ({ categories, onView, onEdit, onStatusChange, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1040px] table-fixed text-left text-sm">
      <caption className="sr-only">Danh sách danh mục sản phẩm TLUPhone</caption>
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th scope="col" className="w-[16%] px-5 py-3 font-semibold">Danh mục</th>
          <th scope="col" className="w-[10%] px-3 py-3 font-semibold">Mã</th>
          <th scope="col" className="w-[13%] px-3 py-3 font-semibold">Slug</th>
          <th scope="col" className="w-[15%] px-3 py-3 font-semibold">Mô tả</th>
          <th scope="col" className="w-[7%] whitespace-nowrap px-3 py-3 text-right font-semibold">Sản phẩm</th>
          <th scope="col" className="w-[9%] whitespace-nowrap px-3 py-3 font-semibold">Trạng thái</th>
          <th scope="col" className="w-[8%] px-3 py-3 font-semibold">Ngày tạo</th>
          <th scope="col" className="w-[22%] px-4 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {categories.map((category) => (
          <tr key={category.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-primary">
                  <FiFolder aria-hidden="true" />
                </span>
                <span className="line-clamp-2 font-semibold text-secondary">{category.name}</span>
              </div>
            </td>
            <td className="break-words px-3 py-4 font-mono text-xs font-semibold text-slate-600">{category.code}</td>
            <td className="break-words px-3 py-4 text-slate-600">{category.slug}</td>
            <td className="px-3 py-4">
              <p className="max-w-64 line-clamp-2 leading-6 text-slate-500">{category.description}</p>
            </td>
            <td className="px-3 py-4 text-right font-semibold text-secondary">{category.productCount.toLocaleString('vi-VN')}</td>
            <td className="px-3 py-4">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${category.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                {category.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
              </span>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-slate-500">{formatAdminDate(category.createdAt)}</td>
            <td className="px-4 py-4">
              <div className="flex justify-end">
                <ActionButton label={`Xem chi tiết ${category.name}`} onClick={() => onView(category)}><FiEye aria-hidden="true" /></ActionButton>
                <ActionButton label={`Chỉnh sửa ${category.name}`} tone="edit" onClick={() => onEdit(category)}><FiEdit2 aria-hidden="true" /></ActionButton>
                <ActionButton label={`${category.status === 'active' ? 'Ẩn' : 'Kích hoạt'} ${category.name}`} tone={category.status === 'active' ? 'warning' : 'success'} onClick={() => onStatusChange(category)}>{category.status === 'active' ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</ActionButton>
                <ActionButton label={`Xóa ${category.name}`} tone="danger" onClick={() => onDelete(category)}><FiTrash2 aria-hidden="true" /></ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const CategoriesEmptyState = () => (
  <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-400">
      <FiFolder aria-hidden="true" />
    </span>
    <h2 className="mt-4 font-bold text-secondary">Không tìm thấy danh mục</h2>
    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Hãy thử từ khóa khác hoặc thay đổi bộ lọc trạng thái.</p>
  </div>
)

export default CategoriesTable
