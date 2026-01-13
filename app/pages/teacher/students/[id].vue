<!-- pages/teacher/students/[id].vue -->
<template>
  <div class="space-y-6">
    <!-- Back Button -->
    <Button variant="ghost" @click="navigateTo('/teacher/students')">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Back to Students
    </Button>

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

    <!-- Student Details -->
    <div v-else-if="student" class="space-y-6">
      <!-- Student Header Card -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div class="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="lucide:user" class="w-10 h-10 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ student.full_name }}
              </h1>
              <p class="text-neutral-500 dark:text-neutral-400 mt-1">
                Admission Number: {{ student.admission_number }}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline">{{ student.class_name }}</Badge>
                <Badge :variant="student.status === 'Active' ? 'default' : 'secondary'">
                  {{ student.status }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Icon name="lucide:calendar-check" class="w-6 h-6 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Attendance Rate</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ student.attendance_rate ? `${student.attendance_rate}%` : 'N/A' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Icon name="lucide:award" class="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Average Grade</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ student.average_grade || 'N/A' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Icon name="lucide:clipboard-check" class="w-6 h-6 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Assignments</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ student.completed_assignments || 0 }}/{{ student.total_assignments || 0 }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Basic Information -->
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-neutral-500 dark:text-neutral-400">Full Name</Label>
              <p class="text-neutral-900 dark:text-neutral-100 mt-1">{{ student.full_name }}</p>
            </div>
            <div>
              <Label class="text-neutral-500 dark:text-neutral-400">Admission Number</Label>
              <p class="text-neutral-900 dark:text-neutral-100 mt-1">{{ student.admission_number }}</p>
            </div>
            <div>
              <Label class="text-neutral-500 dark:text-neutral-400">Class</Label>
              <p class="text-neutral-900 dark:text-neutral-100 mt-1">{{ student.class_name }}</p>
            </div>
            <div>
              <Label class="text-neutral-500 dark:text-neutral-400">Status</Label>
              <p class="text-neutral-900 dark:text-neutral-100 mt-1">{{ student.status }}</p>
            </div>
            <div v-if="student.email">
              <Label class="text-neutral-500 dark:text-neutral-400">Email</Label>
              <p class="text-neutral-900 dark:text-neutral-100 mt-1">{{ student.email }}</p>
            </div>
            <div v-if="student.phone_number">
              <Label class="text-neutral-500 dark:text-neutral-400">Phone Number</Label>
              <p class="text-neutral-900 dark:text-neutral-100 mt-1">{{ student.phone_number }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Grades -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Recent Grades</CardTitle>
            <Button variant="outline" size="sm" @click="navigateTo('/teacher/grades')">
              View All Grades
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="!student.recent_grades || student.recent_grades.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No recent grades available
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="grade in student.recent_grades"
              :key="grade.id"
              class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ grade.subject }}</p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ grade.assessment_type }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-primary-700 dark:text-primary-400">{{ grade.score }}%</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ grade.grade }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Attendance History -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Recent Attendance</CardTitle>
            <Button variant="outline" size="sm" @click="navigateTo('/teacher/attendance')">
              View All Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="!student.recent_attendance || student.recent_attendance.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No attendance records available
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="record in student.recent_attendance"
              :key="record.id"
              class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ record.date }}</p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ record.subject }}</p>
              </div>
              <Badge :variant="record.status === 'Present' ? 'default' : 'destructive'">
                {{ record.status }}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
  email?: string
  phone_number?: string
  attendance_rate?: number
  average_grade?: string
  completed_assignments?: number
  total_assignments?: number
  recent_grades?: Array<{
    id: number
    subject: string
    assessment_type: string
    score: number
    grade: string
  }>
  recent_attendance?: Array<{
    id: number
    date: string
    subject: string
    status: string
  }>
}

const route = useRoute()
const { apiCall } = useApi()

const studentId = computed(() => route.params.id as string)

const loading = ref(true)
const error = ref<string | null>(null)
const student = ref<Student | null>(null)

const fetchStudent = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: apiError } = await apiCall<Student>(`/academic/teachers/students/${studentId.value}/`)

    if (apiError) {
      error.value = 'Failed to load student details'
      loading.value = false
      return
    }

    if (data) {
      student.value = data
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    console.error('Error fetching student:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudent()
})

useHead({
  title: computed(() => student.value ? `${student.value.full_name} - Student Details` : 'Student Details')
})
</script>
