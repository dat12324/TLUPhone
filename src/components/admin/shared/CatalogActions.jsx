import { FiEdit2, FiEye, FiEyeOff } from 'react-icons/fi'

const CatalogActions = ({ item, label, onEdit, onStatusChange }) => (
  <div className="flex flex-wrap items-center justify-end gap-2">
    <button type="button" onClick={() => onEdit(item)} aria-label={`Sửa ${label} ${item.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-primary/30 hover:bg-rose-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><FiEdit2 aria-hidden="true" />Sửa</button>
    <button type="button" onClick={() => onStatusChange(item)} aria-label={`${item.status === 'active' ? 'Ẩn' : 'Hiện'} ${label} ${item.name}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      {item.status === 'active' ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
      {item.status === 'active' ? 'Ẩn' : 'Hiện'}
    </button>
  </div>
)

export default CatalogActions
