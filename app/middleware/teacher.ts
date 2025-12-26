// middleware/teacher.ts
import { useAuth } from '~~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()

  console.log('🔷 TEACHER MIDDLEWARE:', {
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    isAdmin: user.value?.isAdmin,
    isTeacher: user.value?.isTeacher,
    isParent: user.value?.isParent,
  })

  // First check if user is authenticated
  if (!isAuthenticated.value) {
    console.log('🔷 TEACHER MIDDLEWARE: Not authenticated, redirecting to login')
    return navigateTo('/login', { replace: true })
  }

  // Allow access if user has teacher role (even if they have other roles too)
  if (user.value?.isTeacher) {
    console.log('🔷 TEACHER MIDDLEWARE: User has teacher role, allowing access')
    return // Allow access
  }

  // User doesn't have teacher role, redirect to their appropriate dashboard
  console.log('🔷 TEACHER MIDDLEWARE: User does not have teacher role, redirecting')
  if (user.value?.isAdmin) {
    return navigateTo('/admin', { replace: true })
  } else if (user.value?.isParent) {
    return navigateTo('/parent', { replace: true })
  } else {
    return navigateTo('/', { replace: true })
  }
})
