// Dữ liệu chỉ dùng để trình bày giao diện Admin khi chưa có xác thực Backend.
// Sau này AdminLayout nhận admin hiện tại từ AdminAuthContext/service thay cho object này.
export const mockAdminUser = {
  id: 'admin-preview',
  fullName: 'Quản trị viên',
  role: 'admin',
  roleLabel: 'Admin TLUPhone',
  avatarUrl: '',
}
