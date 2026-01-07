// composables/parent/useProfile.ts
import type { Parent, User } from '~~/types'
import { useAuth } from '~~/composables/useAuth'
import { useApi } from '~~/composables/useApi'

export interface ParentProfile extends Parent {
  full_name?: string
  age?: number
}

export interface UpdateParentProfileData {
  phone_number?: string
  email?: string
  alt_email?: string
  address?: string
  occupation?: string
  monthly_income?: number
}

export const useParentProfile = () => {
  const { apiCall } = useApi()
  const { user } = useAuth()

  const profile = ref<ParentProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch parent profile from user data
   */
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    // Fetch user profile to get parent_id
    const { data: userData, error: userError } = await apiCall<User>('/users/profile/', {
      method: 'GET'
    })

    if (userError || !userData) {
      loading.value = false
      error.value = userError?.message || 'Failed to load profile'
      console.error('Failed to fetch parent profile:', userError)
      return { success: false, error: error.value }
    }

    // If the user is a parent, fetch their complete parent profile
    if (userData.isParent && userData.parent_id) {
      const { data: parentData, error: parentError } = await apiCall<ParentProfile>(`/users/parents/${userData.parent_id}/`, {
        method: 'GET'
      })

      loading.value = false

      if (parentError || !parentData) {
        error.value = parentError?.message || 'Failed to load parent details'
        console.error('Failed to fetch parent details:', parentError)
        return { success: false, error: error.value }
      }

      profile.value = parentData
      return { success: true, data: parentData }
    } else {
      // Fallback to user data
      loading.value = false
      profile.value = userData as any
      return { success: true, data: userData as any }
    }
  }

  /**
   * Update parent profile
   */
  const updateProfile = async (data: UpdateParentProfileData) => {
    loading.value = true
    error.value = null

    if (!user.value?.parent_id) {
      loading.value = false
      error.value = 'Parent ID not found'
      return { success: false, error: error.value }
    }

    const { data: responseData, error: apiError } = await apiCall<ParentProfile>(`/users/parents/${user.value.parent_id}/`, {
      method: 'PATCH',
      body: data
    })

    loading.value = false

    if (apiError || !responseData) {
      error.value = apiError?.message || 'Failed to update profile'
      console.error('Failed to update parent profile:', apiError)
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
