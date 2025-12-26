// plugins/student-api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Create a custom $fetch instance for student API calls
  const studentApi = async <T = any>(url: string, options: any = {}) => {
    const { useStudentAuth } = await import('~~/composables/useStudentAuth')
    const { token, refreshAccessToken } = useStudentAuth()

    // Prepare request options
    const requestOptions = {
      ...options,
      baseURL: config.public.apiBase,
      headers: {
        ...options.headers,
      },
    }

    // Add auth token if available
    if (token.value) {
      requestOptions.headers.Authorization = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(url, requestOptions)
    } catch (error: any) {
      // Handle 401 errors - try to refresh token
      if (error.response?.status === 401 && !requestOptions.headers['X-Retry-Request']) {
        const refreshed = await refreshAccessToken()

        if (refreshed && token.value) {
          // Retry the request with new token
          const retryOptions = {
            ...requestOptions,
            headers: {
              ...requestOptions.headers,
              Authorization: `Bearer ${token.value}`,
              'X-Retry-Request': 'true', // Prevent infinite retry loop
            },
          }

          return await $fetch<T>(url, retryOptions)
        }
      }

      // Re-throw the error if not handled
      throw error
    }
  }

  return {
    provide: {
      api: studentApi,
    },
  }
})
