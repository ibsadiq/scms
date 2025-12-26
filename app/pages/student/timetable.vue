<!-- pages/student/timetable.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Timetable</h1>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        View your weekly class schedule
      </p>
    </div>

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

    <!-- Timetable Content -->
    <template v-else>
      <!-- Today's Schedule Card -->
      <Card v-if="todaySchedule.length > 0" class="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-primary-900 dark:text-primary-100">
            <Icon name="lucide:calendar-check" class="w-5 h-5" />
            Today's Schedule - {{ currentDay }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div
              v-for="period in todaySchedule"
              :key="period.id"
              class="flex items-center gap-4 p-3 bg-white dark:bg-neutral-800 rounded-lg"
            >
              <div class="flex-shrink-0 w-20 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {{ formatTime(period.start_time) }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-neutral-900 dark:text-neutral-100">{{ period.subject_name }}</p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ period.teacher_name }}</p>
              </div>
              <div v-if="period.room_number" class="flex-shrink-0">
                <Badge variant="outline">Room {{ period.room_number }}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Day Selector (Mobile) -->
      <div class="lg:hidden">
        <select
          v-model="selectedDay"
          class="w-full p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        >
          <option v-for="day in daysOfWeek" :key="day" :value="day">
            {{ day }}
          </option>
        </select>
      </div>

      <!-- Weekly Timetable Tabs (Desktop) -->
      <Card class="hidden lg:block">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs v-model="selectedDay">
            <TabsList class="grid w-full grid-cols-5">
              <TabsTrigger v-for="day in daysOfWeek" :key="day" :value="day">
                {{ day }}
              </TabsTrigger>
            </TabsList>
            <TabsContent v-for="day in daysOfWeek" :key="day" :value="day" class="mt-6">
              <DaySchedule :day="day" :periods="getScheduleForDay(day)" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <!-- Mobile Day Schedule -->
      <Card class="lg:hidden">
        <CardHeader>
          <CardTitle>{{ selectedDay }}'s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <DaySchedule :day="selectedDay" :periods="getScheduleForDay(selectedDay)" />
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStudentTimetable } from '~~/composables/student/useTimetable'
import type { TimetableSlot } from '~~/types'

definePageMeta({
  middleware: 'student',
  layout: 'student'
})

const { timetable, weeklyTimetable, todaySchedule, loading, error, fetchTimetable, getScheduleForDay } = useStudentTimetable()

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const selectedDay = ref('Monday')

// Get current day
const currentDay = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
})

// Set selected day to current day on mount
onMounted(async () => {
  const today = currentDay.value
  if (daysOfWeek.includes(today)) {
    selectedDay.value = today
  }

  await fetchTimetable()
})

// Format time helper
const formatTime = (timeString: string) => {
  if (!timeString) return ''
  return timeString.substring(0, 5) // HH:MM
}

useHead({
  title: 'My Timetable'
})
</script>
