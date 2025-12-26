// middleware/parent.ts
import { useAuth } from '~~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()

  console.log('🟣 PARENT MIDDLEWARE:', {
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    isAdmin: user.value?.isAdmin,
    isTeacher: user.value?.isTeacher,
    isParent: user.value?.isParent,
  })

  // First check if user is authenticated
  if (!isAuthenticated.value) {
    console.log('🟣 PARENT MIDDLEWARE: Not authenticated, redirecting to login')
    return navigateTo('/login', { replace: true })
  }

  // Allow access if user has parent role (even if they have other roles too)
  if (user.value?.isParent) {
    console.log('🟣 PARENT MIDDLEWARE: User has parent role, allowing access')
    return // Allow access
  }

  // User doesn't have parent role, redirect to their appropriate dashboard
  console.log('🟣 PARENT MIDDLEWARE: User does not have parent role, redirecting')
  if (user.value?.isAdmin) {
    return navigateTo('/admin', { replace: true })
  } else if (user.value?.isTeacher) {
    return navigateTo('/teacher', { replace: true })
  } else {
    return navigateTo('/', { replace: true })
  }
})
