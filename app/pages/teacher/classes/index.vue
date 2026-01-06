<!-- pages/teacher/classes/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Classes</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">View your homeroom and teaching assignments</p>
      </div>
      <Button variant="outline" size="sm" @click="loadClasses" :disabled="loading">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading classes...</p>
    </div>

    <!-- Empty State -->
    <Card v-else-if="homeroomClasses.length === 0 && teachingAssignments.length === 0">
      <CardContent class="p-12 text-center">
        <Icon name="lucide:book-open" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
        <p class="text-neutral-500 dark:text-neutral-400">No classes assigned yet</p>
        <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Contact your administrator for class assignments</p>
      </CardContent>
    </Card>

    <!-- Classes Tables -->
    <div v-else class="space-y-6">
      <!-- Homeroom Classes Table -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:home" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 class="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Homeroom Classes</h2>
          <Badge variant="default" class="ml-2">{{ homeroomClasses.length }}</Badge>
        </div>

        <Card>
          <CardContent class="p-0">
            <!-- Empty State for Homeroom Classes -->
            <div v-if="homeroomClasses.length === 0" class="p-12 text-center">
              <Icon name="lucide:home-x" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <p class="text-neutral-500 dark:text-neutral-400 font-medium">No homeroom class assigned yet</p>
              <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Contact your administrator to be assigned as a homeroom teacher</p>
            </div>

            <!-- Table with Data -->
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Classroom</th>
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Grade Level</th>
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Students</th>
                    <th class="text-right p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="classroom in homeroomClasses"
                    :key="classroom.id"
                    class="border-b border-neutral-200 dark:border-neutral-700 last:border-0 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
                  >
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <Icon name="lucide:home" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                        </div>
                        <div>
                          <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ classroom.classroom_name }}</p>
                          <p class="text-xs text-neutral-500 dark:text-neutral-400">
                            <Icon name="lucide:shield-check" class="w-3 h-3 inline mr-1" />
                            Homeroom Teacher
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ classroom.grade_level_name }}</span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <Icon name="lucide:users" class="w-4 h-4 text-neutral-400" />
                        <span class="text-sm text-neutral-900 dark:text-neutral-100 font-medium">{{ classroom.student_count || 0 }}</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          @click="navigateTo(`/teacher/attendance?class=${classroom.classroom_id}`)"
                        >
                          <Icon name="lucide:check-square" class="w-4 h-4 mr-1" />
                          Attendance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="navigateTo(`/teacher/classes/${classroom.classroom_id}`)"
                        >
                          <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Teaching Assignments Table -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:book-open" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 class="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Teaching Assignments</h2>
          <Badge variant="secondary" class="ml-2">{{ teachingAssignments.length }}</Badge>
        </div>

        <Card>
          <CardContent class="p-0">
            <!-- Empty State for Teaching Assignments -->
            <div v-if="teachingAssignments.length === 0" class="p-12 text-center">
              <Icon name="lucide:book-x" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <p class="text-neutral-500 dark:text-neutral-400 font-medium">No subjects allocated yet</p>
              <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Contact your administrator to allocate subjects</p>
            </div>

            <!-- Table with Data -->
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Classroom</th>
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Subject</th>
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Grade Level</th>
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Students</th>
                    <th class="text-left p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Role</th>
                    <th class="text-right p-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="assignment in teachingAssignments"
                    :key="assignment.id"
                    class="border-b border-neutral-200 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Icon name="lucide:graduation-cap" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div>
                          <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ assignment.classroom_name }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <Badge variant="secondary">{{ assignment.subject_name }}</Badge>
                    </td>
                    <td class="p-4">
                      <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ assignment.grade_level_name }}</span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <Icon name="lucide:users" class="w-4 h-4 text-neutral-400" />
                        <span class="text-sm text-neutral-900 dark:text-neutral-100 font-medium">{{ assignment.student_count || 0 }}</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <Badge v-if="assignment.is_class_teacher" variant="default" class="bg-primary-600">
                        <Icon name="lucide:shield-check" class="w-3 h-3 mr-1" />
                        Also Homeroom
                      </Badge>
                      <Badge v-else variant="outline">
                        <Icon name="lucide:book-open" class="w-3 h-3 mr-1" />
                        Subject Teacher
                      </Badge>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          @click="navigateTo(`/teacher/attendance?class=${assignment.id}`)"
                        >
                          <Icon name="lucide:check-square" class="w-4 h-4 mr-1" />
                          Attendance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="navigateTo(`/teacher/grades?class=${assignment.id}`)"
                        >
                          <Icon name="lucide:award" class="w-4 h-4 mr-1" />
                          Grades
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          @click="navigateTo(`/teacher/classes/${assignment.classroom_id}`)"
                        >
                          <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Quick Actions -->
    <Card v-if="!loading && (homeroomClasses.length > 0 || teachingAssignments.length > 0)">
      <CardHeader class="p-4 sm:p-6">
        <CardTitle class="text-lg sm:text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" @click="navigateTo('/teacher/attendance')" class="w-full justify-start">
            <Icon name="lucide:clipboard-check" class="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
          <Button variant="outline" @click="navigateTo('/teacher/grades')" class="w-full justify-start">
            <Icon name="lucide:award" class="w-4 h-4 mr-2" />
            Enter Grades
          </Button>
          <Button variant="outline" @click="navigateTo('/teacher/timetable')" class="w-full justify-start">
            <Icon name="lucide:calendar" class="w-4 h-4 mr-2" />
            View Timetable
          </Button>
          <Button variant="outline" @click="navigateTo('/teacher')" class="w-full justify-start">
            <Icon name="lucide:layout-dashboard" class="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useClasses } from '~~/composables/teacher/useClasses'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

interface HomeroomClass {
  id: string
  classroom_id: number
  classroom_name: string
  grade_level_name: string
  student_count: number
}

interface TeachingAssignment {
  id: number
  classroom_id: number
  classroom_name: string
  subject_name: string
  grade_level_name: string
  student_count: number
  is_class_teacher: boolean
  schedule: any[]
}

const { fetchMyClasses } = useClasses()

const homeroomClasses = ref<HomeroomClass[]>([])
const teachingAssignments = ref<TeachingAssignment[]>([])
const loading = ref(true)

const loadClasses = async () => {
  loading.value = true
  const { data } = await fetchMyClasses()

  if (data) {
    // Backend now returns separate arrays
    homeroomClasses.value = (data as any).homeroom_classes || []
    teachingAssignments.value = (data as any).teaching_assignments || []
  }

  loading.value = false
}

onMounted(() => {
  loadClasses()
})
</script>
