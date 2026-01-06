<!-- pages/admin/assessments/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Assessments & Examinations</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage examinations and assessments for classrooms
        </p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Create Assessment
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-12 h-12 animate-spin text-primary-600" />
    </div>

    <!-- Assessments List -->
    <div v-else-if="assessments.length > 0" class="grid grid-cols-1 gap-4">
      <Card v-for="assessment in assessments" :key="assessment.id" class="hover:shadow-md transition-shadow">
        <CardContent class="p-6">
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <!-- Assessment Info -->
            <div class="flex-1 space-y-3">
              <div>
                <h3 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {{ assessment.name }}
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Created by {{ assessment.created_by_name || 'Unknown' }} • {{ formatDate(assessment.created_on) }}
                </p>
              </div>

              <!-- Date Range -->
              <div class="flex items-center gap-2 text-sm">
                <Icon name="lucide:calendar" class="w-4 h-4 text-neutral-500" />
                <span class="text-neutral-700 dark:text-neutral-300">
                  {{ formatDate(assessment.start_date) }} - {{ formatDate(assessment.ends_date) }}
                </span>
              </div>

              <!-- Total Marks -->
              <div class="flex items-center gap-2 text-sm">
                <Icon name="lucide:award" class="w-4 h-4 text-neutral-500" />
                <span class="text-neutral-700 dark:text-neutral-300">
                  Total Marks: <strong>{{ assessment.out_of }}</strong>
                </span>
              </div>

              <!-- Classrooms -->
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="(className, index) in assessment.classroom_names"
                  :key="index"
                  variant="secondary"
                >
                  <Icon name="lucide:school" class="w-3 h-3 mr-1" />
                  {{ className }}
                </Badge>
              </div>

              <!-- Comments -->
              <p v-if="assessment.comments" class="text-sm text-neutral-600 dark:text-neutral-400 italic">
                {{ assessment.comments }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex lg:flex-col gap-2">
              <Button variant="outline" size="sm" @click="handleEdit(assessment)">
                <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" @click="handleViewMarks(assessment)">
                <Icon name="lucide:clipboard-list" class="w-4 h-4 mr-2" />
                Marks
              </Button>
              <Button variant="destructive" size="sm" @click="handleDelete(assessment)">
                <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="flex flex-col items-center justify-center py-16">
        <Icon name="lucide:clipboard-list" class="w-16 h-16 text-neutral-400 mb-4" />
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No Assessments Found</h3>
        <p class="text-neutral-600 dark:text-neutral-400 mb-4 text-center">
          Create your first assessment to get started
        </p>
        <Button @click="showCreateDialog = true">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Create Assessment
        </Button>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingAssessment ? 'Edit' : 'Create' }} Assessment</DialogTitle>
          <DialogDescription>
            {{ editingAssessment ? 'Update assessment information' : 'Create a new assessment for classrooms' }}
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Assessment Name -->
          <div class="space-y-2">
            <Label for="name">Assessment Name <span class="text-destructive">*</span></Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., Mid-Term Test - Term Two"
              required
            />
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="start_date">Start Date <span class="text-destructive">*</span></Label>
              <Input
                id="start_date"
                v-model="formData.start_date"
                type="date"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="ends_date">End Date <span class="text-destructive">*</span></Label>
              <Input
                id="ends_date"
                v-model="formData.ends_date"
                type="date"
                required
              />
            </div>
          </div>

          <!-- Total Marks -->
          <div class="space-y-2">
            <Label for="out_of">Total Marks <span class="text-destructive">*</span></Label>
            <Input
              id="out_of"
              v-model.number="formData.out_of"
              type="number"
              min="1"
              placeholder="e.g., 50"
              required
            />
          </div>

          <!-- Classrooms Multi-Select -->
          <div class="space-y-2">
            <Label>Classrooms <span class="text-destructive">*</span></Label>
            <div v-if="loadingClassrooms" class="flex items-center gap-2 text-sm text-neutral-500">
              <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              Loading classrooms...
            </div>
            <div v-else-if="classroomOptions.length === 0" class="text-sm text-neutral-500">
              No classrooms available
            </div>
            <div v-else class="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              <div
                v-for="classroom in classroomOptions"
                :key="classroom.id"
                class="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  :id="`classroom-${classroom.id}`"
                  :value="classroom.id"
                  v-model="formData.classrooms"
                  class="rounded border-neutral-300 text-primary-600 focus:ring-primary-600"
                />
                <label
                  :for="`classroom-${classroom.id}`"
                  class="text-sm font-medium leading-none cursor-pointer"
                >
                  {{ classroom.name }}{{ classroom.stream_name ? ` ${classroom.stream_name}` : '' }}
                </label>
              </div>
            </div>
            <p v-if="formData.classrooms.length > 0" class="text-xs text-neutral-500">
              {{ formData.classrooms.length }} classroom(s) selected
            </p>
          </div>

          <!-- Comments -->
          <div class="space-y-2">
            <Label for="comments">Comments (Optional)</Label>
            <textarea
              id="comments"
              v-model="formData.comments"
              rows="3"
              class="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Additional information about this assessment..."
            />
          </div>

          <!-- Error Message -->
          <div v-if="formError" class="text-sm text-destructive">
            {{ formError }}
          </div>

          <DialogFooter class="gap-2">
            <Button type="button" variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="submitting">
              <Icon v-if="submitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ submitting ? 'Saving...' : (editingAssessment ? 'Update' : 'Create') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Examination, Classroom } from '~~/types'
