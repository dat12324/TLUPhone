// Translate the Backend Address DTO to existing form names; no browser storage.
export const mapAddress = address => ({
  id: address.id,
  receiverName: address.recipientName || '',
  phone: address.phoneNumber || '',
  province: address.city || '',
  district: address.district || '',
  ward: address.ward || '',
  detailAddress: address.streetAddress || '',
  isDefault: address.isDefault === true,
})

export const toAddressPayload = address => ({
  recipientName: address.receiverName.trim(),
  phoneNumber: address.phone.trim(),
  city: address.province.trim(),
  district: address.district.trim(),
  ward: address.ward.trim(),
  streetAddress: address.detailAddress.trim(),
  isDefault: address.isDefault === true,
})
