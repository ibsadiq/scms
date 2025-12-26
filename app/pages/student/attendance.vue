<!-- pages/student/attendance.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Attendance</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View your attendance records and statistics
        </p>
      </div>
      <Button variant="outline" size="sm" @click="loadData">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !summary" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Content -->
    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="lucide:calendar" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Days</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ totalDays }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon name="lucide:check-circle" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Present</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ presentDays }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Icon name="lucide:x-circle" class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Absent</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ absentDays }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Icon name="lucide:clock" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Late</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ lateDays }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icon name="lucide:trending-up" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Attendance Rate</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ attendanceRate.toFixed(1) }}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Month Selector -->
      <Card>
        <CardHeader>
          <CardTitle>Monthly Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              @click="previousMonth"
            >
              <Icon name="lucide:chevron-left" class="w-4 h-4" />
            </Button>
            <div class="flex-1 text-center">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ currentMonthName }} {{ selectedYear }}
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="nextMonth"
              :disabled="isCurrentMonth"
            >
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </Button>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-2">
            <!-- Day headers -->
            <div
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="day"
              class="text-center text-sm font-semibold text-neutral-600 dark:text-neutral-400 py-2"
            >
              {{ day }}
            </div>

            <!-- Calendar days -->
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="aspect-square"
            >
              <div
                v-if="day.date"
                class="w-full h-full rounded-lg border transition-all"
                :class="getDayClasses(day)"
              >
                <div class="flex flex-col items-center justify-center h-full p-1">
                  <span class="text-sm font-medium">{{ day.day }}</span>
                  <Icon
                    v-if="day.status"
                    :name="getStatusIcon(day.status)"
                    class="w-4 h-4 mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-6 flex flex-wrap gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-500"></div>
              <span class="text-neutral-600 dark:text-neutral-400">Present</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-500"></div>
              <span class="text-neutral-600 dark:text-neutral-400">Absent</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-500"></div>
              <span class="text-neutral-600 dark:text-neutral-400">Late</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-500"></div>
              <span class="text-neutral-600 dark:text-neutral-400">Excused</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Records -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="recentRecords.length > 0" class="space-y-3">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div
                  class="p-2 rounded-lg"
                  :class="getStatusBgClass(record.status)"
                >
                  <Icon
                    :name="getStatusIcon(record.status)"
                    class="w-5 h-5"
                    :class="getStatusIconClass(record.status)"
                  />
                </div>
                <div>
                  <p class="font-medium text-neutral-900 dark:text-neutral-100">
                    {{ formatDate(record.date) }}
                  </p>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    {{ record.subject_name || 'Full Day' }}
                    <span v-if="record.period"> - {{ record.period }}</span>
                  </p>
                </div>
              </div>
              <div class="text-right">
                <Badge :variant="getStatusVariant(record.status)">
                  {{ record.status.charAt(0).toUpperCase() + record.status.slice(1) }}
                </Badge>
                <p v-if="record.remarks" class="text-xs text-neutral-500 mt-1">
                  {{ record.remarks }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:inbox" size="48" class="mx-auto mb-3 opacity-20" />
            <p>No attendance records for this period</p>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStudentAttendance } from '~~/composables/student/useAttendance'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

const {
  attendanceRecords,
  summary,
  loading,
  error,
  presentDays,
  absentDays,
  lateDays,
  excusedDays,
  totalDays,
  attendanceRate,
  fetchAttendance,
  fetchSummary
} = useStudentAttendance()

const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

const currentMonthName = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value - 1).toLocaleDateString('en-US', {
    month: 'long'
  })
})

const isCurrentMonth = computed(() => {
  const now = new Date()
  return selectedMonth.value === now.getMonth() + 1 && selectedYear.value === now.getFullYear()
})

// Calendar generation
interface CalendarDay {
  date: string | null
  day: number | null
  status: string | null
  isToday: boolean
  isCurrentMonth: boolean
}

const calendarDays = computed(() => {
  const year = selectedYear.value
  const month = selectedMonth.value - 1
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: CalendarDay[] = []

  // Add empty days for alignment
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({
      date: null,
      day: null,
      status: null,
      isToday: false,
      isCurrentMonth: false
    })
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split('T')[0]
    const record = attendanceRecords.value.find(r => r.date === dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    days.push({
      date: dateString,
      day,
      status: record?.status || null,
      isToday,
      isCurrentMonth: true
    })
  }

  return days
})

const recentRecords = computed(() => {
  return attendanceRecords.value
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
})

// Navigation
const previousMonth = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
  loadMonthData()
}

const nextMonth = () => {
  if (!isCurrentMonth.value) {
    if (selectedMonth.value === 12) {
      selectedMonth.value = 1
      selectedYear.value++
    } else {
      selectedMonth.value++
    }
    loadMonthData()
  }
}

const loadData = async () => {
  await Promise.all([
    fetchSummary(selectedMonth.value, selectedYear.value),
    loadMonthData()
  ])
}

const loadMonthData = async () => {
  await fetchAttendance({
    month: selectedMonth.value,
    year: selectedYear.value
  })
}

// Styling helpers
const getDayClasses = (day: CalendarDay) => {
  if (!day.date) return ''

  const classes = []

  if (day.isToday) {
    classes.push('ring-2 ring-primary-500')
  }

  if (!day.status) {
    classes.push('border-neutral-200 dark:border-neutral-700')
  } else {
    switch (day.status) {
      case 'present':
        classes.push('bg-green-50 dark:bg-green-900/20 border-green-500')
        break
      case 'absent':
        classes.push('bg-red-50 dark:bg-red-900/20 border-red-500')
        break
      case 'late':
        classes.push('bg-orange-50 dark:bg-orange-900/20 border-orange-500')
        break
      case 'excused':
        classes.push('bg-blue-50 dark:bg-blue-900/20 border-blue-500')
        break
    }
  }

  return classes.join(' ')
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'present':
      return 'lucide:check-circle'
    case 'absent':
      return 'lucide:x-circle'
    case 'late':
      return 'lucide:clock'
    case 'excused':
      return 'lucide:info'
    default:
      return 'lucide:circle'
  }
}

const getStatusBgClass = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-green-100 dark:bg-green-900/30'
    case 'absent':
      return 'bg-red-100 dark:bg-red-900/30'
    case 'late':
      return 'bg-orange-100 dark:bg-orange-900/30'
    case 'excused':
      return 'bg-blue-100 dark:bg-blue-900/30'
    default:
      return 'bg-neutral-100 dark:bg-neutral-800'
  }
}

const getStatusIconClass = (status: string) => {
  switch (status) {
    case 'present':
      return 'text-green-600 dark:text-green-400'
    case 'absent':
      return 'text-red-600 dark:text-red-400'
    case 'late':
      return 'text-orange-600 dark:text-orange-400'
    case 'excused':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-neutral-600 dark:text-neutral-400'
  }
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' => {
  switch (status) {
    case 'absent':
      return 'destructive'
    default:
      return 'outline'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  loadData()
})

useHead({
  title: 'My Attendance'
})
</script>
