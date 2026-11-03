import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { mapAuthUser } from '../helpers/auth.js'
import api, { refreshSession, setAccessToken } from '../lib/api.js'

const AuthContext = createContext(null)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const version = useRef(0)

  useEffect(() => {
    let active = true
    const currentVersion = version.current
    const restore = async () => {
      try {
        await refreshSession()
        const { data: result } = await api.get('/users/getProfile')
        if (active && currentVersion === version.current) setUser(mapAuthUser(result.user))
      } catch (error) {
        if (active && currentVersion === version.current) {
          setAccessToken(null)
          if (error.status !== 401 && error.status !== 403) setAuthError(error.message)
        }
      } finally {
        if (active) setAuthLoading(false)
      }
    }
    void restore()
    return () => { active = false }
  }, [])

  const login = useCallback(async ({ email, password }, remember = false) => {
    const currentVersion = ++version.current
    try {
      const { data: result } = await api.post('/auth/login', { email: email.trim(), password, remember }, { skipAuth: true })
      if (currentVersion !== version.current) return { success: false, message: 'Yêu cầu đăng nhập đã bị hủy.' }
      setAccessToken(result.accessToken)
      const safeUser = mapAuthUser(result.user)
      setUser(safeUser)
      setAuthError('')
      return { success: true, user: safeUser }
    } catch (error) { return { success: false, message: error.message } }
  }, [])

  const googleLogin = useCallback(async (credential, remember = false) => {
    const currentVersion = ++version.current
    try {
      const { data: result } = await api.post('/auth/google', { credential, remember }, { skipAuth: true })
      if (currentVersion !== version.current) return { success: false, message: 'Yêu cầu đăng nhập đã bị hủy.' }
      setAccessToken(result.accessToken)
      const safeUser = mapAuthUser(result.user)
      setUser(safeUser)
      setAuthError('')
      return { success: true, user: safeUser }
    } catch (error) { return { success: false, message: error.message } }
  }, [])

  const register = useCallback(async payload => {
    try {
      const { fullName, email, phone, dateOfBirth, password, confirmPassword } = payload
      const { data: result } = await api.post('/auth/register', {
        fullName, email: email.trim(), password, confirmPassword,
        ...(phone ? { phoneNumber: phone } : {}), ...(dateOfBirth ? { dateOfBirth } : {}),
      }, { skipAuth: true })
      return { success: true, user: mapAuthUser(result.user) }
    } catch (error) { return { success: false, message: error.message } }
  }, [])

  const logout = useCallback(async () => {
    version.current += 1
    setAccessToken(null)
    setUser(null)
    setAuthError('')
    try {
      await api.post('/auth/logout', undefined, { skipAuth: true })
      return { success: true }
    } catch (error) { return { success: false, message: error.message } }
  }, [])

  const refreshUser = useCallback(async () => {
    const currentVersion = version.current
    const { data: result } = await api.get('/users/getProfile')
    const safeUser = mapAuthUser(result.user)
    if (currentVersion === version.current) setUser(safeUser)
    return safeUser
  }, [])

  const updateProfile = useCallback(async (data, avatarFile) => {
    const currentVersion = version.current
    let profileSaved = false
    try {
      const { fullName, phoneNumber, dateOfBirth, gender } = data
      const { data: result } = await api.patch('/users/updateProfile', {
        fullName, phoneNumber, dateOfBirth: dateOfBirth || null, gender: gender || null,
      })
      if (currentVersion !== version.current) return { success: false, message: 'Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.' }
      setUser(current => current ? mapAuthUser({ ...current, ...result.user }) : null)
      profileSaved = true
      if (avatarFile) {
        const body = new FormData()
        body.append('image', avatarFile)
        const { data: uploaded } = await api.patch('/users/avatar', body)
        if (currentVersion !== version.current) return { success: false, message: 'Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.' }
        setUser(current => current ? mapAuthUser({ ...current, ...uploaded.user }) : null)
        if (uploaded.warning) return { success: true, message: uploaded.warning }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: profileSaved
        ? `Thông tin cá nhân đã lưu, nhưng chưa cập nhật được ảnh đại diện. ${error.message}`
        : error.message }
    }
  }, [])


  const value = useMemo(() => ({ user, authLoading, authError, isAuthenticated: Boolean(user),
    login, googleLogin, register, logout, refreshUser, updateProfile }), [user, authLoading, authError, login, googleLogin, register, logout, refreshUser, updateProfile])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  return context
}
