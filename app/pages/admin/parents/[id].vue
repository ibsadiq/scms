<!-- pages/admin/parents/[id].vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="outline" size="sm" @click="navigateTo('/admin/parents')">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Back to Parents
        </Button>
        <div v-if="!loading">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {{ parent?.first_name }} {{ parent?.last_name }}
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-1">
            {{ parent?.parent_type }} • {{ parent?.children_details?.length || 0 }} child(ren)
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="showEditDialog = true" v-if="parent">
          <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
          Edit Parent
        </Button>
        <Button variant="destructive" @click="handleDelete" v-if="parent">
          <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Parent Details -->
    <div v-else-if="parent" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Profile & Contact -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Profile Card -->
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-center">
              <div class="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon name="lucide:user-circle" class="w-16 h-16 text-primary-700 dark:text-primary-400" />
              </div>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ parent.first_name }} {{ parent.middle_name }} {{ parent.last_name }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {{ parent.parent_type }}
              </p>
              <span
                class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                :class="parent.inactive ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
              >
                {{ parent.inactive ? 'Inactive' : 'Active' }}
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Invitation Status Card -->
        <Card v-if="invitation">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="lucide:mail-check" class="w-5 h-5" />
              Account Invitation
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="p-3 rounded-lg" :class="getInvitationStatusBg(invitation.status)">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">Status</span>
                <span class="text-xs px-2 py-1 rounded-full font-medium" :class="getInvitationStatusClass(invitation.status)">
                  {{ invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1) }}
                </span>
              </div>
              <p class="text-xs text-neutral-600 dark:text-neutral-400">
                <span v-if="invitation.status === 'pending'">
                  Invitation sent {{ formatDate(invitation.created_at) }}
                </span>
                <span v-else-if="invitation.status === 'accepted'">
                  Account activated {{ formatDate(invitation.accepted_at) }}
                </span>
                <span v-else>
                  Invitation expired
                </span>
              </p>
              <p v-if="invitation.status === 'pending' && invitation.days_until_expiry !== undefined" class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                <Icon name="lucide:clock" class="w-3 h-3 inline mr-1" />
                Expires in {{ invitation.days_until_expiry }} day(s)
              </p>
            </div>

            <div v-if="invitation.status === 'pending'" class="flex gap-2">
              <Button @click="handleResendInvitation" size="sm" variant="outline" class="flex-1" :disabled="resendingInvitation">
                <Icon v-if="resendingInvitation" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                <Icon v-else name="lucide:send" class="w-4 h-4 mr-2" />
                Resend
              </Button>
              <Button @click="copyInvitationLink" size="sm" variant="outline" class="flex-1">
                <Icon name="lucide:copy" class="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Contact Information -->
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="parent.email" class="flex items-start gap-3">
              <Icon name="lucide:mail" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Primary Email</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ parent.email }}</p>
              </div>
            </div>
            <div v-if="parent.alt_email" class="flex items-start gap-3">
              <Icon name="lucide:mail" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Alternative Email</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ parent.alt_email }}</p>
              </div>
            </div>
            <div v-if="parent.phone_number" class="flex items-start gap-3">
              <Icon name="lucide:phone" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Phone Number</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ parent.phone_number }}</p>
              </div>
            </div>
            <div v-if="parent.address" class="flex items-start gap-3">
              <Icon name="lucide:map-pin" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Address</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ parent.address }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Details & Children -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information -->
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Full Name</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  {{ parent.first_name }} {{ parent.middle_name }} {{ parent.last_name }}
                </p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Relationship</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ parent.parent_type }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Gender</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ parent.gender || 'N/A' }}</p>
              </div>
              <div v-if="parent.date_of_birth">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Date of Birth</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ formatDate(parent.date_of_birth) }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">National ID</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ parent.national_id || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Occupation</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ parent.occupation || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Single Parent</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ parent.single_parent ? 'Yes' : 'No' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Children Information -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Children ({{ parent.children_details?.length || 0 }})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="!parent.children_details || parent.children_details.length === 0" class="text-center py-8">
              <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
              <p class="text-sm text-neutral-500 dark:text-neutral-400">No children assigned</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="child in parent.children_details"
                :key="child.id"
                class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                @click="navigateTo(`/admin/students/${child.id}`)"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon name="lucide:user" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">
                      {{ child.first_name }} {{ child.last_name }}
                    </p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">
                      {{ child.admission_number }} • {{ child.current_class }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="getStatusClass(child.status)"
                  >
                    {{ child.status }}
                  </span>
                  <Icon name="lucide:chevron-right" class="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <Icon name="lucide:alert-circle" class="w-16 h-16 mx-auto text-red-500 mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Parent Not Found</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">The parent you're looking for doesn't exist.</p>
      <Button @click="navigateTo('/admin/parents')">Back to Parents</Button>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
          <DialogDescription>Update parent information</DialogDescription>
        </DialogHeader>
        <div class="text-center py-8">
          <Icon name="lucide:construction" class="w-12 h-12 mx-auto text-neutral-400 mb-2" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">Edit functionality coming soon!</p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useParents } from '~~/composables/admin/useParents'
import { useInvitations, type Invitation } from '~~/composables/admin/useInvitations'
import type { Parent } from '~~/types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { fetchParent, deleteParent } = useParents()
const { fetchInvitationByProfileId, resendInvitation } = useInvitations()

const parent = ref<Parent | null>(null)
const loading = ref(true)
const showEditDialog = ref(false)
const invitation = ref<Invitation | null>(null)
const resendingInvitation = ref(false)

// Load parent data
onMounted(async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    toast.error('Invalid parent ID')
    router.push('/admin/parents')
    return
  }

  const response = await fetchParent(id)
  loading.value = false

  if (response.data) {
    parent.value = response.data

    // Check for invitation
    const invitationData = await fetchInvitationByProfileId('parent', id)
    invitation.value = invitationData || null
  } else {
    toast.error(response.error || 'Failed to load parent')
  }
})

// Handle delete
const handleDelete = async () => {
  if (!parent.value) return

  if (!confirm(`Are you sure you want to delete ${parent.value.first_name} ${parent.value.last_name}?`)) {
    return
  }

  const response = await deleteParent(parent.value.id!)
  if (response.error) {
    toast.error('Failed to delete parent: ' + response.error)
  } else {
    toast.success(`${parent.value.first_name} ${parent.value.last_name} deleted successfully`)
    router.push('/admin/parents')
  }
}

// Get status class
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'Graduated': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Transferred': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }
  return classes[status] || classes['Active']
}

// Format date
const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Invitation helpers
const getInvitationStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'accepted':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'expired':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getInvitationStatusBg = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800'
    case 'accepted':
      return 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
    case 'expired':
      return 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
    default:
      return 'bg-gray-50 dark:bg-gray-900/10 border border-gray-200 dark:border-gray-800'
  }
}

const handleResendInvitation = async () => {
  if (!invitation.value) return

  resendingInvitation.value = true
  const response = await resendInvitation(invitation.value.id)
  resendingInvitation.value = false

  if (response.error) {
    toast.error('Failed to resend invitation')
  } else {
    toast.success('Invitation resent successfully')
  }
}

const copyInvitationLink = async () => {
  if (!invitation.value) return

  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || window.location.origin
  const link = `${baseUrl}/setup-account?token=${invitation.value.token}`

  try {
    await navigator.clipboard.writeText(link)
    toast.success('Invitation link copied to clipboard')
  } catch (err) {
    toast.error('Failed to copy link')
  }
}
</script>
