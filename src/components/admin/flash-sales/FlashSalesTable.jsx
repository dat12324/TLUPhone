import { FiClock, FiEdit2, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'
import PendingActionButton from '../shared/PendingActionButton'

const statusConfig = {
  upcoming: { label: 'Sắp diễn ra', classes: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  active: { label: 'Đang diễn ra', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  ended: { label: 'Đã kết thúc', classes: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  disabled: { label: 'Đã tắt', classes: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
}

const formatDateTime = (value) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Không hợp lệ'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const FlashSalesTable = ({ flashSales }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[940px] table-fixed text-left text-sm">
      <caption className="sr-only">Danh sách chương trình Flash Sale tại TLUPhone</caption>
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th scope="col" className="w-[23%] px-5 py-3 font-semibold">Chương trình</th>
          <th scope="col" className="w-[9%] px-3 py-3 text-right font-semibold">Số SKU</th>
          <th scope="col" className="w-[15%] px-3 py-3 font-semibold">Bắt đầu</th>
          <th scope="col" className="w-[15%] px-3 py-3 font-semibold">Kết thúc</th>
          <th scope="col" className="w-[13%] px-3 py-3 font-semibold">Trạng thái</th>
          <th scope="col" className="w-[13%] px-3 py-3 font-semibold">Ngày tạo</th>
          <th scope="col" className="w-[12%] px-5 py-3 text-right font-semibold">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {flashSales.map((flashSale) => {
          const status = statusConfig[flashSale.computedStatus] || statusConfig.disabled
          return (
            <tr key={flashSale.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-primary"><FiZap aria-hidden="true" /></span>
                  <div className="min-w-0"><p className="line-clamp-2 font-semibold text-secondary">{flashSale.name}</p><p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{flashSale.description}</p></div>
                </div>
              </td>
              <td className="px-3 py-4 text-right font-semibold text-secondary">{flashSale.skuCount.toLocaleString('vi-VN')}</td>
              <td className="px-3 py-4 leading-6 text-slate-600">{formatDateTime(flashSale.startAt)}</td>
              <td className="px-3 py-4 leading-6 text-slate-600">{formatDateTime(flashSale.endAt)}</td>
              <td className="px-3 py-4">
                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.classes}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />{status.label}
                </span>
              </td>
              <td className="px-3 py-4 leading-6 text-slate-500">{formatDateTime(flashSale.createdAt)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end">
                  <PendingActionButton label={`Xem ${flashSale.name}`}><FiEye aria-hidden="true" /></PendingActionButton>
                  <PendingActionButton label={`Chỉnh sửa ${flashSale.name}`}><FiEdit2 aria-hidden="true" /></PendingActionButton>
                  <PendingActionButton label={`${flashSale.isEnabled ? 'Tắt' : 'Bật'} ${flashSale.name}`}>{flashSale.isEnabled ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</PendingActionButton>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export const FlashSalesEmptyState = () => (
  <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-400"><FiClock aria-hidden="true" /></span>
    <h2 className="mt-4 font-bold text-secondary">Không tìm thấy Flash Sale</h2>
    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Hãy thử từ khóa khác hoặc thay đổi bộ lọc trạng thái.</p>
  </div>
)

export default FlashSalesTable

