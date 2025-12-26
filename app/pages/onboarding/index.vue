<template>
  <div class="min-h-screen bg-background">
    <div class="container max-w-4xl mx-auto py-8 px-4 sm:py-12">
      <!-- Header -->
      <div class="text-center mb-8 sm:mb-12">
        <div class="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4">
          <img src="/logo.png" alt="ScholAfric" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">Welcome to ScholAfric</h1>
        <p class="text-base sm:text-lg text-muted-foreground">Let's get your school set up in just a few steps</p>
      </div>

      <Stepper class="mx-auto mb-10 max-w-3xl">
        <StepperItem
          v-for="item in ONBOARDING_STEPS"
          :key="item.step"
          :step="item.step"
          :completed="currentStep > item.step"
          :active="currentStep === item.step"
          class="relative flex w-full flex-col items-center"
        >
          <StepperTrigger>
            <StepperIndicator>
              <component :is="item.icon" class="h-4 w-4" />
            </StepperIndicator>
          </StepperTrigger>

          <StepperSeparator
            v-if="item.step !== ONBOARDING_STEPS.at(-1)?.step"
            class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 h-0.5
                  bg-muted group-data-[state=completed]:bg-primary"
          />

          <div class="mt-2 text-center">
            <StepperTitle>{{ item.title }}</StepperTitle>
            <StepperDescription class="hidden sm:block">
              {{ item.description }}
            </StepperDescription>
          </div>
        </StepperItem>
      </Stepper>


      <!-- Content Card -->
      <Card class="shadow-lg">
        <CardContent class="p-6 sm:p-8">
          <!-- Step 1: School Information -->
          <div v-if="currentStep === 1">
            <CardHeader class="px-0 pt-0">
              <CardTitle class="text-2xl">School Information</CardTitle>
              <CardDescription>Tell us about your school</CardDescription>
            </CardHeader>

            <form @submit.prevent="handleStep1Submit" class="space-y-6 mt-6">
              <div class="space-y-2">
                <Label for="school_name">
                  School Name <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="school_name"
                  v-model="step1Data.school_name"
                  type="text"
                  required
                  placeholder="ABC High School"
                />
              </div>

              <div class="space-y-2">
                <Label for="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  v-model="step1Data.contact_email"
                  type="email"
                  placeholder="admin@school.com"
                />
              </div>

              <div class="space-y-2">
                <Label for="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  v-model="step1Data.contact_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div class="space-y-2">
                <Label for="address">School Address</Label>
                <Textarea
                  id="address"
                  v-model="step1Data.address"
                  rows="3"
                  placeholder="123 Main Street, City, State, ZIP"
                />
              </div>

              <Button type="submit" :disabled="loading" class="w-full" size="lg">
                <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? 'Creating...' : 'Continue' }}
              </Button>
            </form>
          </div>

          <!-- Step 2: Create Admin User -->
          <div v-if="currentStep === 2">
            <CardHeader class="px-0 pt-0">
              <CardTitle class="text-2xl">Create Admin Account</CardTitle>
              <CardDescription>Set up your administrator credentials</CardDescription>
            </CardHeader>

            <form @submit.prevent="handleStep2Submit" class="space-y-6 mt-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="first_name">
                    First Name <span class="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    v-model="step2Data.first_name"
                    type="text"
                    required
                    placeholder="John"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="last_name">
                    Last Name <span class="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    v-model="step2Data.last_name"
                    type="text"
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="email">
                  Email Address <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  v-model="step2Data.email"
                  type="email"
                  required
                  placeholder="admin@school.com"
                />
              </div>

              <div class="space-y-2">
                <Label for="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  v-model="step2Data.phone_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div class="space-y-2">
                <Label for="password">
                  Password <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  v-model="step2Data.password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Minimum 8 characters"
                />
                <p class="text-xs text-muted-foreground">Must be at least 8 characters long</p>
              </div>

              <div class="space-y-2">
                <Label for="confirm_password">
                  Confirm Password <span class="text-destructive">*</span>
                </Label>
                <Input
                  id="confirm_password"
                  v-model="step2Data.confirm_password"
                  type="password"
                  required
                  minlength="8"
                  placeholder="Re-enter password"
                />
              </div>

              <div class="flex gap-3">
                <Button type="button" @click="currentStep = 1" variant="outline" size="lg">
                  Back
                </Button>
                <Button type="submit" :disabled="loading" class="flex-1" size="lg">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? 'Creating Account...' : 'Create Admin Account' }}
                </Button>
              </div>
            </form>
          </div>

          <!-- Step 3: Configure Settings -->
          <div v-if="currentStep === 3">
            <CardHeader class="px-0 pt-0">
              <CardTitle class="text-2xl">Customize Your School</CardTitle>
              <CardDescription>Add your school logo and branding (optional)</CardDescription>
            </CardHeader>

            <form @submit.prevent="handleStep3Submit" class="space-y-6 mt-6">
              <div class="space-y-2">
                <Label for="logo">School Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  @change="handleLogoChange"
                  class="cursor-pointer"
                />
                <p class="text-xs text-muted-foreground">Upload your school logo (PNG, JPG, or SVG)</p>
              </div>

              <div v-if="logoPreview" class="p-4 border rounded-lg bg-muted/30">
                <p class="text-sm font-medium mb-2">Preview:</p>
                <img :src="logoPreview" alt="Logo preview" class="h-24 object-contain" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="primary_color">Primary Color</Label>
                  <Input
                    id="primary_color"
                    v-model="step3Data.primary_color"
                    type="color"
                    class="h-10"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="secondary_color">Secondary Color</Label>
                  <Input
                    id="secondary_color"
                    v-model="step3Data.secondary_color"
                    type="color"
                    class="h-10"
                  />
                </div>
              </div>

              <Alert>
                <Info class="h-4 w-4" />
                <AlertDescription>
                  You can skip this step and customize your branding later from the settings page.
                </AlertDescription>
              </Alert>

              <div class="flex gap-3">
                <Button
                    type="button"
                    @click="handleSkipBranding"
                    variant="outline"
                    size="lg"
                  >
                    Skip for Now
                  </Button>

                <Button type="submit" :disabled="loading" class="flex-1" size="lg">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? 'Saving...' : 'Continue' }}
                </Button>
              </div>
            </form>
          </div>

          <!-- Step 4: Complete -->
          <div v-if="currentStep === 4">
            <div class="text-center py-6">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
                <CheckCircle2 class="h-8 w-8 text-primary" />
              </div>
              <CardHeader class="px-0">
                <CardTitle class="text-2xl">Setup Complete!</CardTitle>
                <CardDescription class="text-base">Your ScholAfric instance is ready to use</CardDescription>
              </CardHeader>

              <Alert class="mt-6 text-left">
                <Info class="h-4 w-4" />
                <AlertTitle>Next Steps</AlertTitle>
                <AlertDescription>
                  You'll be redirected to the login page where you can sign in with the admin account you just created
                </AlertDescription>
              </Alert>

              <Button
                @click="handleCompleteOnboarding"
                :disabled="loading"
                class="w-full mt-6"
                size="lg"
              >
                <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? 'Completing...' : 'Go to Login' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-muted-foreground">
          Need help? <a href="#" class="text-primary hover:underline font-medium">Contact Support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
} from '@/components/ui/stepper'

