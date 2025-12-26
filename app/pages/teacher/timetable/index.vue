<!-- pages/teacher/timetable/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Timetable</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Your weekly teaching schedule</p>
      </div>
      <Button variant="outline" @click="printTimetable" class="w-full sm:w-auto">
        <Icon name="lucide:printer" class="w-4 h-4 mr-2" />
        Print Schedule
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading timetable...</p>
    </div>

    <!-- Today's Schedule Card -->
    <Card v-else-if="todaySchedule.length > 0">
      <CardHeader class="p-4 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-lg sm:text-xl">Today's Schedule</CardTitle>
            <CardDescription class="text-sm">{{ currentDay }} - {{ currentDate }}</CardDescription>
          </div>
          <Badge variant="default">{{ todaySchedule.length }} Classes</Badge>
        </div>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div class="space-y-3">
          <div
            v-for="period in todaySchedule"
            :key="period.id"
            class="flex items-start gap-3 p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            :class="{ 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800': isCurrentPeriod(period) }"
          >
            <div class="flex-shrink-0">
              <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Icon name="lucide:clock" class="w-5 h-5 sm:w-6 sm:h-6 text-primary-700 dark:text-primary-400" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                    {{ period.subject_name }}
                  </h3>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                    {{ period.classroom_name }} - {{ period.grade_level_name }}
                  </p>
                </div>
                <Badge v-if="isCurrentPeriod(period)" variant="default" class="flex-shrink-0">
                  <Icon name="lucide:activity" class="w-3 h-3 mr-1" />
                  Now
                </Badge>
              </div>
              <div class="flex items-center gap-4 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:clock" class="w-4 h-4" />
                  {{ formatTime(period.start_time) }} - {{ formatTime(period.end_time) }}
                </span>
                <span v-if="period.room_number" class="flex items-center gap-1">
                  <Icon name="lucide:door-open" class="w-4 h-4" />
                  Room {{ period.room_number }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Weekly Timetable -->
    <Card>
      <CardHeader class="p-4 sm:p-6">
        <CardTitle class="text-lg sm:text-xl">Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <!-- Mobile: Day Tabs -->
        <div class="block lg:hidden">
          <div class="flex overflow-x-auto gap-2 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700">
            <Button
              v-for="day in daysOfWeek"
              :key="day"
              :variant="selectedDay === day ? 'default' : 'outline'"
              size="sm"
              @click="selectedDay = day"
              class="flex-shrink-0"
            >
              {{ day.substring(0, 3) }}
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="period in getScheduleForDay(selectedDay)"
              :key="period.id"
              class="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <h4 class="font-semibold text-sm truncate">{{ period.subject_name }}</h4>
                <Badge variant="outline" class="flex-shrink-0 text-xs">
                  {{ formatTime(period.start_time) }}
                </Badge>
              </div>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 truncate">{{ period.classroom_name }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">{{ period.grade_level_name }}</p>
            </div>
            <div v-if="getScheduleForDay(selectedDay).length === 0" class="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">
              No classes scheduled for {{ selectedDay }}
            </div>
          </div>
        </div>

        <!-- Desktop: Grid View -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="p-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                  Time
                </th>
                <th
                  v-for="day in daysOfWeek"
                  :key="day"
                  class="p-3 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                  :class="{ 'bg-primary-50 dark:bg-primary-900/20': day === currentDay }"
                >
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in timeSlots" :key="slot">
                <td class="p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 whitespace-nowrap">
                  {{ slot }}
                </td>
                <td
                  v-for="day in daysOfWeek"
                  :key="day"
                  class="p-2 border-b border-r border-neutral-200 dark:border-neutral-700 align-top"
                  :class="{ 'bg-primary-50/30 dark:bg-primary-900/10': day === currentDay }"
                >
                  <div
                    v-for="period in getPeriodForDayAndTime(day, slot)"
                    :key="period.id"
                    class="p-2 rounded bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-2 last:mb-0 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <p class="text-xs font-semibold text-primary-900 dark:text-primary-100 truncate">
                      {{ period.subject_name }}
                    </p>
                    <p class="text-xs text-primary-700 dark:text-primary-300 truncate mt-1">
                      {{ period.classroom_name }}
                    </p>
                    <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      {{ period.grade_level_name }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTimetable } from '~~/composables/teacher/useTimetable'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

const { fetchMyTimetable } = useTimetable()

const timetable = ref([])
const loading = ref(true)
const selectedDay = ref('')

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']

const currentDay = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const todaySchedule = computed(() => {
  return timetable.value
    .filter(period => period.day_of_week === currentDay.value && period.is_active)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
})

const getScheduleForDay = (day: string) => {
  return timetable.value
    .filter(period => period.day_of_week === day && period.is_active)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

const getPeriodForDayAndTime = (day: string, timeSlot: string) => {
  const slotTime = convertTo24Hour(timeSlot)
  return timetable.value.filter(period => {
    if (period.day_of_week !== day || !period.is_active) return false
    const startTime = period.start_time.substring(0, 5)
    return startTime === slotTime
  })
}

const isCurrentPeriod = (period: any) => {
  if (period.day_of_week !== currentDay.value) return false

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const startTime = period.start_time.substring(0, 5)
  const endTime = period.end_time.substring(0, 5)

  return currentTime >= startTime && currentTime <= endTime
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const convertTo24Hour = (time12h: string) => {
  const [time, period] = time12h.split(' ')
  let [hours, minutes] = time.split(':')

  if (period === 'PM' && hours !== '12') {
    hours = String(parseInt(hours) + 12)
  } else if (period === 'AM' && hours === '12') {
    hours = '00'
  }

  return `${hours.padStart(2, '0')}:${minutes}`
}

const printTimetable = () => {
  window.print()
}

onMounted(async () => {
  loading.value = true
  selectedDay.value = currentDay.value

  const { data } = await fetchMyTimetable()
  if (data) timetable.value = data

  loading.value = false
})
</script>
