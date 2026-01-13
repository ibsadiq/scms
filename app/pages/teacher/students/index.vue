<!-- pages/teacher/students/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Students</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View and manage students in your classes
        </p>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label for="search">Search Student</Label>
            <div class="relative">
              <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="search"
                v-model="searchQuery"
                placeholder="Name or admission number..."
                class="pl-9"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="class">Class</Label>
            <select
              id="class"
              v-model="selectedClass"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option value="">All Classes</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="status">Status</Label>
            <select
              id="status"
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="flex items-end">
            <Button
              variant="outline"
              class="w-full"
              @click="clearFilters"
            >
              <Icon name="lucide:x" class="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Students List -->
    <div v-else-if="filteredStudents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="student in filteredStudents"
        :key="student.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="navigateTo(`/teacher/students/${student.id}`)"
      >
        <CardContent class="pt-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="lucide:user" class="w-6 h-6 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {{ student.full_name }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {{ student.admission_number }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <Badge variant="outline" class="text-xs">
                  {{ student.class_name }}
                </Badge>
                <Badge :variant="student.status === 'Active' ? 'default' : 'secondary'" class="text-xs">
                  {{ student.status }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- Student Stats -->
          <div class="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div class="text-center">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Attendance</p>
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                {{ student.attendance_rate ? `${student.attendance_rate}%` : 'N/A' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Avg Grade</p>
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                {{ student.average_grade || 'N/A' }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="py-12">
        <div class="text-center text-neutral-500 dark:text-neutral-400">
          <Icon name="lucide:users" class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p class="text-lg font-medium">No students found</p>
          <p class="text-sm mt-2">{{ searchQuery || selectedClass || selectedStatus ? 'Try adjusting your filters' : 'No students in your classes yet' }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <div v-if="!loading && filteredStudents.length > 0" class="flex items-center justify-between">
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        Showing {{ filteredStudents.length }} of {{ students.length }} students
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useApi } from '~~/composables/useApi'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

interface Student {
  id: number
  admission_number: string
  full_name: string
  first_name: string
  middle_name?: string
  last_name: string
  class_name: string
  class_id: number
  status: string
  attendance_rate?: number
  average_grade?: string
}

interface ClassRoom {
  id: number
  name: string
  subject: string
  student_count: number
}

const { apiCall } = useApi()

const loading = ref(true)
const error = ref<string | null>(null)
const students = ref<Student[]>([])
const classes = ref<ClassRoom[]>([])

const searchQuery = ref('')
const selectedClass = ref('')
const selectedStatus = ref('')

// Fetch teacher's students
const fetchStudents = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch teacher's classes first
    const { data: classData, error: classError } = await apiCall<ClassRoom[]>('/academic/teachers/my-classes/')

    if (classError) {
      error.value = 'Failed to load classes'
      loading.value = false
      return
    }

    if (classData) {
      classes.value = classData
    }

    // Fetch students from all teacher's classes
    const { data: studentData, error: studentError } = await apiCall<Student[]>('/academic/teachers/my-students/')

    if (studentError) {
      error.value = 'Failed to load students'
      loading.value = false
      return
    }

    if (studentData) {
      students.value = studentData
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    console.error('Error fetching students:', err)
  } finally {
    loading.value = false
  }
}

// Filtered students based on search and filters
const filteredStudents = computed(() => {
  let result = students.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(student =>
      student.full_name.toLowerCase().includes(query) ||
      student.admission_number.toLowerCase().includes(query)
    )
  }

  // Filter by class
  if (selectedClass.value) {
    result = result.filter(student => student.class_id === parseInt(selectedClass.value))
  }

  // Filter by status
  if (selectedStatus.value) {
    result = result.filter(student => student.status === selectedStatus.value)
  }

  return result
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedClass.value = ''
  selectedStatus.value = ''
}

onMounted(() => {
  fetchStudents()
})

useHead({
  title: 'My Students'
})
</script>
