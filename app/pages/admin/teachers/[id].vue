<!-- pages/admin/teachers/[id].vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="outline" size="sm" @click="navigateTo('/admin/teachers')">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>
        <div v-if="!loading">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {{ teacher?.first_name }} {{ teacher?.last_name }}
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-1">
            {{ teacher?.empId || 'No Employee ID' }} • {{ teacher?.designation || 'No designation' }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="showEditDialog = true" v-if="teacher">
          <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
          Edit Teacher
        </Button>
        <Button variant="destructive" @click="handleDelete" v-if="teacher">
          <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Teacher Details -->
    <div v-else-if="teacher" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <Icon name="lucide:user-check" class="w-16 h-16 text-primary-700 dark:text-primary-400" />
              </div>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ teacher.first_name }} {{ teacher.middle_name }} {{ teacher.last_name }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {{ teacher.designation || 'Teacher' }}
              </p>
              <span
                class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                :class="teacher.inactive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
              >
                {{ teacher.inactive ? 'Inactive' : 'Active' }}
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
            <div v-if="teacher.email" class="flex items-start gap-3">
              <Icon name="lucide:mail" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.email }}</p>
              </div>
            </div>
            <div v-if="teacher.phone_number" class="flex items-start gap-3">
              <Icon name="lucide:phone" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Phone</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.phone_number }}</p>
              </div>
            </div>
            <div v-if="teacher.address" class="flex items-start gap-3">
              <Icon name="lucide:map-pin" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Address</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.address }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information -->
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Employee Number</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.empId || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Date of Birth</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ formatDate(teacher.date_of_birth) }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Gender</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.gender || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">National ID</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.national_id || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">TIN Number</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.tin_number || 'N/A' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Employment Information -->
        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Designation</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.designation || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Short Name</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.short_name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Status</p>
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-medium"
                  :class="teacher.inactive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                >
                  {{ teacher.inactive ? 'Inactive' : 'Active' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Salary</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  {{ teacher.salary ? `₦${formatCurrency(teacher.salary)}` : 'N/A' }}
                </p>
              </div>
              <div v-if="teacher.unpaid_salary">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Unpaid Salary</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  ₦{{formatCurrency(teacher.unpaid_salary)}}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Subject Specialization -->
        <Card v-if="teacher.subject_specialization_display && teacher.subject_specialization_display.length > 0">
          <CardHeader>
            <CardTitle>Subject Specialization</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Badge v-for="subject in teacher.subject_specialization_display" :key="subject" variant="secondary">
                {{ subject }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Alternative Email -->
        <Card v-if="teacher.alt_email">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Alternative Email</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ teacher.alt_email }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <Icon name="lucide:alert-circle" class="w-16 h-16 mx-auto text-red-500 mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Teacher Not Found</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">The teacher you're looking for doesn't exist.</p>
      <Button @click="navigateTo('/admin/teachers')">Back to Teachers</Button>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogScrollContent class="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>Update teacher information</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleUpdate" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Personal Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="edit_empId">Employee ID *</Label>
                <Input id="edit_empId" v-model="editForm.empId" required />
              </div>

              <div class="space-y-2">
                <Label for="edit_short_name">Short Name</Label>
                <Input id="edit_short_name" v-model="editForm.short_name" maxlength="3" />
              </div>

              <div class="space-y-2">
                <Label for="edit_designation">Designation</Label>
                <Input id="edit_designation" v-model="editForm.designation" />
              </div>
            </div>

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
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit_date_of_birth">Date of Birth</Label>
                <Input id="edit_date_of_birth" type="date" v-model="editForm.date_of_birth" />
              </div>

              <div class="space-y-2">
                <Label for="edit_gender">Gender</Label>
                <select
                  id="edit_gender"
                  v-model="editForm.gender"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Contact Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit_email">Email *</Label>
                <Input id="edit_email" type="email" v-model="editForm.email" required />
              </div>

              <div class="space-y-2">
                <Label for="edit_alt_email">Alternative Email</Label>
                <Input id="edit_alt_email" type="email" v-model="editForm.alt_email" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit_phone_number">Phone Number *</Label>
                <Input id="edit_phone_number" type="tel" v-model="editForm.phone_number" required />
              </div>

              <div class="space-y-2">
                <Label for="edit_address">Address</Label>
                <Input id="edit_address" v-model="editForm.address" />
              </div>
            </div>
          </div>

          <!-- National IDs -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">National Identification</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="edit_national_id">National ID</Label>
                <Input id="edit_national_id" v-model="editForm.national_id" />
              </div>

              <div class="space-y-2">
                <Label for="edit_nssf_number">NSSF Number</Label>
                <Input id="edit_nssf_number" v-model="editForm.nssf_number" />
              </div>

              <div class="space-y-2">
                <Label for="edit_tin_number">TIN Number</Label>
                <Input id="edit_tin_number" v-model="editForm.tin_number" />
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Academic Information</h3>

            <div class="space-y-2">
              <Label for="edit_subject_specialization">Subject Specialization</Label>
              <select
                id="edit_subject_specialization"
                v-model="editForm.subject_specialization"
                multiple
                class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Hold Ctrl/Cmd to select multiple subjects</p>
            </div>
          </div>

          <!-- Employment Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Employment Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="edit_salary">Salary</Label>
                <Input id="edit_salary" type="number" v-model.number="editForm.salary" step="0.01" />
              </div>

              <div class="space-y-2">
                <Label for="edit_inactive">Status</Label>
                <select
                  id="edit_inactive"
                  v-model="editForm.inactive"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                >
                  <option :value="false">Active</option>
                  <option :value="true">Inactive</option>
                </select>
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogScrollContent } from '@/components/ui/dialog'
import { useTeachers } from '~~/composables/admin/useTeachers'
import { useInvitations, type Invitation } from '~~/composables/admin/useInvitations'
import { useApi } from '~~/composables/useApi'
import type { Teacher, Subject } from '~~/types'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const route = useRoute()
const router = useRouter()
const { fetchTeacher, deleteTeacher, updateTeacher } = useTeachers()
const { fetchInvitationByProfileId, resendInvitation } = useInvitations()
const { apiCall } = useApi()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const teacher = ref<Teacher | null>(null)
const loading = ref(true)
const showEditDialog = ref(false)
const invitation = ref<Invitation | null>(null)
const resendingInvitation = ref(false)
const updating = ref(false)
const subjects = ref<Subject[]>([])

const editForm = ref({
  empId: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  alt_email: '',
  address: '',
  gender: '',
  date_of_birth: '',
  national_id: '',
  nssf_number: '',
  tin_number: '',
  designation: '',
  short_name: '',
  subject_specialization: [] as number[],
  salary: null as number | null,
  inactive: false
})

// Initialize edit form when dialog opens
watch(showEditDialog, (newValue) => {
  if (newValue && teacher.value) {
    editForm.value = {
      empId: teacher.value.empId,
      first_name: teacher.value.first_name,
      middle_name: teacher.value.middle_name || '',
      last_name: teacher.value.last_name,
      email: teacher.value.email,
      phone_number: teacher.value.phone_number,
      alt_email: teacher.value.alt_email || '',
      address: teacher.value.address || '',
      gender: teacher.value.gender || '',
      date_of_birth: teacher.value.date_of_birth || '',
      national_id: teacher.value.national_id || '',
      nssf_number: teacher.value.nssf_number || '',
      tin_number: teacher.value.tin_number || '',
      designation: teacher.value.designation || '',
      short_name: teacher.value.short_name || '',
      subject_specialization: teacher.value.subject_specialization?.map(name =>
        subjects.value.find(s => s.name === name)?.id
      ).filter(Boolean) as number[] || [],
      salary: teacher.value.salary,
      inactive: teacher.value.inactive || false
    }
  }
})

// Load teacher data and subjects
onMounted(async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    showErrorToast('Invalid teacher ID', 'Error')
    router.push('/admin/teachers')
    return
  }

  const [teacherResponse, subjectsResponse] = await Promise.all([
    fetchTeacher(id),
    apiCall<Subject[]>('/academic/subjects/')
  ])

  loading.value = false

  if (teacherResponse.data) {
    teacher.value = teacherResponse.data

    // Check for invitation
    invitation.value = await fetchInvitationByProfileId('teacher', id)
  } else {
    showErrorToast(teacherResponse.error, 'Failed to load teacher')
  }

  if (subjectsResponse.data) {
    subjects.value = subjectsResponse.data
  }

  // Check if edit query parameter is present and open edit dialog
  if (route.query.edit === 'true') {
    showEditDialog.value = true
  }
})

