<!-- components/auth/UnifiedLogin.vue -->
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
            Sign in to your account
          </CardDescription>
        </div>

        <!-- MOBILE: Segmented Control (< 640px) -->
        <div class="sm:hidden relative flex bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-1.5 mt-6">
          <!-- Sliding Pill Background -->
          <div
            class="absolute top-1.5 bottom-1.5 bg-white dark:bg-neutral-700 rounded-lg shadow-sm transition-all duration-300 ease-out"
            :style="{
              left: `${pillOffset}px`,
              width: `${pillWidth}px`
            }"
          />

          <!-- Segment Buttons -->
          <button
            v-for="type in userTypes"
            :key="type.value"
            :ref="(el) => { if (el) segmentRefs[type.value] = el as HTMLElement }"
            type="button"
            @click="selectUserType(type.value as 'student' | 'staff' | 'parent')"
            class="relative z-10 flex-1 px-3 py-3 text-sm font-semibold transition-colors duration-200 rounded-lg flex items-center justify-center gap-2"
            :class="userType === type.value
              ? 'text-primary-700 dark:text-primary-400'
              : 'text-neutral-600 dark:text-neutral-400'
            "
          >
            <Icon :name="type.icon" class="w-4 h-4" />
            <span class="text-xs">{{ type.short }}</span>
          </button>
        </div>

        <!-- DESKTOP: Tabs (>= 640px) -->
        <Tabs v-model="userType" class="hidden sm:block mt-6">
          <TabsList class="grid w-full grid-cols-3 h-12 bg-neutral-100 dark:bg-neutral-800">
            <TabsTrigger
              v-for="type in userTypes"
              :key="type.value"
              :value="type.value"
              class="font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              <Icon :name="type.icon" class="w-4 h-4 mr-2" />
              {{ type.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Dynamic Input Field -->
          <div class="space-y-2">
            <Label :for="inputId" class="text-sm font-medium">
              {{ inputLabel }}
            </Label>
            <div class="relative">
              <Icon
                :name="inputIcon"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              />
              <Input
                :id="inputId"
                v-model="credentials.identifier"
                :type="inputType"
                :placeholder="inputPlaceholder"
                class="pl-10 h-12 text-base"
                required
                :maxlength="userType === 'student' ? 11 : undefined"
              />
            </div>
            <p v-if="userType === 'student'" class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Icon name="lucide:info" class="w-3 h-3" />
              Enter your 11-digit phone number
            </p>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password" class="text-sm font-medium">Password</Label>
              <button
                type="button"
                class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div class="relative">
              <Icon
                name="lucide:lock"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500"
              />
              <Input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
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

          <!-- Error Alert -->
          <Alert v-if="error" variant="destructive" class="animate-in fade-in slide-in-from-top-2">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <!-- Sign In Button -->
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
              name="lucide:log-in"
              class="w-5 h-5 mr-2"
            />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </Button>
        </form>

        <!-- Register Link (Students Only) -->
        <div v-if="userType === 'student'" class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p class="text-sm text-center text-neutral-600 dark:text-neutral-400">
            Don't have an account?
            <NuxtLink
              :to="registerUrl"
              class="text-primary-700 dark:text-primary-400 hover:underline font-semibold ml-1"
            >
              Register here
            </NuxtLink>
          </p>
        </div>

        <!-- Help Text -->
        <div class="mt-4 text-center">
          <button
            type="button"
            class="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
          >
            <Icon name="lucide:help-circle" class="w-3 h-3" />
            Need help signing in?
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Bottom Info -->
    <div class="absolute bottom-4 left-0 right-0 text-center">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        {{ product() }} © {{ new Date().getFullYear() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '~~/composables/useAuth'
import { useStudentAuth } from '~~/composables/useStudentAuth'
import { useSettings } from '~~/composables/useSettings'
import { useBrand } from '~~/composables/useBrand'
import { toast } from 'vue-sonner'

// Props
const props = defineProps<{
  registerUrl?: string
}>()

// Composables
// Get school branding from global state (set by init-app plugin)
const { fetchSettingsPublic, applyPrimaryColor, applySecondaryColor } = useSettings()
const { product, preferSchool, appLogo } = useBrand()

// Initialize as reactive refs that will be populated on client side
const schoolLogoUrl = useState<string | undefined>('school_logo_url', () => undefined)
const schoolName = useState<string>('school_name', () => preferSchool())

// Try to get cached settings from localStorage first
const getCachedSettings = () => {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('school_settings')
    if (!cached) return null
    const { data } = JSON.parse(cached)
    return data
  } catch {
    return null
  }
}

// Load settings on client side immediately
if (typeof window !== 'undefined') {
  const cachedSettings = getCachedSettings()
  if (cachedSettings) {
    // Try multiple possible field names from the API response
    schoolLogoUrl.value = (cachedSettings as any).logo_url || (cachedSettings as any).school_logo_url || (cachedSettings as any).logo || undefined
    schoolName.value = cachedSettings?.school_name || product()

    // Apply colors to the page
    if (cachedSettings.primary_color) {
      applyPrimaryColor(cachedSettings.primary_color)
    }
    if ((cachedSettings as any).secondary_color) {
      applySecondaryColor((cachedSettings as any).secondary_color)
    }

    console.log('✅ [UnifiedLogin] Loaded from cache:', {
      logo: schoolLogoUrl.value,
      name: schoolName.value,
      primary: cachedSettings.primary_color,
      secondary: (cachedSettings as any).secondary_color
    })
  }
}

// User type configuration
const userTypes = [
  {
    value: 'staff',
    label: 'Staff',
    short: 'Staff',
    icon: 'lucide:briefcase',
    inputType: 'email',
    inputLabel: 'Email Address',
    inputPlaceholder: 'staff@school.com',
    inputIcon: 'lucide:mail'
  },
  {
    value: 'student',
    label: 'Student',
    short: 'Student',
    icon: 'lucide:graduation-cap',
    inputType: 'tel',
    inputLabel: 'Phone Number',
    inputPlaceholder: '08012345678',
    inputIcon: 'lucide:phone'
  },
  {
    value: 'parent',
    label: 'Parent',
    short: 'Parent',
    icon: 'lucide:users',
    inputType: 'email',
    inputLabel: 'Email Address',
    inputPlaceholder: 'parent@example.com',
    inputIcon: 'lucide:mail'
  }
]

// Auth composables
const staffAuth = useAuth()
const studentAuth = useStudentAuth()
const router = useRouter()

// Default register URL
const registerUrl = computed(() => props.registerUrl || '/student/register')

// State
const userType = ref<'student' | 'staff' | 'parent'>('staff')
const credentials = ref({
  identifier: '',
  password: ''
})
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

// Segmented control state (mobile only)
const segmentRefs = ref<Record<string, HTMLElement | null>>({})
const pillOffset = ref(0)
const pillWidth = ref(0)

// Computed properties
const currentUserTypeConfig = computed(() => {
  return userTypes.find(t => t.value === userType.value)!
})

const inputId = computed(() => currentUserTypeConfig.value.value + '-input')
const inputType = computed(() => currentUserTypeConfig.value.inputType)
const inputLabel = computed(() => currentUserTypeConfig.value.inputLabel)
const inputPlaceholder = computed(() => currentUserTypeConfig.value.inputPlaceholder)
const inputIcon = computed(() => currentUserTypeConfig.value.inputIcon)

// Methods
const selectUserType = (type: 'student' | 'staff' | 'parent') => {
  userType.value = type
  credentials.value.identifier = ''
  credentials.value.password = ''
  error.value = ''
  updatePillPosition()
}

const updatePillPosition = () => {
  nextTick(() => {
    const activeSegment = segmentRefs.value[userType.value]
    if (activeSegment) {
      const parent = activeSegment.parentElement
      if (parent) {
        pillOffset.value = activeSegment.offsetLeft
        pillWidth.value = activeSegment.offsetWidth
      }
    }
  })
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    if (userType.value === 'student') {
      // Student login
      const result = await studentAuth.login({
        phone_number: credentials.value.identifier,
        password: credentials.value.password
      })

      if (result.success) {
        toast.success('Welcome back, ' + result.student?.first_name + '!')
        await router.push('/student')
      } else {
        error.value = result.error || 'Invalid phone number or password'
      }
    } else {
      // Staff/Parent login
      const result = await staffAuth.login({
        email: credentials.value.identifier,
        password: credentials.value.password
      })

      if (result.success) {
        const user = result.user
        toast.success('Welcome back!')

        // Redirect based on role
        if (user?.isAdmin) {
          await router.push('/admin')
        } else if (user?.isTeacher) {
          await router.push('/teacher')
        } else if (user?.isParent) {
          await router.push('/parent')
        } else {
          await router.push('/')
        }
      } else {
        error.value = result.error || 'Invalid email or password'
      }
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

// Watch for user type changes (for tabs on desktop)
watch(userType, () => {
  credentials.value.identifier = ''
  credentials.value.password = ''
  error.value = ''
  updatePillPosition()
})

// Lifecycle
onMounted(async () => {
  updatePillPosition()
  window.addEventListener('resize', updatePillPosition)

  // If settings are not loaded yet (no logo and default school name), fetch them
  if (!schoolLogoUrl.value && schoolName.value === 'School Management System') {
    console.log('⚠️ [UnifiedLogin] No cached settings found, fetching from API...')
    try {
      const { data } = await fetchSettingsPublic(false)
      if (data) {
        // Try multiple possible field names from the API response
        schoolLogoUrl.value = (data as any).logo_url || data.school_logo_url || (data as any).logo
        schoolName.value = data.school_name || product()

        // Apply colors to the page
        if (data.primary_color) {
          applyPrimaryColor(data.primary_color)
        }
        if ((data as any).secondary_color) {
          applySecondaryColor((data as any).secondary_color)
        }

        console.log('✅ [UnifiedLogin] Loaded from API:', {
          logo: schoolLogoUrl.value,
          name: schoolName.value,
          primary: data.primary_color,
          secondary: (data as any).secondary_color
        })
      }
    } catch (error) {
      console.error('❌ [UnifiedLogin] Failed to fetch school settings:', error)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePillPosition)
})
</script>

<style scoped>
/* Animation for alerts */
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
