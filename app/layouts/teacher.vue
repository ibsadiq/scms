<!-- layouts/teacher.vue -->
<template>
  <div class="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="isMobileMenuOpen = false"
      />
    </Transition>

    <!-- Sidebar - Hidden on mobile, slides in when menu is open -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isMobileMenuOpen || !isMobile"
        class="fixed lg:static inset-y-0 left-0 z-50 lg:z-auto"
      >
        <TeacherSidebar @close="isMobileMenuOpen = false" />
      </div>
    </Transition>

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Mobile Header -->
      <div class="lg:hidden flex items-center justify-between gap-2 px-3 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <!-- Hamburger Menu -->
        <button
          @click="isMobileMenuOpen = true"
          class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex-shrink-0"
        >
          <Icon name="lucide:menu" class="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </button>

        <!-- Page Title -->
        <h1 class="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate flex-1 text-center">{{ pageTitle }}</h1>

        <!-- Mobile Actions -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <!-- Notifications -->
          <Button variant="ghost" size="icon" class="h-9 w-9">
            <Icon name="lucide:bell" class="w-5 h-5" />
          </Button>

          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- Profile Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-9 w-9">
                <div class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon name="lucide:user" class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="navigateTo('/teacher/profile')">
                <Icon name="lucide:user" class="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem @click="navigateTo('/teacher/settings')">
                <Icon name="lucide:settings" class="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleLogout" class="text-red-600">
                <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TeacherNavbar :title="pageTitle" class="hidden lg:flex" />
      <main class="flex-1 overflow-y-auto p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '~~/composables/useAuth'

const route = useRoute()
const { logout } = useAuth()
const isMobileMenuOpen = ref(false)
const isMobile = ref(false)

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/teacher') return 'Dashboard'
  if (path.includes('classes')) return 'My Classes'
  if (path.includes('timetable')) return 'My Timetable'
  if (path.includes('attendance')) return 'Attendance'
  if (path.includes('grades')) return 'Grades & Results'
  if (path.includes('assignments')) return 'Assignments'
  if (path.includes('students')) return 'Students'
  return 'Teacher Portal'
})

const handleLogout = async () => {
  await logout()
  navigateTo('/login')
}

// Check if mobile on mount and window resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Close mobile menu when route changes
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})
</script>
