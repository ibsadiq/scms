// composables/student/useProfile.ts
import type { Student } from '~~/types'

export interface StudentProfile extends Student {
  full_name?: string
  age?: number
}

export interface UpdateProfileData {
  phone_number?: string
  email?: string
  preferred_stream?: 'science' | 'arts' | 'commercial'
}

export const useStudentProfile = () => {
  const { $api } = useNuxtApp()

  const profile = ref<StudentProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch student profile
   */
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<StudentProfile>('/academic/students/portal/profile/', {
        method: 'GET'
      })

      profile.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      console.error('Failed to fetch student profile:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update student profile
   */
  const updateProfile = async (data: UpdateProfileData) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<StudentProfile>('/academic/students/portal/update-profile/', {
        method: 'PUT',
        body: data
      })

      profile.value = response
      return { success: true, data: response, message: 'Profile updated successfully' }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      console.error('Failed to update student profile:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  }
}
