// composables/admin/useProfile.ts
import type { User } from '~~/types'
import { useAuth } from '~~/composables/useAuth'
import { useApi } from '~~/composables/useApi'

export interface AdminProfile extends User {
  full_name?: string
  date_joined?: string
  last_login?: string | null
  phone_number?: string
  address?: string
  date_of_birth?: string
  gender?: string
}

export interface UpdateAdminProfileData {
  first_name?: string
  middle_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  address?: string
}

export const useAdminProfile = () => {
  const { apiCall } = useApi()
  const { user, fetchUser } = useAuth()

  const profile = ref<AdminProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch admin/staff profile
   */
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    const { data, error: apiError } = await apiCall<AdminProfile>('/users/profile/', {
      method: 'GET'
    })

    loading.value = false

    if (apiError || !data) {
      error.value = apiError?.message || 'Failed to load profile'
      console.error('Failed to fetch admin profile:', apiError)
      return { success: false, error: error.value }
    }

    profile.value = data
    return { success: true, data }
  }

  /**
   * Update admin/staff profile
   */
  const updateProfile = async (data: UpdateAdminProfileData) => {
    loading.value = true
    error.value = null

    if (!user.value?.id) {
      loading.value = false
      error.value = 'User ID not found'
      return { success: false, error: error.value }
    }

    // Use the profile endpoint for updates
    const { data: responseData, error: apiError } = await apiCall<AdminProfile>('/users/profile/', {
      method: 'PATCH',
      body: data
    })

    loading.value = false

    if (apiError || !responseData) {
      error.value = apiError?.message || 'Failed to update profile'
      console.error('Failed to update admin profile:', apiError)
      return { success: false, error: error.value }
    }

    profile.value = responseData

    // Refresh the user data in the auth composable
    await fetchUser()

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
