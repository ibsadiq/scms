// plugins/api-interceptor.ts
import { useAuth } from '~~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { token, refreshAccessToken } = useAuth()

  // Create a custom $fetch instance with interceptors
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,

    async onRequest({ options }) {
      // Add auth token to all requests
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`,
        }
      }
    },

    async onResponseError({ response, options }) {
      // Handle 401 errors - try to refresh token
      if (response.status === 401 && !options.headers?.['X-Retry-Request']) {
        const refreshed = await refreshAccessToken()

        if (refreshed) {
          // Retry the request with new token
          const retryOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token.value}`,
              'X-Retry-Request': 'true', // Prevent infinite retry loop
            },
          }

          // Retry the original request
          return $fetch(response.url, retryOptions)
        }
        // If refresh failed, user will be logged out by refreshAccessToken()
      }
    },
  })

  return {
    provide: {
      apiFetch,
    },
  }
})
