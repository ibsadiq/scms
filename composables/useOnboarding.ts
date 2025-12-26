import { useAuthStore } from '~~/stores/auth'
import { ref } from 'vue'
import { OnboardingStep } from '~~/constants/onboarding-step'

export const useOnboarding = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  /* -----------------------------
   * State (single source of truth)
   * ----------------------------- */
const currentStep = ref<number>(OnboardingStep.SCHOOL_INFO)

  const loading = ref(false)
  const error = ref<string | null>(null)

  /* -----------------------------
   * Helpers
   * ----------------------------- */
  const getApiBaseUrl = () =>
    config.public.apiBaseUrl || config.public.apiBase

  /* -----------------------------
   * Status / Sync
   * ----------------------------- */
  const refreshStatus = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{
        needs_onboarding: boolean
        current_step?: number
        onboarding_step?: string | number
        onboarding_step_label?: string
        onboarding_completed: boolean
        school_id?: number
        school_name?: string
        admin_user?: any
      }>(`${getApiBaseUrl()}/tenants/onboarding/check/`)

      console.log('🔍 [refreshStatus] Response from backend:', {
        needs_onboarding: response.needs_onboarding,
        current_step: response.current_step,
        onboarding_step: response.onboarding_step,
        school_id: response.school_id,
        admin_user: response.admin_user,
      })

      if (response.needs_onboarding) {
        // Determine current step based on what's been completed
        let stepToShow = OnboardingStep.SCHOOL_INFO

        // Priority 1: Use current_step if provided
        if (response.current_step) {
          stepToShow = response.current_step
        }
        // Priority 2: Use onboarding_step from backend
        else if (response.onboarding_step !== undefined) {
          if (typeof response.onboarding_step === 'number') {
            stepToShow = response.onboarding_step
          } else {
            // Map string step to number
            const stepMap: Record<string, number> = {
              'step1': OnboardingStep.SCHOOL_INFO,
              'step2': OnboardingStep.ADMIN,
              'step3': OnboardingStep.BRANDING,
              'step4': OnboardingStep.COMPLETED,
            }
            stepToShow = stepMap[response.onboarding_step] || OnboardingStep.SCHOOL_INFO
          }
        }
        // Priority 3: Fallback - detect based on completion status
        else {
          // Check what has been completed to determine next step
          const hasSchool = !!response.school_id
          const hasAdmin = !!response.admin_user

          if (!hasSchool) {
            stepToShow = OnboardingStep.SCHOOL_INFO // Step 1
          } else if (!hasAdmin) {
            stepToShow = OnboardingStep.ADMIN // Step 2
          } else {
            stepToShow = OnboardingStep.BRANDING // Step 3
          }
        }

        currentStep.value = stepToShow
      } else {
        currentStep.value = OnboardingStep.COMPLETED
      }

      return response
    } catch (err: any) {
      // If tenant not found (404), assume fresh install - start at step 1
      if (err.status === 404 || err.statusCode === 404) {
        currentStep.value = OnboardingStep.SCHOOL_INFO
        return {
          needs_onboarding: true,
          current_step: OnboardingStep.SCHOOL_INFO,
          onboarding_completed: false
        }
      }

      // For other errors, set error and throw
      error.value =
        err.data?.message ||
        err.message ||
        'Failed to check onboarding status'
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   * Step 1 – Create Tenant
   * ----------------------------- */
  const createTenant = async (data: {
    school_name: string
    primary_color?: string
    secondary_color?: string
    address?: string
    contact_email?: string
    contact_phone?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{
        message?: string
        school_id?: number
        next_step?: number
      }>(
        `${getApiBaseUrl()}/tenants/onboarding/step1/create-tenant/`,
        { method: 'POST', body: data }
      )

      console.log('🏫 [createTenant] Response:', response)

      // If backend returns next_step, use it directly
      if (response.next_step) {
        console.log('➡️ [createTenant] Backend says next step is:', response.next_step)
        currentStep.value = response.next_step
      } else {
        await refreshStatus()
      }

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   * Step 2 – Create Admin User
   * ----------------------------- */
  const createAdminUser = async (data: {
    email: string
    password: string
    confirm_password: string
    first_name: string
    last_name: string
    phone_number?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{
        user: any
        tokens?: { access: string; refresh: string }
        next_step?: number
      }>(
        `${getApiBaseUrl()}/tenants/onboarding/step2/create-admin/`,
        { method: 'POST', body: data }
      )

      console.log('👤 [createAdminUser] Response:', response)

      if (response.tokens) {
        authStore.setTokens(
          response.tokens.access,
          response.tokens.refresh
        )
        authStore.user = response.user
      }

      // If backend returns next_step, use it directly
      if (response.next_step) {
        console.log('➡️ [createAdminUser] Backend says next step is:', response.next_step)
        currentStep.value = response.next_step
      } else {
        await refreshStatus()
      }

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   * Step 3 – Configure Settings
   * ----------------------------- */
  const configureSettings = async (formData: FormData) => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{
        message?: string
        next_step?: number
      }>(
        `${getApiBaseUrl()}/tenants/onboarding/step3/configure-settings/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          body: formData,
        }
      )

      console.log('🎨 [configureSettings] Response:', response)

      // If backend returns next_step, use it directly
      if (response.next_step) {
        console.log('➡️ [configureSettings] Backend says next step is:', response.next_step)
        currentStep.value = response.next_step
      } else {
        await refreshStatus()
      }

      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   * Step 4 – Complete Onboarding
   * ----------------------------- */
  const completeOnboarding = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch(
        `${getApiBaseUrl()}/tenants/onboarding/step4/complete/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          body: { confirm: true },
        }
      )

      await refreshStatus()
      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   * Skip to Complete (Dev/Testing)
   * ----------------------------- */
  const skipToComplete = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch(
        `${getApiBaseUrl()}/tenants/onboarding/skip-to-complete/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        }
      )

      await refreshStatus()
      return response
    } catch (err: any) {
      error.value = err.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /* -----------------------------
   * Get School Settings
   * ----------------------------- */
  const getSchoolSettings = async () => {
    try {
      // First get onboarding status
      const onboardingResponse = await $fetch<any>(`${getApiBaseUrl()}/tenants/onboarding/check/`)
      console.log('📦 [getSchoolSettings] Onboarding response:', onboardingResponse)

      // If we have a school, also fetch full settings including logo
      if (onboardingResponse?.school_id && authStore.accessToken) {
        try {
          const settingsResponse = await $fetch<any>(`${getApiBaseUrl()}/settings/`, {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          })
          console.log('📦 [getSchoolSettings] Settings response:', settingsResponse)

          // Merge both responses
          return {
            ...onboardingResponse,
            ...settingsResponse,
            school_logo_url: settingsResponse.school_logo_url || settingsResponse.school_logo,
          }
        } catch (settingsErr) {
          console.log('⚠️ [getSchoolSettings] Could not fetch full settings, using onboarding data only')
          return onboardingResponse
        }
      }

      return onboardingResponse
    } catch (err: any) {
      // Return null if school doesn't exist yet
      if (err.status === 404 || err.statusCode === 404) {
        return null
      }
      throw err
    }
  }

  /* -----------------------------
   * Check Onboarding Status
   * ----------------------------- */
  const checkOnboardingStatus = async () => {
    try {
      const response = await $fetch<{
        needs_onboarding: boolean
        onboarding_completed: boolean
        current_step?: number
        onboarding_step?: string
      }>(`${getApiBaseUrl()}/tenants/onboarding/check/`)

      // Normalize the response to always include current_step as number
      let current_step = response.current_step
      if (!current_step && response.onboarding_step) {
        const stepMap: Record<string, number> = {
          'step1': OnboardingStep.SCHOOL_INFO,
          'step2': OnboardingStep.ADMIN,
          'step3': OnboardingStep.BRANDING,
          'step4': OnboardingStep.COMPLETED,
        }
        current_step = stepMap[response.onboarding_step] || OnboardingStep.SCHOOL_INFO
      }

      return {
        ...response,
        current_step: current_step || OnboardingStep.SCHOOL_INFO
      }
    } catch (err: any) {
      // If tenant not found (404), assume fresh install needs onboarding
      if (err.status === 404 || err.statusCode === 404) {
        return {
          needs_onboarding: true,
          onboarding_completed: false,
          current_step: OnboardingStep.SCHOOL_INFO
        }
      }
      throw err
    }
  }

  /* -----------------------------
   * Expose API
   * ----------------------------- */
  return {
    // state
    currentStep,
    loading,
    error,

    // actions
    refreshStatus,
    createTenant,
    createAdminUser,
    configureSettings,
    completeOnboarding,
    skipToComplete,
    checkOnboardingStatus,
    getSchoolSettings,
  }
}
