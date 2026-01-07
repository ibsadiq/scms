// composables/teacher/useProfile.ts
import type { Teacher, User } from '~~/types'
import { useAuth } from '~~/composables/useAuth'
import { useApi } from '~~/composables/useApi'

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
  const { apiCall } = useApi()
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

    // Fetch user profile to get teacher_id
    const { data: userData, error: userError } = await apiCall<User>('/users/profile/', {
      method: 'GET'
    })

    if (userError || !userData) {
      loading.value = false
      error.value = userError?.message || 'Failed to load profile'
      console.error('Failed to fetch teacher profile:', userError)
      return { success: false, error: error.value }
    }

    // If the user is a teacher, fetch their complete teacher profile
    if (userData.isTeacher && userData.teacher_id) {
      const { data: teacherData, error: teacherError } = await apiCall<TeacherProfile>(`/users/teachers/${userData.teacher_id}/`, {
        method: 'GET'
      })

      loading.value = false

      if (teacherError || !teacherData) {
        error.value = teacherError?.message || 'Failed to load teacher details'
        console.error('Failed to fetch teacher details:', teacherError)
        return { success: false, error: error.value }
      }

      profile.value = teacherData
      return { success: true, data: teacherData }
    } else {
      // Fallback to user data
      loading.value = false
      profile.value = userData as any
      return { success: true, data: userData as any }
    }
  }

  /**
   * Update teacher profile
   */
  const updateProfile = async (data: UpdateTeacherProfileData) => {
    loading.value = true
    error.value = null

    if (!user.value?.teacher_id) {
      loading.value = false
      error.value = 'Teacher ID not found'
      return { success: false, error: error.value }
    }

    const { data: responseData, error: apiError } = await apiCall<TeacherProfile>(`/users/teachers/${user.value.teacher_id}/`, {
      method: 'PATCH',
      body: data
    })

    loading.value = false

    if (apiError || !responseData) {
      error.value = apiError?.message || 'Failed to update profile'
      console.error('Failed to update teacher profile:', apiError)
      return { success: false, error: error.value }
    }

    profile.value = responseData
    return { success: true, data: responseData, message: 'Profile updated successfully' }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  }
}
