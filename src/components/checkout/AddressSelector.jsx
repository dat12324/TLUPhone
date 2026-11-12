import SideDrawer from '../common/SideDrawer'

const AddressSelector = ({ addresses, addressesLoading, addressesError, onClose, onRetry, onSelect }) => (
  <SideDrawer title="Chọn địa chỉ giao hàng" onClose={onClose}>
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
      {addressesLoading ? <p role="status" className="py-6 text-center text-sm text-slate-500">Đang tải sổ địa chỉ…</p> : addressesError ? (
        <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          <p>{addressesError}</p>
          <button type="button" onClick={onRetry} className="mt-2 min-h-10 font-semibold underline">Thử lại</button>
        </div>
      ) : addresses.length ? addresses.map(address => (
        <button key={address.id} type="button" onClick={() => onSelect(address)} className="block w-full rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary hover:bg-rose-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <span className="flex flex-wrap items-center gap-2 font-semibold">
            {address.receiverName}
            {address.isDefault && <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-primary">Mặc định</span>}
          </span>
          <span className="mt-1 block text-sm text-slate-600">{address.phone}</span>
          <span className="mt-2 block text-sm leading-6 text-slate-500">{[address.detailAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}</span>
        </button>
      )) : (
        <div className="py-8 text-center text-sm text-slate-500">
          <p>Bạn chưa có địa chỉ đã lưu.</p>
          <button type="button" onClick={onClose} className="mt-4 min-h-11 rounded-lg border border-slate-200 px-4 font-semibold text-secondary">Nhập địa chỉ mới</button>
        </div>
      )}
    </div>
  </SideDrawer>
)

export default AddressSelector
