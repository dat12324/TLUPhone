import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { normalizePhone } from '../helpers/auth'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'tluphone_auth_user'
const AUTH_SESSION_KEY = 'tluphone_auth_session'
const PROFILE_STORAGE_KEY = 'tluphone_mock_profile'

const readStoredJson = (storage, key) => {
  try {
    const value = storage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const createSafeUser = ({ fullName, phone, email = '', dateOfBirth = '', avatar = '', authProvider = 'phone' }) => ({
  fullName: fullName?.trim() || 'Khách hàng',
  phone: normalizePhone(phone),
  email: (email || '').trim(),
  dateOfBirth,
  avatar: avatar || '',
  authProvider,
})

const readStoredProfiles = () => {
  const storedProfiles = readStoredJson(localStorage, PROFILE_STORAGE_KEY)
  if (!storedProfiles) return []
  return Array.isArray(storedProfiles) ? storedProfiles : [storedProfiles]
}

const findProfileByPhone = (phone) => {
  const normalizedPhone = normalizePhone(phone)
  return readStoredProfiles().find(
    (profile) => normalizePhone(profile.phone) === normalizedPhone
  )
}

const readInitialUser = () => {
  const storedUser =
    readStoredJson(localStorage, AUTH_STORAGE_KEY) ||
    readStoredJson(sessionStorage, AUTH_SESSION_KEY)

  if (!storedUser) return null

  const matchingProfile = findProfileByPhone(storedUser.phone)
  if (matchingProfile) return createSafeUser(matchingProfile)

  // Loại bỏ phiên mock cũ từng được tạo mà không có hồ sơ đăng ký tương ứng.
  if (storedUser.fullName === 'Khách hàng') {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }

  return createSafeUser(storedUser)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readInitialUser)

  useEffect(() => {
    if (!user?.phone) return

    const matchingProfile = findProfileByPhone(user.phone)
    if (!matchingProfile) {
      if (user.fullName === 'Khách hàng') {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        sessionStorage.removeItem(AUTH_SESSION_KEY)
        setUser(null)
      }
      return
    }

    if (!matchingProfile.fullName || matchingProfile.fullName === user.fullName) return

    const restoredUser = createSafeUser(matchingProfile)
    if (localStorage.getItem(AUTH_STORAGE_KEY)) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(restoredUser))
    }
    if (sessionStorage.getItem(AUTH_SESSION_KEY)) {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(restoredUser))
    }
    setUser(restoredUser)
  }, [user])

  const persistUser = useCallback((safeUser, remember = false) => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_SESSION_KEY)

    const storage = remember ? localStorage : sessionStorage
    const key = remember ? AUTH_STORAGE_KEY : AUTH_SESSION_KEY
    storage.setItem(key, JSON.stringify(safeUser))
    setUser(safeUser)
  }, [])

  const register = useCallback((payload) => {
    const safeUser = createSafeUser(payload)
    const otherProfiles = readStoredProfiles().filter(
      (profile) => normalizePhone(profile.phone) !== safeUser.phone
    )

    // Chỉ lưu hồ sơ an toàn phục vụ bản mock, tuyệt đối không lưu mật khẩu.
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify([safeUser, ...otherProfiles]))
    persistUser(safeUser, true)
    return { success: true, user: safeUser }
  }, [persistUser])

  const login = useCallback(({ phone }, remember = false) => {
    const normalizedPhone = normalizePhone(phone)
    const matchingProfile = findProfileByPhone(normalizedPhone)

    if (!matchingProfile) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản đăng ký bằng số điện thoại này.',
      }
    }

    const safeUser = createSafeUser(matchingProfile)

    persistUser(safeUser, remember)
    return { success: true, user: safeUser }
  }, [persistUser])

  const updateProfile = useCallback((updates) => {
    if (!user) return { success: false, message: 'Bạn chưa đăng nhập.' }

    const updatedUser = createSafeUser({
      ...user,
      ...updates,
      phone: user.phone,
    })
    const otherProfiles = readStoredProfiles().filter(
      (profile) => normalizePhone(profile.phone) !== updatedUser.phone
    )

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify([updatedUser, ...otherProfiles]))
    persistUser(updatedUser, Boolean(localStorage.getItem(AUTH_STORAGE_KEY)))
    return { success: true, user: updatedUser }
  }, [persistUser, user])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    updateProfile,
    logout,
  }), [user, login, register, updateProfile, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  }
  return context
}
