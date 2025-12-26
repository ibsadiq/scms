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
      <Button variant="ghost" size="icon">
        <Icon name="lucide:bell" class="w-5 h-5" />
      </Button>

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
          <DropdownMenuLabel>
            <div class="flex flex-col">
              <span class="font-semibold">{{ parentName }}</span>
              <span class="text-xs text-neutral-500 font-normal">Parent</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="navigateTo('/parent/profile')">
            <Icon name="lucide:user" class="w-4 h-4 mr-2" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem @click="navigateTo('/parent/settings')">
            <Icon name="lucide:settings" class="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem @click="showChangePassword = true">
            <Icon name="lucide:key" class="w-4 h-4 mr-2" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout" class="text-red-600">
            <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Change Password Dialog -->
    <Dialog v-model:open="showChangePassword">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div class="space-y-2">
            <Label for="old_password">Current Password</Label>
            <Input
              id="old_password"
              v-model="passwordForm.old_password"
              type="password"
              placeholder="Enter current password"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="new_password">New Password</Label>
            <Input
              id="new_password"
              v-model="passwordForm.new_password"
              type="password"
              placeholder="Enter new password"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="new_password_confirm">Confirm New Password</Label>
            <Input
              id="new_password_confirm"
              v-model="passwordForm.new_password_confirm"
              type="password"
              placeholder="Confirm new password"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showChangePassword = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="isChangingPassword">
              <Icon v-if="isChangingPassword" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              Change Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { useAuth } from '~~/composables/useAuth'
import { useBrand } from '~~/composables/useBrand'

defineProps<{
  title: string
}>()

const { user, logout } = useAuth()
const { school, product, schoolLogo } = useBrand()

const displayName = computed(() => school() || product())

const formattedDate = computed(() => {
  const today = new Date()
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Compute parent full name
const parentName = computed(() => {
  if (!user.value) return 'Parent'

  const parts = [
    user.value.first_name,
    user.value.middle_name,
    user.value.last_name
  ].filter(Boolean)

  return parts.join(' ') || 'Parent'
})

// Change password
const showChangePassword = ref(false)
const isChangingPassword = ref(false)
const passwordForm = ref({
  old_password: '',
  new_password: '',
  new_password_confirm: ''
})

const handleChangePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirm) {
    toast.error('Passwords do not match')
    return
  }

  isChangingPassword.value = true

  try {
    const config = useRuntimeConfig()
    const { token } = useAuth()

    await $fetch(`${config.public.apiBase}/users/change-password/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: passwordForm.value
    })

    toast.success('Password changed successfully!')
    showChangePassword.value = false
    passwordForm.value = {
      old_password: '',
      new_password: '',
      new_password_confirm: ''
    }
  } catch (error: any) {
    toast.error(error.data?.detail || 'Failed to change password')
  } finally {
    isChangingPassword.value = false
  }
}

const handleLogout = async () => {
  await logout()
}
</script>
