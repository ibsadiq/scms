<!-- pages/admin/parents/create.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/parents')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Add New Parent/Guardian</h1>
        <p class="text-neutral-600 mt-1">Register a new parent or guardian</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Parent/Guardian Information</CardTitle>
        <CardDescription>Enter the parent or guardian's details</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Personal Information</h3>

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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="parent_type">Relationship *</Label>
                <select
                  id="parent_type"
                  v-model="formData.parent_type"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="gender">Gender</Label>
                <select
                  id="gender"
                  v-model="formData.gender"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="national_id">National ID</Label>
                <Input
                  id="national_id"
                  v-model="formData.national_id"
                  placeholder="National ID number"
                />
              </div>

              <div class="space-y-2">
                <Label for="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  v-model="formData.occupation"
                  placeholder="e.g., Engineer, Teacher"
                />
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 border rounded-lg">
              <input
                id="single_parent"
                v-model="formData.single_parent"
                type="checkbox"
                class="w-4 h-4 border-gray-300 rounded"
              />
              <Label for="single_parent" class="cursor-pointer">
                Single Parent
              </Label>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Contact Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="phone_number">Primary Phone Number *</Label>
                <Input
                  id="phone_number"
                  v-model="formData.phone_number"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="parent@example.com"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="alt_email">Alternative Email</Label>
              <Input
                id="alt_email"
                v-model="formData.alt_email"
                type="email"
                placeholder="alternative@example.com"
              />
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

          <!-- Student Association -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Associated Students</h3>

            <div class="space-y-2">
              <Label for="students">Students</Label>
              <div class="space-y-2">
                <!-- Selected Students Display -->
                <div v-if="selectedStudents.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="student in selectedStudents"
                    :key="student.id"
                    class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20"
                  >
                    {{ student.first_name }} {{ student.last_name }} ({{ student.admission_number }})
                    <button
                      type="button"
                      @click="removeStudent(student.id!)"
                      class="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
                    >
                      <Icon name="lucide:x" class="w-3 h-3" />
                    </button>
                  </span>
                </div>

                <!-- Search Input -->
                <div class="relative">
                  <Input
                    v-model="studentSearch"
                    type="text"
                    placeholder="Type at least 3 characters to search students..."
                    @input="handleStudentSearch"
                  />

                  <!-- Loading State -->
                  <div v-if="searchingStudents" class="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin text-neutral-400" />
                  </div>

                  <!-- Search Results Dropdown -->
                  <div
                    v-if="showStudentDropdown && searchResults.length > 0"
                    class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <div class="p-1">
                      <div
                        v-for="student in searchResults"
                        :key="student.id"
                        @click="addStudent(student)"
                        class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-700"
                      >
                        {{ student.first_name }} {{ student.last_name }} ({{ student.admission_number }})
                      </div>
                    </div>
                  </div>

                  <!-- No Results Message -->
                  <div
                    v-else-if="showStudentDropdown && searchResults.length === 0 && studentSearch.length >= 3 && !searchingStudents"
                    class="absolute z-50 w-full mt-1 rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    No students found matching "{{ studentSearch }}"
                  </div>
                </div>
              </div>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Type at least 3 characters to search for students by name or admission number.
              </p>
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
                  The parent will receive an email invitation to set up their own password and activate their account.
                  If unchecked, a default password will be set automatically.
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="loading">
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? (formData.send_invitation ? 'Sending Invitation...' : 'Registering...') : (formData.send_invitation ? 'Send Invitation' : 'Register Parent/Guardian') }}
            </Button>
            <Button type="button" variant="outline" @click="navigateTo('/admin/parents')">
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
import type { Parent, Student } from '~~/types'
import { useParents } from '~~/composables/admin/useParents'
import { useApi } from '~~/composables/useApi'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { createParent } = useParents()
const { apiCall } = useApi()
const router = useRouter()

// Student search state
const studentSearch = ref('')
const searchResults = ref<Student[]>([])
const selectedStudents = ref<Student[]>([])
const searchingStudents = ref(false)
const showStudentDropdown = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const formData = ref<Partial<Parent & { send_invitation?: boolean; students?: number[] }>>({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  alt_email: '',
  address: '',
  gender: undefined,
  parent_type: 'Father',
  national_id: '',
  occupation: '',
  monthly_income: undefined,
  single_parent: false,
  students: [],
  send_invitation: true
})

const loading = ref(false)

// Search for students by name (backend search)
const searchStudents = async (query: string) => {
  if (query.length < 3) {
    searchResults.value = []
    showStudentDropdown.value = false
    return
  }

  searchingStudents.value = true
  showStudentDropdown.value = true

  try {
    const { data } = await apiCall<Student[]>(`/sis/students/?search=${encodeURIComponent(query)}`)
    if (data) {
      // Check if data is an array, if not, it might be paginated
      const students = Array.isArray(data) ? data : (data as any).results || []

      // Filter out already selected students
      searchResults.value = students.filter(
        (student: Student) => !formData.value.students?.includes(student.id!)
      )
    } else {
      searchResults.value = []
    }
  } catch (err) {
    console.error('Error searching students:', err)
    searchResults.value = []
  }

  searchingStudents.value = false
}

// Handle student search with debounce
const handleStudentSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    searchStudents(studentSearch.value)
  }, 300) // 300ms debounce
}

// Add student to selection
const addStudent = (student: Student) => {
  if (!formData.value.students?.includes(student.id!)) {
    formData.value.students = [...(formData.value.students || []), student.id!]
    selectedStudents.value = [...selectedStudents.value, student]
  }
  studentSearch.value = ''
  searchResults.value = []
  showStudentDropdown.value = false
}

// Remove student from selection
const removeStudent = (studentId: number) => {
  formData.value.students = formData.value.students?.filter(id => id !== studentId)
  selectedStudents.value = selectedStudents.value.filter(s => s.id !== studentId)
}

const handleSubmit = async () => {
  loading.value = true

  const { data, error: apiError } = await createParent(formData.value as Parent)

  if (data) {
    // Show success message based on invitation status
    if (formData.value.send_invitation) {
      toast.success(`Invitation sent to ${formData.value.first_name} ${formData.value.last_name}`, {
        description: 'They will receive an email to set up their account.'
      })
    } else {
      toast.success(`Parent ${formData.value.first_name} ${formData.value.last_name} registered successfully`)
    }
    router.push('/admin/parents')
  } else {
    toast.error('Failed to register parent/guardian', {
      description: apiError || 'An unexpected error occurred. Please try again.'
    })
  }

  loading.value = false
}
</script>
