<!-- pages/admin/profile.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Profile</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View and update your personal information
        </p>
      </div>
      <Button v-if="!isEditing" @click="startEditing">
        <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
        Edit Profile
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !profile" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Profile Content -->
    <div v-else-if="profile" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <Card class="lg:col-span-1">
        <CardContent class="pt-6">
          <div class="flex flex-col items-center text-center">
            <!-- Profile Photo -->
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-4">
              <Icon name="lucide:user" size="64" class="text-white" />
            </div>

            <!-- User Info -->
            <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{{ fullName }}</h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">@{{ profile.username }}</p>

            <div class="mt-4 space-y-2 w-full">
              <div class="flex flex-wrap items-center justify-center gap-2">
                <Badge v-if="profile.isAdmin" variant="default">
                  <Icon name="lucide:shield" class="w-3 h-3 mr-1" />
                  Admin
                </Badge>
                <Badge v-if="profile.isAccountant" variant="default">
                  <Icon name="lucide:calculator" class="w-3 h-3 mr-1" />
                  Accountant
                </Badge>
                <Badge v-if="profile.isTeacher" variant="default">
                  <Icon name="lucide:book-open" class="w-3 h-3 mr-1" />
                  Teacher
                </Badge>
                <Badge v-if="profile.isParent" variant="default">
                  <Icon name="lucide:users" class="w-3 h-3 mr-1" />
                  Parent
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Details Card -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form v-if="isEditing" @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="first_name">First Name</Label>
                <Input
                  id="first_name"
                  v-model="editForm.first_name"
                  type="text"
                  placeholder="First name"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  v-model="editForm.middle_name"
                  type="text"
                  placeholder="Middle name (optional)"
                />
              </div>

              <div class="space-y-2">
                <Label for="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  v-model="editForm.last_name"
                  type="text"
                  placeholder="Last name"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  v-model="editForm.email"
                  type="email"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  v-model="editForm.phone_number"
                  type="tel"
                  placeholder="08012345678"
                />
              </div>

              <div class="space-y-2 md:col-span-2">
                <Label for="address">Address</Label>
                <Input
                  id="address"
                  v-model="editForm.address"
                  type="text"
                  placeholder="Your address"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" @click="cancelEditing">
                Cancel
              </Button>
              <Button type="submit" :disabled="loading">
                <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Save Changes
              </Button>
            </div>
          </form>

          <div v-else class="space-y-4">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">First Name</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.first_name || 'N/A' }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Middle Name</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.middle_name || 'N/A' }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Last Name</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.last_name || 'N/A' }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Username</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.username }}</p>
              </div>

              <div v-if="profile.gender">
                <Label class="text-neutral-500 dark:text-neutral-400">Gender</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.gender }}</p>
              </div>

              <div v-if="profile.date_of_birth">
                <Label class="text-neutral-500 dark:text-neutral-400">Date of Birth</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">
                  {{ formatDate(profile.date_of_birth) }}
                </p>
              </div>
            </div>

            <Separator />

            <!-- Contact Information -->
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Contact Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Email Address</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.email }}</p>
                </div>

                <div v-if="profile.phone_number">
                  <Label class="text-neutral-500 dark:text-neutral-400">Phone Number</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.phone_number }}</p>
                </div>

                <div v-if="profile.address">
                  <Label class="text-neutral-500 dark:text-neutral-400">Address</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.address }}</p>
                </div>
              </div>
            </div>

            <Separator />

            <!-- Account Information -->
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Account Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">User ID</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.id }}</p>
                </div>

                <div v-if="profile.date_joined">
                  <Label class="text-neutral-500 dark:text-neutral-400">Date Joined</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ formatDate(profile.date_joined) }}</p>
                </div>

                <div v-if="profile.last_login">
                  <Label class="text-neutral-500 dark:text-neutral-400">Last Login</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ formatDateTime(profile.last_login) }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAdminProfile } from '~~/composables/admin/useProfile'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { success: showSuccessToast, error: showError } = useToast()

const { profile, loading, error, fetchProfile, updateProfile } = useAdminProfile()

const isEditing = ref(false)
const editForm = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  address: ''
})

// Computed full name
const fullName = computed(() => {
  if (!profile.value) return ''
  const parts = [
    profile.value.first_name,
    profile.value.middle_name,
    profile.value.last_name
  ].filter(Boolean)
  return parts.join(' ') || profile.value.username
})

// Format date helper
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format date and time helper
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Start editing
const startEditing = () => {
  if (!profile.value) return

  editForm.value = {
    first_name: profile.value.first_name || '',
    middle_name: profile.value.middle_name || '',
    last_name: profile.value.last_name || '',
    email: profile.value.email || '',
    phone_number: profile.value.phone_number || '',
    address: profile.value.address || ''
  }

  isEditing.value = true
}

// Cancel editing
const cancelEditing = () => {
  isEditing.value = false
  editForm.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: ''
  }
}

// Save profile
const saveProfile = async () => {
  const result = await updateProfile(editForm.value)

  if (result.success) {
    showSuccessToast(result.message || 'Profile updated successfully')
    isEditing.value = false
  } else {
    showError(result.error || 'Failed to update profile')
  }
}

// Fetch profile on mount
onMounted(async () => {
  await fetchProfile()
})

useHead({
  title: 'My Profile'
})
</script>
