<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <Icon name="lucide:user-plus" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <CardTitle class="text-2xl">Set Up Your Account</CardTitle>
        <CardDescription v-if="invitation && !loading">
          Welcome, {{ invitation.first_name }} {{ invitation.last_name }}!<br>
          Create your password to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-8">
          <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <p class="text-neutral-600 dark:text-neutral-400">Validating invitation...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <Icon name="lucide:alert-circle" class="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Invalid or Expired Invitation</h3>
          <p class="text-neutral-600 dark:text-neutral-400 mb-4">{{ error }}</p>
          <Button @click="navigateTo('/login')">
            Go to Login
          </Button>
        </div>

        <!-- Setup Form -->
        <form v-else-if="invitation" @submit.prevent="handleSubmit" class="space-y-4">
          <div class="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg mb-4">
            <div class="flex items-center gap-2 text-sm">
              <Icon name="lucide:mail" class="w-4 h-4 text-neutral-500" />
              <span class="text-neutral-600 dark:text-neutral-400">{{ invitation.email }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm mt-2">
              <Icon name="lucide:user-check" class="w-4 h-4 text-neutral-500" />
              <span class="text-neutral-600 dark:text-neutral-400 capitalize">{{ invitation.role }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="password">Password *</Label>
            <Input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="Enter your password"
              required
              minlength="8"
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Must be at least 8 characters long
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password_confirm">Confirm Password *</Label>
            <Input
              id="password_confirm"
              v-model="formData.password_confirm"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>

          <Alert v-if="submitError" variant="destructive">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ submitError }}</AlertDescription>
          </Alert>

          <Button type="submit" class="w-full" :disabled="submitting">
            <Icon v-if="submitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ submitting ? 'Creating Account...' : 'Create Account' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'

definePageMeta({
  layout: false, // Use no layout for standalone page
  middleware: []  // No auth middleware needed
})

const route = useRoute()
const router = useRouter()
const { apiCall } = useApi()

const token = computed(() => route.query.token as string)

const invitation = ref<any>(null)
const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const submitError = ref('')

const formData = ref({
  password: '',
  password_confirm: ''
})

// Validate invitation on mount
onMounted(async () => {
  if (!token.value) {
    error.value = 'No invitation token provided'
    loading.value = false
    return
  }

  const { data, error: apiError } = await apiCall(`/users/invitations/validate/${token.value}/`)

  if (data) {
    invitation.value = data
  } else {
    error.value = apiError || 'Failed to validate invitation'
  }

  loading.value = false
})

const handleSubmit = async () => {
  submitError.value = ''

  // Validate passwords match
  if (formData.value.password !== formData.value.password_confirm) {
    submitError.value = 'Passwords do not match'
    return
  }

  // Validate password length
  if (formData.value.password.length < 8) {
    submitError.value = 'Password must be at least 8 characters long'
    return
  }

  submitting.value = true

  const { data, error: apiError } = await apiCall('/users/invitations/accept/', {
    method: 'POST',
    body: {
      token: token.value,
      password: formData.value.password,
      password_confirm: formData.value.password_confirm
    }
  })

  if (data) {
    // Store tokens
    const authStore = useAuthStore()
    authStore.setTokens(data.tokens.access, data.tokens.refresh)
    authStore.setUser(data.user)

    showSuccessToast('Account created successfully!', {
      description: 'Welcome to the system. Redirecting to your dashboard...'
    })

    // Redirect based on user role
    setTimeout(() => {
      if (data.user.isTeacher) {
        router.push('/teacher')
      } else if (data.user.isParent) {
        router.push('/parent')
      } else if (data.user.isAccountant) {
        router.push('/accountant')
      } else {
        router.push('/admin')
      }
    }, 1500)
  } else {
    submitError.value = apiError || 'Failed to create account'
  }

  submitting.value = false
}
</script>
