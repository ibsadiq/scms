<!-- components/auth/StudentRegister.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4">
    <Card class="w-full max-w-md shadow-2xl border-0">
      <CardHeader class="space-y-3 text-center pb-4">
        <!-- App/Product Logo -->
        <div class="flex justify-center mb-3">
          <div class="h-32 flex items-center justify-center">
            <img :src="appLogo()" :alt="product()" class="h-full w-auto object-contain" />
          </div>
        </div>

        <div>
          <CardDescription class="text-base">
            Register as a student to access the portal
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Admission Number -->
          <div class="space-y-2">
            <Label for="admission_number" class="text-sm font-medium">
              Admission Number
            </Label>
            <div class="relative">
              <Icon
                name="lucide:hash"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              />
              <Input
                id="admission_number"
                v-model="formData.admission_number"
                type="text"
                placeholder="Enter your admission number"
                class="pl-10 h-12 text-base"
                required
              />
            </div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Icon name="lucide:info" class="w-3 h-3" />
              Your unique student identification number
            </p>
          </div>

          <!-- Phone Number -->
          <div class="space-y-2">
            <Label for="phone_number" class="text-sm font-medium">
              Phone Number
            </Label>
            <div class="relative">
              <Icon
                name="lucide:phone"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              />
              <Input
                id="phone_number"
                v-model="formData.phone_number"
                type="tel"
                placeholder="08012345678"
                class="pl-10 h-12 text-base"
                required
                maxlength="11"
              />
            </div>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Icon name="lucide:info" class="w-3 h-3" />
              11-digit Nigerian phone number
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium">Password</Label>
            <div class="relative">
              <Icon
                name="lucide:lock"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              />
              <Input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a strong password"
                class="pl-10 pr-10 h-12 text-base"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-2">
            <Label for="password_confirm" class="text-sm font-medium">
              Confirm Password
            </Label>
            <div class="relative">
              <Icon
                name="lucide:lock-keyhole"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              />
              <Input
                id="password_confirm"
                v-model="formData.password_confirm"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Re-enter your password"
                class="pl-10 pr-10 h-12 text-base"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          <Alert v-if="error" variant="destructive" class="animate-in fade-in slide-in-from-top-2">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <!-- Success Alert -->
          <Alert v-if="success" class="animate-in fade-in slide-in-from-top-2 border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
            <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{{ success }}</AlertDescription>
          </Alert>

          <!-- Register Button -->
          <Button
            type="submit"
            class="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            :disabled="loading"
          >
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="w-5 h-5 mr-2 animate-spin"
            />
            <Icon
              v-else
              name="lucide:user-plus"
              class="w-5 h-5 mr-2"
            />
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </Button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p class="text-sm text-center text-neutral-600 dark:text-neutral-400">
            Already have an account?
            <NuxtLink
              :to="loginUrl"
              class="text-primary-700 dark:text-primary-400 hover:underline font-semibold ml-1"
            >
              Sign in here
            </NuxtLink>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Bottom Info -->
    <div class="absolute bottom-4 left-0 right-0 text-center">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ product() }} © 2025
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStudentAuth } from '~~/composables/useStudentAuth'
import { useBrand } from '~~/composables/useBrand'
import { useErrorHandler } from '~~/composables/useErrorHandler'

// Props
const props = defineProps<{
  loginUrl?: string
}>()

// Composables
const { register } = useStudentAuth()
const { product, appLogo } = useBrand()
const router = useRouter()

// Default login URL
const loginUrl = computed(() => props.loginUrl || '/login')

const formData = ref({
  admission_number: '',
  phone_number: '',
  password: '',
  password_confirm: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validation
  if (formData.value.password !== formData.value.password_confirm) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (formData.value.phone_number.length !== 11) {
    error.value = 'Phone number must be 11 digits'
    loading.value = false
    return
  }

  if (formData.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    loading.value = false
    return
  }

  const result = await register(formData.value)

  if (result.success) {
    success.value = 'Account created successfully! Redirecting to login...'
    showSuccessToast('Registration successful!')

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push(loginUrl.value)
    }, 2000)
  } else {
    error.value = result.error || 'Registration failed. Please try again.'
  }

  loading.value = false
}
</script>

<style scoped>
@keyframes slide-in-from-top-2 {
  from {
    transform: translateY(-0.5rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-in {
  animation: slide-in-from-top-2 0.3s ease-out;
}

.fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
