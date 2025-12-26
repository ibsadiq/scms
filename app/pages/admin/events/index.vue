<!-- pages/admin/events/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">School Events</h1>
        <p class="text-neutral-600 mt-1">Manage school calendar events</p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" @click="showBulkUpload = true">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="navigateTo('/admin/events/create')">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>All Events</CardTitle>
            <CardDescription>View and manage school events</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <select
              v-model="filterType"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              <option value="exam">Examinations</option>
              <option value="graduation">Graduation</option>
              <option value="holiday">Holiday</option>
              <option value="leave">Leave</option>
              <option value="other">Other</option>
            </select>
            <Input
              v-model="searchQuery"
              placeholder="Search events..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading events...</p>
        </div>

        <div v-else-if="filteredEvents.length === 0" class="text-center py-12">
          <Icon name="lucide:calendar-x" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500">No events found</p>
          <Button @click="navigateTo('/admin/events/create')" variant="outline" class="mt-4">
            Create Your First Event
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="event in filteredEvents" :key="event.id">
                <TableCell class="font-medium">{{ event.name }}</TableCell>
                <TableCell>
                  <Badge :class="getEventTypeColor(event.event_type)">
                    {{ getEventTypeLabel(event.event_type) }}
                  </Badge>
                </TableCell>
                <TableCell>{{ event.term_name }}</TableCell>
                <TableCell>{{ formatDateShort(event.start_date) }}</TableCell>
                <TableCell>
                  {{ event.end_date ? formatDateShort(event.end_date) : '-' }}
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="navigateTo(`/admin/events/${event.id}`)">
                        <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="navigateTo(`/admin/events/${event.id}?edit=true`)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleDelete(event)" class="text-red-600">
                        <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Events</DialogTitle>
          <DialogDescription>
            Upload multiple events from an Excel file
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
            />
            <p class="text-xs text-neutral-500">
              Upload an Excel file with event data
            </p>
          </div>

          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="downloadTemplate">
              <Icon name="lucide:download" class="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" @click="showBulkUpload = false">Cancel</Button>
          <Button @click="handleBulkUpload" :disabled="!selectedFile || uploading">
            <Icon v-if="uploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SchoolEvent } from '~~/types'
import { useSchoolEvents } from '~~/composables/admin/useSchoolEvents'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

const { fetchEvents, deleteEvent, uploadBulkEvents } = useSchoolEvents()
const config = useRuntimeConfig()
const route = useRoute()

const loading = ref(true)
const events = ref<SchoolEvent[]>([])
const searchQuery = ref('')
const filterType = ref('')
const showBulkUpload = ref(false)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

const filteredEvents = computed(() => {
  let filtered = events.value || []

  // Filter by type
  if (filterType.value) {
    filtered = filtered.filter(e =>
      String(e.event_type).toLowerCase() === String(filterType.value).toLowerCase()
    )
  }

  // Filter by search
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()

    filtered = filtered.filter(e =>
      e.name?.toLowerCase().includes(search) ||
      e.event_type?.toLowerCase().includes(search) ||   // <-- FIXED
      e.term_name?.toLowerCase().includes(search)
    )
  }

  return filtered.sort((a, b) =>
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )
})

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}

const getEventTypeColor = (type?: string | number) => {
  const t = String(type ?? '').toLowerCase()
  switch (t) {
    case 'exam':
      return 'bg-blue-100 text-blue-800'
    case 'graduation':
      return 'bg-purple-100 text-purple-800'
    case 'holiday':
      return 'bg-amber-100 text-amber-800'
    case 'leave':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getEventTypeLabel = (type?: string | number) => {
  const t = String(type ?? '').toLowerCase()
  switch (t) {
    case 'exam':
      return 'Examination'
    case 'graduation':
      return 'Graduation'
    case 'holiday':
      return 'Holiday'
    case 'leave':
      return 'Leave'
    case 'other':
      return 'Other'
    default:
      return type ? String(type) : '—'
  }
}

const formatDateShort = (date?: string | null) => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return String(date)
  }
}

const loadEvents = async () => {
  loading.value = true
  console.log('Fetching events from API...')

  const { data, error: fetchError } = await fetchEvents()

  if (data) {
    console.log('Events fetched successfully:', data)
    console.log('Number of events:', data.length)
    events.value = data
  } else {
    console.error('Failed to fetch events:', fetchError)
  }

  loading.value = false
}

const handleDelete = async (event: SchoolEvent) => {
  if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return

  const { error } = await deleteEvent(event.id!)
  if (!error) {
    events.value = events.value.filter(e => e.id !== event.id)
    toast.success('Event deleted successfully')
  } else {
    toast.error('Failed to delete event', { description: error || 'An unexpected error occurred. Please try again.' })
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleBulkUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true

  const { error } = await uploadBulkEvents(selectedFile.value)

  if (!error) {
    toast.success('Events uploaded successfully')
    showBulkUpload.value = false
    selectedFile.value = null
    loadEvents()
  } else {
    toast.error('Failed to upload events', { description: error || 'An unexpected error occurred. Please try again.' })
  }

  uploading.value = false
}

const downloadTemplate = async () => {
  try {
    const response = await fetch(
      `${config.public.apiBase}/administration/school-events/template-download/`,
      {
        headers: {
          Authorization: `Bearer ${useCookie('auth_token').value}`
        }
      }
    )
    
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'events_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  } catch (error) {
    alert('Failed to download template')
  }
}

onMounted(() => {
  loadEvents()
})

// Reload events when navigating back to this page
onActivated(() => {
  loadEvents()
})

// Also watch route changes to refresh when coming back from create/edit
watch(() => route.path, (newPath) => {
  if (newPath === '/admin/events') {
    loadEvents()
  }
})
</script>