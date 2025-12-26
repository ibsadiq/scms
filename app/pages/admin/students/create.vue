<!-- pages/admin/students/create.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/students')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Enroll New Student</h1>
        <p class="text-neutral-600 mt-1">Add a new student to the system</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
        <CardDescription>Enter the student's personal and academic details</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Personal Information</h3>

            <!-- Passport Photo Upload -->
            <div class="space-y-2">
              <Label for="passport_photo">Passport Photo</Label>
              <div class="flex items-start gap-4">
                <div v-if="photoPreview" class="w-32 h-32 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <img :src="photoPreview" alt="Passport photo preview" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-32 h-32 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
                  <Icon name="lucide:user" class="w-12 h-12 text-neutral-400" />
                </div>
                <div class="flex-1 space-y-2">
                  <Input
                    id="passport_photo"
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="cursor-pointer"
                  />
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Upload student's passport photo (JPG, PNG). Max size: 2MB
                  </p>
                  <Button
                    v-if="photoPreview"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="clearPhoto"
                  >
                    <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                    Remove Photo
                  </Button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="admission_number">Admission Number *</Label>
                <Input
                  id="admission_number"
                  v-model="formData.admission_number"
                  placeholder="e.g., STU2024001"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="admission_date">Admission Date *</Label>
                <DateInput
                  id="admission_date"
                  v-model="formData.admission_date"
                  required
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
                <Label for="status">Status *</Label>
                <select
                  id="status"
                  v-model="formData.status"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Contact Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="student@example.com"
                />
              </div>

              <div class="space-y-2">
                <Label for="phone">Phone Number</Label>
                <Input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
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

          <!-- Academic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Academic Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="grade_level">Grade Level</Label>
                <select
                  id="grade_level"
                  v-model="formData.grade_level"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select grade level</option>
                  <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">
                    {{ grade.name }}
                  </option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="classroom">Classroom</Label>
                <select
                  id="classroom"
                  v-model="formData.classroom"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select classroom</option>
                  <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
                    {{ classroom.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Guardian Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Guardian Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="guardian">Guardian/Parent</Label>
                <select
                  id="guardian"
                  v-model="formData.guardian"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select guardian</option>
                  <option v-for="parent in parents" :key="parent.id" :value="parent.id">
                    {{ parent.first_name }} {{ parent.last_name }} ({{ parent.relationship }})
                  </option>
                </select>
                <p class="text-xs text-neutral-500">
                  If guardian not in list, add them in the Parents section first
                </p>
              </div>

              <div class="space-y-2">
                <Label for="emergency_contact">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact"
                  v-model="formData.emergency_contact"
                  placeholder="Contact person name"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="emergency_phone">Emergency Phone Number</Label>
              <Input
                id="emergency_phone"
                v-model="formData.emergency_phone"
                type="tel"
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          <!-- Additional Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Additional Information</h3>

            <div class="space-y-2">
              <Label for="medical_info">Medical Information</Label>
              <Textarea
                id="medical_info"
                v-model="formData.medical_info"
                placeholder="Allergies, conditions, medications, etc."
                rows="3"
              />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="loading">
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Enrolling...' : 'Enroll Student' }}
            </Button>
            <Button type="button" variant="outline" @click="navigateTo('/admin/students')">
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
import { DateInput } from '@/components/ui/date-input'
import type { Student, GradeLevel, Classroom, Parent } from '~~/types'
import { useStudents } from '~~/composables/admin/useStudents'
import { useApi } from '~~/composables/useApi'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { createStudent } = useStudents()
const { apiCall } = useApi()
const router = useRouter()

const gradeLevels = ref<GradeLevel[]>([])
const classrooms = ref<Classroom[]>([])
const parents = ref<Parent[]>([])

const formData = ref<Partial<Student>>({
  admission_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'Male',
  classroom: null,
  grade_level: null,
  guardian: null,
  admission_date: new Date().toISOString().split('T')[0],
  status: 'Active',
  medical_info: '',
  emergency_contact: '',
  emergency_phone: ''
})

const loading = ref(false)
const photoPreview = ref<string | null>(null)
const photoFile = ref<File | null>(null)

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Photo size too large', {
      description: 'Photo size must be less than 2MB'
    })
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Invalid file type', {
      description: 'Please upload an image file'
    })
    return
  }

  photoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearPhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  const input = document.getElementById('passport_photo') as HTMLInputElement
  if (input) input.value = ''
}

const loadReferences = async () => {
  const [gradeLevelsRes, classroomsRes, parentsRes] = await Promise.all([
    apiCall<GradeLevel[]>('/academic/grade-levels/'),
    apiCall<Classroom[]>('/academic/classrooms/'),
    apiCall<Parent[]>('/users/parents/')
  ])

  if (gradeLevelsRes.data) gradeLevels.value = gradeLevelsRes.data
  if (classroomsRes.data) classrooms.value = classroomsRes.data
  if (parentsRes.data) parents.value = parentsRes.data
}

const handleSubmit = async () => {
  loading.value = true

  try {
    // If photo is uploaded, we need to send as FormData
    if (photoFile.value) {
      const formDataToSend = new FormData()

      // Append all form fields
      Object.entries(formData.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Append photo file
      formDataToSend.append('image', photoFile.value)

      // Send with FormData
      const { data, error: apiError } = await apiCall<Student>('/sis/students/', {
        method: 'POST',
        body: formDataToSend
      })

      if (data) {
        toast.success('Student enrolled successfully')
        router.push('/admin/students')
      } else {
        toast.error('Failed to enroll student', {
          description: apiError || 'An unexpected error occurred. Please try again.'
        })
      }
    } else {
      // Send as regular JSON
      const { data, error: apiError } = await createStudent(formData.value as Student)

      if (data) {
        toast.success('Student enrolled successfully')
        router.push('/admin/students')
      } else {
        toast.error('Failed to enroll student', {
          description: apiError || 'An unexpected error occurred. Please try again.'
        })
      }
    }
  } catch (err) {
    toast.error('Failed to enroll student', {
      description: 'An error occurred while enrolling the student'
    })
  }

  loading.value = false
}

onMounted(() => {
  loadReferences()
})
</script>
