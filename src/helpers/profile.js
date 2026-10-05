const ADDRESSES_STORAGE_KEY = 'tluphone_profile_addresses'

const readAddressBook = () => {
  try {
    const saved = localStorage.getItem(ADDRESSES_STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export const getAddresses = (phone) => {
  const addressBook = readAddressBook()
  return Array.isArray(addressBook[phone]) ? addressBook[phone] : []
}

export const saveAddresses = (phone, addresses) => {
  const addressBook = readAddressBook()
  addressBook[phone] = addresses
  localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addressBook))
}

