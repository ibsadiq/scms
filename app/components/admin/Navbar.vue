<!-- components/admin/Navbar.vue -->
<template>
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 flex items-center justify-between px-6 flex-shrink-0">
    <div class="flex items-center gap-3">
      <!-- School Logo -->
      <div class="h-10 w-10 flex-shrink-0">
        <img :src="schoolLogo()" :alt="displayName" class="h-full w-full object-contain" />
      </div>
      <!-- School name with tooltip -->
      <div class="hidden sm:flex items-center">
        <h2 class="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]" :title="displayName">
          {{ displayName }}
        </h2>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <NotificationDropdown view-all-link="/admin/notifications" />

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span class="text-sm font-semibold text-primary-700">
                {{ userInitials }}
              </span>
            </div>
            <span class="text-sm font-medium">{{ userName }}</span>
            <Icon name="lucide:chevron-down" class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <!-- Role Switcher Section (only if user has multiple roles) -->
          <template v-if="hasMultipleRoles">
            <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
            <DropdownMenuItem
              v-for="role in availableRoles"
              :key="role.path"
              @click="switchRole(role.path)"
              :class="{ 'bg-primary-50 dark:bg-primary-900/20': currentPath === role.path }"
            >
              <Icon :name="role.icon" class="w-4 h-4 mr-2" />
              {{ role.name }}
              <Icon v-if="currentPath === role.path" name="lucide:check" class="w-4 h-4 ml-auto" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </template>

          <DropdownMenuItem @click="navigateTo('/admin/profile')">
            <Icon name="lucide:user" class="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem @click="navigateTo('/admin/settings')">
            <Icon name="lucide:settings" class="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="text-red-600" :disabled="isLoggingOut">
            <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '~~/composables/useAuth'
import { useRoleSwitcher } from '~~/composables/useRoleSwitcher'
import { useBrand } from '~~/composables/useBrand'
const { school, product, schoolLogo } = useBrand()

const displayName = computed(() => school() || product())

interface Props {
  title: string
}

defineProps<Props>()

const { user, logout } = useAuth()
const isLoggingOut = ref(false)

// Role switcher
const { availableRoles, hasMultipleRoles, currentPath, switchRole } = useRoleSwitcher()

const userName = computed(() => {
  if (!user.value) return 'User'
  return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || user.value.username || 'User'
})
const formattedDate = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
const userInitials = computed(() => {
  if (!user.value) return 'U'
  const first = user.value.first_name?.[0] || ''
  const last = user.value.last_name?.[0] || ''
  return (first + last).toUpperCase() || user.value.username?.[0]?.toUpperCase() || 'U'
})

const handleLogout = async () => {
  if (isLoggingOut.value) return

  try {
    isLoggingOut.value = true
    await logout()
  } catch (error) {
    // Force redirect even on error
    window.location.href = '/login'
  } finally {
    isLoggingOut.value = false
  }
}
</script>