<!-- pages/admin/students/[id].vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="outline" size="sm" @click="navigateTo('/admin/students')">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <div v-if="!loading">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {{ student?.first_name }} {{ student?.last_name }}
          </h1>
          <p class="text-neutral-600 dark:text-neutral-400 mt-1">
            {{ student?.admission_number }} • {{ student?.grade_level_name || 'N/A' }} - {{ student?.classroom_name || 'N/A' }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="showEditDialog = true" v-if="student">
          <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
          Edit Student
        </Button>
        <Button variant="destructive" @click="handleDelete" v-if="student">
          <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Student Details -->
    <div v-else-if="student" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <Icon name="lucide:user" class="w-16 h-16 text-primary-700 dark:text-primary-400" />
              </div>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {{ student.grade_level_name || 'N/A' }} - {{ student.classroom_name || 'N/A' }}
              </p>
              <span
                class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(student.status)"
              >
                {{ student.status }}
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Contact & Address -->
        <Card>
          <CardHeader>
            <CardTitle>Contact & Address</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-start gap-3">
              <Icon name="lucide:phone" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Parent Contact</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ student.parent_contact || 'N/A' }}</p>
              </div>
            </div>
            <div v-if="student.region || student.city || student.street" class="flex items-start gap-3">
              <Icon name="lucide:map-pin" class="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Address</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {{ [student.street, student.city, student.region].filter(Boolean).join(', ') || 'N/A' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column - Details & Financial -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Information -->
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Admission Number</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.admission_number }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Admission Date</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ formatDate(student.admission_date) }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Date of Birth</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ formatDate(student.date_of_birth) }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Gender</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.gender }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Religion</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.religion || 'N/A' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Academic Information -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Academic Information</CardTitle>
              <Button variant="outline" size="sm" @click="navigateTo(`/admin/finance/balances?student=${student.id}`)">
                <Icon name="lucide:wallet" class="w-4 h-4 mr-2" />
                View Fees
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Grade Level</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.grade_level_name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Class</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.classroom_name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Academic Year</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.academic_year_name || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Status</p>
                <span
                  class="inline-block px-2 py-1 rounded text-xs font-medium"
                  :class="getStatusClass(student.status)"
                >
                  {{ student.status }}
                </span>
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Previous School</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.previous_school || 'N/A' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Parent/Guardian Information -->
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Parent Contact</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.parent_contact || 'N/A' }}</p>
              </div>
              <div v-if="student.guardian_name">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Guardian Name</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.guardian_name }}</p>
              </div>
              <div v-if="student.guardian_phone">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Guardian Phone</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.guardian_phone }}</p>
              </div>
              <div v-if="student.guardian_email">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Guardian Email</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.guardian_email }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Medical Information -->
        <Card v-if="student.medical_conditions || student.allergies || student.blood_group">
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div v-if="student.blood_group">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Blood Group</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.blood_group }}</p>
              </div>
              <div v-if="student.medical_conditions" class="col-span-2">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Medical Conditions</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.medical_conditions }}</p>
              </div>
              <div v-if="student.allergies" class="col-span-2">
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Allergies</p>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ student.allergies }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <Icon name="lucide:alert-circle" class="w-16 h-16 mx-auto text-red-500 mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Student Not Found</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">The student you're looking for doesn't exist.</p>
      <Button @click="navigateTo('/admin/students')">Back to Students</Button>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update student information</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleUpdate" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="first_name">First Name *</Label>
                <Input id="first_name" v-model="editForm.first_name" required />
              </div>
              <div class="space-y-2">
                <Label for="middle_name">Middle Name</Label>
                <Input id="middle_name" v-model="editForm.middle_name" />
              </div>
              <div class="space-y-2">
                <Label for="last_name">Last Name *</Label>
                <Input id="last_name" v-model="editForm.last_name" required />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="date_of_birth">Date of Birth *</Label>
                <Input id="date_of_birth" type="date" v-model="editForm.date_of_birth" required />
              </div>
              <div class="space-y-2">
                <Label for="gender">Gender *</Label>
                <select
                  id="gender"
                  v-model="editForm.gender"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="religion">Religion</Label>
                <Input id="religion" v-model="editForm.religion" />
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Academic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="admission_number">Admission Number *</Label>
                <Input id="admission_number" v-model="editForm.admission_number" required />
              </div>
              <div class="space-y-2">
                <Label for="admission_date">Admission Date *</Label>
                <Input id="admission_date" type="date" v-model="editForm.admission_date" required />
              </div>
              <div class="space-y-2">
                <Label for="status">Status *</Label>
                <select
                  id="status"
                  v-model="editForm.status"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="class_level">Class Level</Label>
                <select
                  id="class_level"
                  v-model="editForm.class_level"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select Class Level</option>
                  <option v-for="classLevel in classLevels" :key="classLevel.id" :value="classLevel.id">
                    {{ classLevel.name }}
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="previous_school">Previous School</Label>
                <Input id="previous_school" v-model="editForm.previous_school" />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="parent_contact">Parent Contact *</Label>
                <Input id="parent_contact" v-model="editForm.parent_contact" required />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="region">Region</Label>
                <Input id="region" v-model="editForm.region" />
              </div>
              <div class="space-y-2">
                <Label for="city">City</Label>
                <Input id="city" v-model="editForm.city" />
              </div>
              <div class="space-y-2">
                <Label for="street">Street</Label>
                <Input id="street" v-model="editForm.street" />
              </div>
            </div>
          </div>

          <!-- Guardian Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Guardian Information (Optional)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="guardian_phone">Guardian Phone</Label>
                <Input id="guardian_phone" v-model="editForm.guardian_phone" />
              </div>
              <div class="space-y-2">
                <Label for="guardian_email">Guardian Email</Label>
                <Input id="guardian_email" type="email" v-model="editForm.guardian_email" />
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Medical Information (Optional)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="blood_group">Blood Group</Label>
                <Input id="blood_group" v-model="editForm.blood_group" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="medical_conditions">Medical Conditions</Label>
                <textarea
                  id="medical_conditions"
                  v-model="editForm.medical_conditions"
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows="3"
                />
              </div>
              <div class="space-y-2">
                <Label for="allergies">Allergies</Label>
                <textarea
                  id="allergies"
                  v-model="editForm.allergies"
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditDialog = false">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useStudents } from '~~/composables/admin/useStudents'
import { useApi } from '~~/composables/useApi'
import type { Student, ClassLevel } from '~~/types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { fetchStudent, deleteStudent, updateStudent } = useStudents()
const { apiCall } = useApi()

