export const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh đã chọn.'))
  reader.readAsDataURL(file)
})
