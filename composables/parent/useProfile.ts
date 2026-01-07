// composables/parent/useProfile.ts
import type { Parent } from '~~/types'

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
  const { $api } = useNuxtApp()
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

    try {
      // Since parent data is already in the user object, we can use it directly
      // But we'll also fetch the full profile from the API for complete data
      const response = await $api<User>('/users/profile/', {
        method: 'GET'
      })

      // If the user is a parent, fetch their complete parent profile
      if (response.isParent && response.parent_id) {
        const parentData = await $api<ParentProfile>(`/users/parents/${response.parent_id}/`, {
          method: 'GET'
        })
        profile.value = parentData
      } else {
        // Fallback to user data
        profile.value = response as any
      }

      return { success: true, data: profile.value }
    } catch (err: any) {
      error.value = err.message || 'Failed to load profile'
      console.error('Failed to fetch parent profile:', err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update parent profile
   */
  const updateProfile = async (data: UpdateParentProfileData) => {
    loading.value = true
    error.value = null

    try {
      if (!user.value?.parent_id) {
        throw new Error('Parent ID not found')
      }

      const response = await $api<ParentProfile>(`/users/parents/${user.value.parent_id}/`, {
        method: 'PATCH',
        body: data
      })

      profile.value = response
      return { success: true, data: response, message: 'Profile updated successfully' }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      console.error('Failed to update parent profile:', err)
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
