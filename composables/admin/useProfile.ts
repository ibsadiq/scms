// composables/admin/useProfile.ts
import type { User } from '~~/types'

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
  const { $api } = useNuxtApp()
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

    try {
      const response = await $api<AdminProfile>('/users/profile/', {
        method: 'GET'
      })

      profile.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      console.error('Failed to fetch admin profile:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update admin/staff profile
   */
  const updateProfile = async (data: UpdateAdminProfileData) => {
    loading.value = true
    error.value = null

    try {
      if (!user.value?.id) {
        throw new Error('User ID not found')
      }

      // Use the profile endpoint for updates
      const response = await $api<AdminProfile>('/users/profile/', {
        method: 'PATCH',
        body: data
      })

      profile.value = response

      // Refresh the user data in the auth composable
      await fetchUser()

      return { success: true, data: response, message: 'Profile updated successfully' }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      console.error('Failed to update admin profile:', err)
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
