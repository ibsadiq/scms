<!-- pages/parent/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Welcome, {{ parentName }}</h1>
      <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Here's an overview of your children's progress</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-4 sm:space-y-6">
      <!-- My Children Cards -->
      <div>
        <h2 class="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 sm:mb-4">My Children</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card
            v-for="child in dashboardData?.children"
            :key="child.id"
            class="hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateTo(`/parent/children/${child.id}`)"
          >
            <CardContent class="p-4 sm:p-6">
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:user" class="w-6 h-6 sm:w-8 sm:h-8 text-primary-700 dark:text-primary-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{{ child.first_name }} {{ child.last_name }}</h3>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{{ child.class_name }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <Badge :variant="child.status === 'active' ? 'default' : 'secondary'">
                      {{ child.status }}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Academic Performance & Attendance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Academic Performance -->
        <Card>
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>Current term overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="child in dashboardData?.children"
                :key="child.id"
                class="p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div class="flex items-center justify-between mb-2 gap-2">
                  <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ child.first_name }} {{ child.last_name }}</p>
                  <Badge class="flex-shrink-0">{{ child.class_name }}</Badge>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Average Grade</p>
                    <p class="text-xl sm:text-2xl font-bold text-primary-700 dark:text-primary-400">{{ child.performance.average_grade }}</p>
                  </div>
                  <div class="text-right min-w-0 flex-1">
                    <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Position</p>
                    <p class="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{{ child.performance.position }}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Attendance Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="child in dashboardData?.children"
                :key="child.id"
                class="p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div class="flex items-center justify-between mb-3 gap-2">
                  <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ child.first_name }} {{ child.last_name }}</p>
                  <Badge :variant="child.attendance.rate >= 90 ? 'default' : 'destructive'" class="flex-shrink-0">
                    {{ child.attendance.rate }}%
                  </Badge>
                </div>
                <div class="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                  <div class="p-1.5 sm:p-2 rounded bg-green-50 dark:bg-green-900/20">
                    <p class="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">{{ child.attendance.present }}</p>
                    <p class="text-xs text-neutral-600 dark:text-neutral-400">Present</p>
                  </div>
                  <div class="p-1.5 sm:p-2 rounded bg-red-50 dark:bg-red-900/20">
                    <p class="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">{{ child.attendance.absent }}</p>
                    <p class="text-xs text-neutral-600 dark:text-neutral-400">Absent</p>
                  </div>
                  <div class="p-1.5 sm:p-2 rounded bg-orange-50 dark:bg-orange-900/20">
                    <p class="text-base sm:text-lg font-bold text-orange-700 dark:text-orange-400">{{ child.attendance.late }}</p>
                    <p class="text-xs text-neutral-600 dark:text-neutral-400">Late</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Fee Status & Upcoming Events -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Fee Payment Status -->
        <Card>
          <CardHeader>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>Fee Payment Status</CardTitle>
                <CardDescription>Current term fees</CardDescription>
              </div>
              <Button variant="outline" size="sm" @click="navigateTo('/parent/fees')" class="self-start sm:self-auto">
                Pay Now
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="child in dashboardData?.children"
                :key="child.id"
                class="p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div class="flex items-center justify-between mb-2 gap-2">
                  <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ child.first_name }} {{ child.last_name }}</p>
                  <Badge :variant="child.fees.status === 'Paid' ? 'default' : child.fees.status === 'Partial' ? 'secondary' : 'destructive'" class="flex-shrink-0">
                    {{ child.fees.status }}
                  </Badge>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Total Fee</p>
                    <p class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">₦{{ formatCurrency(child.fees.total) }}</p>
                  </div>
                  <div class="text-right min-w-0 flex-1">
                    <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Balance</p>
                    <p
                      :class="[
                        'text-base sm:text-lg font-bold truncate',
                        child.fees.balance === 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                      ]"
                    >
                      ₦{{ formatCurrency(child.fees.balance) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Upcoming Events -->
        <Card>
          <CardHeader>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>School calendar</CardDescription>
              </div>
              <Button variant="outline" size="sm" @click="navigateTo('/parent/events')" class="self-start sm:self-auto">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="dashboardData?.upcomingEvents.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No upcoming events
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="event in dashboardData?.upcomingEvents"
                :key="event.id"
                class="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:calendar" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ event.name }}</p>
                  <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ event.date }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Recent Activities -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates about your children</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="dashboardData?.recentActivities.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No recent activities
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="activity in dashboardData?.recentActivities"
              :key="activity.id"
              class="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div
                :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  activity.type === 'grade' ? 'bg-green-50 dark:bg-green-900/20' :
                  activity.type === 'attendance' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  activity.type === 'payment' ? 'bg-purple-50 dark:bg-purple-900/20' :
                  'bg-orange-50 dark:bg-orange-900/20'
                ]"
              >
                <Icon
                  :name="activity.icon"
                  :class="[
                    'w-5 h-5',
                    activity.type === 'grade' ? 'text-green-700 dark:text-green-400' :
                    activity.type === 'attendance' ? 'text-blue-700 dark:text-blue-400' :
                    activity.type === 'payment' ? 'text-purple-700 dark:text-purple-400' :
                    'text-orange-700 dark:text-orange-400'
                  ]"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ activity.child_name }}</p>
                  <p class="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0">{{ activity.time }}</p>
                </div>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{{ activity.description }}</p>
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
import { Badge } from '@/components/ui/badge'
import { useChildren } from '~~/composables/parent/useChildren'
import { useEvents } from '~~/composables/parent/useEvents'
import { useAuth } from '~~/composables/useAuth'

