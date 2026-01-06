<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="relative">
        <Icon name="lucide:bell" class="w-5 h-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-80 sm:w-96 max-h-[500px] overflow-y-auto">
      <div class="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-700">
        <h3 class="font-semibold text-sm">Notifications</h3>
        <Button
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          @click="handleMarkAllRead"
          class="text-xs h-7"
        >
          Mark all read
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto text-neutral-400" />
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="p-8 text-center">
        <Icon name="lucide:bell-off" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600" />
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">No notifications</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="divide-y dark:divide-neutral-700">
        <button
          v-for="notification in notifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          :class="{ 'bg-primary-50/30 dark:bg-primary-900/10': !notification.is_read }"
        >
          <div class="flex items-start gap-3">
            <!-- Icon based on type -->
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              :class="getNotificationIconClass(notification.notification_type, notification.priority)"
            >
              <Icon :name="getNotificationIcon(notification.notification_type)" class="w-4 h-4" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="font-medium text-sm truncate" :class="{ 'font-semibold': !notification.is_read }">
                  {{ notification.title }}
                </p>
                <span
                  v-if="!notification.is_read"
                  class="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500"
                />
              </div>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2">
                {{ notification.message }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                {{ formatRelativeTime(notification.created_at) }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- View All Footer -->
      <div v-if="notifications.length > 0" class="border-t dark:border-neutral-700 p-2">
        <Button
          variant="ghost"
          size="sm"
          @click="navigateTo(viewAllLink)"
          class="w-full text-xs"
        >
          View all notifications
        </Button>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotifications, type Notification } from '~~/composables/useNotifications'
import { useToast } from '~~/composables/useToast'

const props = defineProps<{
  viewAllLink?: string
}>()

const { success, error: showError } = useToast()
const { fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotifications()

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)

// Load notifications
const loadNotifications = async () => {
  loading.value = true
  const { data, error } = await fetchNotifications()

  if (data) {
    // Show only recent 10 notifications in dropdown
    notifications.value = data.slice(0, 10)
  } else if (error) {
  }

  loading.value = false
}

// Load unread count
const loadUnreadCount = async () => {
  const { data } = await fetchUnreadCount()
  if (data) {
    unreadCount.value = data.unread_count
  }
}

// Mark notification as read
const handleNotificationClick = async (notification: Notification) => {
  if (!notification.is_read) {
    await markAsRead(notification.id)
    notification.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  // Navigate based on notification type (optional - implement as needed)
  // For now, just mark as read
}

// Mark all as read
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

// Get icon based on notification type
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

// Get icon class based on type and priority
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

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Initial load
onMounted(() => {
  loadNotifications()
  loadUnreadCount()

  // Poll for new notifications every 30 seconds
  const interval = setInterval(() => {
    loadUnreadCount()
    loadNotifications()
  }, 30000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>
