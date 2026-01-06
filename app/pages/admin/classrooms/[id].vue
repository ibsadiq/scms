<!-- pages/admin/classrooms/[id].vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/classrooms')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Classroom Details</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">View and manage classroom information</p>
      </div>
      <Button @click="showEditDialog = true">
        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
    </div>

    <!-- View Mode -->
    <div v-else-if="classroom" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <CardTitle class="text-2xl">{{ classroom.name_display || classroom.name }}</CardTitle>
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
                <p class="font-semibold text-lg">{{ classroom.class_teacher_name }}</p>
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
              @click="showDeleteDialog = true"
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
          <CardDescription>List of all students enrolled in {{ classroom.name_display || classroom.name }}</CardDescription>
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

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Classroom</DialogTitle>
          <DialogDescription>Update classroom information</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Class Teacher Selection -->
          <div class="space-y-2">
            <Label for="edit_class_teacher">Class Teacher *</Label>
            <select
              id="edit_class_teacher"
              v-model.number="editForm.class_teacher"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              required
            >
              <option :value="null" disabled>Select a class teacher</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.first_name }} {{ teacher.last_name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Select the teacher who will manage this classroom</p>
          </div>

          <!-- Stream Selection -->
          <div class="space-y-2">
            <Label for="edit_stream">Stream</Label>
            <select
              id="edit_stream"
              v-model.number="editForm.stream"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option :value="null">No stream assigned</option>
              <option v-for="stream in streams" :key="stream.id" :value="stream.id">
                {{ stream.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Optionally assign a stream (e.g., A, B, C)</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit_capacity">Capacity *</Label>
              <Input
                id="edit_capacity"
                v-model.number="editForm.capacity"
                type="number"
                min="1"
                required
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Maximum number of students</p>
            </div>

            <div class="space-y-2">
              <Label for="edit_occupied_sits">Occupied Seats *</Label>
              <Input
                id="edit_occupied_sits"
                v-model.number="editForm.occupied_sits"
                type="number"
                min="0"
                required
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Currently occupied seats</p>
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

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the classroom "{{ classroom?.name_display || classroom?.name }}".
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Classroom {
  id?: number
  name: string
  stream_name?: string | null
  stream_id?: number | null
  class_teacher: number | null
  class_teacher_name?: string
  capacity: number
  occupied_sits: number
  available_sits: number
  class_status: string
  name_display: string | null
}

interface Stream {
  id: number
  name: string
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
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
const { showErrorToast, showSuccessToast } = useErrorHandler()

const loading = ref(true)
const saving = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const classroom = ref<Classroom | null>(null)
const streams = ref<Stream[]>([])
const teachers = ref<Teacher[]>([])
const loadingStudents = ref(true)
const students = ref<StudentEnrollment[]>([])

const editForm = ref({
  class_teacher: null as number | null,
  stream: null as number | null,
  capacity: 40,
  occupied_sits: 0
})

// Watch for edit dialog open and initialize form
watch(showEditDialog, (newValue) => {
  if (newValue && classroom.value) {
    editForm.value = {
      class_teacher: typeof classroom.value.class_teacher === 'number' ? classroom.value.class_teacher : null,
      stream: classroom.value.stream_id || null,
      capacity: classroom.value.capacity,
      occupied_sits: classroom.value.occupied_sits
    }
  }
})

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

  const [classroomRes, streamsRes, teachersRes] = await Promise.all([
    apiCall<Classroom>(`/academic/classrooms/${id}/`),
    apiCall<Stream[]>('/academic/streams/'),
    apiCall<Teacher[]>('/users/teachers/')
  ])

  if (classroomRes.data) {
    classroom.value = classroomRes.data
  }

  if (streamsRes.data) {
    streams.value = streamsRes.data
  }

  if (teachersRes.data) {
    teachers.value = teachersRes.data
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

  if (!editForm.value.class_teacher) {
    showErrorToast('Please select a class teacher', 'Validation Error')
    return
  }

  saving.value = true

  const id = parseInt(route.params.id as string)
  const { data, error: apiError } = await apiCall<Classroom>(
    `/academic/classrooms/${id}/`,
    {
      method: 'PATCH',
      body: {
        class_teacher: editForm.value.class_teacher,
        stream: editForm.value.stream,
        capacity: Number(editForm.value.capacity) || 40,
        occupied_sits: Number(editForm.value.occupied_sits) || 0
      }
    }
  )

  if (data) {
    classroom.value = data
    showSuccessToast('Classroom updated successfully')
    showEditDialog.value = false
  } else {
    showErrorToast(apiError, 'Failed to update classroom')
  }

  saving.value = false
}

const confirmDelete = async () => {
  if (!classroom.value) return

  const { error } = await apiCall(`/academic/classrooms/${classroom.value.id}/`, {
    method: 'DELETE'
  })

  if (!error) {
    showSuccessToast('Classroom deleted successfully')
    showDeleteDialog.value = false
    router.push('/admin/classrooms')
  } else {
    showErrorToast(error, 'Failed to delete classroom')
    showDeleteDialog.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>