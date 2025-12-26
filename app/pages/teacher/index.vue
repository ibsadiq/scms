<!-- pages/teacher/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Welcome, {{ teacherName }}</h1>
      <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Here's what's happening with your classes today</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
      <Icon name="lucide:alert-circle" class="w-16 h-16 text-red-500 mb-4" />
      <p class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Failed to load dashboard</p>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{{ error }}</p>
      <Button @click="loadDashboard">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData" class="space-y-4 sm:space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <AdminStatsCard
          title="My Classes"
          :value="dashboardData?.stats.totalClasses || 0"
          icon="lucide:users"
          description="Active classes"
          bg-color="bg-blue-50 dark:bg-blue-900/20"
          icon-color="text-blue-700 dark:text-blue-400"
        />
        <AdminStatsCard
          title="Total Students"
          :value="dashboardData?.stats.totalStudents || 0"
          icon="lucide:graduation-cap"
          description="Across all classes"
          bg-color="bg-green-50 dark:bg-green-900/20"
          icon-color="text-green-700 dark:text-green-400"
        />
        <AdminStatsCard
          title="Today's Classes"
          :value="dashboardData?.stats.todaysClasses || 0"
          icon="lucide:calendar-check"
          description="Scheduled today"
          bg-color="bg-purple-50 dark:bg-purple-900/20"
          icon-color="text-purple-700 dark:text-purple-400"
        />
        <AdminStatsCard
          title="Pending Grades"
          :value="dashboardData?.stats.pendingGrades || 0"
          icon="lucide:clipboard-list"
          description="Awaiting submission"
          bg-color="bg-orange-50 dark:bg-orange-900/20"
          icon-color="text-orange-700 dark:text-orange-400"
        />
      </div>

      <!-- Today's Schedule & My Classes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Today's Schedule -->
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for {{ formatDate(new Date()) }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="dashboardData?.todaysSchedule.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No classes scheduled for today
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="period in dashboardData?.todaysSchedule"
                :key="period.id"
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="lucide:book-open" class="w-5 h-5 sm:w-6 sm:h-6 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{{ period.subject_name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{{ period.classroom_name }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between sm:block sm:text-right sm:flex-shrink-0">
                  <p class="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {{ period.start_time }} - {{ period.end_time }}
                  </p>
                  <Badge :variant="period.status === 'completed' ? 'default' : 'secondary'">
                    {{ period.status }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- My Classes -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>My Classes</CardTitle>
                <CardDescription>Classes you're teaching</CardDescription>
              </div>
              <Button variant="outline" size="sm" @click="navigateTo('/teacher/classes')">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="dashboardData?.myClasses.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No classes assigned
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="classItem in dashboardData?.myClasses"
                :key="classItem.id"
                class="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                @click="navigateTo(`/teacher/classes/${classItem.id}`)"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="lucide:users" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ classItem.name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{{ classItem.subject }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-base sm:text-lg font-bold text-primary-700 dark:text-primary-400">{{ classItem.student_count }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">students</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activities & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Recent Activities -->
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="dashboardData?.recentActivities.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No recent activities
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="activity in dashboardData?.recentActivities"
                :key="activity.id"
                class="flex items-start gap-3"
              >
                <div
                  :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    activity.type === 'grade' ? 'bg-green-50 dark:bg-green-900/20' :
                    activity.type === 'attendance' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    'bg-orange-50 dark:bg-orange-900/20'
                  ]"
                >
                  <Icon
                    :name="activity.icon"
                    :class="[
                      'w-4 h-4',
                      activity.type === 'grade' ? 'text-green-700 dark:text-green-400' :
                      activity.type === 'attendance' ? 'text-blue-700 dark:text-blue-400' :
                      'text-orange-700 dark:text-orange-400'
                    ]"
                  />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ activity.title }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ activity.description }}</p>
                  <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/teacher/attendance')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon name="lucide:clipboard-check" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Take Attendance</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Mark student attendance</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/teacher/grades')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <Icon name="lucide:award" class="w-5 h-5 text-green-700 dark:text-green-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Enter Grades</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Submit student grades</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/teacher/assignments')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Icon name="lucide:clipboard-list" class="w-5 h-5 text-purple-700 dark:text-purple-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Create Assignment</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Add new assignment</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/teacher/timetable')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <Icon name="lucide:calendar-days" class="w-5 h-5 text-orange-700 dark:text-orange-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">View Timetable</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">See your schedule</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Upcoming Assessments -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Assessments</CardTitle>
              <CardDescription>Exams and tests you need to prepare</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/teacher/grades')">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="dashboardData?.upcomingAssessments.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No upcoming assessments
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="assessment in dashboardData?.upcomingAssessments"
              :key="assessment.id"
              class="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <Badge>{{ assessment.type }}</Badge>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ assessment.date }}</p>
              </div>
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">{{ assessment.name }}</h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ assessment.subject }} • {{ assessment.classroom }}</p>
            </div>
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
import { formatDate } from '~~/utils/helpers'
import { useDashboard, type TeacherDashboardData } from '~~/composables/teacher/useDashboard'
import { useAuth } from '~~/composables/useAuth'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

const { user } = useAuth()
const { fetchDashboard } = useDashboard()

const teacherName = computed(() => {
  if (!user.value) return 'Teacher'
  return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'Teacher'
})

const loading = ref(true)
const error = ref<string | null>(null)
const dashboardData = ref<TeacherDashboardData | null>(null)

const loadDashboard = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: apiError } = await fetchDashboard()

    if (apiError) {
      error.value = apiError
      console.error('Failed to load dashboard:', apiError)
      return
    }

    if (data) {
      dashboardData.value = data
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Dashboard error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>
