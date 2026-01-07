<!-- pages/parent/profile.vue -->
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
              <Icon v-if="!profile.image" name="lucide:user" size="64" class="text-white" />
              <img v-else :src="profile.image" :alt="fullName" class="w-full h-full rounded-full object-cover" />
            </div>

            <!-- Parent Info -->
            <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{{ fullName }}</h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ profile.parent_type || 'Parent' }}</p>

            <div class="mt-4 space-y-2 w-full">
              <div v-if="profile.occupation" class="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Icon name="lucide:briefcase" class="w-4 h-4" />
                <span>{{ profile.occupation }}</span>
              </div>
              <div v-if="profile.children_details && profile.children_details.length > 0" class="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Icon name="lucide:users" class="w-4 h-4" />
                <span>{{ profile.children_details.length }} {{ profile.children_details.length === 1 ? 'Child' : 'Children' }}</span>
              </div>
              <div class="flex items-center justify-center gap-2 text-sm">
                <Badge :variant="!profile.inactive ? 'default' : 'secondary'">
                  {{ !profile.inactive ? 'Active' : 'Inactive' }}
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
                <Label for="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  v-model="editForm.phone_number"
                  type="tel"
                  placeholder="08012345678"
                />
              </div>

              <div class="space-y-2">
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  v-model="editForm.email"
                  type="email"
                  placeholder="parent@email.com"
                />
              </div>

              <div class="space-y-2">
                <Label for="alt_email">Alternative Email</Label>
                <Input
                  id="alt_email"
                  v-model="editForm.alt_email"
                  type="email"
                  placeholder="alternative@email.com"
                />
              </div>

              <div class="space-y-2">
                <Label for="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  v-model="editForm.occupation"
                  type="text"
                  placeholder="Your occupation"
                />
              </div>

              <div class="space-y-2">
                <Label for="monthly_income">Monthly Income</Label>
                <Input
                  id="monthly_income"
                  v-model.number="editForm.monthly_income"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
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
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.first_name }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Middle Name</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.middle_name || 'N/A' }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Last Name</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.last_name }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Parent Type</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.parent_type || 'N/A' }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Gender</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.gender || 'N/A' }}</p>
              </div>

              <div>
                <Label class="text-neutral-500 dark:text-neutral-400">Date of Birth</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">
                  {{ formatDate(profile.date_of_birth) }}
                </p>
              </div>

              <div v-if="profile.national_id">
                <Label class="text-neutral-500 dark:text-neutral-400">National ID</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.national_id }}</p>
              </div>

              <div v-if="profile.single_parent !== undefined">
                <Label class="text-neutral-500 dark:text-neutral-400">Single Parent</Label>
                <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.single_parent ? 'Yes' : 'No' }}</p>
              </div>
            </div>

            <Separator />

            <!-- Contact Information -->
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Contact Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Phone Number</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.phone_number || 'Not provided' }}</p>
                </div>

                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Email Address</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.email || 'Not provided' }}</p>
                </div>

                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Alternative Email</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.alt_email || 'Not provided' }}</p>
                </div>

                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Address</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.address || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <Separator v-if="profile.occupation || profile.monthly_income" />

            <!-- Professional Information -->
            <div v-if="profile.occupation || profile.monthly_income">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Professional Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="profile.occupation">
                  <Label class="text-neutral-500 dark:text-neutral-400">Occupation</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ profile.occupation }}</p>
                </div>

                <div v-if="profile.monthly_income">
                  <Label class="text-neutral-500 dark:text-neutral-400">Monthly Income</Label>
                  <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ formatCurrency(profile.monthly_income) }}</p>
                </div>
              </div>
            </div>

            <Separator v-if="profile.children_details && profile.children_details.length > 0" />

            <!-- Children Information -->
            <div v-if="profile.children_details && profile.children_details.length > 0">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Children</h3>
              <div class="space-y-3">
                <div
                  v-for="(child, index) in profile.children_details"
                  :key="index"
                  class="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label class="text-neutral-500 dark:text-neutral-400 text-xs">Name</Label>
                      <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ child.name || 'N/A' }}</p>
                    </div>
                    <div>
                      <Label class="text-neutral-500 dark:text-neutral-400 text-xs">Class</Label>
                      <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ child.classroom_name || 'N/A' }}</p>
                    </div>
                    <div>
                      <Label class="text-neutral-500 dark:text-neutral-400 text-xs">Admission Number</Label>
                      <p class="text-neutral-900 dark:text-neutral-100 font-medium">{{ child.admission_number || 'N/A' }}</p>
                    </div>
                  </div>
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
import { useParentProfile } from '~~/composables/parent/useProfile'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'parent'
})

const { success: showSuccessToast, error: showError } = useToast()

const { profile, loading, error, fetchProfile, updateProfile } = useParentProfile()

const isEditing = ref(false)
const editForm = ref({
  phone_number: '',
  email: '',
  alt_email: '',
  address: '',
  occupation: '',
  monthly_income: 0
})

// Computed full name
const fullName = computed(() => {
  if (!profile.value) return ''
  const parts = [
    profile.value.first_name,
    profile.value.middle_name,
    profile.value.last_name
  ].filter(Boolean)
  return parts.join(' ')
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

// Format currency helper
const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS'
  }).format(amount)
}

// Start editing
const startEditing = () => {
  if (!profile.value) return

  editForm.value = {
    phone_number: profile.value.phone_number || '',
    email: profile.value.email || '',
    alt_email: profile.value.alt_email || '',
    address: profile.value.address || '',
    occupation: profile.value.occupation || '',
    monthly_income: profile.value.monthly_income || 0
  }

  isEditing.value = true
}

// Cancel editing
const cancelEditing = () => {
  isEditing.value = false
  editForm.value = {
    phone_number: '',
    email: '',
    alt_email: '',
    address: '',
    occupation: '',
    monthly_income: 0
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
  title: 'My Profile - Parent'
})
</script>
