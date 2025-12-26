<!-- pages/admin/events/create.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/events')">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Create School Event</h1>
        <p class="text-neutral-600 mt-1">Schedule a new event</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Enter the information for the new event</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="name">Event Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="e.g., Mid-Term Examinations"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="event_type">Event Type *</Label>
              <select
                id="event_type"
                v-model="formData.event_type"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select event type</option>
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
              v-model="formData.term"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select term</option>
              <option v-for="term in terms" :key="term.id" :value="term.id">
                {{ term.name }} - {{ term.academic_year_name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="start_date">Start Date *</Label>
              <Input
                id="start_date"
                v-model="formData.start_date"
                type="date"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="end_date">End Date</Label>
              <Input
                id="end_date"
                v-model="formData.end_date"
                type="date"
              />
              <p class="text-xs text-neutral-500">Leave empty for single-day events</p>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Additional details about the event..."
              rows="4"
            />
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="loading || !formData.term">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Creating...' : 'Create Event' }}
            </Button>
            <Button type="button" variant="outline" @click="navigateTo('/admin/events')">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { SchoolEvent, Term } from '~~/types'
import { useSchoolEvents } from '~~/composables/admin/useSchoolEvents'
import { useTerms } from '~~/composables/admin/useTerms'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { createEvent } = useSchoolEvents()
const { fetchTerms } = useTerms()

const formData = ref<SchoolEvent>({
  name: '',
  event_type: '' as any,
  term: 0,
  start_date: '',
  end_date: '',
  description: ''
})

const terms = ref<Term[]>([])
const loading = ref(false)

// Pre-select term if provided in query
onMounted(async () => {
  const { data } = await fetchTerms()
  if (data) {
    terms.value = data
  }

  // If term is provided in query, pre-select it
  if (route.query.term) {
    formData.value.term = parseInt(route.query.term as string)
  }
})

const handleSubmit = async () => {
  loading.value = true

  // Prepare payload - ensure proper data types
  const payload = {
    name: formData.value.name,
    event_type: formData.value.event_type,
    term: Number(formData.value.term),
    start_date: formData.value.start_date,
    end_date: formData.value.end_date || null,
    description: formData.value.description || ''
  }

  // Remove empty end_date to send null to backend
  if (!payload.end_date) {
    payload.end_date = null
  }

  console.log('Creating event with payload:', payload)

  const { data, error: apiError } = await createEvent(payload)

  if (data) {
    console.log('Event created successfully:', data)
    toast.success('Event created successfully')
    router.push('/admin/events')
  } else {
    console.error('Failed to create event:', apiError)
    toast.error('Failed to create event', { description: apiError || 'An unexpected error occurred. Please try again.' })
  }

  loading.value = false
}
</script>