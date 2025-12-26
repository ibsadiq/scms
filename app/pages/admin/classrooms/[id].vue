<!-- pages/admin/classrooms/[id].vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/classrooms')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-neutral-900">
          {{ editMode ? 'Edit Classroom' : 'Classroom Details' }}
        </h1>
        <p class="text-neutral-600 mt-1">
          {{ editMode ? 'Update classroom information' : 'View and manage classroom information' }}
        </p>
      </div>
      <Button v-if="!editMode" @click="editMode = true">
        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
    </div>

    <!-- Edit Mode -->
    <Card v-else-if="editMode && classroom">
      <CardHeader>
        <CardTitle>Classroom Details</CardTitle>
        <CardDescription>Modify the information for this classroom</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Stream Selection -->
          <div class="space-y-2">
            <Label for="stream">Stream</Label>
            <select
              id="stream"
              v-model.number="selectedStream"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option :value="null">No stream assigned</option>
              <option v-for="stream in streams" :key="stream.id" :value="stream.id">
                {{ stream.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500">Optionally assign a stream (e.g., A, B, C)</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="capacity">Capacity *</Label>
              <Input
                id="capacity"
                v-model.number="classroom.capacity"
                type="number"
                min="1"
                required
              />
              <p class="text-xs text-neutral-500">Maximum number of students</p>
            </div>

            <div class="space-y-2">
              <Label for="occupied_sits">Occupied Seats *</Label>
              <Input
                id="occupied_sits"
                v-model.number="classroom.occupied_sits"
                type="number"
                min="0"
                required
              />
              <p class="text-xs text-neutral-500">Currently occupied seats</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelEdit">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- View Mode -->
    <div v-else-if="classroom" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <CardTitle class="text-2xl">{{ classroom.name }}</CardTitle>
                  <Badge v-if="classroom.stream_name" variant="outline" class="text-sm">
                    Stream {{ classroom.stream_name }}
                  </Badge>
                </div>
                <CardDescription class="mt-2 text-base" v-if="classroom.class_teacher_name">
                  Class Teacher: {{ classroom.class_teacher_name }}
                </CardDescription>
              </div>
              <Badge :variant="getStatusVariant(classroom.class_status)" class="text-sm">
                {{ classroom.class_status }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-3 gap-6">
              <div class="text-center p-4 rounded-lg bg-primary-50">
                <p class="text-sm font-medium text-neutral-600 mb-1">Capacity</p>
                <p class="text-3xl font-bold text-primary-700">{{ classroom.capacity }}</p>
              </div>
              <div class="text-center p-4 rounded-lg bg-secondary-50">
                <p class="text-sm font-medium text-neutral-600 mb-1">Occupied</p>
                <p class="text-3xl font-bold text-secondary-700">{{ classroom.occupied_sits }}</p>
              </div>
              <div class="text-center p-4 rounded-lg bg-green-50">
                <p class="text-sm font-medium text-neutral-600 mb-1">Available</p>
                <p class="text-3xl font-bold text-green-700">{{ classroom.available_sits }}</p>
              </div>
            </div>

            <div v-if="classroom.class_teacher" class="p-4 rounded-lg border border-neutral-200">
              <p class="text-sm font-medium text-neutral-500 mb-2">Class Teacher</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Icon name="lucide:user" class="w-5 h-5 text-primary-700" />
                </div>
                <p class="font-semibold text-lg">{{ classroom.class_teacher }}</p>
              </div>
            </div>

            <!-- Progress Bar -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-neutral-600">Occupancy</p>
                <p class="text-sm font-semibold">{{ occupancyPercentage }}%</p>
              </div>
              <div class="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  class="h-3 rounded-full transition-all"
                  :class="getOccupancyColor()"
                  :style="{ width: `${occupancyPercentage}%` }"
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button variant="outline" class="w-full justify-start">
              <Icon name="lucide:users" class="w-4 h-4 mr-2" />
              View Students
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start text-red-600 hover:text-red-700"
              @click="handleDelete"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
              Delete Classroom
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-600">Availability</span>
                <Badge :variant="getStatusVariant(classroom.class_status)">
                  {{ classroom.class_status }}
                </Badge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-600">Seats Left</span>
                <span class="font-semibold">{{ classroom.available_sits }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      <!-- Students in Classroom Section -->
      <Card>
        <CardHeader>
          <CardTitle>Students in This Classroom</CardTitle>
          <CardDescription>List of all students enrolled in {{ classroom.name }}</CardDescription>
        </CardHeader>
        <CardContent class="p-0">
          <!-- Loading Students -->
          <div v-if="loadingStudents" class="text-center py-12">
            <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading students...</p>
          </div>

          <!-- No Students -->
          <div v-else-if="students.length === 0" class="text-center py-12 px-4">
            <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p class="text-neutral-500 dark:text-neutral-400">No students enrolled yet</p>
          </div>

          <!-- Students Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Gender
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                <tr
                  v-for="(enrollment, index) in students"
                  :key="enrollment.id"
                  class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {{ enrollment.student_admission_number }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {{ enrollment.student_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                    {{ enrollment.student_gender || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="navigateTo(`/admin/students/${enrollment.student}`)"
                    >
                      <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApi } from '~~/composables/useApi'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Classroom {
  id?: number
  name: string
  stream_name?: string | null
  stream_id?: number | null
  class_teacher: string | null
  class_teacher_name?: string
  capacity: number
  occupied_sits: number
  available_sits: number
  class_status: string
}

interface Stream {
  id: number
  name: string
}

interface StudentEnrollment {
  id: number
  student: number
  student_name: string
  student_admission_number: string
  student_gender?: string
  classroom: number
  academic_year: number
}

const route = useRoute()
const router = useRouter()
const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const classroom = ref<Classroom | null>(null)
const originalData = ref<Classroom | null>(null)
const streams = ref<Stream[]>([])
const selectedStream = ref<number | null>(null)
const loadingStudents = ref(true)
const students = ref<StudentEnrollment[]>([])

const occupancyPercentage = computed(() => {
  if (!classroom.value) return 0
  return Math.round((classroom.value.occupied_sits / classroom.value.capacity) * 100)
})

const getStatusVariant = (status: string) => {
  if (status === 'Full') return 'destructive'
  if (status === 'Available') return 'default'
  return 'secondary'
}

const getOccupancyColor = () => {
  const percentage = occupancyPercentage.value
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const loadData = async () => {
  const id = parseInt(route.params.id as string)

  const [classroomRes, streamsRes] = await Promise.all([
    apiCall<Classroom>(`/academic/classrooms/${id}/`),
    apiCall<Stream[]>('/academic/streams/')
  ])

  if (classroomRes.data) {
    classroom.value = classroomRes.data
    originalData.value = { ...classroomRes.data }
    selectedStream.value = classroomRes.data.stream_id || null
  }

  if (streamsRes.data) {
    streams.value = streamsRes.data
  }

  loading.value = false
  loadStudents()
}

const loadStudents = async () => {
  const id = parseInt(route.params.id as string)
  loadingStudents.value = true

  // Fetch student enrollments for this classroom
  const { data } = await apiCall<StudentEnrollment[]>('/academic/student-classes/')

  if (data) {
    // Filter students enrolled in this classroom
    students.value = data.filter(enrollment => enrollment.classroom === id)
  }

  loadingStudents.value = false
}

const handleSubmit = async () => {
  if (!classroom.value) return

  saving.value = true

  const id = parseInt(route.params.id as string)
  const { data, error: apiError } = await apiCall<Classroom>(
    `/academic/classrooms/${id}/`,
    {
      method: 'PATCH',
      body: {
        stream: selectedStream.value,
        capacity: classroom.value.capacity,
        occupied_sits: classroom.value.occupied_sits
      }
    }
  )

  if (data) {
    classroom.value = data
    originalData.value = { ...data }
    selectedStream.value = data.stream_id || null
    toast.success('Classroom updated successfully')
    setTimeout(() => {
      editMode.value = false
    }, 1500)
  } else {
    toast.error('Failed to update classroom', { description: apiError || 'An unexpected error occurred. Please try again.' })
  }

  saving.value = false
}

const cancelEdit = () => {
  if (originalData.value) {
    classroom.value = { ...originalData.value }
    selectedStream.value = originalData.value.stream_id || null
  }
  editMode.value = false
}

const handleDelete = async () => {
  if (!classroom.value) return
  if (!confirm(`Are you sure you want to delete "${classroom.value.name}"?`)) return

  const { error } = await apiCall(`/academic/classrooms/${classroom.value.id}/`, {
    method: 'DELETE'
  })

  if (!error) {
    toast.success('Classroom deleted successfully')
    router.push('/admin/classrooms')
  } else {
    toast.error('Failed to delete classroom', { description: error || 'An unexpected error occurred. Please try again.' })
  }
}

onMounted(() => {
  loadData()
})
</script>