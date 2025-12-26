// middleware/student.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip authentication check on server-side
  if (process.server) {
    console.log('🛡️ STUDENT MIDDLEWARE: Skipping on server-side')
    return
  }

  const { useStudentAuth } = await import('~~/composables/useStudentAuth')
  const { isStudentAuthenticated, studentData, token } = useStudentAuth()

  console.log('🛡️ STUDENT MIDDLEWARE: Checking auth for:', to.path)
  console.log('🛡️ STUDENT MIDDLEWARE: Token exists:', !!token.value)
  console.log('🛡️ STUDENT MIDDLEWARE: Student data exists:', !!studentData.value)
  console.log('🛡️ STUDENT MIDDLEWARE: Student data:', studentData.value)
  console.log('🛡️ STUDENT MIDDLEWARE: Is authenticated:', isStudentAuthenticated.value)

  // If not authenticated and trying to access protected student pages
  if (!isStudentAuthenticated.value) {
    // Allow access to login and register pages
    if (to.path === '/login' || to.path === '/student/register') {
      return
    }

    console.log('🛡️ STUDENT MIDDLEWARE: Not authenticated, redirecting to login')
    return navigateTo('/login')
  }

  console.log('🛡️ STUDENT MIDDLEWARE: Authentication successful, allowing access')
})
