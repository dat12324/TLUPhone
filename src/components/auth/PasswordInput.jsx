import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const PasswordInput = ({ id, label, error, ...inputProps }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:ring-2 focus:ring-primary/15 ${
            error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-primary'
          }`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary"
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {isVisible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default PasswordInput