import {
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-vue-next'

import { ONBOARDING_STEPS } from '~~/constants/onboarding'
import { useOnboarding } from '~~/composables/useOnboarding'
import { useSettings } from '~~/composables/useSettings'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: false,
})

/**
 * 🔹 Single source of truth
 */
const {
  currentStep,
  loading,
  error,
  createTenant,
  createAdminUser,
  configureSettings,
  skipToComplete,
  refreshStatus,
  getSchoolSettings,
} = useOnboarding()

/**
 * 🔹 Step 1
 */
const step1Data = ref({
  school_name: '',
  address: '',
  contact_email: '',
  contact_phone: '',
})

/**
 * 🔹 Step 2
 */
const step2Data = ref({
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  phone_number: '',
})

/**
 * 🔹 Step 3
 */
const step3Data = ref({
  primary_color: '#047857',
  secondary_color: '#BA770F',
})
const logoFile = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

/**
 * 🔹 Initial load
 */
onMounted(async () => {
  console.log('🎬 [ONBOARDING] Page mounted')
  await refreshStatus()
  console.log('📊 [ONBOARDING] Current step after refresh:', currentStep.value)

  // Load existing school data if available
  try {
    const schoolData = await getSchoolSettings()
    console.log('🏫 [ONBOARDING] School data received:', schoolData)

    if (schoolData && schoolData.school_id) {
      console.log('✅ [ONBOARDING] Pre-filling form with:', {
        school_name: schoolData.school_name,
        primary_color: schoolData.primary_color,
        secondary_color: schoolData.secondary_color,
      })

      // Pre-fill Step 1 form with existing data
      step1Data.value = {
        school_name: schoolData.school_name || '',
        address: schoolData.address || '',
        contact_email: schoolData.contact_email || '',
        contact_phone: schoolData.contact_phone || '',
      }

      // Pre-fill Step 3 form with color data
      step3Data.value = {
        primary_color: schoolData.primary_color || '#047857',
        secondary_color: schoolData.secondary_color || '#BA770F',
      }

      console.log('📝 [ONBOARDING] Form data updated:', step1Data.value, step3Data.value)

      // Apply settings immediately to document
      const { applySettingsToDocument } = useSettings()
      applySettingsToDocument({
        school_name: schoolData.school_name,
        primary_color: schoolData.primary_color,
        secondary_color: schoolData.secondary_color,
        school_logo_url: schoolData.school_logo_url,
      })
      console.log('🎨 [ONBOARDING] Applied settings to document')
    } else {
      console.log('⚠️ [ONBOARDING] No school data to pre-fill')
    }
  } catch (err) {
    console.error('❌ [ONBOARDING] Error loading school data:', err)
  }
})

