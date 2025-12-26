// plugins/token-refresh.client.ts
import { useAuth } from '~~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { token, refreshAccessToken, isAuthenticated } = useAuth()

  // Check if we need to refresh the token periodically
  if (process.client && isAuthenticated.value) {
    // Refresh token every 20 hours (before 1-day expiry)
    const refreshInterval = setInterval(async () => {
      if (token.value) {
        await refreshAccessToken()
      } else {
        // If no token, clear the interval
        clearInterval(refreshInterval)
      }
    }, 20 * 60 * 60 * 1000) // 20 hours

    // Clear interval when the app is destroyed
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(refreshInterval)
      })
    }
  }
})
