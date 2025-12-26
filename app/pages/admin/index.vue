<!-- pages/admin/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
      <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Welcome back, {{ userName }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-4 sm:space-y-6">
      <!-- Primary Stats Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        <AdminStatsCard
          title="Total Students"
          :value="dashboardData?.stats.totalStudents || 0"
          icon="lucide:users"
          description="Active students"
          bg-color="bg-blue-50 dark:bg-blue-900/20"
          icon-color="text-blue-700 dark:text-blue-400"
        />
        <AdminStatsCard
          title="Total Teachers"
          :value="dashboardData?.stats.totalTeachers || 0"
          icon="lucide:user-check"
          description="Active teachers"
          bg-color="bg-green-50 dark:bg-green-900/20"
          icon-color="text-green-700 dark:text-green-400"
        />
        <AdminStatsCard
          title="Active Subjects"
          :value="dashboardData?.stats.activeSubjects || 0"
          icon="lucide:book-open"
          description="Registered subjects"
          bg-color="bg-purple-50 dark:bg-purple-900/20"
          icon-color="text-purple-700 dark:text-purple-400"
        />
        <AdminStatsCard
          title="Attendance Rate"
          :value="`${dashboardData?.stats.attendanceRate || 0}%`"
          icon="lucide:check-circle"
          description="This week average"
          bg-color="bg-teal-50 dark:bg-teal-900/20"
          icon-color="text-teal-700 dark:text-teal-400"
        />
        <AdminStatsCard
          title="New Students"
          :value="dashboardData?.stats.newStudentsThisMonth || 0"
          icon="lucide:user-plus"
          description="This month"
          bg-color="bg-orange-50 dark:bg-orange-900/20"
          icon-color="text-orange-700 dark:text-orange-400"
        />
      </div>

      <!-- Admissions Overview (if available) -->
      <Card v-if="dashboardData?.admissionStats" class="border-l-4 border-l-primary-500">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <Icon name="lucide:users-round" class="w-5 h-5 text-primary-600" />
                Admissions Overview
              </CardTitle>
              <CardDescription>Active admission session statistics</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/admin/admissions/applications')">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {{ dashboardData.admissionStats.totalApplications }}
              </p>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Total Applications</p>
            </div>
            <div class="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {{ dashboardData.admissionStats.pendingReview }}
              </p>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Pending Review</p>
            </div>
            <div class="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p class="text-2xl font-bold text-green-700 dark:text-green-400">
                {{ dashboardData.admissionStats.approved }}
              </p>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Approved</p>
            </div>
            <div class="text-center p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
              <p class="text-2xl font-bold text-primary-700 dark:text-primary-400">
                {{ dashboardData.admissionStats.enrolled }}
              </p>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Enrolled</p>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600 dark:text-neutral-400">Total Revenue</span>
              <span class="font-bold text-green-700 dark:text-green-400">
                ₦{{ formatCurrency((dashboardData.admissionStats.applicationRevenue || 0) + (dashboardData.admissionStats.examRevenue || 0) + (dashboardData.admissionStats.acceptanceRevenue || 0)) }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div class="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                <p class="text-neutral-500 dark:text-neutral-400">Application</p>
                <p class="font-semibold text-neutral-900 dark:text-neutral-100">₦{{ formatCurrency(dashboardData.admissionStats.applicationRevenue) }}</p>
              </div>
              <div class="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                <p class="text-neutral-500 dark:text-neutral-400">Exam</p>
                <p class="font-semibold text-neutral-900 dark:text-neutral-100">₦{{ formatCurrency(dashboardData.admissionStats.examRevenue) }}</p>
              </div>
              <div class="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                <p class="text-neutral-500 dark:text-neutral-400">Acceptance</p>
                <p class="font-semibold text-neutral-900 dark:text-neutral-100">₦{{ formatCurrency(dashboardData.admissionStats.acceptanceRevenue) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Students by Level & Financial Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Students by Level -->
        <Card>
          <CardHeader>
            <CardTitle>Students by Level</CardTitle>
            <CardDescription>Distribution across academic levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="level in dashboardData?.studentsByLevel"
                :key="level.name"
                class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon :name="level.icon" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ level.name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ level.count }} students</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-primary-700 dark:text-primary-400">{{ level.percentage }}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Financial Overview -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Fee collection summary</CardDescription>
              </div>
              <Button variant="outline" size="sm" @click="navigateTo('/admin/finance/payments')">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Icon name="lucide:trending-up" class="w-6 h-6 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">Collected</p>
                    <p class="text-2xl font-bold text-green-700 dark:text-green-400">
                      ₦{{ formatCurrency(dashboardData?.financial.collected || 0) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Icon name="lucide:trending-down" class="w-6 h-6 text-red-700 dark:text-red-400" />
                  </div>
                  <div>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400">Outstanding</p>
                    <p class="text-2xl font-bold text-red-700 dark:text-red-400">
                      ₦{{ formatCurrency(dashboardData?.financial.outstanding || 0) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="pt-2">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Collection Rate</span>
                  <span class="text-sm font-bold text-primary-700 dark:text-primary-400">
                    {{ dashboardData?.financial.collectionRate || 0 }}%
                  </span>
                </div>
                <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all"
                    :style="{ width: `${dashboardData?.financial.collectionRate || 0}%` }"
                  ></div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <Button variant="outline" size="sm" @click="navigateTo('/admin/finance/payments')" class="w-full">
                  <Icon name="lucide:plus-circle" class="w-4 h-4 mr-2" />
                  Collect
                </Button>
                <Button variant="outline" size="sm" @click="navigateTo('/admin/finance/balances')" class="w-full">
                  <Icon name="lucide:wallet" class="w-4 h-4 mr-2" />
                  Balances
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Attendance Tracking & Performance Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Weekly Attendance -->
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>Last 5 school days</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="record in dashboardData?.attendance"
                :key="record.date"
                class="flex items-center justify-between p-3 rounded-lg border border-neutral-200"
              >
                <div>
                  <p class="font-medium">{{ record.dayName }}</p>
                  <p class="text-sm text-neutral-500">{{ formatDate(record.date) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold" :class="getAttendanceColor(record.rate)">
                    {{ record.rate }}%
                  </p>
                  <p class="text-xs text-neutral-500">
                    {{ record.present }}/{{ record.total }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Performance Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>Current term overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <div>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">Average Grade</p>
                  <p class="text-3xl font-bold text-primary-700 dark:text-primary-400">
                    {{ dashboardData?.performance.averageGrade }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">Pass Rate</p>
                  <p class="text-3xl font-bold text-green-700 dark:text-green-400">
                    {{ dashboardData?.performance.passRate }}%
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="text-center p-2 sm:p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p class="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
                    {{ dashboardData?.performance.grades.a }}%
                  </p>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Grade A</p>
                </div>
                <div class="text-center p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p class="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {{ dashboardData?.performance.grades.b }}%
                  </p>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Grade B</p>
                </div>
                <div class="text-center p-2 sm:p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p class="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {{ dashboardData?.performance.grades.c }}%
                  </p>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">Grade C</p>
                </div>
                <div class="text-center p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p class="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400">
                    {{ dashboardData?.performance.grades.df }}%
                  </p>
                  <p class="text-xs text-neutral-600 dark:text-neutral-400">D/F</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Admissions & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Recent Admissions -->
        <Card>
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
            <CardDescription>Latest student enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="dashboardData?.recentAdmissions.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No recent admissions
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="student in dashboardData?.recentAdmissions"
                :key="student.id"
                class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Icon name="lucide:user" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.first_name }} {{ student.last_name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.grade_level }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatDate(student.admission_date) }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/admin/students')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Icon name="lucide:user-plus" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Add New Student</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Enroll a new student</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/admin/teachers')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <Icon name="lucide:user-check" class="w-5 h-5 text-green-700 dark:text-green-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Add New Teacher</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Register new teacher</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/admin/timetable')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon name="lucide:calendar-days" class="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Manage Timetable</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Class schedules</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto py-4 justify-start"
                @click="navigateTo('/admin/assessments')"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Icon name="lucide:clipboard-list" class="w-5 h-5 text-purple-700 dark:text-purple-400" />
                  </div>
                  <div class="text-left">
                    <p class="font-semibold">Manage Assessments</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">Exams and grades</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Payments -->
      <Card v-if="dashboardData?.recentPayments && dashboardData.recentPayments.length > 0">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest fee payments received</CardDescription>
            </div>
            <Button variant="outline" size="sm" @click="navigateTo('/admin/payments')">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="payment in dashboardData.recentPayments"
              :key="payment.id"
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:receipt" class="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ payment.student_name }}</p>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                      #{{ payment.receipt_number }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 flex-wrap">
                    <span class="truncate">{{ payment.term_name }}</span>
                    <span class="hidden sm:inline">•</span>
                    <span class="hidden sm:inline">{{ payment.method }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between sm:block sm:text-right sm:flex-shrink-0">
                <p class="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">
                  ₦{{ formatCurrency(payment.amount) }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ formatDate(payment.paid_on) }}
                </p>
              </div>
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
import type { DashboardData } from '~~/types'
import { useAuth } from '~~/composables/useAuth'
import { useDashboard } from '~~/composables/admin/useDashboard'
import { formatDate } from '~~/utils/helpers'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { user, fetchUser } = useAuth()
const { fetchDashboardStats } = useDashboard()

const userName = computed(() => {
  if (!user.value) return 'User'
  return `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || user.value.username
})

const loading = ref(true)
const dashboardData = ref<DashboardData | null>(null)

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Get attendance color
const getAttendanceColor = (rate: number) => {
  if (rate >= 95) return 'text-green-700'
  if (rate >= 85) return 'text-blue-700'
  if (rate >= 75) return 'text-yellow-700'
  return 'text-red-700'
}

// Load all data
const loadData = async () => {
  loading.value = true

  const [, dashboardResult] = await Promise.all([
    fetchUser(),
    fetchDashboardStats(),
  ])

  dashboardData.value = dashboardResult

  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>
