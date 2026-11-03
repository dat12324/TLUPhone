import CatalogActions from '../shared/CatalogActions'
import { FiFolder } from 'react-icons/fi'
import { formatAdminDate } from '../../../utils/adminFormatters'

const CategoriesTable = ({ categories, onEdit, onStatusChange }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[920px] table-fixed text-left text-sm">
      <caption className="sr-only">Danh sách danh mục sản phẩm TLUPhone</caption>
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th scope="col" className="w-[32%] px-5 py-3 font-semibold">Danh mục</th>

          <th scope="col" className="w-[15%] px-3 py-3 font-semibold">Slug</th>
          <th scope="col" className="w-[9%] whitespace-nowrap px-3 py-3 text-right font-semibold">Sản phẩm</th>
          <th scope="col" className="w-[10%] whitespace-nowrap px-3 py-3 font-semibold">Trạng thái</th>
          <th scope="col" className="w-[12%] px-3 py-3 font-semibold">Ngày tạo</th>
          <th scope="col" className="w-[22%] px-4 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {categories.map((category) => (
          <tr key={category.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-primary">
                  <>{category.image ? <img src={category.image} alt="" className="h-10 w-10 rounded-xl object-contain" /> : <FiFolder aria-hidden="true" />}</>
                </span>
                <span className="line-clamp-2 font-semibold text-secondary">{category.name}</span>
              </div>
            </td>

            <td className="break-words px-3 py-4 text-slate-600">{category.slug}</td>
            <td className="px-3 py-4 text-right font-semibold text-secondary">{category.productCount?.toLocaleString('vi-VN') ?? '—'}</td>
            <td className="px-3 py-4">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${category.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                {category.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
              </span>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-slate-500">{formatAdminDate(category.createdAt)}</td>
            <td className="px-4 py-4">
              <CatalogActions item={category} label="danh mục" onEdit={onEdit} onStatusChange={onStatusChange} />
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
