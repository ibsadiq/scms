<!-- pages/student/assignments/[id].vue -->
<template>
  <div class="space-y-6">
    <!-- Back Button -->
    <Button variant="ghost" size="sm" @click="navigateTo('/student/assignments')">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Back to Assignments
    </Button>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Assignment Content -->
    <template v-else-if="selectedAssignment">
      <!-- Assignment Details Card -->
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <CardTitle class="text-2xl">{{ selectedAssignment.title }}</CardTitle>
              <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:book-open" class="w-4 h-4" />
                  {{ selectedAssignment.subject_name }}
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <Icon name="lucide:user" class="w-4 h-4" />
                  {{ selectedAssignment.teacher_name }}
                </span>
                <span>•</span>
                <Badge :variant="selectedAssignment.is_overdue ? 'destructive' : 'default'">
                  <Icon name="lucide:calendar" class="w-3 h-3 mr-1" />
                  Due: {{ formatDateTime(selectedAssignment.due_date) }}
                </Badge>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-neutral-500 dark:text-neutral-400">Max Score</div>
              <div class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ selectedAssignment.max_score }}
              </div>
              <Badge class="mt-2">{{ formatType(selectedAssignment.assignment_type) }}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Instructions</h3>
            <p class="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {{ selectedAssignment.description }}
            </p>
          </div>

          <!-- Teacher Attachments -->
          <div v-if="selectedAssignment.attachments?.length > 0">
            <h3 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Attachments</h3>
            <div class="space-y-2">
              <a
                v-for="attachment in selectedAssignment.attachments"
                :key="attachment.id"
                :href="attachment.file_url"
                target="_blank"
                class="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Icon name="lucide:file" class="w-5 h-5 text-primary-600" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ attachment.file_name }}</p>
                  <p class="text-xs text-neutral-500">{{ formatFileSize(attachment.file_size) }}</p>
                </div>
                <Icon name="lucide:download" class="w-4 h-4 text-neutral-400" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Grade Card (if graded) -->
      <Card v-if="selectedAssignment.is_graded && selectedAssignment.grade" class="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Icon name="lucide:award" class="w-5 h-5" />
            Your Grade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ selectedAssignment.grade.final_score }}
              </div>
              <div class="text-sm text-neutral-500 dark:text-neutral-400">out of {{ selectedAssignment.max_score }}</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ selectedAssignment.grade.grade_letter }}
              </div>
              <div class="text-sm text-neutral-500 dark:text-neutral-400">Grade</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                {{ selectedAssignment.grade.percentage }}%
              </div>
              <div class="text-sm text-neutral-500 dark:text-neutral-400">Percentage</div>
            </div>
            <div class="text-center" v-if="selectedAssignment.grade.late_penalty_applied > 0">
              <div class="text-4xl font-bold text-red-600 dark:text-red-400">
                -{{ selectedAssignment.grade.late_penalty_applied }}
              </div>
              <div class="text-sm text-neutral-500 dark:text-neutral-400">Late Penalty</div>
            </div>
          </div>

          <div v-if="selectedAssignment.grade.feedback" class="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Teacher Feedback</h4>
            <p class="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {{ selectedAssignment.grade.feedback }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Submission Card -->
      <Card v-if="!selectedAssignment.has_submitted">
        <CardHeader>
          <CardTitle>Submit Your Work</CardTitle>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Upload your completed assignment before the deadline
          </p>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="submission_text">Your Answer/Notes</Label>
              <Textarea
                id="submission_text"
                v-model="submissionForm.text"
                placeholder="Type your answer or notes here..."
                rows="6"
              />
            </div>

            <div class="space-y-2">
              <Label>Upload Files (Optional)</Label>
              <div
                class="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                @click="triggerFileInput"
                @drop.prevent="handleDrop"
                @dragover.prevent
              >
                <Icon name="lucide:upload-cloud" size="48" class="mx-auto mb-3 text-neutral-400" />
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Click to upload or drag and drop
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  PDF, DOC, DOCX, images, ZIP (Max 10MB per file)
                </p>
              </div>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                class="hidden"
                @change="handleFileSelect"
              />

              <!-- Selected Files List -->
              <div v-if="selectedFiles.length > 0" class="space-y-2 mt-3">
                <div
                  v-for="(file, index) in selectedFiles"
                  :key="index"
                  class="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <Icon name="lucide:file" class="w-5 h-5 text-primary-600" />
                    <div>
                      <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ file.name }}</p>
                      <p class="text-xs text-neutral-500">{{ formatFileSize(file.size) }}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="removeFile(index)"
                  >
                    <Icon name="lucide:x" class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert v-if="selectedAssignment.is_overdue" variant="destructive">
              <Icon name="lucide:alert-triangle" class="h-4 w-4" />
              <AlertTitle>Assignment Overdue</AlertTitle>
              <AlertDescription>
                This assignment is past the due date. Late penalty may apply.
              </AlertDescription>
            </Alert>

            <div class="flex gap-2">
              <Button type="submit" :disabled="submitting || (!submissionForm.text && selectedFiles.length === 0)">
                <Icon v-if="submitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Submit Assignment
              </Button>
              <Button type="button" variant="outline" @click="navigateTo('/student/assignments')">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- View Submission Card (if already submitted) -->
      <Card v-else-if="mySubmission">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <Icon name="lucide:check-circle" class="w-5 h-5 text-green-600" />
                Your Submission
              </CardTitle>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Submitted on {{ formatDateTime(mySubmission.submitted_at) }}
                <Badge v-if="mySubmission.is_late" variant="destructive" class="ml-2">Late</Badge>
              </p>
            </div>
            <Button
              v-if="!selectedAssignment.is_graded"
              variant="outline"
              size="sm"
              @click="showUpdateForm = true"
            >
              <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
              Update Submission
            </Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="mySubmission.submission_text">
            <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Your Answer</h4>
            <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p class="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                {{ mySubmission.submission_text }}
              </p>
            </div>
          </div>

          <div v-if="mySubmission.attachments?.length > 0">
            <h4 class="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Your Files</h4>
            <div class="space-y-2">
              <a
                v-for="attachment in mySubmission.attachments"
                :key="attachment.id"
                :href="attachment.file_url"
                target="_blank"
                class="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Icon name="lucide:file" class="w-5 h-5 text-primary-600" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ attachment.file_name }}</p>
                  <p class="text-xs text-neutral-500">{{ formatFileSize(attachment.file_size) }}</p>
                </div>
                <Icon name="lucide:download" class="w-4 h-4 text-neutral-400" />
              </a>
            </div>
          </div>

          <Alert v-if="!selectedAssignment.is_graded">
            <Icon name="lucide:clock" class="h-4 w-4" />
            <AlertTitle>Pending Grading</AlertTitle>
            <AlertDescription>
              Your teacher will review your submission and provide feedback soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <!-- Update Submission Dialog -->
      <Dialog v-model:open="showUpdateForm">
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Submission</DialogTitle>
            <DialogDescription>
              Modify your submission before the teacher grades it
            </DialogDescription>
          </DialogHeader>
          <form @submit.prevent="handleUpdate" class="space-y-4">
            <div class="space-y-2">
              <Label for="update_text">Your Answer/Notes</Label>
              <Textarea
                id="update_text"
                v-model="updateForm.text"
                rows="6"
              />
            </div>

            <div class="space-y-2">
              <Label>Upload New Files</Label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                @change="handleUpdateFileSelect"
                class="block w-full text-sm text-neutral-900 dark:text-neutral-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" @click="showUpdateForm = false">
                Cancel
              </Button>
              <Button type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Update Submission
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useStudentAssignments } from '~~/composables/student/useAssignments'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  middleware: 'student'
})

