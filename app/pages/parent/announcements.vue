<!-- pages/parent/announcements.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Announcements</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Important updates and notices from the school
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Select v-model="selectedCategory">
        <SelectTrigger class="w-full sm:w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="academic">Academic</SelectItem>
          <SelectItem value="administrative">Administrative</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="security">Security</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="selectedPriority">
        <SelectTrigger class="w-full sm:w-48">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="unreadOnly"
          v-model="unreadOnly"
          class="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600"
        />
        <label for="unreadOnly" class="text-sm text-neutral-700 dark:text-neutral-300">
          Unread only
        </label>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Announcements List -->
    <div v-else-if="filteredAnnouncements && filteredAnnouncements.length > 0" class="space-y-3 sm:space-y-4">
      <Card
        v-for="announcement in filteredAnnouncements"
        :key="announcement.id"
        :class="[
          'hover:shadow-md transition-shadow cursor-pointer',
          !announcement.is_read && 'border-l-4 border-l-primary-500'
        ]"
        @click="viewAnnouncement(announcement)"
      >
        <CardContent class="p-4 sm:p-6">
          <div class="flex items-start gap-3 sm:gap-4">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                getPriorityColor(announcement.priority)
              ]"
            >
              <Icon :name="getCategoryIcon(announcement.category)" class="w-5 h-5" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">
                  {{ announcement.title }}
                  <Badge v-if="!announcement.is_read" variant="default" class="ml-2 text-xs">New</Badge>
                </h3>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <Badge :variant="getPriorityVariant(announcement.priority)">
                    {{ announcement.priority }}
                  </Badge>
                </div>
              </div>

              <p class="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                {{ announcement.content }}
              </p>

              <div class="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <div class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="w-3 h-3" />
                  {{ formatDate(announcement.published_date) }}
                </div>
                <Badge variant="outline" class="text-xs">
                  {{ announcement.category }}
                </Badge>
                <div v-if="announcement.attachments && announcement.attachments.length > 0" class="flex items-center gap-1">
                  <Icon name="lucide:paperclip" class="w-3 h-3" />
                  {{ announcement.attachments.length }} attachment(s)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="p-8 text-center">
        <Icon name="lucide:bell-off" class="w-12 h-12 mx-auto text-neutral-400 mb-3" />
        <p class="text-neutral-600 dark:text-neutral-400">No announcements found</p>
      </CardContent>
    </Card>

    <!-- Announcement Detail Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            {{ selectedAnnouncement?.title }}
            <Badge v-if="selectedAnnouncement" :variant="getPriorityVariant(selectedAnnouncement.priority)">
              {{ selectedAnnouncement.priority }}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div v-if="selectedAnnouncement" class="space-y-4">
          <div class="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
            <div class="flex items-center gap-1">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              {{ formatDate(selectedAnnouncement.published_date) }}
            </div>
            <Badge variant="outline">{{ selectedAnnouncement.category }}</Badge>
          </div>

          <div class="prose dark:prose-invert max-w-none">
            <p class="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {{ selectedAnnouncement.content }}
            </p>
          </div>

          <div v-if="selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0" class="space-y-2">
            <h4 class="font-medium text-neutral-900 dark:text-neutral-100">Attachments</h4>
            <div class="space-y-2">
              <a
                v-for="attachment in selectedAnnouncement.attachments"
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

const { fetchAnnouncements, markAnnouncementAsRead } = useEvents()

const loading = ref(true)
const announcements = ref([])
const selectedCategory = ref('all')
const selectedPriority = ref('all')
const unreadOnly = ref(false)

const showDialog = ref(false)
const selectedAnnouncement = ref(null)

const filteredAnnouncements = computed(() => {
  let filtered = announcements.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(a => a.category === selectedCategory.value)
  }

  if (selectedPriority.value !== 'all') {
    filtered = filtered.filter(a => a.priority === selectedPriority.value)
  }

  if (unreadOnly.value) {
    filtered = filtered.filter(a => !a.is_read)
  }

  return filtered
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    general: 'lucide:info',
    urgent: 'lucide:alert-circle',
    academic: 'lucide:book-open',
    administrative: 'lucide:briefcase',
    health: 'lucide:heart-pulse',
    security: 'lucide:shield'
  }
  return icons[category] || 'lucide:bell'
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  }
  return colors[priority] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400'
}

const getPriorityVariant = (priority: string) => {
  return priority === 'urgent' ? 'destructive' : 'secondary'
}

const viewAnnouncement = async (announcement: any) => {
  selectedAnnouncement.value = announcement
  showDialog.value = true

  if (!announcement.is_read) {
    await markAnnouncementAsRead(announcement.id)
    announcement.is_read = true
  }
}

const loadAnnouncements = async () => {
  loading.value = true

  try {
    const { data, error } = await fetchAnnouncements()

    if (error || !data) {
      console.error('Error fetching announcements:', error)
      return
    }

    announcements.value = data
  } catch (err) {
    console.error('Error loading announcements:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>
