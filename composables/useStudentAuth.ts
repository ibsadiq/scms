// composables/useStudentAuth.ts
import type {
  StudentLoginCredentials,
  StudentRegistrationData,
  StudentChangePasswordData,
  StudentAuthResponse
} from '~~/types'

export const useStudentAuth = () => {
  const config = useRuntimeConfig()

  const token = useCookie('student_auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  const refreshToken = useCookie('student_refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  // Initialize student data state (loaded by student-auth-init.client.ts plugin)
  const studentData = useState<StudentAuthResponse['student'] | null>('student_data', () => null)

  const isStudentAuthenticated = computed(() => !!token.value && !!studentData.value)

  // Watch student data changes and persist to localStorage
  if (process.client) {
    watch(studentData, (newData) => {
      if (newData) {
        try {
          localStorage.setItem('student_data', JSON.stringify(newData))
        } catch {
          // Ignore localStorage errors
        }
      } else {
        try {
          localStorage.removeItem('student_data')
        } catch {
          // Ignore localStorage errors
        }
      }
    }, { deep: true })
  }

  /**
   * Student Registration
   */
  const register = async (registrationData: StudentRegistrationData) => {
    try {
      const response = await $fetch<StudentAuthResponse>(
        `${config.public.apiBase}/academic/students/auth/register/`,
        {
          method: 'POST',
          body: registrationData,
        }
      )

      console.log('📝 STUDENT REGISTER: Response received:', response)

      // Set tokens
      token.value = response.access
      refreshToken.value = response.refresh

      // Set student data
      studentData.value = response.student

      // Explicitly save to localStorage (in addition to watcher)
      if (process.client) {
        try {
          localStorage.setItem('student_data', JSON.stringify(response.student))
          console.log('📝 STUDENT REGISTER: Student data saved to localStorage')
        } catch (error) {
          console.error('📝 STUDENT REGISTER: Failed to save to localStorage:', error)
        }
      }

      console.log('📝 STUDENT REGISTER: Student data set:', studentData.value)

      return {
        success: true,
        student: response.student,
        message: 'Registration successful! Welcome to the student portal.'
      }
    } catch (error: any) {
      console.error('📝 STUDENT REGISTER: Registration failed:', error)

      // Handle validation errors
      if (error.data) {
        const errorMessages: string[] = []

        if (error.data.phone_number) {
          errorMessages.push(...error.data.phone_number)
        }
        if (error.data.password) {
          errorMessages.push(...error.data.password)
        }
        if (error.data.password_confirm) {
          errorMessages.push(...error.data.password_confirm)
        }
        if (error.data.admission_number) {
          errorMessages.push(...error.data.admission_number)
        }
        if (error.data.detail) {
          errorMessages.push(error.data.detail)
        }

        return {
          success: false,
          error: errorMessages.length > 0 ? errorMessages.join(', ') : 'Registration failed. Please check your information.'
        }
      }

      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    }
  }

  /**
   * Student Login
   */
  const login = async (credentials: StudentLoginCredentials) => {
    try {
      const response = await $fetch<StudentAuthResponse>(
        `${config.public.apiBase}/academic/students/auth/login/`,
        {
          method: 'POST',
          body: credentials,
        }
      )

      console.log('🔐 STUDENT LOGIN: Response received:', response)

      // Set tokens
      token.value = response.access
      refreshToken.value = response.refresh

      // Set student data
      studentData.value = response.student

      // Explicitly save to localStorage (in addition to watcher)
      if (process.client) {
        try {
          localStorage.setItem('student_data', JSON.stringify(response.student))
          console.log('🔐 STUDENT LOGIN: Student data saved to localStorage')
        } catch (error) {
          console.error('🔐 STUDENT LOGIN: Failed to save to localStorage:', error)
        }
      }

      console.log('🔐 STUDENT LOGIN: Student data set:', studentData.value)

      return {
        success: true,
        student: response.student,
        message: 'Login successful! Welcome back.'
      }
    } catch (error: any) {
      console.error('🔐 STUDENT LOGIN: Login failed:', error)

      return {
        success: false,
        error: error.data?.detail || error.data?.non_field_errors?.[0] || 'Invalid phone number or password'
      }
    }
  }

  /**
   * Student Logout
   */
  const logout = async () => {
    try {
      // Clear the token cookies
      token.value = null
      refreshToken.value = null

      // Clear the student data state
      studentData.value = null

      // Navigate to login page
      await navigateTo('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      // Force navigation even if there's an error
      window.location.href = '/login'
    }
  }

  /**
   * Refresh Access Token
   */
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      console.log('🔐 No refresh token available, logging out...')
      await logout()
      return false
    }

    try {
      console.log('🔄 Refreshing student access token...')
      const response = await $fetch<{ access: string }>(
        `${config.public.apiBase}/token/refresh/`,
        {
          method: 'POST',
          body: { refresh: refreshToken.value },
        }
      )

      token.value = response.access
      console.log('✅ Student access token refreshed successfully')
      return true
    } catch (error) {
      console.log('❌ Student token refresh failed, logging out...', error)
      await logout()
      return false
    }
  }

  /**
   * Change Password
   */
  const changePassword = async (passwordData: StudentChangePasswordData) => {
    if (!token.value) {
      return {
        success: false,
        error: 'You must be logged in to change your password'
      }
    }

    try {
      const response = await $fetch(
        `${config.public.apiBase}/academic/students/auth/change-password/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
          body: passwordData,
        }
      )

      console.log('🔒 PASSWORD CHANGE: Success')

      return {
        success: true,
        message: 'Password changed successfully!'
      }
    } catch (error: any) {
      console.error('🔒 PASSWORD CHANGE: Failed:', error)

      // Handle validation errors
      if (error.data) {
        const errorMessages: string[] = []

        if (error.data.old_password) {
          errorMessages.push(...error.data.old_password)
        }
        if (error.data.new_password) {
          errorMessages.push(...error.data.new_password)
        }
        if (error.data.new_password_confirm) {
          errorMessages.push(...error.data.new_password_confirm)
        }
        if (error.data.detail) {
          errorMessages.push(error.data.detail)
        }

        return {
          success: false,
          error: errorMessages.length > 0 ? errorMessages.join(', ') : 'Password change failed'
        }
      }

      return {
        success: false,
        error: error.message || 'Password change failed. Please try again.'
      }
    }
  }

  return {
    token,
    refreshToken,
    studentData,
    isStudentAuthenticated,
    register,
    login,
    logout,
    changePassword,
    refreshAccessToken,
  }
}
