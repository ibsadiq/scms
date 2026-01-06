<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Notifications</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          View and manage your notifications
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          v-if="unreadCount > 0"
          @click="handleMarkAllRead"
          variant="outline"
          size="sm"
        >
          <Icon name="lucide:check-check" class="w-4 h-4 mr-2" />
          Mark all read ({{ unreadCount }})
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader class="p-4">
        <CardTitle class="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent class="p-4">
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="filter in filters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            :variant="selectedFilter === filter.value ? 'default' : 'outline'"
            size="sm"
          >
            <Icon :name="filter.icon" class="w-4 h-4 mr-2" />
            {{ filter.label }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Notifications List -->
    <Card v-if="loading">
      <CardContent class="p-8 text-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
        <p class="text-neutral-500 dark:text-neutral-400 mt-4">Loading notifications...</p>
      </CardContent>
    </Card>

    <Card v-else-if="filteredNotifications.length === 0">
      <CardContent class="p-8 text-center">
        <Icon name="lucide:bell-off" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600" />
        <p class="text-neutral-500 dark:text-neutral-400 mt-4">
          {{ selectedFilter === 'all' ? 'No notifications yet' : 'No notifications in this category' }}
        </p>
      </CardContent>
    </Card>

    <div v-else class="space-y-3">
      <Card
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="cursor-pointer transition-colors"
        :class="{ 'bg-primary-50/30 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800': !notification.is_read }"
        @click="handleNotificationClick(notification)"
      >
        <CardContent class="p-4">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              :class="getNotificationIconClass(notification.notification_type, notification.priority)"
            >
              <Icon :name="getNotificationIcon(notification.notification_type)" class="w-5 h-5" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3
                      class="font-medium text-base"
                      :class="{ 'font-semibold': !notification.is_read }"
                    >
                      {{ notification.title }}
                    </h3>
                    <Badge
                      v-if="notification.priority === 'urgent' || notification.priority === 'high'"
                      :variant="notification.priority === 'urgent' ? 'destructive' : 'default'"
                      class="text-xs"
                    >
                      {{ notification.priority }}
                    </Badge>
                  </div>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:clock" class="w-3 h-3" />
                      {{ formatDateTime(notification.created_at) }}
                    </span>
                    <Badge variant="secondary" class="text-xs">
                      {{ getTypeLabel(notification.notification_type) }}
                    </Badge>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    v-if="!notification.is_read"
                    class="w-2 h-2 rounded-full bg-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications, type Notification } from '~~/composables/useNotifications'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'student',
  middleware: 'student'
})

const { success, error: showError } = useToast()
const { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotifications()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const unreadCount = ref(0)
const selectedFilter = ref('all')

const filters = [
  { value: 'all', label: 'All', icon: 'lucide:inbox' },
  { value: 'unread', label: 'Unread', icon: 'lucide:circle-dot' },
  { value: 'general', label: 'Announcements', icon: 'lucide:megaphone' },
  { value: 'assignment', label: 'Assignments', icon: 'lucide:clipboard-list' },
  { value: 'result', label: 'Results', icon: 'lucide:trophy' },
  { value: 'exam', label: 'Exams', icon: 'lucide:file-text' },
  { value: 'attendance', label: 'Attendance', icon: 'lucide:user-check' },
  { value: 'event', label: 'Events', icon: 'lucide:calendar' }
]

const filteredNotifications = computed(() => {
  if (selectedFilter.value === 'all') return notifications.value
  if (selectedFilter.value === 'unread') return notifications.value.filter(n => !n.is_read)
  return notifications.value.filter(n => n.notification_type === selectedFilter.value)
})

const loadNotifications = async () => {
  loading.value = true
  const { data, error } = await fetchNotifications()

  if (data) {
    notifications.value = data
  } else if (error) {
    showError('Failed to load notifications', String(error))
  }

  loading.value = false
}

const loadUnreadCount = async () => {
  const { data } = await fetchUnreadCount()
  if (data) {
    unreadCount.value = data.unread_count
  }
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.is_read) {
    await markAsRead(notification.id)
    notification.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
}

const handleMarkAllRead = async () => {
  const { error } = await markAllAsRead()

  if (!error) {
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
    success('All notifications marked as read')
  } else {
    showError('Failed to mark notifications as read', String(error))
  }
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    general: 'lucide:megaphone',
    attendance: 'lucide:user-check',
    fee: 'lucide:dollar-sign',
    result: 'lucide:trophy',
    exam: 'lucide:file-text',
    event: 'lucide:calendar',
    assignment: 'lucide:clipboard-list',
    promotion: 'lucide:trending-up',
    report_card: 'lucide:file-badge'
  }
  return icons[type] || 'lucide:bell'
}

const getNotificationIconClass = (type: string, priority: string) => {
  if (priority === 'urgent') {
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  }
  if (priority === 'high') {
    return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  }

  const colors: Record<string, string> = {
    general: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    attendance: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    fee: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    result: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    exam: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    event: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    assignment: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    promotion: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    report_card: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
  }

  return colors[type] || 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    general: 'Announcement',
    attendance: 'Attendance',
    fee: 'Fee',
    result: 'Result',
    exam: 'Exam',
    event: 'Event',
    assignment: 'Assignment',
    promotion: 'Promotion',
    report_card: 'Report Card'
  }
  return labels[type] || type
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

onMounted(() => {
  loadNotifications()
  loadUnreadCount()
})
</script>
