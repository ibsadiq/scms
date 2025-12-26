// composables/useAuth.ts
import type { LoginCredentials, User } from '~~/types'

export const useAuth = () => {
  const config = useRuntimeConfig()

  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  const refreshToken = useCookie('refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  // Initialize user from localStorage if available
  const user = useState<User | null>('user', () => {
    if (process.server) return null

    try {
      const cached = localStorage.getItem('user_data')
      if (cached) {
        return JSON.parse(cached)
      }
    } catch {
      // Ignore errors
    }
    return null
  })

  const isAuthenticated = computed(() => !!token.value)

  // Watch user changes and persist to localStorage
  if (process.client) {
    watch(user, (newUser) => {
      if (newUser) {
        try {
          localStorage.setItem('user_data', JSON.stringify(newUser))
        } catch {
          // Ignore localStorage errors
        }
      } else {
        try {
          localStorage.removeItem('user_data')
        } catch {
          // Ignore localStorage errors
        }
      }
    }, { deep: true })
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await $fetch<User & { access: string; refresh: string }>(
        `${config.public.apiBase}/users/login/`,
        {
          method: 'POST',
          body: credentials,
        }
      )

      console.log('🔐 LOGIN COMPOSABLE: Response received:', response)

      token.value = response.access
      refreshToken.value = response.refresh

      // Extract user data from response (all fields except access and refresh)
      const { access, refresh, ...userData } = response
      user.value = userData as User

      console.log('🔐 LOGIN COMPOSABLE: User set to:', user.value)
      console.log('🔐 LOGIN COMPOSABLE: Token set to:', token.value ? 'EXISTS' : 'NULL')

      return { success: true, user: userData as User }
    } catch (error: any) {
      console.error('🔐 LOGIN COMPOSABLE: Login failed:', error)
      return {
        success: false,
        error: error.data?.detail || 'Login failed'
      }
    }
  }

  const logout = async () => {
    try {
      // Clear the token cookies
      token.value = null
      refreshToken.value = null

      // Clear the user state
      user.value = null

      // Navigate to login page
      await navigateTo('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      // Force navigation even if there's an error
      window.location.href = '/login'
    }
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      console.log('🔐 No refresh token available, logging out...')
      await logout()
      return false
    }

    try {
      console.log('🔄 Refreshing access token...')
      const response = await $fetch<{ access: string }>(
        `${config.public.apiBase}/token/refresh/`,
        {
          method: 'POST',
          body: { refresh: refreshToken.value },
        }
      )

      token.value = response.access
      console.log('✅ Access token refreshed successfully')
      return true
    } catch (error) {
      console.log('❌ Token refresh failed, logging out...', error)
      await logout()
      return false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await $fetch<User>(
        `${config.public.apiBase}/users/profile/`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        }
      )
      user.value = response
    } catch (error) {
      await logout()
    }
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    refreshAccessToken,
  }
}