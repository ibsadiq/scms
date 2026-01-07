// composables/teacher/useProfile.ts
import type { Teacher } from '~~/types'

export interface TeacherProfile extends Teacher {
  full_name?: string
  age?: number
}

export interface UpdateTeacherProfileData {
  phone_number?: string
  email?: string
  alt_email?: string
  address?: string
}

export const useTeacherProfile = () => {
  const { $api } = useNuxtApp()
  const { user } = useAuth()

  const profile = ref<TeacherProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch teacher profile from user data
   */
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      // Since teacher data is already in the user object, we can use it directly
      // But we'll also fetch the full profile from the API for complete data
      const response = await $api<User>('/users/profile/', {
        method: 'GET'
      })

      // If the user is a teacher, fetch their complete teacher profile
      if (response.isTeacher && response.teacher_id) {
        const teacherData = await $api<TeacherProfile>(`/users/teachers/${response.teacher_id}/`, {
          method: 'GET'
        })
        profile.value = teacherData
      } else {
        // Fallback to user data
        profile.value = response as any
      }

      return { success: true, data: profile.value }
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      console.error('Failed to fetch teacher profile:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update teacher profile
   */
  const updateProfile = async (data: UpdateTeacherProfileData) => {
    loading.value = true
    error.value = null

    try {
      if (!user.value?.teacher_id) {
        throw new Error('Teacher ID not found')
      }

      const response = await $api<TeacherProfile>(`/users/teachers/${user.value.teacher_id}/`, {
        method: 'PATCH',
        body: data
      })

      profile.value = response
      return { success: true, data: response, message: 'Profile updated successfully' }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      console.error('Failed to update teacher profile:', err)
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
