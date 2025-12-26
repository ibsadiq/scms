<!-- pages/student/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <Card class="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
      <CardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-2">Welcome back, {{ studentName }}! 👋</h1>
            <p class="text-primary-100 text-sm">
              {{ studentData?.classroom_name || 'Student Portal' }} • {{ studentData?.admission_number }}
            </p>
          </div>
          <div class="hidden sm:block">
            <Icon name="lucide:graduation-cap" size="64" class="opacity-20" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Dashboard Content -->
    <template v-else>
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Attendance -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="lucide:calendar-days" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Attendance</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ attendanceRate }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Average Grade -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon name="lucide:award" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Average Grade</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ averageGrade }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Assignments -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Icon name="lucide:clipboard-list" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Assignments</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ upcomingAssignmentsCount }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Fee Balance -->
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icon name="lucide:wallet" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Fee Balance</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ feeBalance }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Today's Schedule -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Today's Schedule</CardTitle>
            <Button variant="ghost" size="sm" as-child>
              <NuxtLink to="/student/timetable">
                View All
              </NuxtLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:calendar-clock" size="48" class="mx-auto mb-4 opacity-20" />
            <p>No classes scheduled for today</p>
            <p class="text-sm mt-1">Check your full timetable for the week</p>
          </div>
        </CardContent>
      </Card>

      <!-- Upcoming Assignments -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Upcoming Assignments</CardTitle>
            <Button variant="ghost" size="sm" as-child>
              <NuxtLink to="/student/assignments">
                View All
              </NuxtLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:clipboard-check" size="48" class="mx-auto mb-4 opacity-20" />
            <p>No upcoming assignments</p>
            <p class="text-sm mt-1">You're all caught up!</p>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Grades -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Recent Grades</CardTitle>
            <Button variant="ghost" size="sm" as-child>
              <NuxtLink to="/student/grades">
                View All
              </NuxtLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:file-text" size="48" class="mx-auto mb-4 opacity-20" />
            <p>No grades available</p>
            <p class="text-sm mt-1">Grades will appear here once published</p>
          </div>
        </CardContent>
      </Card>

      <!-- Announcements -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">Announcements</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:megaphone" size="48" class="mx-auto mb-4 opacity-20" />
            <p>No new announcements</p>
            <p class="text-sm mt-1">Stay tuned for updates</p>
          </div>
        </CardContent>
      </Card>
    </div>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="outline" class="h-auto py-4 flex flex-col gap-2" as-child>
              <NuxtLink to="/student/timetable">
                <Icon name="lucide:calendar-days" class="w-6 h-6" />
                <span class="text-sm">My Timetable</span>
              </NuxtLink>
            </Button>

            <Button variant="outline" class="h-auto py-4 flex flex-col gap-2" as-child>
              <NuxtLink to="/student/assignments">
                <Icon name="lucide:clipboard-list" class="w-6 h-6" />
                <span class="text-sm">Assignments</span>
              </NuxtLink>
            </Button>

            <Button variant="outline" class="h-auto py-4 flex flex-col gap-2" as-child>
              <NuxtLink to="/student/grades">
                <Icon name="lucide:award" class="w-6 h-6" />
                <span class="text-sm">My Grades</span>
              </NuxtLink>
            </Button>

            <Button variant="outline" class="h-auto py-4 flex flex-col gap-2" as-child>
              <NuxtLink to="/student/fees">
                <Icon name="lucide:wallet" class="w-6 h-6" />
                <span class="text-sm">Fees</span>
              </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStudentAuth } from '~~/composables/useStudentAuth'
import { useStudentDashboard } from '~~/composables/student/useDashboard'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

const { studentData } = useStudentAuth()
const { dashboardData, loading, error, fetchDashboard } = useStudentDashboard()

// Compute student full name
const studentName = computed(() => {
  if (!studentData.value) return 'Student'

  const parts = [
    studentData.value.first_name,
    studentData.value.middle_name,
    studentData.value.last_name
  ].filter(Boolean)

  return parts.join(' ') || 'Student'
})

// Computed values for dashboard stats
const attendanceRate = computed(() => {
  if (!dashboardData.value?.attendance_summary) return '--'
  return `${dashboardData.value.attendance_summary.attendance_rate.toFixed(1)}%`
})

const averageGrade = computed(() => {
  if (!dashboardData.value?.recent_results || dashboardData.value.recent_results.length === 0) return '--'
  // Calculate average from recent results
  const total = dashboardData.value.recent_results.reduce((sum, result) => sum + (result.score || 0), 0)
  const avg = total / dashboardData.value.recent_results.length
  return avg.toFixed(1)
})

const upcomingAssignmentsCount = computed(() => {
  if (!dashboardData.value?.upcoming_assignments) return '--'
  return dashboardData.value.upcoming_assignments.length
})

const feeBalance = computed(() => {
  if (!dashboardData.value?.fee_balance) return '--'
  const balance = dashboardData.value.fee_balance.remaining
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(balance)
})

// Fetch dashboard data on mount
onMounted(async () => {
  await fetchDashboard()
})

// Set page title
useHead({
  title: 'Student Dashboard'
})

</script>