<!-- pages/teacher/classes/[id].vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading class details...</p>
    </div>

    <!-- Error State -->
    <Card v-else-if="error">
      <CardContent class="p-12 text-center">
        <Icon name="lucide:alert-circle" class="w-12 h-12 mx-auto text-red-500 mb-3" />
        <p class="text-neutral-900 dark:text-neutral-100 font-semibold">{{ error }}</p>
        <Button @click="navigateTo('/teacher/classes')" variant="outline" class="mt-4">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Back to Classes
        </Button>
      </CardContent>
    </Card>

    <!-- Class Details -->
    <div v-else-if="classDetails">
      <!-- Header with Back Button -->
      <div class="flex items-center gap-4 mb-6">
        <Button @click="navigateTo('/teacher/classes')" variant="ghost" size="sm">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <!-- Class Info Card -->
      <Card class="border-l-4 border-l-primary-500">
        <CardHeader class="p-4 sm:p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Icon name="lucide:users" class="w-6 h-6 text-primary-700 dark:text-primary-400" />
                </div>
                <div>
                  <CardTitle class="text-xl sm:text-2xl">{{ classDetails.classroom_name }}</CardTitle>
                  <CardDescription class="text-base">{{ classDetails.subject_name }}</CardDescription>
                </div>
              </div>
              <div v-if="classDetails.is_class_teacher" class="mt-3">
                <Badge variant="default">
                  <Icon name="lucide:shield-check" class="w-3 h-3 mr-1" />
                  Homeroom Teacher
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-4 sm:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <Icon name="lucide:layers" class="w-5 h-5 text-neutral-500" />
              <div>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Grade Level</p>
                <p class="font-semibold text-neutral-900 dark:text-neutral-100">{{ classDetails.grade_level_name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <Icon name="lucide:users" class="w-5 h-5 text-neutral-500" />
              <div>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Students</p>
                <p class="font-semibold text-neutral-900 dark:text-neutral-100">{{ students.length }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <Icon name="lucide:calendar" class="w-5 h-5 text-neutral-500" />
              <div>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Active</p>
                <p class="font-semibold text-green-600 dark:text-green-400">Current Year</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader class="p-4 sm:p-6">
          <CardTitle class="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent class="p-4 sm:p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="default" @click="navigateTo(`/teacher/attendance?class=${classDetails.classroom_id}`)" class="w-full">
              <Icon name="lucide:clipboard-check" class="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
            <Button variant="outline" @click="navigateTo(`/teacher/grades?class=${classDetails.id}`)" class="w-full">
              <Icon name="lucide:award" class="w-4 h-4 mr-2" />
              Enter Grades
            </Button>
            <Button variant="outline" @click="navigateTo('/teacher/timetable')" class="w-full">
              <Icon name="lucide:calendar-days" class="w-4 h-4 mr-2" />
              View Timetable
            </Button>
            <Button variant="outline" @click="navigateTo('/teacher')" class="w-full">
              <Icon name="lucide:layout-dashboard" class="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Students List -->
      <Card>
        <CardHeader class="p-4 sm:p-6">
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-lg sm:text-xl">Students</CardTitle>
              <CardDescription>{{ students.length }} students enrolled</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="loadStudents">
              <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent class="p-4 sm:p-6">
          <!-- Loading Students -->
          <div v-if="loadingStudents" class="text-center py-8">
            <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading students...</p>
          </div>

          <!-- No Students -->
          <div v-else-if="students.length === 0" class="text-center py-8">
            <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p class="text-neutral-500 dark:text-neutral-400">No students enrolled yet</p>
          </div>

          <!-- Students Grid - Mobile -->
          <div v-else class="block lg:hidden space-y-3">
            <Card v-for="student in students" :key="student.id" class="border">
              <CardContent class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon name="lucide:user" class="w-6 h-6 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {{ student.first_name }} {{ student.last_name }}
                    </p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.admission_number }}</p>
                    <p v-if="student.email" class="text-xs text-neutral-400 dark:text-neutral-500 truncate">{{ student.email }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Students Table - Desktop -->
          <div class="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[50px]">#</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(student, index) in students" :key="student.id">
                  <TableCell class="font-medium">{{ index + 1 }}</TableCell>
                  <TableCell class="font-medium">{{ student.admission_number }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Icon name="lucide:user" class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                      </div>
                      <span>{{ student.first_name }} {{ student.last_name }}</span>
                    </div>
                  </TableCell>
                  <TableCell>{{ student.email || '-' }}</TableCell>
                  <TableCell>{{ student.phone || '-' }}</TableCell>
                  <TableCell>
                    <Badge variant="default">{{ student.status }}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useClasses, type TeacherClass, type ClassStudent } from '~~/composables/teacher/useClasses'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

const route = useRoute()
const { fetchMyClasses, fetchClassStudents } = useClasses()
const { showToast } = useToast()

const classId = computed(() => parseInt(route.params.id as string))
const loading = ref(true)
const loadingStudents = ref(false)
const error = ref<string | null>(null)
const classDetails = ref<TeacherClass | null>(null)
const students = ref<ClassStudent[]>([])

const loadClassDetails = async () => {
  loading.value = true
  error.value = null

  try {
    // Fetch all classes to find the one we want
    const { data, error: fetchError } = await fetchMyClasses()

    if (fetchError) {
      error.value = fetchError
      showToast('Error', 'Failed to load class details', 'error')
      return
    }

    if (data) {
      // Find the class by ID
      const foundClass = data.find(c => c.id === classId.value)

      if (!foundClass) {
        error.value = 'Class not found or you do not have access to this class'
        return
      }

      classDetails.value = foundClass

      // Load students for this class
      await loadStudents()
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load class details'
    showToast('Error', error.value, 'error')
  } finally {
    loading.value = false
  }
}

const loadStudents = async () => {
  if (!classDetails.value?.classroom_id) return

  loadingStudents.value = true

  try {
    const { data, error: fetchError } = await fetchClassStudents(classDetails.value.classroom_id)

    if (fetchError) {
      showToast('Error', 'Failed to load students', 'error')
      return
    }

    if (data) {
      students.value = data
    }
  } catch (err: any) {
    showToast('Error', err.message || 'Failed to load students', 'error')
  } finally {
    loadingStudents.value = false
  }
}

onMounted(() => {
  loadClassDetails()
})
</script>
