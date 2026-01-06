// composables/useApi.ts
import { useAuth } from './useAuth'

export const useApi = () => {
  const config = useRuntimeConfig()

  const apiCall = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: any
      query?: any
      _retry?: boolean
    } = {}
  ) => {
    try {
      const { token } = useAuth()

      const response = await $fetch<T>(
        `${config.public.apiBase}${endpoint}`,
        {
          method: options.method || 'GET',
          headers: {
            ...(token.value && { Authorization: `Bearer ${token.value}` }),
          },
          body: options.body,
          query: options.query,
        }
      )

      return { data: response, error: null }
    } catch (error: any) {
      if (error.status === 401 && !options._retry) {
        const { refreshAccessToken } = useAuth()
        const refreshed = await refreshAccessToken()

        if (refreshed) {
          return await apiCall<T>(endpoint, { ...options, _retry: true })
        }
      }

      return {
        data: null,
        error: error
      }
    }
  }

  return { apiCall }
}
