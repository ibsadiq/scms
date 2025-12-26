<!-- pages/admin/students/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Students</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage student records and enrollments</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button variant="outline" @click="showBulkUpload = true" class="w-full sm:w-auto">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="navigateTo('/admin/students/create')" class="w-full sm:w-auto">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Student
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Students</CardTitle>
            <CardDescription class="text-sm">View and manage student records</CardDescription>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <select
              v-model="filterStatus"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
            <select
              v-model="filterGradeLevel"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Grade Levels</option>
              <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
            <select
              v-model="filterClassLevel"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Class Levels</option>
              <option v-for="classLevel in classLevels" :key="classLevel.id" :value="classLevel.id">
                {{ classLevel.name }}
              </option>
            </select>
            <Input
              v-model="searchQuery"
              placeholder="Search students..."
              class="w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading students...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="students.length === 0" class="text-center py-12">
          <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No students found</p>
          <Button @click="navigateTo('/admin/students/create')" variant="outline" class="mt-4">
            Enroll Your First Student
          </Button>
        </div>

        <!-- Mobile: Card List -->
        <div v-else>
          <div class="block lg:hidden space-y-3">
            <Card v-for="(student, index) in students" :key="student.id" class="hover:shadow-md transition-shadow">
              <CardContent class="p-4">
                <div class="space-y-3">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}.</span>
                        <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate capitalize">
                          {{ student.first_name }} {{ student.last_name }}
                        </h3>
                      </div>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {{ student.admission_number }}
                      </p>
                    </div>
                    <Badge :variant="getStatusVariant(student.status)" class="flex-shrink-0">
                      {{ student.status }}
                    </Badge>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Admission No.</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.admission_number }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Gender</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.gender }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Grade Level</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.grade_level_name || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Class Level</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.class_level_display || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Classroom</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.classroom_name || 'Unassigned' }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" @click="navigateTo(`/admin/students/${student.id}`)" class="flex-1">
                      <Icon name="lucide:eye" class="w-4 h-4 mr-1.5" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" @click="navigateTo(`/admin/students/${student.id}?edit=true`)" class="flex-1">
                      <Icon name="lucide:pencil" class="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" @click="openDeleteDialog(student)">
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
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
                <TableHead class="w-16">#</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Class Level</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(student, index) in students" :key="student.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <TableCell class="font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}</TableCell>
                <TableCell class="font-medium">{{ student.admission_number }}</TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{{ student.first_name }} {{ student.last_name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.parent_contact || 'No contact' }}</p>
                  </div>
                </TableCell>
                <TableCell>{{ student.gender }}</TableCell>
                <TableCell>{{ student.grade_level_name || '-' }}</TableCell>
                <TableCell>{{ student.class_level_display || '-' }}</TableCell>
                <TableCell>{{ student.classroom_display || 'Unassigned' }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(student.status)">
                    {{ student.status }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="navigateTo(`/admin/students/${student.id}`)">
                        <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="navigateTo(`/admin/students/${student.id}?edit=true`)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="openDeleteDialog(student)" class="text-red-600">
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

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} students
            </p>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="currentPage--"
                :disabled="currentPage === 1"
              >
                <Icon name="lucide:chevron-left" class="w-4 h-4" />
                Previous
              </Button>

              <!-- Page numbers (show first, last, and current +/- 2) -->
              <template v-for="page in getPageNumbers()" :key="page">
                <span v-if="page === '...'" class="px-3 py-2 text-neutral-400">...</span>
                <Button
                  v-else
                  variant="outline"
                  size="sm"
                  @click="currentPage = page"
                  :class="{ 'bg-primary text-primary-foreground': currentPage === page }"
                >
                  {{ page }}
                </Button>
              </template>

              <Button
                variant="outline"
                size="sm"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                Next
                <Icon name="lucide:chevron-right" class="w-4 h-4" />
              </Button>
            </div>
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
            This will permanently delete <strong>{{ studentToDelete?.first_name }} {{ studentToDelete?.last_name }}</strong> from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Student
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription class="text-sm">
            Upload multiple student records from an Excel file
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Upload an Excel file with student data (columns: admission_number, first_name, last_name, etc.)
            </p>
          </div>

          <Alert v-if="uploadError" variant="destructive">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ uploadError }}</AlertDescription>
          </Alert>

          <Alert v-if="uploadSuccess" class="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle class="text-green-900 dark:text-green-100">Success</AlertTitle>
            <AlertDescription class="text-green-800 dark:text-green-200">
              Students uploaded successfully!
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button variant="outline" @click="showBulkUpload = false" class="w-full sm:w-auto">Cancel</Button>
          <Button @click="handleBulkUpload" :disabled="!selectedFile || uploading" class="w-full sm:w-auto">
            <Icon v-if="uploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </Button>
        </DialogFooter>
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
import type { Student, GradeLevel, ClassLevel } from '~~/types'
import { useStudents, type StudentFilters } from '~~/composables/admin/useStudents'
import { useApi } from '~~/composables/useApi'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { fetchStudents, deleteStudent, uploadBulkStudents } = useStudents()
const { apiCall } = useApi()

