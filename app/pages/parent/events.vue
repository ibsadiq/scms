<!-- pages/parent/events.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Events Calendar</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Upcoming school events and activities
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Select v-model="selectedType">
        <SelectTrigger class="w-full sm:w-48">
          <SelectValue placeholder="All Events" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="academic">Academic</SelectItem>
          <SelectItem value="sports">Sports</SelectItem>
          <SelectItem value="cultural">Cultural</SelectItem>
          <SelectItem value="meeting">Meetings</SelectItem>
          <SelectItem value="holiday">Holidays</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="selectedStatus">
        <SelectTrigger class="w-full sm:w-48">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Events List -->
    <div v-else-if="filteredEvents && filteredEvents.length > 0" class="space-y-3 sm:space-y-4">
      <Card
        v-for="event in filteredEvents"
        :key="event.id"
        class="hover:shadow-md transition-shadow cursor-pointer"
        @click="viewEvent(event)"
      >
        <CardContent class="p-4 sm:p-6">
          <div class="flex items-start gap-3 sm:gap-4">
            <!-- Event Date Badge -->
            <div class="flex-shrink-0 text-center">
              <div class="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex flex-col items-center justify-center">
                <p class="text-xs text-primary-700 dark:text-primary-400 uppercase">
                  {{ formatMonth(event.start_date) }}
                </p>
                <p class="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {{ formatDay(event.start_date) }}
                </p>
              </div>
            </div>

            <!-- Event Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">
                  {{ event.title }}
                </h3>
                <Badge :variant="getStatusVariant(event.status)">
                  {{ event.status }}
                </Badge>
              </div>

              <p class="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                {{ event.description }}
              </p>

              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <div class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="w-3 h-3" />
                  {{ formatDateRange(event.start_date, event.end_date) }}
                </div>
                <div v-if="event.start_time" class="flex items-center gap-1">
                  <Icon name="lucide:clock" class="w-3 h-3" />
                  {{ formatTime(event.start_time) }}
                  <span v-if="event.end_time"> - {{ formatTime(event.end_time) }}</span>
                </div>
                <div v-if="event.location" class="flex items-center gap-1">
                  <Icon name="lucide:map-pin" class="w-3 h-3" />
                  {{ event.location }}
                </div>
              </div>

              <div class="flex items-center gap-2 mt-3">
                <Badge variant="outline" class="text-xs">
                  {{ event.event_type }}
                </Badge>
                <Badge v-if="event.is_mandatory" variant="destructive" class="text-xs">
                  Mandatory
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="p-8 text-center">
        <Icon name="lucide:calendar-x" class="w-12 h-12 mx-auto text-neutral-400 mb-3" />
        <p class="text-neutral-600 dark:text-neutral-400">No events found</p>
      </CardContent>
    </Card>

    <!-- Event Detail Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            {{ selectedEvent?.title }}
            <Badge v-if="selectedEvent" :variant="getStatusVariant(selectedEvent.status)">
              {{ selectedEvent.status }}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div v-if="selectedEvent" class="space-y-4">
          <!-- Event Info -->
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <Icon name="lucide:calendar" class="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Date</p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  {{ formatDateRange(selectedEvent.start_date, selectedEvent.end_date) }}
                </p>
              </div>
            </div>

            <div v-if="selectedEvent.start_time" class="flex items-start gap-3">
              <Icon name="lucide:clock" class="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Time</p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  {{ formatTime(selectedEvent.start_time) }}
                  <span v-if="selectedEvent.end_time"> - {{ formatTime(selectedEvent.end_time) }}</span>
                </p>
              </div>
            </div>

            <div v-if="selectedEvent.location" class="flex items-start gap-3">
              <Icon name="lucide:map-pin" class="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Location</p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">{{ selectedEvent.location }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <Icon name="lucide:tag" class="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">Event Type</p>
                <div class="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{{ selectedEvent.event_type }}</Badge>
                  <Badge v-if="selectedEvent.is_mandatory" variant="destructive">Mandatory</Badge>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <h4 class="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Description</h4>
            <p class="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {{ selectedEvent.description }}
            </p>
          </div>

          <div v-if="selectedEvent.attachments && selectedEvent.attachments.length > 0" class="space-y-2">
            <h4 class="font-medium text-neutral-900 dark:text-neutral-100">Attachments</h4>
            <div class="space-y-2">
              <a
                v-for="attachment in selectedEvent.attachments"
                :key="attachment.id"
                :href="attachment.file_url"
                target="_blank"
                class="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Icon name="lucide:file" class="w-4 h-4 text-neutral-500" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ attachment.file_name }}</span>
                <Icon name="lucide:external-link" class="w-4 h-4 ml-auto text-neutral-400" />
              </a>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="showDialog = false" variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEvents } from '~~/composables/parent/useEvents'

definePageMeta({
  layout: 'parent',
  middleware: 'parent'
})

const { fetchUpcomingEvents } = useEvents()

const loading = ref(true)
const events = ref([])
const selectedType = ref('all')
const selectedStatus = ref('all')

const showDialog = ref(false)
const selectedEvent = ref(null)

const filteredEvents = computed(() => {
  let filtered = events.value

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(e => e.event_type === selectedType.value)
  }

  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(e => e.status === selectedStatus.value)
  }

  return filtered
})

const formatMonth = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short' })
}

const formatDay = (dateString: string) => {
  return new Date(dateString).getDate().toString()
}

const formatDateRange = (startDate: string, endDate?: string) => {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (!endDate || startDate === endDate) {
    return start
  }

  const end = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `${start} - ${end}`
}

const formatTime = (time: string) => {
  if (!time) return ''
  try {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return time
  }
}

const getStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    upcoming: 'default',
    ongoing: 'secondary',
    completed: 'outline',
    cancelled: 'destructive'
  }
  return variants[status] || 'outline'
}

const viewEvent = (event: any) => {
  selectedEvent.value = event
  showDialog.value = true
}

const loadEvents = async () => {
  loading.value = true

  try {
    const { data, error } = await fetchUpcomingEvents()

    if (error || !data) {
      console.error('Error fetching events:', error)
      return
    }

    events.value = data
  } catch (err) {
    console.error('Error loading events:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>
