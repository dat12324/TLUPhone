import { FiMapPin, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm"><Icon /></span>
    <p className="font-semibold text-secondary">{title}</p>
    {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
  </div>
)

export const ProfilePanel = ({ title, action, children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-secondary">{title}</h2>
      {action}
    </div>
    {children}
  </section>
)

export const ProfileAddressBook = ({
  addresses, loading = false, busy = false, error = '', onRetry, pendingDeleteAddressId, onOpenAddress, onDelete, onCancelDelete, onConfirmDelete, onSetDefault,
}) => {
  return (
    <div id="address-book" className="scroll-mt-24">
      <ProfilePanel
      title="Sổ địa chỉ"
      action={<button type="button" disabled={loading || busy || Boolean(error)} onClick={() => onOpenAddress()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"><FiPlus aria-hidden="true" /> Thêm địa chỉ</button>}
    >
      <p className="-mt-3 mb-5 text-sm text-slate-500">{loading ? 'Đang tải địa chỉ…' : addresses.length + ' địa chỉ đã lưu'}</p>
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <p>{error}</p>
          <button type="button" onClick={onRetry} disabled={busy || loading} className="mt-2 min-h-11 font-semibold underline">Tải lại địa chỉ</button>
        </div>
      )}
      {loading ? <p role="status" className="py-5 text-sm text-slate-500">Đang tải sổ địa chỉ…</p> : error && addresses.length === 0 ? null : addresses.length === 0 ? (
        <EmptyState icon={FiMapPin} title="Chưa có địa chỉ giao hàng" description="Thêm địa chỉ để thanh toán nhanh hơn trong lần mua tiếp theo." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{address.receiverName}</strong>
                    {address.isDefault && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-primary">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{address.phone}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {[address.detailAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <button
                    type="button"
                    disabled={busy || loading} onClick={() => onOpenAddress(address)}
                    className="flex h-11 w-11 items-center justify-center text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Sửa địa chỉ của ${address.receiverName}`}
                  >
                    <FiEdit2 aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={busy || loading} onClick={() => onDelete(address.id)}
                    className="flex h-11 w-11 items-center justify-center text-slate-400 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`Xóa địa chỉ của ${address.receiverName}`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </div>
              </div>

              {pendingDeleteAddressId === address.id && (
                <div
                  role="alertdialog"
                  aria-labelledby={`delete-address-${address.id}`}
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3"
                >
                  <p id={`delete-address-${address.id}`} className="text-sm font-semibold text-red-700">
                    Bạn chắc chắn muốn xóa địa chỉ này?
                  </p>
                  <p className="mt-1 text-xs text-red-600">Thao tác này không thể hoàn tác.</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy} onClick={onCancelDelete}
                      className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600"
                    >
                      Giữ lại
                    </button>
                    <button
                      type="button"
                      disabled={busy || loading} onClick={() => onConfirmDelete(address.id)}
                      className="min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Xóa địa chỉ
                    </button>
                  </div>
                </div>
              )}

              {!address.isDefault && pendingDeleteAddressId !== address.id && (
                <button
                  type="button"
                  disabled={busy || loading} onClick={() => onSetDefault(address.id)}
                  className="mt-3 min-h-11 text-xs font-semibold text-primary"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      </ProfilePanel>
    </div>
  )

}
