<!-- pages/teacher/marked-scripts/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Marked Scripts</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Upload and manage marked examination scripts</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <Button @click="showBulkUpload = true" variant="outline">
          <Icon name="lucide:upload-cloud" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="showUploadDialog = true">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Upload Script
        </Button>
      </div>
    </div>

    <!-- Filters Card -->
    <Card>
      <CardHeader class="p-4 sm:p-6">
        <CardTitle class="text-lg sm:text-xl">Filter Scripts</CardTitle>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="examination">Examination</Label>
            <select
              id="examination"
              v-model="filterExamination"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              @change="loadScripts"
            >
              <option value="">All Examinations</option>
              <option v-for="exam in examinations" :key="exam.id" :value="exam.id">
                {{ exam.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="classroom">Classroom</Label>
            <select
              id="classroom"
              v-model="filterClassroom"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              @change="loadScripts"
            >
              <option value="">All Classes</option>
              <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="subject">Subject</Label>
            <select
              id="subject"
              v-model="filterSubject"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              @change="loadScripts"
            >
              <option value="">All Subjects</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Scripts List -->
    <Card v-if="loading">
      <CardContent class="p-8 sm:p-12 text-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
        <p class="text-neutral-500 dark:text-neutral-400 mt-4">Loading scripts...</p>
      </CardContent>
    </Card>

    <Card v-else-if="scripts.length === 0">
      <CardContent class="p-8 sm:p-12 text-center">
        <Icon name="lucide:file-text" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600" />
        <p class="text-neutral-500 dark:text-neutral-400 mt-4">No marked scripts uploaded yet</p>
        <Button @click="showUploadDialog = true" class="mt-4">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Upload Your First Script
        </Button>
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader class="p-4 sm:p-6">
        <CardTitle class="text-lg sm:text-xl">Uploaded Scripts ({{ scripts.length }})</CardTitle>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <!-- Mobile: Card List -->
        <div class="block lg:hidden space-y-3">
          <Card v-for="script in scripts" :key="script.id">
            <CardContent class="p-4">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base truncate">{{ script.examination_name }}</h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ script.classroom_name }}</p>
                  </div>
                  <Badge>{{ script.subject_name }}</Badge>
                </div>

                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  <p>Uploaded: {{ formatDate(script.uploaded_on) }}</p>
                  <p>By: {{ script.teacher_name }}</p>
                </div>

                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="downloadScript(script)">
                    <Icon name="lucide:download" class="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="destructive" @click="confirmDelete(script)">
                    <Icon name="lucide:trash-2" class="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Desktop: Table -->
        <div class="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Examination</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="script in scripts" :key="script.id">
                <TableCell class="font-medium">{{ script.examination_name }}</TableCell>
                <TableCell>{{ script.classroom_name }}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{{ script.subject_name }}</Badge>
                </TableCell>
                <TableCell>{{ script.teacher_name }}</TableCell>
                <TableCell>{{ formatDate(script.uploaded_on) }}</TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button size="sm" variant="outline" @click="downloadScript(script)">
                      <Icon name="lucide:download" class="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="destructive" @click="confirmDelete(script)">
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Upload Dialog -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Marked Script</DialogTitle>
          <DialogDescription>
            Upload a single marked examination script (PDF format)
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleUpload" class="space-y-4">
          <div class="space-y-2">
            <Label for="upload_examination">Examination *</Label>
            <select
              id="upload_examination"
              v-model="uploadData.examination"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              required
            >
              <option value="">Select examination</option>
              <option v-for="exam in examinations" :key="exam.id" :value="exam.id">
                {{ exam.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="upload_classroom">Classroom *</Label>
            <select
              id="upload_classroom"
              v-model="uploadData.classroom"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              required
            >
              <option value="">Select classroom</option>
              <option v-for="cls in classrooms" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="upload_subject">Subject *</Label>
            <select
              id="upload_subject"
              v-model="uploadData.subject"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              required
              @change="loadStudentsForClassroom"
            >
              <option value="">Select subject</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="upload_student">Student *</Label>
            <select
              id="upload_student"
              v-model="uploadData.student"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              required
              :disabled="!uploadData.classroom"
            >
              <option value="">{{ uploadData.classroom ? 'Select student' : 'Select classroom first' }}</option>
              <option v-for="student in availableStudents" :key="student.id" :value="student.id">
                {{ student.admission_number }} - {{ student.first_name }} {{ student.last_name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="upload_file">PDF File *</Label>
            <Input
              id="upload_file"
              type="file"
              accept=".pdf"
              @change="handleFileSelect"
              required
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Only PDF files are allowed</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showUploadDialog = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="uploading">
              <Icon v-if="uploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Marked Scripts</DialogTitle>
          <DialogDescription>
            Upload multiple marked scripts at once using a CSV file with PDF attachments
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleBulkUpload" class="space-y-4">
          <div class="space-y-2">
            <Label for="bulk_csv">CSV File *</Label>
            <Input
              id="bulk_csv"
              type="file"
              accept=".csv"
              @change="handleBulkCSVSelect"
              required
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              CSV format: examination_id, classroom_id, subject_id, file_name
            </p>
          </div>

          <div class="space-y-2">
            <Label for="bulk_pdfs">PDF Files *</Label>
            <Input
              id="bulk_pdfs"
              type="file"
              accept=".pdf"
              multiple
              @change="handleBulkPDFsSelect"
              required
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Select all PDF files referenced in the CSV
            </p>
          </div>

          <div v-if="bulkUploadResult" class="p-4 rounded-lg" :class="bulkUploadResult.failed > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'">
            <p class="font-medium">Upload Results:</p>
            <ul class="text-sm mt-2 space-y-1">
              <li class="text-green-600 dark:text-green-400">✓ Successfully uploaded: {{ bulkUploadResult.uploaded }}</li>
              <li v-if="bulkUploadResult.failed > 0" class="text-red-600 dark:text-red-400">✗ Failed: {{ bulkUploadResult.failed }}</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showBulkUpload = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="bulkUploading">
              <Icon v-if="bulkUploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ bulkUploading ? 'Uploading...' : 'Upload All' }}
            </Button>
          </DialogFooter>
        </form>
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MarkedScript, Examination, Classroom, Subject } from '~~/types'
import { useMarkedScripts } from '~~/composables/teacher/useMarkedScripts'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'teacher',
  middleware: 'teacher'
})

const { success: showSuccess, error: showError } = useToast()

const { fetchMarkedScripts, uploadMarkedScript, bulkUploadMarkedScripts, deleteMarkedScript } = useMarkedScripts()
const { apiCall } = useApi()

const scripts = ref<MarkedScript[]>([])
const examinations = ref<Examination[]>([])
const classrooms = ref<Classroom[]>([])
const subjects = ref<Subject[]>([])
const availableStudents = ref<any[]>([])

const loading = ref(false)
const uploading = ref(false)
const bulkUploading = ref(false)
const showUploadDialog = ref(false)
const showBulkUpload = ref(false)

const filterExamination = ref('')
const filterClassroom = ref('')
const filterSubject = ref('')

const uploadData = ref({
  examination: '',
  classroom: '',
  subject: '',
  student: '',
  file: null as File | null
})

const bulkData = ref({
  csv: null as File | null,
  pdfs: [] as File[]
})

const bulkUploadResult = ref<{ uploaded: number; failed: number } | null>(null)

const loadScripts = async () => {
  loading.value = true
  const { data, error } = await fetchMarkedScripts()

  if (data) {
    let filtered = data

    if (filterExamination.value) {
      filtered = filtered.filter(s => s.examination === parseInt(filterExamination.value))
    }
    if (filterClassroom.value) {
      filtered = filtered.filter(s => s.classroom === parseInt(filterClassroom.value))
    }
    if (filterSubject.value) {
      filtered = filtered.filter(s => s.subject === parseInt(filterSubject.value))
    }

    scripts.value = filtered
  } else if (error) {
    showError('Failed to load scripts', String(error))
  }

  loading.value = false
}

const loadReferences = async () => {
  const [examsRes, classroomsRes, subjectsRes] = await Promise.all([
    apiCall<Examination[]>('/academic/assessments/'),
    apiCall<Classroom[]>('/academic/classrooms/'),
    apiCall<Subject[]>('/academic/subjects/')
  ])

  if (examsRes.data) examinations.value = examsRes.data
  if (classroomsRes.data) classrooms.value = classroomsRes.data
  if (subjectsRes.data) subjects.value = subjectsRes.data
}

const loadStudentsForClassroom = async () => {
  if (!uploadData.value.classroom) {
    availableStudents.value = []
    return
  }

  const { data, error } = await apiCall<any[]>(`/academic/classrooms/${uploadData.value.classroom}/students/`)

  if (data) {
    availableStudents.value = data
  } else if (error) {
    showError('Failed to load students', String(error))
    availableStudents.value = []
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadData.value.file = target.files[0]
  }
}

const handleBulkCSVSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    bulkData.value.csv = target.files[0]
  }
}

const handleBulkPDFsSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    bulkData.value.pdfs = Array.from(target.files)
  }
}

