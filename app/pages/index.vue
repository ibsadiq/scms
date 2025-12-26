<!-- pages/index.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
    <div class="text-center">
      <!-- School Logo or Default ScholAfric Logo -->
      <div class="w-32 h-32 mx-auto mb-6">
        <img
          :src="schoolLogoUrl || '/logo.png'"
          :alt="schoolName"
          class="w-full h-full object-contain animate-pulse"
        />
      </div>

      <h1 class="text-4xl font-bold text-neutral-900 mb-2">{{ schoolName }}</h1>
      <p class="text-neutral-600 mb-8">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~~/composables/useAuth'
import { useOnboarding } from '~~/composables/useOnboarding'

definePageMeta({
  layout: 'default'
})

// Get school branding from global state
// Check if values were pre-loaded by app.html script
const preloadedLogo = (window as any).__SCHOOL_LOGO_URL__
const preloadedName = (window as any).__SCHOOL_NAME__

const schoolLogoUrl = useState<string | undefined>('school_logo_url', () => preloadedLogo || undefined)
const schoolName = useState<string>('school_name', () => preloadedName || 'ScholAfric')

const { isAuthenticated, user } = useAuth()

onMounted(async () => {
  // If user is already authenticated, redirect to appropriate dashboard
  if (isAuthenticated.value) {
    if (user.value?.isAdmin) {
      await navigateTo('/admin')
    } else if (user.value?.isTeacher) {
      await navigateTo('/teacher')
    } else if (user.value?.isParent) {
      await navigateTo('/parent')
    } else if (user.value?.isStudent) {
      await navigateTo('/student')
    }
    return
  }

  // Check onboarding status and redirect accordingly
  try {
    const { checkOnboardingStatus } = useOnboarding()
    const status = await checkOnboardingStatus()

    if (status.needs_onboarding) {
      await navigateTo('/onboarding', { replace: true })
    } else {
      await navigateTo('/login', { replace: true })
    }
  } catch (error: any) {
    console.error('❌ [HOMEPAGE] Error checking onboarding:', error)
    // Default to login on error
    await navigateTo('/login', { replace: true })
  }
})
</script>