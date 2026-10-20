import { useState } from 'react'
import { FiEdit2, FiEye, FiEyeOff, FiImage } from 'react-icons/fi'
import { formatAdminDate } from '../../../utils/adminFormatters'
import PendingActionButton from '../shared/PendingActionButton'

const BrandLogoCell = ({ brand }) => {
  const [imageError, setImageError] = useState(false)

  if (!brand.logo || imageError) {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500" title="Logo chưa được cập nhật">
        {brand.name.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={brand.logo}
      alt={`Logo ${brand.name}`}
      className="h-11 w-11 rounded-xl border border-slate-200 bg-white object-contain p-1.5"
      onError={() => setImageError(true)}
    />
  )
}

const BrandsTable = ({ brands, onEdit, onStatusChange }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1080px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-6 py-3 font-semibold">Logo</th>
          <th className="px-4 py-3 font-semibold">Thương hiệu</th>
          <th className="px-4 py-3 font-semibold">Mã</th>
          <th className="px-4 py-3 font-semibold">Slug</th>
          <th className="px-4 py-3 text-right font-semibold">Sản phẩm</th>
          <th className="px-4 py-3 font-semibold">Trạng thái</th>
          <th className="px-4 py-3 font-semibold">Ngày tạo</th>
          <th className="px-6 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {brands.map((brand) => (
          <tr key={brand.id} className="hover:bg-slate-50/70">
            <td className="px-6 py-3"><BrandLogoCell brand={brand} /></td>
            <td className="px-4 py-3">
              <p className="font-semibold text-secondary">{brand.name}</p>
              <p className="mt-0.5 max-w-52 truncate text-xs text-slate-500">{brand.description}</p>
            </td>
            <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">{brand.code}</td>
            <td className="px-4 py-3 text-slate-600">{brand.slug}</td>
            <td className="px-4 py-3 text-right font-semibold text-secondary">{brand.productCount.toLocaleString('vi-VN')}</td>
            <td className="px-4 py-3">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${brand.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                {brand.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatAdminDate(brand.createdAt)}</td>
            <td className="px-6 py-3">
              <div className="flex justify-end gap-0.5">
                <PendingActionButton label={`Xem ${brand.name}`}><FiEye aria-hidden="true" /></PendingActionButton>
                <button type="button" onClick={() => onEdit(brand)} className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Chỉnh sửa ${brand.name}`} title={`Chỉnh sửa ${brand.name}`}>
                  <FiEdit2 aria-hidden="true" />
                </button>
                <button type="button" onClick={() => onStatusChange(brand)} className={`flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${brand.status === 'active' ? 'text-emerald-600 hover:bg-amber-50 hover:text-amber-700' : 'text-slate-300 hover:bg-emerald-50 hover:text-emerald-600'}`} aria-label={`${brand.status === 'active' ? 'Ẩn' : 'Kích hoạt'} ${brand.name}`} title={`${brand.status === 'active' ? 'Ẩn' : 'Kích hoạt'} ${brand.name}`}>
                  {brand.status === 'active' ? <FiEye aria-hidden="true" /> : <FiEyeOff aria-hidden="true" />}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const BrandsEmptyState = () => (
  <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-400">
      <FiImage aria-hidden="true" />
    </span>
    <h2 className="mt-4 font-bold text-secondary">Không tìm thấy thương hiệu</h2>
    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Hãy thử từ khóa khác hoặc thay đổi bộ lọc trạng thái.</p>
  </div>
)

export default BrandsTable