const { success, error: showError } = useToast()

const route = useRoute()
const assignmentId = computed(() => Number(route.params.id))

const {
  selectedAssignment,
  mySubmission,
  loading,
  submitting,
  error,
  fetchAssignment,
  fetchMySubmission,
  submitAssignment,
  updateSubmission
} = useStudentAssignments()

// Submission form
const submissionForm = ref({
  text: ''
})

const updateForm = ref({
  text: ''
})

const selectedFiles = ref<File[]>([])
const updateFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()
const showUpdateForm = ref(false)

// File handling
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)]
  }
}

const handleUpdateFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    updateFiles.value = Array.from(target.files)
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(event.dataTransfer.files)]
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// Submit assignment
const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('submission_text', submissionForm.value.text)

  selectedFiles.value.forEach(file => {
    formData.append('files', file)
  })

  const result = await submitAssignment(assignmentId.value, formData)

  if (result.success) {
    showSuccessToast(result.message || 'Assignment submitted successfully!')
    submissionForm.value.text = ''
    selectedFiles.value = []
    await fetchMySubmission(assignmentId.value)
  } else {
    showError(result.error || 'Failed to submit assignment')
  }
}

// Update submission
const handleUpdate = async () => {
  const formData = new FormData()
  formData.append('submission_text', updateForm.value.text)

  updateFiles.value.forEach(file => {
    formData.append('files', file)
  })

  const result = await updateSubmission(assignmentId.value, formData)

  if (result.success) {
    showSuccessToast(result.message || 'Submission updated successfully!')
    showUpdateForm.value = false
    updateFiles.value = []
    await fetchMySubmission(assignmentId.value)
  } else {
    showError(result.error || 'Failed to update submission')
  }
}

// Format helpers
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatType = (type: string) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Load assignment on mount
onMounted(async () => {
  await fetchAssignment(assignmentId.value)
  await fetchMySubmission(assignmentId.value)

  // Pre-fill update form if submission exists
  if (mySubmission.value) {
    updateForm.value.text = mySubmission.value.submission_text
  }
})

useHead({
  title: computed(() => selectedAssignment.value?.title || 'Assignment Details')
})
</script>
