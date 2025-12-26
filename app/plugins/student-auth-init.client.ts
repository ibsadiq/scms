// plugins/student-auth-init.client.ts
/**
 * This plugin initializes student authentication state from localStorage
 * It runs early in the app lifecycle to ensure auth state is ready before middleware
 */
export default defineNuxtPlugin({
  name: 'student-auth-init',
  enforce: 'pre', // Run before other plugins
  setup() {
    // Only run on client-side
    if (process.server) return

    const studentToken = useCookie('student_auth_token')
    const studentData = useState<any>('student_data')

    console.log('🔄 [student-auth-init] Plugin running...')
    console.log('🔄 [student-auth-init] Token exists:', !!studentToken.value)
    console.log('🔄 [student-auth-init] Current studentData:', studentData.value)

    // Only load from localStorage if student token exists and data is not already loaded
    if (studentToken.value && !studentData.value) {
      try {
        console.log('🔄 [student-auth-init] Attempting to load from localStorage...')
        const cached = localStorage.getItem('student_data')
        console.log('🔄 [student-auth-init] localStorage data:', cached ? 'found' : 'not found')

        if (cached) {
          const parsed = JSON.parse(cached)
          studentData.value = parsed
          console.log('✅ [student-auth-init] Student data loaded:', parsed?.first_name)
        } else {
          console.log('⚠️ [student-auth-init] No student data in localStorage, but token exists')
          // Token exists but no data - this might mean localStorage was cleared
          // The user will need to login again
        }
      } catch (error) {
        console.error('❌ [student-auth-init] Error loading student data from localStorage:', error)
      }
    } else if (!studentToken.value) {
      console.log('ℹ️ [student-auth-init] No student token found')
    } else if (studentData.value) {
      console.log('ℹ️ [student-auth-init] Student data already loaded:', studentData.value?.first_name)
    }
  }
})