const handleUpload = async () => {
  if (!uploadData.value.file) return

  uploading.value = true

  const formData = new FormData()
  formData.append('examination', uploadData.value.examination)
  formData.append('classroom', uploadData.value.classroom)
  formData.append('subject', uploadData.value.subject)
  formData.append('file', uploadData.value.file)

  const { data, error } = await uploadMarkedScript(formData)

  if (data) {
    showSuccessToast('Script uploaded successfully')
    showUploadDialog.value = false
    uploadData.value = {
      examination: '',
      classroom: '',
      subject: '',
      file: null
    }
    await loadScripts()
  } else {
    showError('Failed to upload script', {
      description: String(error)
    })
  }

  uploading.value = false
}

const handleBulkUpload = async () => {
  if (!bulkData.value.csv || bulkData.value.pdfs.length === 0) return

  bulkUploading.value = true
  bulkUploadResult.value = null

  const formData = new FormData()
  formData.append('csv_file', bulkData.value.csv)

  bulkData.value.pdfs.forEach((pdf) => {
    formData.append('pdf_files', pdf)
  })

  const { data, error } = await bulkUploadMarkedScripts(formData)

  if (data) {
    bulkUploadResult.value = data
    showSuccessToast(`Bulk upload completed`, {
      description: `${data.uploaded} uploaded, ${data.failed} failed`
    })
    await loadScripts()
  } else {
    showError('Bulk upload failed', {
      description: String(error)
    })
  }

  bulkUploading.value = false
}

const downloadScript = (script: MarkedScript) => {
  window.open(script.file, '_blank')
}

const confirmDelete = async (script: MarkedScript) => {
  if (!confirm(`Are you sure you want to delete this script for ${script.examination_name}?`)) return

  const { error } = await deleteMarkedScript(script.id!)

  if (!error) {
    showSuccessToast('Script deleted successfully')
    await loadScripts()
  } else {
    showError('Failed to delete script', {
      description: String(error)
    })
  }
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await loadReferences()
  await loadScripts()
})
</script>
