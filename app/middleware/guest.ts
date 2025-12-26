// middleware/guest.ts
import { useAuth } from '~~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, user } = useAuth()

  console.log('🟢 GUEST MIDDLEWARE:', {
    to: to.path,
    from: from.path,
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    isAdmin: user.value?.isAdmin,
    isTeacher: user.value?.isTeacher,
    isParent: user.value?.isParent,
  })

  // If authenticated and trying to access guest-only page, redirect to appropriate dashboard
  if (isAuthenticated.value) {
    console.log('🟢 GUEST MIDDLEWARE: User is authenticated, redirecting to dashboard')
    if (user.value?.isAdmin) {
      console.log('🟢 GUEST MIDDLEWARE: Redirecting to /admin')
      return navigateTo('/admin', { replace: true })
    } else if (user.value?.isTeacher) {
      console.log('🟢 GUEST MIDDLEWARE: Redirecting to /teacher')
      return navigateTo('/teacher', { replace: true })
    } else if (user.value?.isParent) {
      console.log('🟢 GUEST MIDDLEWARE: Redirecting to /parent')
      return navigateTo('/parent', { replace: true })
    } else {
      console.log('🟢 GUEST MIDDLEWARE: No role found, redirecting to /')
      return navigateTo('/', { replace: true })
    }
  }
})