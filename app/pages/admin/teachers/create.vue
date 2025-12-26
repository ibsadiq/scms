<!-- pages/admin/teachers/create.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/teachers')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Add New Teacher</h1>
        <p class="text-neutral-600 mt-1">Register a new teaching staff member</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Teacher Information</CardTitle>
        <CardDescription>Enter the teacher's personal and employment details</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Personal Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="empId">Employee ID *</Label>
                <Input
                  id="empId"
                  v-model="formData.empId"
                  placeholder="e.g., TCH001"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="short_name">Short Name</Label>
                <Input
                  id="short_name"
                  v-model="formData.short_name"
                  placeholder="e.g., JD"
                  maxlength="3"
                />
              </div>

              <div class="space-y-2">
                <Label for="designation">Designation</Label>
                <Input
                  id="designation"
                  v-model="formData.designation"
                  placeholder="e.g., Senior Teacher"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  v-model="formData.first_name"
                  placeholder="John"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  v-model="formData.middle_name"
                  placeholder="Optional"
                />
              </div>

              <div class="space-y-2">
                <Label for="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  v-model="formData.last_name"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="date_of_birth">Date of Birth *</Label>
                <DateInput
                  id="date_of_birth"
                  v-model="formData.date_of_birth"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="gender">Gender *</Label>
                <select
                  id="gender"
                  v-model="formData.gender"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="inactive">Status *</Label>
                <select
                  id="inactive"
                  v-model="formData.inactive"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                  required
                >
                  <option :value="false">Active</option>
                  <option :value="true">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Contact Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="email">Email *</Label>
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="teacher@example.com"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  v-model="formData.phone_number"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="national_id">National ID</Label>
                <Input
                  id="national_id"
                  v-model="formData.national_id"
                  placeholder="National ID Number"
                />
              </div>

              <div class="space-y-2">
                <Label for="tin_number">TIN Number</Label>
                <Input
                  id="tin_number"
                  v-model="formData.tin_number"
                  placeholder="Tax Identification Number"
                  maxlength="9"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="address">Address</Label>
              <Textarea
                id="address"
                v-model="formData.address"
                placeholder="Enter full address"
                rows="3"
              />
            </div>
          </div>

          <!-- Professional Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Professional Information</h3>

            <div class="space-y-2">
              <Label for="subjects">Subject Specialization *</Label>
              <MultiSelect
                v-model="formData.subject_specialization"
                :items="subjectOptions"
                placeholder="Search and select subjects..."
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Select subjects this teacher can teach</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="salary">Monthly Salary</Label>
                <Input
                  id="salary"
                  v-model.number="formData.salary"
                  type="number"
                  placeholder="0.00"
                  step="1"
                />
              </div>

              <div class="space-y-2">
                <Label for="alt_email">Alternative Email</Label>
                <Input
                  id="alt_email"
                  v-model="formData.alt_email"
                  type="email"
                  placeholder="personal@example.com"
                />
              </div>
            </div>
          </div>

          <!-- Account Setup Options -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Account Setup</h3>
            <div class="flex items-start gap-3 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
              <div class="flex items-center h-5">
                <input
                  id="send_invitation"
                  v-model="formData.send_invitation"
                  type="checkbox"
                  class="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div class="flex-1">
                <Label for="send_invitation" class="font-medium cursor-pointer">
                  Send invitation email
                </Label>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  The teacher will receive an email invitation to set up their own password and activate their account.
                  If unchecked, a default password will be set automatically.
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="loading">
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? (formData.send_invitation ? 'Sending Invitation...' : 'Registering...') : (formData.send_invitation ? 'Send Invitation' : 'Register Teacher') }}
            </Button>
            <Button type="button" variant="outline" @click="navigateTo('/admin/teachers')">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import MultiSelect from '@/components/ui/multi-select.vue'
import type { Teacher, Subject } from '~~/types'
import { useTeachers } from '~~/composables/admin/useTeachers'
import { useApi } from '~~/composables/useApi'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { createTeacher } = useTeachers()
const { apiCall } = useApi()
const router = useRouter()

const subjects = ref<Subject[]>([])

const formData = ref<Partial<Teacher & { send_invitation?: boolean }>>({
  empId: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  email: '',
  phone_number: '',
  address: '',
  national_id: '',
  tin_number: '',
  nssf_number: '',
  short_name: '',
  designation: '',
  subject_specialization: [],
  inactive: false,
  salary: null,
  alt_email: '',
  send_invitation: true // Default to sending invitation
})

const loading = ref(false)

// Convert subjects to multi-select format
const subjectOptions = computed(() =>
  subjects.value.map(subject => ({
    value: subject.id!,
    label: subject.name
  }))
)

const loadReferences = async () => {
  const { data, error: apiError } = await apiCall<Subject[]>('/academic/subjects/')

  if (data) {
    subjects.value = data
  } else if (apiError) {
    toast.error('Failed to load subjects', {
      description: apiError
    })
  }
}

const handleSubmit = async () => {
  loading.value = true

  // Convert subject IDs to subject names for backend
  const subjectNames = formData.value.subject_specialization
    ?.map(id => subjects.value.find(s => s.id === id)?.name)
    .filter(Boolean) || []

  const payload = {
    ...formData.value,
    subject_specialization: subjectNames
  }

  const { data, error: apiError } = await createTeacher(payload as Teacher)

  if (data) {
    // Show success message based on invitation status
    if (formData.value.send_invitation) {
      toast.success(`Invitation sent to ${formData.value.first_name} ${formData.value.last_name}`, {
        description: 'They will receive an email to set up their account.'
      })
    } else {
      toast.success(`Teacher ${formData.value.first_name} ${formData.value.last_name} registered successfully`)
    }
    router.push('/admin/teachers')
  } else {
    toast.error('Failed to register teacher', {
      description: apiError || 'An unexpected error occurred. Please try again.'
    })
  }

  loading.value = false
}

onMounted(() => {
  loadReferences()
})
</script>
