<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Header -->
    <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 py-6">
      <div class="container mx-auto px-4">
        <div class="flex items-center gap-4">
          <img v-if="schoolLogo()" :src="schoolLogo()" :alt="schoolName" class="h-16 w-16 object-contain" />
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ schoolName }}</h1>
            <p class="text-neutral-600 dark:text-neutral-400">Track Your Application</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Track Your Application</h2>

          <form @submit.prevent="trackApplication" class="space-y-6">
            <!-- Application Number -->
            <div class="space-y-2">
              <Label for="application_number">Application Number *</Label>
              <Input
                id="application_number"
                v-model="form.application_number"
                placeholder="APP-2024-001"
                required
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                This was provided when you created your application
              </p>
            </div>

            <!-- Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white dark:bg-neutral-800 text-neutral-500">Verify with one of the following</span>
              </div>
            </div>

            <!-- Parent Email -->
            <div class="space-y-2">
              <Label for="parent_email">Parent Email</Label>
              <Input
                id="parent_email"
                v-model="form.parent_email"
                type="email"
                placeholder="parent@example.com"
                :disabled="!!form.parent_phone"
              />
            </div>

            <!-- OR -->
            <div class="text-center text-sm text-neutral-500 font-medium">OR</div>

            <!-- Parent Phone -->
            <div class="space-y-2">
              <Label for="parent_phone">Parent Phone Number</Label>
              <Input
                id="parent_phone"
                v-model="form.parent_phone"
                type="tel"
                placeholder="08012345678"
                :disabled="!!form.parent_email"
              />
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <Icon name="lucide:alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <Button type="submit" :disabled="isTracking || !isFormValid" class="flex-1">
                <Icon v-if="isTracking" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:search" class="w-4 h-4 mr-2" />
                Track Application
              </Button>
              <Button type="button" variant="outline" @click="navigateTo('/apply')">
                Cancel
              </Button>
            </div>
          </form>

          <!-- Help Text -->
          <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Need Help?</h3>
            <ul class="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• Make sure you have your application number ready</li>
              <li>• Use the same email or phone number you provided when applying</li>
              <li>• If you can't find your application, please contact the school</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBrand } from '~~/composables/useBrand'
import { useAdmission } from '~~/composables/useAdmission'
import { useToast } from '~~/composables/useToast'


const { success: showSuccessToast, error: showErrorToast } = useToast()

definePageMeta({
  layout: false,
})

const { schoolLogo, school, product } = useBrand()
const { publicAPI } = useAdmission()

const schoolName = computed(() => school() || product())

const form = ref({
  application_number: '',
  parent_email: '',
  parent_phone: '',
})

const isTracking = ref(false)
const errorMessage = ref<string | null>(null)

const isFormValid = computed(() => {
  return form.value.application_number && (form.value.parent_email || form.value.parent_phone)
})

const trackApplication = async () => {
  if (!isFormValid.value) return

  isTracking.value = true
  errorMessage.value = null

  try {
    const result = await publicAPI.trackApplication({
      application_number: form.value.application_number,
      parent_email: form.value.parent_email || undefined,
      parent_phone: form.value.parent_phone || undefined,
    })

    localStorage.setItem('admission_tracking_token', result.tracking_token)
    showSuccessToast('Application found!')
    navigateTo(`/apply/view/${result.tracking_token}`)
  } catch (err: any) {
    const message = err.data?.detail || err.data?.error || 'Application not found. Please check your details and try again.'
    errorMessage.value = message
    showErrorToast(message)
  } finally {
    isTracking.value = false
  }
}
</script>
