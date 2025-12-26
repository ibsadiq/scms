<!-- pages/admin/events/[id].vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/events')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-neutral-900">
          {{ editMode ? 'Edit Event' : 'Event Details' }}
        </h1>
        <p class="text-neutral-600 mt-1">
          {{ editMode ? 'Update event information' : 'View and manage event information' }}
        </p>
      </div>
      <Button v-if="!editMode" @click="editMode = true">
        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
    </div>

    <!-- Edit Mode -->
    <Card v-else-if="editMode && event">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Modify the information for this event</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="name">Event Name *</Label>
              <Input
                id="name"
                v-model="event.name"
                placeholder="e.g., Mid-Term Examinations"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="event_type">Event Type *</Label>
              <select
                id="event_type"
                v-model="event.event_type"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="exam">Examination Period</option>
                <option value="graduation">Graduation Day</option>
                <option value="holiday">Holiday</option>
                <option value="leave">Student Leave</option>
                <option value="other">Other Event</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="term">Term *</Label>
            <select
              id="term"
              v-model="event.term"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option v-for="term in terms" :key="term.id" :value="term.id">
                {{ term.name }} - {{ term.academic_year_name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="start_date">Start Date *</Label>
              <DateInput
                id="start_date"
                v-model="event.start_date"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="end_date">End Date</Label>
              <DateInput
                id="end_date"
                v-model="event.end_date"
              />
              <p class="text-xs text-neutral-500">Leave empty for single-day events</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="event.description"
              placeholder="Additional details about the event..."
              rows="4"
            />
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelEdit">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- View Mode -->
    <div v-else-if="event" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div>
                <CardTitle>{{ event.name }}</CardTitle>
                <CardDescription class="mt-2">
                  {{ event.term_name }} • {{ event.academic_year }}
                </CardDescription>
              </div>
              <Badge :class="getEventTypeColor(event.event_type)" class="text-sm">
                {{ getEventTypeLabel(event.event_type) }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm font-medium text-neutral-500 mb-1">Start Date</p>
                <div class="flex items-center gap-2">
                  <Icon name="lucide:calendar" class="w-4 h-4 text-neutral-400" />
                  <p class="text-lg">{{ formatDate(event.start_date) }}</p>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-neutral-500 mb-1">End Date</p>
                <div class="flex items-center gap-2">
                  <Icon name="lucide:calendar" class="w-4 h-4 text-neutral-400" />
                  <p class="text-lg">
                    {{ event.end_date ? formatDate(event.end_date) : 'Single Day' }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="event.description">
              <p class="text-sm font-medium text-neutral-500 mb-2">Description</p>
              <p class="text-neutral-700 leading-relaxed">{{ event.description }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-neutral-500 mb-2">Duration</p>
              <Badge variant="outline">{{ calculateDuration() }} {{ calculateDuration() === 1 ? 'day' : 'days' }}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button 
              variant="outline" 
              class="w-full justify-start"
              @click="navigateTo(`/admin/terms/${event.term}`)"
            >
              <Icon name="lucide:calendar-days" class="w-4 h-4 mr-2" />
              View Term
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start text-red-600 hover:text-red-700"
              @click="handleDelete"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
              Delete Event
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div :class="getStatusColor()" class="w-3 h-3 rounded-full"></div>
                <span class="text-sm font-medium">{{ getStatusText() }}</span>
              </div>
              <p class="text-xs text-neutral-500">{{ getStatusDescription() }}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DateInput } from '@/components/ui/date-input'
import type { SchoolEvent, Term } from '~~/types'
import { useSchoolEvents } from '~~/composables/admin/useSchoolEvents'
import { useTerms } from '~~/composables/admin/useTerms'
import { formatDate, getEventTypeLabel, getEventTypeColor } from '~~/utils/helpers'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { fetchEvent, updateEvent, deleteEvent } = useSchoolEvents()
const { fetchTerms } = useTerms()

const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const event = ref<SchoolEvent | null>(null)
const originalData = ref<SchoolEvent | null>(null)
const terms = ref<Term[]>([])

const loadData = async () => {
  const id = parseInt(route.params.id as string)
  
  const { data: eventData } = await fetchEvent(id)
  if (eventData) {
    event.value = eventData
    originalData.value = { ...eventData }
  }

  const { data: termsData } = await fetchTerms()
  if (termsData) {
    terms.value = termsData
  }

  // Check if edit mode is requested via query
  if (route.query.edit === 'true') {
    editMode.value = true
  }

  loading.value = false
}

const handleSubmit = async () => {
  if (!event.value) return

  saving.value = true

  const id = parseInt(route.params.id as string)
  const { data, error: apiError } = await updateEvent(id, event.value)

  if (data) {
    toast.success('Event updated successfully')
    originalData.value = { ...event.value }
    setTimeout(() => {
      editMode.value = false
    }, 1500)
  } else {
    toast.error('Failed to update event', { description: apiError || 'An unexpected error occurred. Please try again.' })
  }

  saving.value = false
}

const cancelEdit = () => {
  if (originalData.value) {
    event.value = { ...originalData.value }
  }
  editMode.value = false
}

const calculateDuration = () => {
  if (!event.value) return 0
  const start = new Date(event.value.start_date)
  const end = event.value.end_date ? new Date(event.value.end_date) : start
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const getStatusColor = () => {
  if (!event.value) return 'bg-neutral-400'
  const today = new Date()
  const start = new Date(event.value.start_date)
  const end = event.value.end_date ? new Date(event.value.end_date) : start
  
  if (today < start) return 'bg-blue-500'
  if (today > end) return 'bg-neutral-400'
  return 'bg-green-500'
}

const getStatusText = () => {
  if (!event.value) return 'Unknown'
  const today = new Date()
  const start = new Date(event.value.start_date)
  const end = event.value.end_date ? new Date(event.value.end_date) : start
  
  if (today < start) return 'Upcoming'
  if (today > end) return 'Completed'
  return 'Ongoing'
}

const getStatusDescription = () => {
  if (!event.value) return ''
  const today = new Date()
  const start = new Date(event.value.start_date)
  const end = event.value.end_date ? new Date(event.value.end_date) : start
  
  if (today < start) {
    const days = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`
  }
  if (today > end) {
    return 'This event has ended'
  }
  const days = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return `${days} ${days === 1 ? 'day' : 'days'} remaining`
}

const handleDelete = async () => {
  if (!event.value) return
  if (!confirm(`Are you sure you want to delete "${event.value.name}"?`)) return

  const { error } = await deleteEvent(event.value.id!)
  if (!error) {
    toast.success('Event deleted successfully')
    router.push('/admin/events')
  } else {
    toast.error('Failed to delete event', { description: error || 'An unexpected error occurred. Please try again.' })
  }
}

onMounted(() => {
  loadData()
})
</script>