const student = ref<Student | null>(null)
const loading = ref(true)
const showEditDialog = ref(false)
const saving = ref(false)
const classLevels = ref<ClassLevel[]>([])

// Edit form
const editForm = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'Male' as 'Male' | 'Female' | 'Other',
  admission_number: '',
  admission_date: '',
  status: 'Active' as 'Active' | 'Inactive' | 'Graduated' | 'Withdrawn',
  parent_contact: '',
  region: '',
  city: '',
  street: '',
  class_level: null as number | null,
  previous_school: '',
  religion: '',
  guardian_phone: '',
  guardian_email: '',
  blood_group: '',
  medical_conditions: '',
  allergies: '',
})

// Initialize edit form when dialog opens
watch(showEditDialog, (newValue) => {
  if (newValue && student.value) {
    editForm.value = {
      first_name: student.value.first_name,
      middle_name: student.value.middle_name || '',
      last_name: student.value.last_name,
      date_of_birth: student.value.date_of_birth,
      gender: student.value.gender,
      admission_number: student.value.admission_number,
      admission_date: student.value.admission_date,
      status: student.value.status,
      parent_contact: student.value.parent_contact,
      region: student.value.region || '',
      city: student.value.city || '',
      street: student.value.street || '',
      class_level: student.value.class_level || null,
      previous_school: student.value.previous_school || '',
      religion: student.value.religion || '',
      guardian_phone: student.value.guardian_phone || '',
      guardian_email: student.value.guardian_email || '',
      blood_group: student.value.blood_group || '',
      medical_conditions: student.value.medical_conditions || '',
      allergies: student.value.allergies || '',
    }
  }
})

// Load student data and class levels
onMounted(async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    toast.error('Invalid student ID')
    router.push('/admin/students')
    return
  }

  const [studentResponse, classLevelsResponse] = await Promise.all([
    fetchStudent(id),
    apiCall<ClassLevel[]>('/academic/class-levels/')
  ])

  loading.value = false

  if (studentResponse.data) {
    student.value = studentResponse.data
  } else {
    toast.error(studentResponse.error || 'Failed to load student')
  }

  if (classLevelsResponse.data) {
    classLevels.value = classLevelsResponse.data
  }
})

// Handle update
const handleUpdate = async () => {
  if (!student.value) return

  saving.value = true

  const response = await updateStudent(student.value.id!, editForm.value)

  if (response.error) {
    toast.error('Failed to update student: ' + response.error)
  } else {
    toast.success(`${editForm.value.first_name} ${editForm.value.last_name} updated successfully`)
    student.value = response.data!
    showEditDialog.value = false
  }

  saving.value = false
}

// Handle delete
const handleDelete = async () => {
  if (!student.value) return

  if (!confirm(`Are you sure you want to delete ${student.value.first_name} ${student.value.last_name}?`)) {
    return
  }

  const response = await deleteStudent(student.value.id!)
  if (response.error) {
    toast.error('Failed to delete student: ' + response.error)
  } else {
    toast.success(`${student.value.first_name} ${student.value.last_name} deleted successfully`)
    router.push('/admin/students')
  }
}

// Format date
const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Get status class
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'Graduated': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Transferred': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Suspended': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return classes[status] || classes['Active']
}
</script>
