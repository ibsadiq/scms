// middleware/auth.global.ts
import { useAuth } from '~~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, user } = useAuth()
  const config = useRuntimeConfig()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/test-mobile', '/onboarding', '/accept-invitation']

  // Check if the route is public (exact match or starts with)
  const isPublicRoute = publicRoutes.some(route =>
    to.path === route || to.path.startsWith(route)
  )

  // Skip middleware onboarding check for root path - homepage handles it
  // This prevents "useOnboarding is not defined" error in middleware context
  // For all other routes, we rely on backend middleware to enforce onboarding
  if (to.path === '/') {
    console.log('🏠 [MIDDLEWARE] Root path - letting homepage handle onboarding check')
    return
  }

  // If trying to access protected route without auth, redirect to login
  if (!isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/login', { replace: true })
  }

  // If authenticated and trying to access login page, redirect to appropriate dashboard
  if (isAuthenticated.value && to.path === '/login') {
    // Redirect based on user role
    if (user.value?.isAdmin) {
      return navigateTo('/admin', { replace: true })
    } else if (user.value?.isTeacher) {
      return navigateTo('/teacher', { replace: true })
    } else if (user.value?.isParent) {
      return navigateTo('/parent', { replace: true })
    } else {
      return navigateTo('/', { replace: true })
    }
  }
})