import { useAssessments } from '~~/composables/admin/useAssessments'
import { useClassrooms } from '~~/composables/admin/useClassrooms'
import { useAuth } from '~~/composables/useAuth'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const { fetchAssessments, createAssessment, updateAssessment, deleteAssessment } = useAssessments()
const { fetchClassrooms } = useClassrooms()
const { user } = useAuth()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const loading = ref(true)
const assessments = ref<Examination[]>([])
const showCreateDialog = ref(false)
const editingAssessment = ref<Examination | null>(null)

// Classroom options
const loadingClassrooms = ref(false)
const classroomOptions = ref<Classroom[]>([])

// Form state
const submitting = ref(false)
const formError = ref('')
const formData = ref({
  name: '',
  start_date: '',
  ends_date: '',
  out_of: 0,
  classrooms: [] as number[],
  comments: '',
})

// Load assessments
onMounted(async () => {
  await loadAssessments()
  await loadClassroomOptions()
})

const loadAssessments = async () => {
  loading.value = true
  const { data, error } = await fetchAssessments()

  if (data) {
    assessments.value = data
  } else if (error) {
    showError('Failed to load assessments: ' + error)
  }

  loading.value = false
}

const loadClassroomOptions = async () => {
  loadingClassrooms.value = true
  const { data } = await fetchClassrooms()

  if (data) {
    classroomOptions.value = data
  }

  loadingClassrooms.value = false
}

const handleEdit = (assessment: Examination) => {
  editingAssessment.value = assessment
  // Populate form with assessment data
  formData.value = {
    name: assessment.name,
    start_date: assessment.start_date,
    ends_date: assessment.ends_date,
    out_of: assessment.out_of,
    classrooms: assessment.classrooms,
    comments: assessment.comments || '',
  }
  showCreateDialog.value = true
}

const handleViewMarks = (assessment: Examination) => {
  // Navigate to marks page for this assessment
  navigateTo(`/admin/assessments/${assessment.id}/marks`)
}

const handleDelete = async (assessment: Examination) => {
  if (!confirm(`Are you sure you want to delete "${assessment.name}"?`)) return

  const { error } = await deleteAssessment(assessment.id!)

  if (error) {
    showError('Failed to delete assessment: ' + error)
  } else {
    showSuccessToast('Assessment deleted successfully')
    assessments.value = assessments.value.filter(a => a.id !== assessment.id)
  }
}

const handleSubmit = async () => {
  formError.value = ''

  // Validation
  if (!formData.value.name || !formData.value.start_date || !formData.value.ends_date || !formData.value.out_of) {
    formError.value = 'Please fill in all required fields'
    return
  }

  if (formData.value.classrooms.length === 0) {
    formError.value = 'Please select at least one classroom'
    return
  }

  if (new Date(formData.value.start_date) > new Date(formData.value.ends_date)) {
    formError.value = 'End date must be after start date'
    return
  }

  submitting.value = true

  const payload = {
    ...formData.value,
    created_by: user.value?.id,
    comments: formData.value.comments || null,
  }

  let result
  if (editingAssessment.value) {
    result = await updateAssessment(editingAssessment.value.id!, payload)
  } else {
    result = await createAssessment(payload)
  }

  submitting.value = false

  if (result.error) {
    formError.value = result.error
    showError(`Failed to ${editingAssessment.value ? 'update' : 'create'} assessment: ${result.error}`)
  } else {
    showSuccessToast(`Assessment ${editingAssessment.value ? 'updated' : 'created'} successfully`)
    showCreateDialog.value = false
    resetForm()
    await loadAssessments()
  }
}

const handleCancel = () => {
  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingAssessment.value = null
  formError.value = ''
  formData.value = {
    name: '',
    start_date: '',
    ends_date: '',
    out_of: 0,
    classrooms: [],
    comments: '',
  }
}

// Watch dialog close to reset form
watch(showCreateDialog, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>