/**
 * 🔹 Watch for color changes and apply them in real-time
 * Only apply when user is on step 3 (branding step)
 */
watch(
  () => step3Data.value.primary_color,
  (newColor) => {
    if (newColor && currentStep.value === 3) {
      const { applyPrimaryColor } = useSettings()
      applyPrimaryColor(newColor)
      console.log('🎨 [REALTIME] Applied primary color:', newColor)
    }
  }
)

watch(
  () => step3Data.value.secondary_color,
  (newColor) => {
    if (newColor && currentStep.value === 3) {
      const { applySecondaryColor } = useSettings()
      applySecondaryColor(newColor)
      console.log('🎨 [REALTIME] Applied secondary color:', newColor)
    }
  }
)

/**
 * 🔹 Watch for step changes and reapply settings
 * This ensures colors/logo persist when navigating between steps
 */
watch(currentStep, async (newStep) => {
  console.log('📍 [STEP CHANGE] Step changed to:', newStep)

  // When moving to step 3, apply the branding colors
  if (newStep === 3) {
    try {
      const schoolData = await getSchoolSettings()
      // Apply current colors from step3Data to show real-time preview
      const { applyPrimaryColor, applySecondaryColor } = useSettings()
      applyPrimaryColor(schoolData?.primary_color || step3Data.value.primary_color)
      applySecondaryColor(schoolData?.secondary_color || step3Data.value.secondary_color)
      console.log('🎨 [STEP CHANGE] Applied branding colors for preview')
    } catch (err) {
      console.error('❌ [STEP CHANGE] Error applying branding colors:', err)
    }
  }

  // When moving to step 2 or later, reapply existing settings
  if (newStep >= 2) {
    try {
      const schoolData = await getSchoolSettings()
      if (schoolData) {
        const { applySettingsToDocument } = useSettings()
        applySettingsToDocument({
          school_name: schoolData.school_name,
          primary_color: schoolData.primary_color || step3Data.value.primary_color,
          secondary_color: schoolData.secondary_color || step3Data.value.secondary_color,
          school_logo_url: schoolData.school_logo_url,
        })
        console.log('🎨 [STEP CHANGE] Reapplied settings')
      }
    } catch (err) {
      console.error('❌ [STEP CHANGE] Error reapplying settings:', err)
    }
  }
})

/**
 * =====================
 * ACTIONS
 * =====================
 */

const handleStep1Submit = async () => {
  try {
    await createTenant(step1Data.value)
    await refreshStatus()
  } catch (err: any) {
    const errorMessage = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Failed to create school'
    toast.error('Failed to create school', { description: errorMessage })
  }
}

const handleStep2Submit = async () => {
  if (step2Data.value.password !== step2Data.value.confirm_password) {
    toast.error('Validation error', { description: 'Passwords do not match' })
    return
  }

  try {
    await createAdminUser(step2Data.value)
    await refreshStatus()
  } catch (err: any) {
    const errorMessage = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Failed to create admin user'
    toast.error('Failed to create admin user', { description: errorMessage })
  }
}

const handleLogoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file) return

  logoFile.value = file

  const reader = new FileReader()
  reader.onload = e => {
    logoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleStep3Submit = async () => {
  try {
    const formData = new FormData()
    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }

    // Add color data to the form
    formData.append('primary_color', step3Data.value.primary_color)
    formData.append('secondary_color', step3Data.value.secondary_color)

    // First save to backend
    await configureSettings(formData)

    // Then refresh and apply updated settings so logo & colors take effect immediately
    const { fetchSettings, applySettingsToDocument } = useSettings()
    const { data: updated } = await fetchSettings(false)
    if (updated) {
      applySettingsToDocument(updated)
      logoPreview.value = null // optional: clear preview after successful upload
    }

    await refreshStatus()
  } catch (err: any) {
    const errorMessage = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Failed to save branding'
    toast.error('Failed to save branding', { description: errorMessage })
  }
}

const handleSkipBranding = async () => {
  try {
    await skipToComplete()
    await navigateTo('/login', { replace: true, external: true })
  } catch (err: any) {
    const errorMessage = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Failed to skip to completion'
    toast.error('Failed to skip to completion', { description: errorMessage })
  }
}

const handleCompleteOnboarding = async () => {
  try {
    // Since backend already marked onboarding as complete in step3,
    // we just need to redirect to login with replace to avoid navigation issues
    await navigateTo('/login', { replace: true, external: true })
  } catch (err: any) {
    const errorMessage = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Failed to complete onboarding'
    toast.error('Failed to complete onboarding', { description: errorMessage })
  }
}
</script>
