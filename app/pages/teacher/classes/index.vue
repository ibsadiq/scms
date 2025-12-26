<!-- pages/teacher/classes/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Classes</h1>
      <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">View your homeroom and teaching assignments</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading classes...</p>
    </div>

    <!-- Empty State -->
    <Card v-else-if="homeroomClass === null && teachingClasses.length === 0">
      <CardContent class="p-12 text-center">
        <Icon name="lucide:book-open" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
        <p class="text-neutral-500 dark:text-neutral-400">No classes assigned yet</p>
        <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Contact your administrator for class assignments</p>
      </CardContent>
    </Card>

    <!-- Homeroom Class Section -->
    <div v-else>
      <div v-if="homeroomClass" class="space-y-4">
        <div class="flex items-center gap-2">
          <Icon name="lucide:home" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 class="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Homeroom Class</h2>
          <Badge variant="default" class="ml-2">Class Teacher</Badge>
        </div>

        <Card
          class="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
          @click="navigateToClass(homeroomClass)"
        >
          <CardHeader class="p-4 sm:p-5">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <CardTitle class="text-base sm:text-lg truncate">{{ homeroomClass.classroom_name }}</CardTitle>
                </div>
                <CardDescription class="text-sm truncate mt-1">
                  <Icon name="lucide:shield-check" class="w-3 h-3 inline mr-1" />
                  Homeroom Teacher
                </CardDescription>
              </div>
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="lucide:home" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
              </div>
            </div>
          </CardHeader>

          <CardContent class="p-4 sm:p-5 pt-0">
            <div class="space-y-3">
              <!-- Grade Level -->
              <div class="flex items-center gap-2 text-sm">
                <Icon name="lucide:layers" class="w-4 h-4 text-neutral-400" />
                <span class="text-neutral-600 dark:text-neutral-400">{{ homeroomClass.grade_level_name }}</span>
              </div>

              <!-- Student Count -->
              <div class="flex items-center gap-2 text-sm">
                <Icon name="lucide:users" class="w-4 h-4 text-neutral-400" />
                <span class="text-neutral-600 dark:text-neutral-400">
                  {{ homeroomClass.student_count || 0 }} Students
                </span>
              </div>

              <!-- Actions -->
              <div class="grid grid-cols-2 gap-2 pt-3">
                <Button
                  size="sm"
                  variant="default"
                  @click.stop="navigateTo(`/teacher/attendance?class=${homeroomClass.classroom_id}`)"
                  class="w-full text-xs"
                >
                  <Icon name="lucide:check-square" class="w-3 h-3 mr-1" />
                  Attendance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click.stop="navigateTo(`/teacher/classes/${homeroomClass.classroom_id}`)"
                  class="w-full text-xs"
                >
                  <Icon name="lucide:eye" class="w-3 h-3 mr-1" />
                  View Class
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Teaching Classes Section -->
      <div v-if="teachingClasses.length > 0" class="space-y-4 mt-8">
        <div class="flex items-center gap-2">
          <Icon name="lucide:book-open" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 class="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Teaching Classes</h2>
          <Badge variant="secondary" class="ml-2">{{ teachingClasses.length }} {{ teachingClasses.length === 1 ? 'Class' : 'Classes' }}</Badge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="classItem in teachingClasses"
            :key="classItem.id"
            class="hover:shadow-lg transition-all cursor-pointer border-l-4"
            :class="getClassBorderColor(classItem.grade_level_name)"
            @click="navigateToClass(classItem)"
          >
        <CardHeader class="p-4 sm:p-5">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <CardTitle class="text-base sm:text-lg truncate">{{ classItem.classroom_name }}</CardTitle>
              <CardDescription class="text-sm truncate mt-1">{{ classItem.subject_name }}</CardDescription>
            </div>
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="lucide:graduation-cap" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
            </div>
          </div>
        </CardHeader>

        <CardContent class="p-4 sm:p-5 pt-0">
          <div class="space-y-3">
            <!-- Grade Level -->
            <div class="flex items-center gap-2 text-sm">
              <Icon name="lucide:layers" class="w-4 h-4 text-neutral-400" />
              <span class="text-neutral-600 dark:text-neutral-400">{{ classItem.grade_level_name }}</span>
            </div>

            <!-- Student Count -->
            <div class="flex items-center gap-2 text-sm">
              <Icon name="lucide:users" class="w-4 h-4 text-neutral-400" />
              <span class="text-neutral-600 dark:text-neutral-400">
                {{ classItem.student_count || 0 }} Students
              </span>
            </div>

            <!-- Schedule (if available) -->
            <div v-if="classItem.schedule && classItem.schedule.length > 0" class="pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Schedule</p>
              <div class="space-y-1">
                <div
                  v-for="(schedule, idx) in classItem.schedule.slice(0, 2)"
                  :key="idx"
                  class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  <Icon name="lucide:clock" class="w-3 h-3" />
                  <span>{{ schedule.day }}: {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}</span>
                </div>
                <p v-if="classItem.schedule.length > 2" class="text-xs text-neutral-400 dark:text-neutral-500 pl-5">
                  +{{ classItem.schedule.length - 2 }} more
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="grid grid-cols-2 gap-2 pt-3">
              <Button
                size="sm"
                variant="outline"
                @click.stop="navigateTo(`/teacher/attendance?class=${classItem.id}`)"
                class="w-full text-xs"
              >
                <Icon name="lucide:check-square" class="w-3 h-3 mr-1" />
                Attendance
              </Button>
              <Button
                size="sm"
                variant="outline"
                @click.stop="navigateTo(`/teacher/grades?class=${classItem.id}`)"
                class="w-full text-xs"
              >
                <Icon name="lucide:award" class="w-3 h-3 mr-1" />
                Grades
              </Button>
            </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <Card v-if="!loading && (homeroomClass !== null || teachingClasses.length > 0)">
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useClasses, type TeacherClass } from '~~/composables/teacher/useClasses'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

const { fetchMyClasses } = useClasses()

const myClasses = ref<TeacherClass[]>([])
const homeroomClass = ref<TeacherClass | null>(null)
const teachingClasses = ref<TeacherClass[]>([])
const loading = ref(true)

const getClassBorderColor = (gradeLevel: string) => {
  const colors = [
    'border-l-blue-500',
    'border-l-green-500',
    'border-l-purple-500',
    'border-l-orange-500',
    'border-l-pink-500',
    'border-l-teal-500',
  ]
  const hash = gradeLevel?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
  return colors[hash % colors.length]
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const navigateToClass = (classItem: TeacherClass) => {
  // Navigate to class detail page (you can customize this)
  navigateTo(`/teacher/classes/${classItem.id}`)
}

onMounted(async () => {
  loading.value = true
  const { data } = await fetchMyClasses()

  if (data) {
    myClasses.value = data

    // Separate homeroom class from teaching classes
    const homeroom = data.find(c => c.is_class_teacher === true)
    homeroomClass.value = homeroom || null

    // Teaching classes are all classes (homeroom teacher also teaches their homeroom)
    teachingClasses.value = data
  }

  loading.value = false
})
</script>
