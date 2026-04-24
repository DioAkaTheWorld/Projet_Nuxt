export const useAuth = () => {
  const user = useCookie('auth_user')

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null 
    navigateTo('/')   
  }

  return { user, logout }
}