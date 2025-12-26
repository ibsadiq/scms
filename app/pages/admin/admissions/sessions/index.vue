<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Admission Sessions</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">Manage admission cycles and periods</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Create Session
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8">
      <div class="flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
        <span class="ml-2 text-neutral-600 dark:text-neutral-400">Loading sessions...</span>
      </div>
    </div>

    <!-- Sessions List -->
    <div v-else-if="sessions.length > 0" class="space-y-4">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ session.name }}</h3>
              <span
                v-if="session.is_active"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                <Icon name="lucide:check-circle" class="w-3 h-3 mr-1" />
                Active
              </span>
            </div>
            <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-neutral-600 dark:text-neutral-400">Application Period</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">
                  {{ formatDate(session.start_date) }} - {{ formatDate(session.end_date) }}
                </p>
              </div>
              <div>
                <p class="text-neutral-600 dark:text-neutral-400">Academic Year</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ session.academic_year_display || session.academic_year }}</p>
              </div>
              <div>
                <p class="text-neutral-600 dark:text-neutral-400">Public Applications</p>
                <p class="font-medium text-neutral-900 dark:text-neutral-100">
                  {{ session.allow_public_applications ? 'Enabled' : 'Disabled' }}
                </p>
              </div>
            </div>
            <div v-if="session.application_instructions" class="mt-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ session.application_instructions }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Button
              v-if="!session.is_active"
              @click="activateSession(session.id)"
              size="sm"
              class="bg-green-600 hover:bg-green-700"
            >
              <Icon name="lucide:play" class="w-4 h-4 mr-2" />
              Activate
            </Button>
            <Button
              @click="viewStatistics(session.id)"
              size="sm"
              variant="outline"
            >
              <Icon name="lucide:bar-chart" class="w-4 h-4 mr-2" />
              Statistics
            </Button>
            <Button
              @click="editSession(session)"
              size="sm"
              variant="outline"
            >
              <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-12 text-center">
      <Icon name="lucide:calendar" class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Sessions Yet</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">
        Create your first admission session to start accepting applications
      </p>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Create Session
      </Button>
    </div>

    <!-- Create/Edit Session Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingSession ? 'Edit Session' : 'Create Session' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="saveSession" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <Label for="name">Session Name *</Label>
              <Input
                id="name"
                v-model="sessionForm.name"
                placeholder="e.g., 2024/2025 Admission"
                required
              />
            </div>

            <div>
              <Label for="start_date">Start Date *</Label>
              <Input
                id="start_date"
                v-model="sessionForm.start_date"
                type="date"
                required
              />
            </div>

            <div>
              <Label for="end_date">End Date *</Label>
              <Input
                id="end_date"
                v-model="sessionForm.end_date"
                type="date"
                required
              />
            </div>

            <div class="md:col-span-2">
              <Label for="academic_year">Academic Year *</Label>
              <Select v-model="selectedAcademicYearString" required>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="year in academicYears"
                    :key="year.id"
                    :value="String(year.id)"
                  >
                    {{ year.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Select the academic year this admission session belongs to
              </p>
            </div>

            <div class="md:col-span-2">
              <div class="flex items-center gap-2">
                <input
                  id="allow_public"
                  v-model="sessionForm.allow_public_applications"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="allow_public" class="!mb-0">Allow Public Applications</Label>
              </div>
            </div>

            <div class="md:col-span-2">
              <Label for="instructions">Application Instructions</Label>
              <textarea
                id="instructions"
                v-model="sessionForm.application_instructions"
                class="flex min-h-[100px] w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                placeholder="Welcome message and instructions for applicants..."
              ></textarea>
            </div>

            <div class="md:col-span-2">
              <div class="flex items-center gap-2">
                <input
                  id="require_acceptance_fee"
                  v-model="sessionForm.require_acceptance_fee"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="require_acceptance_fee" class="!mb-0">Require Acceptance Fee</Label>
              </div>
            </div>

            <div v-if="sessionForm.require_acceptance_fee">
              <Label for="acceptance_fee_deadline">Acceptance Fee Deadline (days)</Label>
              <Input
                id="acceptance_fee_deadline"
                v-model.number="sessionForm.acceptance_fee_deadline_days"
                type="number"
                placeholder="14"
                min="1"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Number of days applicants have to pay the acceptance fee (counted from when an offer is issued).
              </p>
            </div>

            <div>
              <Label for="offer_expiry">Offer Expiry (days)</Label>
              <Input
                id="offer_expiry"
                v-model.number="sessionForm.offer_expiry_days"
                type="number"
                placeholder="30"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="isSaving">
              <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ editingSession ? 'Update' : 'Create' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdmissionAdmin } from '~~/composables/useAdmissionAdmin'
import { useAcademicYears } from '~~/composables/admin/useAcademicYears'
import { toast } from 'vue-sonner'
import type { AdmissionSession } from '~~/types/admission'
import type { AcademicYear } from '~~/types'

definePageMeta({
  layout: 'admin',
})

const { adminAPI } = useAdmissionAdmin()
const { fetchAcademicYears } = useAcademicYears()

const loading = ref(true)
const isSaving = ref(false)
const sessions = ref<AdmissionSession[]>([])
const academicYears = ref<AcademicYear[]>([])
const showCreateDialog = ref(false)
const editingSession = ref<AdmissionSession | null>(null)

const sessionForm = ref({
  name: '',
  academic_year: 0,
  start_date: '',
  end_date: '',
  allow_public_applications: true,
  application_instructions: '',
  require_acceptance_fee: true,
  acceptance_fee_deadline_days: 14,
  offer_expiry_days: 30,
})

// Computed property to handle string/number conversion for Select component
const selectedAcademicYearString = computed({
  get: () => sessionForm.value.academic_year ? String(sessionForm.value.academic_year) : '',
  set: (value: string) => {
    sessionForm.value.academic_year = value ? parseInt(value, 10) : 0
  }
})

const loadAcademicYears = async () => {
  try {
    const { data } = await fetchAcademicYears()
    if (data) {
      academicYears.value = data
    }
  } catch (error) {
    console.error('Error loading academic years:', error)
    toast.error('Failed to load academic years')
  }
}

const loadSessions = async () => {
  loading.value = true
  try {
    sessions.value = await adminAPI.listSessions()
  } catch (error) {
    console.error('Error loading sessions:', error)
    toast.error('Failed to load sessions')
  } finally {
    loading.value = false
  }
}

const editSession = (session: AdmissionSession) => {
  editingSession.value = session
  sessionForm.value = {
    name: session.name,
    academic_year: session.academic_year,
    start_date: session.start_date,
    end_date: session.end_date,
    allow_public_applications: session.allow_public_applications,
    application_instructions: session.application_instructions || '',
    require_acceptance_fee: session.require_acceptance_fee,
    acceptance_fee_deadline_days: session.acceptance_fee_deadline_days || 14,
    offer_expiry_days: session.offer_expiry_days || 30,
  }
  showCreateDialog.value = true
}

const saveSession = async () => {
  isSaving.value = true
  try {
    // Validation: if acceptance fee is required, we must have a positive deadline value
    if (sessionForm.value.require_acceptance_fee && (!sessionForm.value.acceptance_fee_deadline_days || sessionForm.value.acceptance_fee_deadline_days <= 0)) {
      toast.error('Please enter a positive Acceptance Fee Deadline (days) when acceptance fees are required.')
      isSaving.value = false
      return
    }
    if (editingSession.value) {
      await adminAPI.updateSession(editingSession.value.id, sessionForm.value)
      toast.success('Session updated successfully')
    } else {
      await adminAPI.createSession(sessionForm.value)
      toast.success('Session created successfully')
    }
    closeDialog()
    await loadSessions()
  } catch (error: any) {
    console.error('Error saving session:', error)
    toast.error(error.data?.detail || 'Failed to save session')
  } finally {
    isSaving.value = false
  }
}

const activateSession = async (id: number) => {
  if (!confirm('Are you sure you want to activate this session? This will deactivate all other sessions.')) return

  try {
    await adminAPI.activateSession(id)
    toast.success('Session activated successfully')
    await loadSessions()
  } catch (error: any) {
    console.error('Error activating session:', error)
    toast.error(error.data?.detail || 'Failed to activate session')
  }
}

const viewStatistics = (id: number) => {
  navigateTo('/admin/admissions?session=' + id)
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingSession.value = null
  sessionForm.value = {
    name: '',
    academic_year: 0,
    start_date: '',
    end_date: '',
    allow_public_applications: true,
    application_instructions: '',
    require_acceptance_fee: true,
    acceptance_fee_deadline_days: 14,
    offer_expiry_days: 30,
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadAcademicYears()
  loadSessions()
})
</script>
