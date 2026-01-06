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
      <DialogScrollContent class="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
          <DialogDescription>Update parent information</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleUpdate" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="edit_first_name">First Name *</Label>
                <Input id="edit_first_name" v-model="editForm.first_name" required />
              </div>
              <div class="space-y-2">
                <Label for="edit_middle_name">Middle Name</Label>
                <Input id="edit_middle_name" v-model="editForm.middle_name" />
              </div>
              <div class="space-y-2">
                <Label for="edit_last_name">Last Name *</Label>
                <Input id="edit_last_name" v-model="editForm.last_name" required />
              </div>
              <div class="space-y-2">
                <Label for="edit_date_of_birth">Date of Birth</Label>
                <Input id="edit_date_of_birth" v-model="editForm.date_of_birth" type="date" />
              </div>
              <div class="space-y-2">
                <Label for="edit_gender">Gender</Label>
                <select id="edit_gender" v-model="editForm.gender" class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm ring-offset-white dark:ring-offset-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300">
                  <option :value="null">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="edit_parent_type">Relationship *</Label>
                <select id="edit_parent_type" v-model="editForm.parent_type" required class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm ring-offset-white dark:ring-offset-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300">
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit_email">Primary Email</Label>
                <Input id="edit_email" v-model="editForm.email" type="email" />
              </div>
              <div class="space-y-2">
                <Label for="edit_alt_email">Alternative Email</Label>
                <Input id="edit_alt_email" v-model="editForm.alt_email" type="email" />
              </div>
              <div class="space-y-2">
                <Label for="edit_phone_number">Phone Number *</Label>
                <Input id="edit_phone_number" v-model="editForm.phone_number" required />
              </div>
              <div class="space-y-2">
                <Label for="edit_address">Address</Label>
                <Input id="edit_address" v-model="editForm.address" />
              </div>
            </div>
          </div>

          <!-- National IDs & Employment -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Additional Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="edit_national_id">National ID</Label>
                <Input id="edit_national_id" v-model="editForm.national_id" />
              </div>
              <div class="space-y-2">
                <Label for="edit_occupation">Occupation</Label>
                <Input id="edit_occupation" v-model="editForm.occupation" />
              </div>
              <div class="space-y-2">
                <Label for="edit_monthly_income">Monthly Income (UGX)</Label>
                <Input id="edit_monthly_income" v-model.number="editForm.monthly_income" type="number" />
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Status</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-2">
                <input
                  id="edit_single_parent"
                  type="checkbox"
                  v-model="editForm.single_parent"
                  class="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                />
                <Label for="edit_single_parent" class="font-normal cursor-pointer">Single Parent</Label>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  id="edit_inactive"
                  type="checkbox"
                  v-model="editForm.inactive"
                  class="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
                />
                <Label for="edit_inactive" class="font-normal cursor-pointer">Mark as Inactive</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditDialog = false">Cancel</Button>
            <Button type="submit" :disabled="updating">
              <Icon v-if="updating" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ updating ? 'Saving...' : 'Save Changes' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogScrollContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useParents } from '~~/composables/admin/useParents'
import { useInvitations, type Invitation } from '~~/composables/admin/useInvitations'
import type { Parent } from '~~/types'
import { useErrorHandler } from '~~/composables/useErrorHandler'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { fetchParent, updateParent, deleteParent } = useParents()
const { fetchInvitationByProfileId, resendInvitation } = useInvitations()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const parent = ref<Parent | null>(null)
const loading = ref(true)
const showEditDialog = ref(false)
const invitation = ref<Invitation | null>(null)
const resendingInvitation = ref(false)
const updating = ref(false)

const editForm = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  alt_email: '',
  address: '',
  gender: null as 'Male' | 'Female' | null,
  date_of_birth: '',
  parent_type: 'Father' as 'Father' | 'Mother' | 'Guardian' | 'Other',
  national_id: '',
  occupation: '',
  monthly_income: null as number | null,
  single_parent: false,
  inactive: false
})

// Watch for edit dialog open and initialize form
watch(showEditDialog, (newValue) => {
  if (newValue && parent.value) {
    editForm.value = {
      first_name: parent.value.first_name || '',
      middle_name: parent.value.middle_name || '',
      last_name: parent.value.last_name || '',
      email: parent.value.email || '',
      phone_number: parent.value.phone_number || '',
      alt_email: parent.value.alt_email || '',
      address: parent.value.address || '',
      gender: parent.value.gender || null,
      date_of_birth: parent.value.date_of_birth || '',
      parent_type: parent.value.parent_type || 'Father',
      national_id: parent.value.national_id || '',
      occupation: parent.value.occupation || '',
      monthly_income: parent.value.monthly_income || null,
      single_parent: parent.value.single_parent || false,
      inactive: parent.value.inactive || false
    }
  }
})

// Load parent data
onMounted(async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    showErrorToast('Invalid parent ID', 'Error')
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
    showErrorToast(response.error, 'Failed to load parent')
  }

  // Check if edit query parameter is present and open edit dialog
  if (route.query.edit === 'true') {
    showEditDialog.value = true
  }
})

// Handle update
const handleUpdate = async () => {
  if (!parent.value) return

  updating.value = true

  const payload = {
    ...editForm.value,
    // Convert empty date strings to null
    date_of_birth: editForm.value.date_of_birth || null
  }

  const response = await updateParent(parent.value.id!, payload)

  if (response.error) {
    showErrorToast(response.error, 'Failed to update parent')
  } else {
    showSuccessToast(`${editForm.value.first_name} ${editForm.value.last_name} updated successfully`)
    parent.value = response.data!
    showEditDialog.value = false
  }

  updating.value = false
}

// Handle delete
const handleDelete = async () => {
  if (!parent.value) return

  if (!confirm(`Are you sure you want to delete ${parent.value.first_name} ${parent.value.last_name}?`)) {
    return
  }

  const response = await deleteParent(parent.value.id!)
  if (response.error) {
    showErrorToast(response.error, 'Failed to delete parent')
  } else {
    showSuccessToast(`${parent.value.first_name} ${parent.value.last_name} deleted successfully`)
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
    showErrorToast(response.error, 'Failed to resend invitation')
  } else {
    showSuccessToast('Invitation resent successfully')
  }
}

const copyInvitationLink = async () => {
  if (!invitation.value) return

  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || window.location.origin
  const link = `${baseUrl}/setup-account?token=${invitation.value.token}`

  try {
    await navigator.clipboard.writeText(link)
    showSuccessToast('Invitation link copied to clipboard')
  } catch (err) {
    showErrorToast(err, 'Failed to copy link')
  }
}
</script>
