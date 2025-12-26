<template>
  <div v-if="periods.length > 0" class="space-y-3">
    <div
      v-for="(period, index) in sortedPeriods"
      :key="period.id"
      class="flex items-start gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
    >
      <!-- Period Number -->
      <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <span class="text-lg font-bold text-primary-700 dark:text-primary-400">{{ index + 1 }}</span>
      </div>

      <!-- Period Details -->
      <div class="flex-1">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">{{ period.subject_name }}</h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              <Icon name="lucide:user" class="inline w-3 h-3 mr-1" />
              {{ period.teacher_name }}
            </p>
          </div>
          <div class="flex-shrink-0 text-right">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {{ formatTime(period.start_time) }} - {{ formatTime(period.end_time) }}
            </p>
            <p v-if="period.room_number" class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <Icon name="lucide:door-open" class="inline w-3 h-3 mr-1" />
              Room {{ period.room_number }}
            </p>
          </div>
        </div>

        <!-- Duration Badge -->
        <div class="mt-2">
          <Badge variant="secondary" class="text-xs">
            {{ calculateDuration(period.start_time, period.end_time) }} minutes
          </Badge>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
    <Icon name="lucide:calendar-x" size="48" class="mx-auto mb-4 opacity-20" />
    <p>No classes scheduled for {{ day }}</p>
    <p class="text-sm mt-1">Enjoy your free time!</p>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import type { TimetableSlot } from '~~/types'

const props = defineProps<{
  day: string
  periods: TimetableSlot[]
}>()

// Sort periods by start time
const sortedPeriods = computed(() => {
  return [...props.periods].sort((a, b) => {
    return a.start_time.localeCompare(b.start_time)
  })
})

// Format time helper
const formatTime = (timeString: string) => {
  if (!timeString) return ''
  return timeString.substring(0, 5) // HH:MM
}

// Calculate duration in minutes
const calculateDuration = (startTime: string, endTime: string) => {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  return endMinutes - startMinutes
}
</script>
