import { FiHome, FiMail, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'

const inputClass = (error) => `w-full rounded-xl border bg-white px-4 py-3 text-sm text-secondary outline-none transition placeholder:text-gray-400 ${error
    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-rose-100'
  }`

const FormField = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-secondary">
      {label} {required && <span className="text-primary">*</span>}
    </span>
    {children}
    {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
  </label>
)

const IconField = ({ name, label, icon: Icon, form, errors, onChange, type, placeholder }) => (
  <FormField label={label} required error={errors[name]}>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type={type} value={form[name]} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} className={`${inputClass(errors[name])} pl-10`} />
    </div>
  </FormField>
)

export const CheckoutSection = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="mb-4 font-bold text-secondary">{title}</h2>
    {children}
  </section>
)

const CheckoutAddress = ({ user, form, errors, updateField, onOpenAddresses }) => (
  <>
    <CheckoutSection title="Thông tin khách hàng">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 text-sm sm:border-r sm:border-slate-100 sm:pr-4">
          <p className="font-semibold text-secondary">{user?.fullName}</p>
          <p className="text-slate-600">{user?.phone || 'Chưa có số điện thoại'}</p>
        </div>
        <IconField name="email" label="Email" icon={FiMail} type="email" placeholder="email@example.com" form={form} errors={errors} onChange={updateField} />
      </div>
    </CheckoutSection>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-secondary">Địa chỉ giao hàng</h2>
        <button type="button" onClick={onOpenAddresses} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/25 px-3 text-xs font-semibold text-primary transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <FiMapPin aria-hidden="true" /> Chọn từ sổ địa chỉ
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <IconField name="fullName" label="Tên người nhận" icon={FiUser} placeholder="Nhập họ và tên" form={form} errors={errors} onChange={updateField} />
        <IconField name="phone" label="Số điện thoại người nhận" icon={FiPhone} type="tel" placeholder="Nhập số điện thoại" form={form} errors={errors} onChange={updateField} />
        <FormField label="Tỉnh/Thành phố" required error={errors.province}>
          <input value={form.province} onChange={event => updateField('province', event.target.value)} autoComplete="address-level1" placeholder="Nhập Tỉnh/Thành phố" className={inputClass(errors.province)} />
        </FormField>
        <FormField label="Quận/Huyện" required error={errors.district}>
          <input value={form.district} onChange={event => updateField('district', event.target.value)} autoComplete="address-level2" placeholder="Nhập Quận/Huyện" className={inputClass(errors.district)} />
        </FormField>
        <FormField label="Phường/Xã" required error={errors.ward}>
          <input value={form.ward} onChange={event => updateField('ward', event.target.value)} autoComplete="address-level3" placeholder="Nhập Phường/Xã" className={inputClass(errors.ward)} />
        </FormField>
        <IconField name="addressLine" label="Địa chỉ nhà" icon={FiHome} placeholder="Số nhà, tên đường" form={form} errors={errors} onChange={updateField} />
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-600 sm:col-span-2">
          <input type="checkbox" checked={form.saveAddress} onChange={event => updateField('saveAddress', event.target.checked)} className="h-4 w-4 accent-primary" />
          Ghi nhớ địa chỉ để tự điền cho lần mua kế tiếp
        </label>
        <div className="sm:col-span-2">
          <FormField label="Ghi chú (nếu có)">
            <textarea rows="2" value={form.note} onChange={event => updateField('note', event.target.value)} placeholder="Nhập ghi chú giao hàng" className={`${inputClass(false)} resize-y`} />
          </FormField>
        </div>
      </div>
    </section>
  </>
)

export default CheckoutAddress
