<!-- pages/admin/subjects/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Subjects</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage academic subjects</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button variant="outline" @click="showBulkUpload = true" class="w-full sm:w-auto">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Subject
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="flex flex-col gap-3 sm:gap-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Subjects</CardTitle>
            <CardDescription class="text-sm">View and manage subjects</CardDescription>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <select
              v-model="filterDepartment"
              class="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Departments</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
            <Input
              v-model="searchQuery"
              placeholder="Search subjects..."
              class="w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading subjects...</p>
        </div>

        <div v-else-if="filteredSubjects.length === 0" class="text-center py-12">
          <Icon name="lucide:book-open" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">No subjects found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4 w-full sm:w-auto">
            Create Your First Subject
          </Button>
        </div>

        <div v-else>
          <!-- Mobile: Card List -->
          <div class="block lg:hidden space-y-3">
            <Card
              v-for="subject in filteredSubjects"
              :key="subject.id"
              class="hover:shadow-md transition-shadow"
            >
              <CardContent class="p-4">
                <div class="space-y-3">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                        {{ subject.name }}
                      </h3>
                      <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {{ getDepartmentName(subject.department) }}
                      </p>
                    </div>
                    <Badge variant="outline" class="flex-shrink-0 text-xs">
                      {{ subject.subject_code || 'N/A' }}
                    </Badge>
                  </div>

                  <!-- Badges -->
                  <div class="flex items-center gap-2 flex-wrap">
                    <Badge v-if="subject.is_selectable" variant="secondary" class="text-xs">
                      Optional
                    </Badge>
                    <Badge v-else variant="default" class="text-xs">
                      Required
                    </Badge>
                    <div class="flex items-center gap-1">
                      <Icon
                        :name="subject.graded ? 'lucide:check-circle' : 'lucide:x-circle'"
                        :class="subject.graded ? 'text-green-600' : 'text-neutral-400'"
                        class="w-4 h-4"
                      />
                      <span class="text-xs text-neutral-600 dark:text-neutral-400">
                        {{ subject.graded ? 'Graded' : 'Not Graded' }}
                      </span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="grid grid-cols-3 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="navigateTo(`/admin/subjects/${subject.id}`)"
                      class="w-full text-xs"
                    >
                      <Icon name="lucide:eye" class="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="navigateTo(`/admin/subjects/${subject.id}?edit=true`)"
                      class="w-full text-xs"
                    >
                      <Icon name="lucide:pencil" class="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="openDeleteDialog(subject)"
                      class="w-full text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
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
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Graded</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="subject in filteredSubjects" :key="subject.id">
                  <TableCell class="font-medium">{{ subject.name }}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{{ subject.subject_code || '-' }}</Badge>
                  </TableCell>
                  <TableCell>{{ getDepartmentName(subject.department) }}</TableCell>
                  <TableCell>
                    <Badge v-if="subject.is_selectable" variant="secondary">Optional</Badge>
                    <Badge v-else variant="default">Required</Badge>
                  </TableCell>
                  <TableCell>
                    <Icon
                      :name="subject.graded ? 'lucide:check-circle' : 'lucide:x-circle'"
                      :class="subject.graded ? 'text-green-600' : 'text-neutral-400'"
                      class="w-5 h-5"
                    />
                  </TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="sm">
                          <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="navigateTo(`/admin/subjects/${subject.id}`)">
                          <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="navigateTo(`/admin/subjects/${subject.id}?edit=true`)">
                          <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="openDeleteDialog(subject)" class="text-red-600">
                          <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{{ subjectToDelete?.name }}</strong> from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Subject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg sm:text-xl">Bulk Upload Subjects</DialogTitle>
          <DialogDescription class="text-sm">
            Upload multiple subjects from an Excel file
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="file" class="text-sm">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
              class="text-sm"
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Upload an Excel file with subject data
            </p>
          </div>

          <Alert v-if="uploadError" variant="destructive" class="text-sm">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle class="text-sm">Error</AlertTitle>
            <AlertDescription class="text-xs">{{ uploadError }}</AlertDescription>
          </Alert>

          <Alert v-if="uploadSuccess" class="border-green-200 bg-green-50 text-sm">
            <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600" />
            <AlertTitle class="text-sm text-green-900">Success</AlertTitle>
            <AlertDescription class="text-xs text-green-800">
              Subjects uploaded successfully!
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button variant="outline" @click="showBulkUpload = false" class="w-full sm:w-auto">
            Cancel
          </Button>
          <Button @click="handleBulkUpload" :disabled="!selectedFile || uploading" class="w-full sm:w-auto">
            <Icon v-if="uploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Create Subject Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Subject</DialogTitle>
          <DialogDescription>Add a new subject to the curriculum</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleCreateSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="create_name">Subject Name *</Label>
              <Input
                id="create_name"
                v-model="createFormData.name"
                placeholder="e.g., Mathematics"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="create_subject_code">Subject Code</Label>
              <Input
                id="create_subject_code"
                v-model="createFormData.subject_code"
                placeholder="e.g., MATH101"
                maxlength="10"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="create_department">Department *</Label>
            <select
              id="create_department"
              v-model="createFormData.department"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              required
            >
              <option value="">Select department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="create_description">Description</Label>
            <Textarea
              id="create_description"
              v-model="createFormData.description"
              placeholder="Brief description of the subject..."
              rows="3"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="create_is_selectable"
                  v-model="createFormData.is_selectable"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="create_is_selectable" class="font-normal cursor-pointer">
                  Optional Subject
                </Label>
              </div>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Check if this subject is optional for students</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="create_graded"
                  v-model="createFormData.graded"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="create_graded" class="font-normal cursor-pointer">
                  Graded Subject
                </Label>
              </div>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Check if teachers can submit grades for this subject</p>
            </div>
          </div>

          <DialogFooter class="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" @click="showCreateDialog = false" class="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" :disabled="creating || !createFormData.department" class="w-full sm:w-auto">
              <Icon v-if="creating" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ creating ? 'Creating...' : 'Create Subject' }}
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useApi } from '~~/composables/useApi'
import { useToast } from '~~/composables/useToast'


definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Subject {
  id?: number
  name: string
  subject_code: string | null
  department: number | string
  is_selectable: boolean
  graded: boolean
  description: string
}

interface Department {
  id: number
  name: string
  order_rank: number | null
}

const { apiCall } = useApi()
const { success, error: showError } = useToast()

const loading = ref(true)
const subjects = ref<Subject[]>([])
const departments = ref<Department[]>([])
const searchQuery = ref('')
const filterDepartment = ref('')
const showBulkUpload = ref(false)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)

const showCreateDialog = ref(false)
const creating = ref(false)
const createFormData = ref({
  name: '',
  subject_code: '',
  department: '' as string | number,
  is_selectable: false,
  graded: true,
  description: ''
})

const showDeleteDialog = ref(false)
const subjectToDelete = ref<Subject | null>(null)

const filteredSubjects = computed(() => {
  let filtered = subjects.value

  if (filterDepartment.value) {
    filtered = filtered.filter(s => s.department === parseInt(filterDepartment.value))
  }

  if (searchQuery.value) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.subject_code?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const getDepartmentName = (deptId: number | string) => {
  const dept = departments.value.find(d => d.id === (typeof deptId === 'string' ? parseInt(deptId) : deptId))
  return dept?.name || 'Unknown'
}

const loadData = async () => {
  loading.value = true
  
  const [subjectsRes, deptsRes] = await Promise.all([
    apiCall<Subject[]>('/academic/subjects/'),
    apiCall<Department[]>('/academic/departments/')
  ])

  if (subjectsRes.data) subjects.value = subjectsRes.data
  if (deptsRes.data) departments.value = deptsRes.data

  loading.value = false
}

const openDeleteDialog = (subject: Subject) => {
  subjectToDelete.value = subject
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!subjectToDelete.value?.id) return

  const { error } = await apiCall(`/academic/subjects/${subjectToDelete.value.id}/`, {
    method: 'DELETE'
  })

  if (!error) {
    subjects.value = subjects.value.filter(s => s.id !== subjectToDelete.value?.id)
    success('Subject deleted successfully')
    showDeleteDialog.value = false
    subjectToDelete.value = null
  } else {
    showError(error, 'Failed to delete subject')
  }
}

const handleCreateSubmit = async () => {
  creating.value = true

  const { data, error: apiError } = await apiCall<Subject>('/academic/subjects/', {
    method: 'POST',
    body: createFormData.value
  })

  if (data) {
    success('Subject created successfully')
    showCreateDialog.value = false
    // Reset form
    createFormData.value = {
      name: '',
      subject_code: '',
      department: '',
      is_selectable: false,
      graded: true,
      description: ''
    }
    // Reload subjects list
    await loadData()
  } else {
    showError(apiError, 'Failed to create subject')
  }

  creating.value = false
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleBulkUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  const { error } = await apiCall('/academic/subjects/bulk-upload/', {
    method: 'POST',
    body: formData
  })

  if (!error) {
    uploadSuccess.value = true
    setTimeout(() => {
      showBulkUpload.value = false
      selectedFile.value = null
      uploadSuccess.value = false
      loadData()
    }, 1500)
  } else {
    uploadError.value = error
  }

  uploading.value = false
}

onMounted(() => {
  loadData()
})
</script>