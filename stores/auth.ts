// stores/auth.ts
import { defineStore } from 'pinia'
import type { User } from '~~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = useCookie('auth_token')
  const refreshToken = useCookie('refresh_token')

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)
  const isTeacher = computed(() => user.value?.isTeacher ?? false)
  const isAccountant = computed(() => user.value?.isAccountant ?? false)
  const isParent = computed(() => user.value?.isParent ?? false)
  const isStudent = computed(() => user.value?.isStudent ?? false)

  const accessToken = computed(() => token.value)

  const setUser = (userData: User) => {
    user.value = userData
  }

  const setToken = (tokenValue: string) => {
    token.value = tokenValue
  }

  const setTokens = (accessToken: string, refreshTokenValue: string) => {
    token.value = accessToken
    refreshToken.value = refreshTokenValue
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
  }

  return {
    user,
    token,
    refreshToken,
    accessToken,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isAccountant,
    isParent,
    isStudent,
    setUser,
    setToken,
    setTokens,
    clearAuth,
  }
})