<template>
  <header class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 flex items-center justify-between px-6 flex-shrink-0">
    <div class="flex items-center gap-3">
      <!-- School Logo -->
      <div class="h-10 w-10 flex-shrink-0">
        <img :src="schoolLogo()" :alt="displayName" class="h-full w-full object-contain" />
      </div>
      <!-- School name -->
      <div class="hidden sm:block">
        <h2 class="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]" :title="displayName">
          {{ displayName }}
        </h2>
      </div>
    </div>
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <NotificationDropdown view-all-link="/teacher/notifications" />

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Profile Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon name="lucide:user" class="w-4 h-4 text-primary-700 dark:text-primary-400" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
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

            <DropdownMenuItem @click="navigateTo('/teacher/profile')">
              <Icon name="lucide:user" class="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout" class="text-red-600">
              <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
  </header>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '~~/stores/auth'
import { useRoleSwitcher } from '~~/composables/useRoleSwitcher'
import { useBrand } from '~~/composables/useBrand'

defineProps<{
  title: string
}>()

const { school, product, schoolLogo } = useBrand()

const displayName = computed(() => school() || product())

const authStore = useAuthStore()

// Role switcher
const { availableRoles, hasMultipleRoles, currentPath, switchRole } = useRoleSwitcher()

const handleLogout = async () => {
  // Clear authentication state
  authStore.clearAuth()

  // Redirect to login page
  await navigateTo('/login')
}
</script>