const loading = ref(true)
const students = ref<Student[]>([])
const gradeLevels = ref<GradeLevel[]>([])
const classLevels = ref<ClassLevel[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterGradeLevel = ref('')
const filterClassLevel = ref('')
const showBulkUpload = ref(false)
const showDeleteDialog = ref(false)
const studentToDelete = ref<Student | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Debounce search - only search after 3 characters
const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Only search if user has typed at least 3 characters, or if the field is empty (to show all results)
    if (newValue.length === 0 || newValue.length >= 3) {
      debouncedSearch.value = newValue
      currentPage.value = 1 // Reset to first page on search
    }
  }, 300)
})

// Watch filters to reload data
watch([filterStatus, filterGradeLevel, filterClassLevel, debouncedSearch, currentPage], () => {
  loadData()
})

// Helper function to generate page numbers for pagination
const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxPagesToShow = 5

  if (totalPages.value <= maxPagesToShow) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate range around current page
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Active':
      return 'default'
    case 'Inactive':
      return 'secondary'
    case 'Graduated':
      return 'outline'
    case 'Withdrawn':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const loadData = async () => {
  loading.value = true

  // Build filters
  const filters: StudentFilters = {
    page: currentPage.value,
    page_size: pageSize.value
  }

  if (debouncedSearch.value) {
    filters.search = debouncedSearch.value
  }

  if (filterStatus.value) {
    filters.status = filterStatus.value
  }

  if (filterGradeLevel.value) {
    filters.grade_level = parseInt(filterGradeLevel.value)
  }

  if (filterClassLevel.value) {
    filters.class_level = filterClassLevel.value
  }

  const [studentsRes, gradeLevelsRes, classLevelsRes] = await Promise.all([
    fetchStudents(filters),
    apiCall<GradeLevel[]>('/academic/grade-levels/'),
    apiCall<ClassLevel[]>('/academic/class-levels/')
  ])

  if (studentsRes.data) {
    students.value = studentsRes.data.results
    totalCount.value = studentsRes.data.count
  }
  if (gradeLevelsRes.data) gradeLevels.value = gradeLevelsRes.data
  if (classLevelsRes.data) classLevels.value = classLevelsRes.data

  loading.value = false
}

const openDeleteDialog = (student: Student) => {
  studentToDelete.value = student
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!studentToDelete.value) return

  const { success, error: showError } = useToast()
  const { error } = await deleteStudent(studentToDelete.value.id!)

  if (!error) {
    students.value = students.value.filter(s => s.id !== studentToDelete.value!.id)
    success('Student deleted', `${studentToDelete.value.first_name} ${studentToDelete.value.last_name} has been removed from the system`)
  } else {
    showError('Failed to delete student', error)
  }

  showDeleteDialog.value = false
  studentToDelete.value = null
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

  const { error } = await uploadBulkStudents(selectedFile.value)

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
