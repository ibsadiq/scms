<!-- pages/teacher/assignments/index.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Assignments</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
          Manage and track student assignments
        </p>
      </div>
      <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        Create Assignment
      </Button>
    </div>

    <!-- Filters and Search -->
    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              v-model="searchQuery"
              placeholder="Search assignments..."
              class="w-full"
            >
              <template #prefix>
                <Icon name="lucide:search" class="w-4 h-4 text-neutral-400" />
              </template>
            </Input>

            <select
              v-model="statusFilter"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>

            <select
              v-model="classroomFilter"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option value="">All Classrooms</option>
              <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
                {{ classroom.name_display || classroom.name }}
              </option>
            </select>

            <select
              v-model="subjectFilter"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option value="">All Subjects</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading assignments...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAssignments.length === 0" class="text-center py-12">
          <Icon name="lucide:clipboard-list" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No assignments found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Assignment
          </Button>
        </div>

        <!-- Assignments List -->
        <div v-else class="space-y-4">
          <Card
            v-for="assignment in filteredAssignments"
            :key="assignment.id"
            class="hover:shadow-md transition-shadow cursor-pointer"
            @click="navigateTo(`/teacher/assignments/${assignment.id}`)"
          >
            <CardHeader class="p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <CardTitle class="text-base sm:text-lg">{{ assignment.title }}</CardTitle>
                    <Badge :variant="getStatusVariant(assignment.status)" class="text-xs">
                      {{ assignment.status }}
                    </Badge>
                    <Badge v-if="assignment.is_overdue && assignment.status === 'published'" variant="destructive" class="text-xs">
                      Overdue
                    </Badge>
                  </div>
                  <div class="flex items-center gap-3 mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 flex-wrap">
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:book" class="w-4 h-4" />
                      {{ assignment.subject_name }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:users" class="w-4 h-4" />
                      {{ assignment.classroom_name }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:calendar" class="w-4 h-4" />
                      Due: {{ formatDate(assignment.due_date) }}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-4 pt-0">
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p class="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Total Students</p>
                  <p class="text-lg font-bold text-blue-700 dark:text-blue-400">{{ assignment.total_students }}</p>
                </div>
                <div class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p class="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Submitted</p>
                  <p class="text-lg font-bold text-green-700 dark:text-green-400">{{ assignment.submission_count }}</p>
                </div>
                <div class="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p class="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Graded</p>
                  <p class="text-lg font-bold text-purple-700 dark:text-purple-400">{{ assignment.graded_count }}</p>
                </div>
              </div>
              <div class="mt-3">
                <div class="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                  <span>Submission Rate</span>
                  <span class="font-semibold">{{ assignment.submission_rate }}%</span>
                </div>
                <div class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-green-500 transition-all"
                    :style="{ width: `${assignment.submission_rate}%` }"
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Create Assignment Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogScrollContent class="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>Create a new assignment for your students</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleCreateSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="title">Title *</Label>
            <Input
              id="title"
              v-model="createForm.title"
              placeholder="Assignment title"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="description">Assignment Instructions *</Label>
            <RichTextEditor v-model="createForm.description" />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Use the toolbar to format your assignment instructions. You can add headings, lists, bold text, and more.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="attachments">Attachments (Optional)</Label>
            <div class="space-y-2">
              <input
                id="attachments"
                type="file"
                multiple
                @change="handleFileSelect"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.png"
                class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Accepted: PDF, Word, PowerPoint, Excel, Text, Images (Max 10MB each)
              </p>

              <!-- Selected Files Preview -->
              <div v-if="selectedFiles.length > 0" class="space-y-2 mt-3">
                <p class="text-sm font-medium">Selected Files:</p>
                <div class="space-y-1">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="index"
                    class="flex items-center justify-between p-2 rounded-md bg-neutral-50 dark:bg-neutral-800 text-sm"
                  >
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <Icon name="lucide:file" class="w-4 h-4 flex-shrink-0 text-neutral-500" />
                      <span class="truncate">{{ file.name }}</span>
                      <span class="text-xs text-neutral-500 flex-shrink-0">({{ formatFileSize(file.size) }})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeFile(index)"
                      class="flex-shrink-0"
                    >
                      <Icon name="lucide:x" class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="assignment_type">Assignment Type *</Label>
              <select
                id="assignment_type"
                v-model="createForm.assignment_type"
                class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                required
              >
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
                <option value="research">Research Paper</option>
                <option value="essay">Essay</option>
                <option value="lab_report">Lab Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="classroom">Classroom *</Label>
              <select
                id="classroom"
                v-model.number="createForm.classroom"
                class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                required
              >
                <option :value="null" disabled>Select classroom</option>
                <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
                  {{ classroom.name_display || classroom.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="subject">Subject *</Label>
              <select
                id="subject"
                v-model.number="createForm.subject"
                class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                required
              >
                <option :value="null" disabled>Select subject</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="due_date">Due Date *</Label>
              <Input
                id="due_date"
                v-model="createForm.due_date"
                type="datetime-local"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="max_score">Maximum Score *</Label>
              <Input
                id="max_score"
                v-model.number="createForm.max_score"
                type="number"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="status">Status *</Label>
              <select
                id="status"
                v-model="createForm.status"
                class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <input
                id="allow_late"
                v-model="createForm.allow_late_submission"
                type="checkbox"
                class="w-4 h-4 rounded border-neutral-300"
              />
              <Label for="allow_late" class="cursor-pointer">Allow late submissions</Label>
            </div>

            <div v-if="createForm.allow_late_submission" class="space-y-2">
              <Label for="late_penalty">Late Penalty (%)</Label>
              <Input
                id="late_penalty"
                v-model.number="createForm.late_penalty_percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDialog = false">Cancel</Button>
            <Button type="submit" :disabled="creating">
              <Icon v-if="creating" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ creating ? 'Creating...' : 'Create Assignment' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogScrollContent } from '@/components/ui/dialog'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'

definePageMeta({
  layout: 'teacher',
  // middleware: 'auth'
})

interface Assignment {
  id: number
  title: string
  description: string
  assignment_type: string
  classroom: number
  classroom_name: string
  subject: number
  subject_name: string
  academic_year: number
  academic_year_name: string
  term?: number | null
  term_name?: string | null
  assigned_date: string
  due_date: string
  max_score: number
  allow_late_submission: boolean
  late_penalty_percent: number
  status: 'draft' | 'published' | 'closed'
  is_active: boolean
  is_overdue: boolean
  total_students: number
  submission_count: number
  graded_count: number
  submission_rate: number
  created_at: string
  updated_at: string
}

interface Classroom {
  id: number
  name: number | string
  name_display?: string
}

interface Subject {
  id: number
  name: string
}

interface AcademicYear {
  id: number
  name: string
  active_year: boolean
}

const { apiCall } = useApi()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const loading = ref(true)
const creating = ref(false)
const showCreateDialog = ref(false)
const assignments = ref<Assignment[]>([])
const classrooms = ref<Classroom[]>([])
const subjects = ref<Subject[]>([])
const activeAcademicYear = ref<AcademicYear | null>(null)
const selectedFiles = ref<File[]>([])

const searchQuery = ref('')
const statusFilter = ref('')
const classroomFilter = ref('')
const subjectFilter = ref('')

const createForm = ref({
  title: '',
  description: '',
  assignment_type: 'homework',
  classroom: null as number | null,
  subject: null as number | null,
  academic_year: null as number | null,
  term: null as number | null,
  due_date: '',
  max_score: 100,
  allow_late_submission: true,
  late_penalty_percent: 10,
  status: 'draft' as 'draft' | 'published'
})

const filteredAssignments = computed(() => {
  return assignments.value.filter(assignment => {
    const matchesSearch = !searchQuery.value ||
      assignment.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !statusFilter.value || assignment.status === statusFilter.value
    const matchesClassroom = !classroomFilter.value || assignment.classroom === Number(classroomFilter.value)
    const matchesSubject = !subjectFilter.value || assignment.subject === Number(subjectFilter.value)

    return matchesSearch && matchesStatus && matchesClassroom && matchesSubject
  })
})

const getStatusVariant = (status: string) => {
  if (status === 'published') return 'default'
  if (status === 'draft') return 'secondary'
  return 'outline'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const invalidFiles = files.filter(file => file.size > maxSize)

    if (invalidFiles.length > 0) {
      showErrorToast(
        `Some files exceed the 10MB limit: ${invalidFiles.map(f => f.name).join(', ')}`,
        'File Size Error'
      )
      return
    }

    selectedFiles.value = [...selectedFiles.value, ...files]
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const uploadAttachments = async (assignmentId: number) => {
  if (selectedFiles.value.length === 0) return

  for (const file of selectedFiles.value) {
    const formData = new FormData()
    formData.append('file', file)

    const { error } = await apiCall(
      `/assignments/teacher/assignments/${assignmentId}/upload_attachment/`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (error) {
      showErrorToast(`Failed to upload ${file.name}`, 'Upload Error')
    }
  }
}

const loadData = async () => {
  loading.value = true

  const [assignmentsRes, classroomsRes, subjectsRes, academicYearRes] = await Promise.all([
    apiCall<Assignment[]>('/assignments/teacher/assignments/'),
    apiCall<Classroom[]>('/academic/classrooms/'),
    apiCall<Subject[]>('/academic/subjects/'),
    apiCall<AcademicYear[]>('/administration/academic-years/')
  ])

  if (assignmentsRes.data) {
    assignments.value = assignmentsRes.data
  }

  if (classroomsRes.data) {
    classrooms.value = classroomsRes.data
  }

  if (subjectsRes.data) {
    subjects.value = subjectsRes.data
  }

  if (academicYearRes.data) {
    const active = academicYearRes.data.find(year => year.active_year)
    if (active) {
      activeAcademicYear.value = active
      createForm.value.academic_year = active.id
    }
  }

  loading.value = false
}

const handleCreateSubmit = async () => {
  if (!createForm.value.classroom || !createForm.value.subject || !createForm.value.academic_year) {
    showErrorToast('Please fill in all required fields', 'Validation Error')
    return
  }

  creating.value = true

  const { data, error: apiError } = await apiCall<Assignment>(
    '/assignments/teacher/assignments/',
    {
      method: 'POST',
      body: {
        ...createForm.value,
        // Convert datetime-local to ISO format
        due_date: new Date(createForm.value.due_date).toISOString()
      }
    }
  )

  if (data) {
    // Upload attachments if any
    if (selectedFiles.value.length > 0) {
      await uploadAttachments(data.id)
    }

    assignments.value.unshift(data)
    showSuccessToast('Assignment created successfully')
    showCreateDialog.value = false
    resetCreateForm()
  } else {
    showErrorToast(apiError, 'Failed to create assignment')
  }

  creating.value = false
}

const resetCreateForm = () => {
  createForm.value = {
    title: '',
    description: '',
    assignment_type: 'homework',
    classroom: null,
    subject: null,
    academic_year: activeAcademicYear.value?.id || null,
    term: null,
    due_date: '',
    max_score: 100,
    allow_late_submission: true,
    late_penalty_percent: 10,
    status: 'draft'
  }
  selectedFiles.value = []

  // Reset file input
  const fileInput = document.getElementById('attachments') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

onMounted(() => {
  loadData()
})
</script>
