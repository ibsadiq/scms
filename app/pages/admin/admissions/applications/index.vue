<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Applications</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">Manage admission applications</p>
      </div>
      <div class="flex gap-2">
        <Button @click="exportApplications" variant="outline" :disabled="isExporting">
          <Icon v-if="isExporting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          <Icon v-else name="lucide:download" class="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button @click="loadApplications">
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Name, email, phone, or application number"
            @input="debouncedSearch"
          />
        </div>

        <!-- Status Filter -->
        <div>
          <Label for="status">Status</Label>
          <select
            id="status"
            v-model="filters.status"
            @change="loadApplications"
            class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DOCUMENTS_PENDING">Documents Pending</option>
            <option value="EXAM_SCHEDULED">Exam Scheduled</option>
            <option value="EXAM_COMPLETED">Exam Completed</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        <!-- Session Filter -->
        <div>
          <Label for="session">Session</Label>
          <select
            id="session"
            v-model="filters.session"
            @change="loadApplications"
            class="flex h-10 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
          >
            <option value="">All Sessions</option>
            <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
          </select>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          :variant="filters.pending_action === 'new_submissions' ? 'default' : 'outline'"
          @click="setPendingAction('new_submissions')"
        >
          New Submissions
        </Button>
        <Button
          size="sm"
          :variant="filters.pending_action === 'pending_documents' ? 'default' : 'outline'"
          @click="setPendingAction('pending_documents')"
        >
          Pending Documents
        </Button>
        <Button
          size="sm"
          :variant="filters.pending_action === 'pending_exams' ? 'default' : 'outline'"
          @click="setPendingAction('pending_exams')"
        >
          Pending Exams
        </Button>
        <Button
          size="sm"
          :variant="filters.pending_action === 'awaiting_acceptance' ? 'default' : 'outline'"
          @click="setPendingAction('awaiting_acceptance')"
        >
          Awaiting Acceptance
        </Button>
        <Button size="sm" variant="ghost" @click="clearFilters">
          <Icon name="lucide:x" class="w-4 h-4 mr-1" />
          Clear Filters
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
      <div class="flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
        <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading applications...</span>
      </div>
    </div>

    <!-- Applications Table -->
    <div v-else-if="applications.length > 0" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Application #
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Student
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Class
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Payment
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Submitted
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <tr
              v-for="app in applications"
              :key="app.id"
              class="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
              @click="navigateTo(`/admin/admissions/applications/${app.id}`)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-mono font-medium text-neutral-900 dark:text-neutral-100">{{ app.application_number }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ app.full_name }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ app.parent_email }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-neutral-900 dark:text-neutral-100">{{ app.applying_for_class_name }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusColor(app.status)"
                >
                  {{ app.status_display }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-1">
                  <Icon
                    v-if="app.application_fee_paid"
                    name="lucide:check-circle"
                    class="w-4 h-4 text-green-600 dark:text-green-400"
                    title="Application fee paid"
                  />
                  <Icon
                    v-else
                    name="lucide:circle"
                    class="w-4 h-4 text-neutral-300 dark:text-neutral-600"
                    title="Application fee not paid"
                  />
                  <Icon
                    v-if="app.exam_fee_paid"
                    name="lucide:check-circle"
                    class="w-4 h-4 text-green-600 dark:text-green-400"
                    title="Exam fee paid"
                  />
                  <Icon
                    v-if="app.acceptance_fee_paid"
                    name="lucide:check-circle"
                    class="w-4 h-4 text-green-600 dark:text-green-400"
                    title="Acceptance fee paid"
                  />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                {{ app.submitted_at ? formatDate(app.submitted_at) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  size="sm"
                  variant="ghost"
                  @click.stop="navigateTo(`/admin/admissions/applications/${app.id}`)"
                >
                  <Icon name="lucide:eye" class="w-4 h-4" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div class="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {{ applications.length }} of {{ totalCount }} applications
        </div>
        <div class="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            :disabled="!previousPage"
            @click="loadPage(previousPage)"
          >
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            :disabled="!nextPage"
            @click="loadPage(nextPage)"
          >
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
      <Icon name="lucide:inbox" class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Applications Found</h3>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{ filters.search || filters.status || filters.pending_action ? 'Try adjusting your filters' : 'No applications have been submitted yet' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdmissionAdmin } from '~~/composables/useAdmissionAdmin'
import { toast } from 'vue-sonner'
import type { AdmissionApplication, AdmissionSession, ApplicationStatus } from '~~/types/admission'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { adminAPI } = useAdmissionAdmin()

const loading = ref(true)
const isExporting = ref(false)
const applications = ref<AdmissionApplication[]>([])
const sessions = ref<AdmissionSession[]>([])
const totalCount = ref(0)
const nextPage = ref<string | null>(null)
const previousPage = ref<string | null>(null)

const filters = ref({
  search: (route.query.search as string) || '',
  status: (route.query.status as string) || '',
  session: (route.query.session as string) || '',
  pending_action: (route.query.pending_action as string) || '',
})

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadApplications()
  }, 500)
}

const loadApplications = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {}

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.session) params.session = filters.value.session
    if (filters.value.pending_action) params.pending_action = filters.value.pending_action

    const result = await adminAPI.listApplications(params)
    applications.value = result.results || []
    totalCount.value = result.count || 0
    nextPage.value = result.next || null
    previousPage.value = result.previous || null
  } catch (error) {
    console.error('Error loading applications:', error)
    toast.error('Failed to load applications')
    applications.value = []
  } finally {
    loading.value = false
  }
}

const loadPage = async (url: string | null) => {
  if (!url) return
  // Extract page number or use URL directly with $fetch
  loading.value = true
  try {
    const result = await $fetch<any>(url)
    applications.value = result.results || []
    totalCount.value = result.count || 0
    nextPage.value = result.next || null
    previousPage.value = result.previous || null
  } catch (error) {
    console.error('Error loading page:', error)
    toast.error('Failed to load page')
    applications.value = []
  } finally {
    loading.value = false
  }
}

const setPendingAction = (action: string) => {
  if (filters.value.pending_action === action) {
    filters.value.pending_action = ''
  } else {
    filters.value.pending_action = action
  }
  loadApplications()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    session: '',
    pending_action: '',
  }
  loadApplications()
}

const exportApplications = async () => {
  isExporting.value = true
  try {
    const params: Record<string, any> = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.session) params.session = filters.value.session

    const blob = await adminAPI.exportApplications(params)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success('Applications exported successfully')
  } catch (error) {
    console.error('Error exporting applications:', error)
    toast.error('Failed to export applications')
  } finally {
    isExporting.value = false
  }
}

const getStatusColor = (status: ApplicationStatus) => {
  const colors: Record<ApplicationStatus, string> = {
    DRAFT: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
    SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    DOCUMENTS_PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    EXAM_SCHEDULED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    EXAM_COMPLETED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    INTERVIEW_SCHEDULED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ENROLLED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    WITHDRAWN: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  }
  return colors[status] || 'bg-neutral-100 text-neutral-700'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(async () => {
  // Load sessions for filter
  try {
    sessions.value = await adminAPI.listSessions()
  } catch (error) {
    console.error('Error loading sessions:', error)
  }

  // Load applications
  await loadApplications()
})
</script>