// Handle update
const handleUpdate = async () => {
  if (!teacher.value) return

  updating.value = true

  // Convert subject IDs to subject names for backend
  const subjectNames = editForm.value.subject_specialization
    ?.map(id => subjects.value.find(s => s.id === id)?.name)
    .filter(Boolean) || []

  const payload = {
    ...editForm.value,
    subject_specialization: subjectNames,
    // Convert empty date strings to null
    date_of_birth: editForm.value.date_of_birth || null
  }

  const response = await updateTeacher(teacher.value.id!, payload)

  if (response.error) {
    showErrorToast(response.error, 'Failed to update teacher')
  } else {
    showSuccessToast(`${editForm.value.first_name} ${editForm.value.last_name} updated successfully`)
    teacher.value = response.data!
    showEditDialog.value = false
  }

  updating.value = false
}

// Handle delete
const handleDelete = async () => {
  if (!teacher.value) return

  if (!confirm(`Are you sure you want to delete ${teacher.value.first_name} ${teacher.value.last_name}?`)) {
    return
  }

  const response = await deleteTeacher(teacher.value.id!)
  if (response.error) {
    showErrorToast(response.error, 'Failed to delete teacher')
  } else {
    showSuccessToast(`${teacher.value.first_name} ${teacher.value.last_name} deleted successfully`)
    router.push('/admin/teachers')
  }
}

// Format date
const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
    showError('Failed to resend invitation')
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
    showError('Failed to copy link')
  }
}
</script>
