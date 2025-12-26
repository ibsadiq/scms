<template>
  <div v-if="assignments.length > 0" class="space-y-4">
    <Card
      v-for="assignment in assignments"
      :key="assignment.id"
      class="hover:shadow-md transition-shadow cursor-pointer"
      @click="navigateTo(`/student/assignments/${assignment.id}`)"
    >
      <CardContent class="pt-6">
        <div class="flex items-start justify-between gap-4">
          <!-- Assignment Info -->
          <div class="flex-1">
            <div class="flex items-start gap-3">
              <!-- Type Icon -->
              <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getTypeColorClass(assignment.assignment_type)">
                <Icon :name="getTypeIcon(assignment.assignment_type)" class="w-5 h-5" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  {{ assignment.title }}
                </h3>
                <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <span class="flex items-center gap-1">
                    <Icon name="lucide:book-open" class="w-3 h-3" />
                    {{ assignment.subject_name }}
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1">
                    <Icon name="lucide:user" class="w-3 h-3" />
                    {{ assignment.teacher_name }}
                  </span>
                </div>

                <!-- Due Date -->
                <div class="mt-2 flex items-center gap-2">
                  <Badge :variant="getDueDateVariant(assignment)">
                    <Icon name="lucide:calendar" class="w-3 h-3 mr-1" />
                    Due: {{ formatDueDate(assignment.due_date) }}
                  </Badge>
                  <Badge v-if="assignment.is_overdue" variant="destructive">
                    Overdue
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Status & Score -->
          <div class="flex-shrink-0 text-right">
            <!-- Submission Status -->
            <div v-if="!assignment.has_submitted" class="text-sm">
              <Badge variant="outline">
                <Icon name="lucide:clock" class="w-3 h-3 mr-1" />
                Not Submitted
              </Badge>
            </div>
            <div v-else-if="!assignment.is_graded" class="text-sm">
              <Badge variant="secondary">
                <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                Submitted
              </Badge>
            </div>
            <div v-else class="text-sm">
              <Badge variant="default" class="bg-green-600">
                <Icon name="lucide:award" class="w-3 h-3 mr-1" />
                Graded
              </Badge>
              <div class="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ assignment.grade?.final_score }}/{{ assignment.max_score }}
              </div>
              <div class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ assignment.grade?.grade_letter }} ({{ assignment.grade?.percentage }}%)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-12 text-neutral-500 dark:text-neutral-400">
    <Icon name="lucide:inbox" size="64" class="mx-auto mb-4 opacity-20" />
    <p class="text-lg font-medium text-neutral-900 dark:text-neutral-100">{{ emptyMessage }}</p>
    <p class="text-sm mt-1">Check back later for new assignments</p>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudentAssignment } from '~~/composables/student/useAssignments'

const props = withDefaults(
  defineProps<{
    assignments: StudentAssignment[]
    emptyMessage?: string
  }>(),
  {
    emptyMessage: 'No assignments found'
  }
)

// Get icon for assignment type
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    homework: 'lucide:pencil',
    project: 'lucide:folder',
    quiz: 'lucide:clipboard-check',
    research: 'lucide:search',
    essay: 'lucide:file-text',
    lab_report: 'lucide:flask',
    other: 'lucide:file'
  }
  return icons[type] || 'lucide:file'
}

// Get color class for assignment type
const getTypeColorClass = (type: string) => {
  const colors: Record<string, string> = {
    homework: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    project: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    quiz: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    research: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    essay: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    lab_report: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    other: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  }
  return colors[type] || colors.other
}

// Format due date
const formatDueDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 0) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Tomorrow'
  } else if (days <= 7) {
    return `In ${days} days`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

// Get badge variant for due date
const getDueDateVariant = (assignment: StudentAssignment) => {
  if (assignment.is_overdue) return 'destructive'

  const date = new Date(assignment.due_date)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days <= 1) return 'destructive'
  if (days <= 3) return 'default'
  return 'secondary'
}
</script>
