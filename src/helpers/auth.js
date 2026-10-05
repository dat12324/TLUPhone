export const normalizePhone = (value = '') => {
  const compactPhone = value.replace(/[\s.-]/g, '')

  if (compactPhone.startsWith('+84')) return `0${compactPhone.slice(3)}`
  if (compactPhone.startsWith('84')) return `0${compactPhone.slice(2)}`
  return compactPhone
}

export const isValidPhone = (value) => {
  const phone = normalizePhone(value)
  return /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/.test(phone)
}

export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export const buildDateOfBirth = (day, month, year) => {
  if (!day || !month || !year) return ''

  const numericDay = Number(day)
  const numericMonth = Number(month)
  const numericYear = Number(year)
  const date = new Date(numericYear, numericMonth - 1, numericDay)

  const isRealDate =
    date.getFullYear() === numericYear &&
    date.getMonth() === numericMonth - 1 &&
    date.getDate() === numericDay

  if (!isRealDate) return ''

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date > today) return ''

  return `${numericYear}-${String(numericMonth).padStart(2, '0')}-${String(numericDay).padStart(2, '0')}`
}
