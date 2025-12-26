import { defineStore } from 'pinia'

interface OnboardingState {
  tenantId: number | null
  schoolName: string | null
  onboardingStep: number | null
  onboardingCompleted: boolean
}

export const useOnboardingStore = defineStore('onboarding', {
  state: (): OnboardingState => ({
    tenantId: null,
    schoolName: null,
    onboardingStep: null,
    onboardingCompleted: false,
  }),

  getters: {
    needsOnboarding: (state) => !state.onboardingCompleted,
  },

  actions: {
    setOnboardingStatus(payload: any) {
      this.tenantId = payload.tenant_id
      this.schoolName = payload.school_name
      this.onboardingStep = payload.onboarding_step
      this.onboardingCompleted = payload.onboarding_completed
    },

    advanceStep(step: number) {
      this.onboardingStep = step
    },

    reset() {
      this.$reset()
    }
  }
})