definePageMeta({
  layout: 'parent',
  middleware: 'parent'
})

const { user } = useAuth()
const { fetchMyChildren, fetchChildPerformance, fetchChildAttendance, fetchChildFees } = useChildren()
const { fetchUpcomingEvents, fetchRecentActivities } = useEvents()

const parentName = computed(() => user.value?.first_name || 'Parent')
const loading = ref(true)

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface DashboardChild {
  id: number
  first_name: string
  last_name: string
  class_name: string
  status: string
  performance: {
    average_grade: string
    position: string
  }
  attendance: {
    rate: number
    present: number
    absent: number
    late: number
  }
  fees: {
    total: number
    paid: number
    balance: number
    status: string
  }
}

const dashboardData = ref<{
  children: DashboardChild[]
  upcomingEvents: any[]
  recentActivities: any[]
} | null>(null)

const loadDashboardData = async () => {
  loading.value = true

  try {
    // Fetch children
    const { data: childrenData, error: childrenError } = await fetchMyChildren()

    if (childrenError || !childrenData) {
      console.error('Error fetching children:', childrenError)
      loading.value = false
      return
    }

    // For each child, fetch performance, attendance, and fees
    const childrenWithDetails = await Promise.all(
      childrenData.map(async (child) => {
        const [performanceRes, attendanceRes, feesRes] = await Promise.all([
          fetchChildPerformance(child.id),
          fetchChildAttendance(child.id),
          fetchChildFees(child.id)
        ])

        return {
          id: child.id,
          first_name: child.first_name,
          last_name: child.last_name,
          class_name: child.classroom?.name || child.class_name || 'Not Assigned',
          status: child.status || 'active',
          performance: {
            average_grade: performanceRes.data?.average_grade || 'N/A',
            position: performanceRes.data?.position?.toString() || 'N/A'
          },
          attendance: {
            rate: attendanceRes.data?.attendance_rate || 0,
            present: attendanceRes.data?.present || 0,
            absent: attendanceRes.data?.absent || 0,
            late: attendanceRes.data?.late || 0
          },
          fees: {
            total: feesRes.data?.total_fees || 0,
            paid: feesRes.data?.total_paid || 0,
            balance: feesRes.data?.balance || 0,
            status: feesRes.data?.status || 'unpaid'
          }
        }
      })
    )

    // Fetch events and activities
    const [eventsRes, activitiesRes] = await Promise.all([
      fetchUpcomingEvents({ limit: 5 }),
      fetchRecentActivities(5)
    ])

    dashboardData.value = {
      children: childrenWithDetails,
      upcomingEvents: eventsRes.data?.map(event => ({
        id: event.id,
        name: event.title,
        date: new Date(event.start_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })) || [],
      recentActivities: activitiesRes.data?.map(activity => ({
        id: activity.id,
        type: activity.type,
        icon: activity.icon || getActivityIcon(activity.type),
        child_name: activity.student_name || 'All Children',
        description: activity.description,
        time: formatRelativeTime(activity.timestamp)
      })) || []
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    'grade_posted': 'lucide:award',
    'attendance_marked': 'lucide:calendar-check',
    'fee_paid': 'lucide:wallet',
    'event_created': 'lucide:megaphone',
    'announcement': 'lucide:bell',
    'remark_added': 'lucide:message-circle'
  }
  return icons[type] || 'lucide:info'
}

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadDashboardData()
})
</script>
