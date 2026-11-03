import { useState } from 'react'
import SideDrawer from '../common/SideDrawer'
import ChangePasswordForm from './ChangePasswordForm'

const PasswordChangeDrawer = ({ onClose, onSuccess }) => {
  const [busy, setBusy] = useState(false)
  return <SideDrawer title="Đổi mật khẩu" onClose={onClose} busy={busy}>
    <ChangePasswordForm drawer onBusyChange={setBusy} onSuccess={onSuccess} />
  </SideDrawer>
}

export default PasswordChangeDrawer
