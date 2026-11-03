import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout'
import ChangePasswordForm from '../components/auth/ChangePasswordForm'
import { useAuth } from '../context/AuthContext'

const ChangePasswordPage = () => {
  const { user } = useAuth()
  return <AuthLayout title="Đổi mật khẩu" subtitle="Cập nhật mật khẩu cho tài khoản đang đăng nhập.">
    <ChangePasswordForm />
    <Link to={user?.role === 'admin' ? '/admin' : '/profile'} className="mt-6 block text-center text-sm font-semibold text-primary">Quay lại tài khoản</Link>
  </AuthLayout>
}

export default ChangePasswordPage
