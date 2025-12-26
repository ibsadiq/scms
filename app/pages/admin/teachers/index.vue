<!-- pages/admin/teachers/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Teachers</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage teaching staff and their assignments</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button variant="outline" @click="showBulkUpload = true" class="w-full sm:w-auto">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="navigateTo('/admin/teachers/create')" class="w-full sm:w-auto">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Teacher
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Teachers</CardTitle>
            <CardDescription class="text-sm">View and manage teaching staff records</CardDescription>
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
            </select>
            <Input
              v-model="searchQuery"
              placeholder="Search teachers..."
              class="w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading teachers...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTeachers.length === 0" class="text-center py-12">
          <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No teachers found</p>
          <Button @click="navigateTo('/admin/teachers/create')" variant="outline" class="mt-4">
            Add Your First Teacher
          </Button>
        </div>

        <!-- Mobile: Card List -->
        <div v-else>
          <div class="block lg:hidden space-y-3">
            <Card v-for="(teacher, index) in filteredTeachers" :key="teacher.id" class="hover:shadow-md transition-shadow">
              <CardContent class="p-4">
                <div class="space-y-3">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}.</span>
                        <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                          {{ teacher.first_name }} {{ teacher.last_name }}
                        </h3>
                      </div>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {{ teacher.designation || 'No designation' }}
                      </p>
                    </div>
                    <Badge :variant="teacher.inactive ? 'destructive' : 'default'" class="flex-shrink-0">
                      {{ teacher.inactive ? 'Inactive' : 'Active' }}
                    </Badge>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Employee No.</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.empId || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Subjects</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.subject_specialization_display?.length || 0 }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Email</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ teacher.email }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Phone</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.phone_number || '-' }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" @click="navigateTo(`/admin/teachers/${teacher.id}`)" class="flex-1">
                      <Icon name="lucide:eye" class="w-4 h-4 mr-1.5" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" @click="navigateTo(`/admin/teachers/${teacher.id}?edit=true`)" class="flex-1">
                      <Icon name="lucide:pencil" class="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" @click="openDeleteDialog(teacher)">
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
                <TableHead>Employee No.</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(teacher, index) in filteredTeachers" :key="teacher.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <TableCell class="font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}</TableCell>
                <TableCell class="font-medium">{{ teacher.empId || '-' }}</TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ teacher.first_name }} {{ teacher.last_name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ teacher.designation || 'No designation' }}</p>
                  </div>
                </TableCell>
                <TableCell>{{ teacher.email }}</TableCell>
                <TableCell>{{ teacher.phone_number || '-' }}</TableCell>
                <TableCell>
                  <div v-if="teacher.subject_specialization_display && teacher.subject_specialization_display.length > 0">
                    <p class="text-sm">{{ teacher.subject_specialization_display.slice(0, 2).join(', ') }}</p>
                    <p v-if="teacher.subject_specialization_display.length > 2" class="text-xs text-neutral-500">
                      +{{ teacher.subject_specialization_display.length - 2 }} more
                    </p>
                  </div>
                  <span v-else class="text-neutral-400">-</span>
                </TableCell>
                <TableCell>
                  <Badge :variant="teacher.inactive ? 'destructive' : 'default'">
                    {{ teacher.inactive ? 'Inactive' : 'Active' }}
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
                      <DropdownMenuItem @click="navigateTo(`/admin/teachers/${teacher.id}`)">
                        <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="navigateTo(`/admin/teachers/${teacher.id}?edit=true`)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="openDeleteDialog(teacher)" class="text-red-600">
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
            This will permanently delete <strong>{{ teacherToDelete?.first_name }} {{ teacherToDelete?.last_name }}</strong> from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Teacher
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Teachers</DialogTitle>
          <DialogDescription class="text-sm">
            Upload multiple teacher records from an Excel file
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
              Upload an Excel file with teacher data (columns: employee_number, first_name, last_name, email, etc.)
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
              Teachers uploaded successfully!
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
import type { Teacher } from '~~/types'
import { useTeachers } from '~~/composables/admin/useTeachers'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { fetchTeachers, deleteTeacher, uploadBulkTeachers } = useTeachers()

const loading = ref(true)
const teachers = ref<Teacher[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const showBulkUpload = ref(false)
const showDeleteDialog = ref(false)
const teacherToDelete = ref<Teacher | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)

const filteredTeachers = computed(() => {
  let filtered = teachers.value

  if (filterStatus.value) {
    const isInactive = filterStatus.value === 'Inactive'
    filtered = filtered.filter(t => t.inactive === isInactive)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.first_name.toLowerCase().includes(query) ||
      t.last_name.toLowerCase().includes(query) ||
      (t.empId && t.empId.toLowerCase().includes(query)) ||
      t.email?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const loadData = async () => {
  loading.value = true
  const { data, error } = await fetchTeachers()

  if (data) {
    teachers.value = data
  } else if (error) {
    console.error('Failed to load teachers:', error)
  }

  loading.value = false
}

const openDeleteDialog = (teacher: Teacher) => {
  teacherToDelete.value = teacher
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!teacherToDelete.value) return

  const { success, error: showError } = useToast()
  const { error } = await deleteTeacher(teacherToDelete.value.id!)

  if (!error) {
    teachers.value = teachers.value.filter(t => t.id !== teacherToDelete.value!.id)
    success('Teacher deleted', `${teacherToDelete.value.first_name} ${teacherToDelete.value.last_name} has been removed from the system`)
  } else {
    showError('Failed to delete teacher', error)
  }

  showDeleteDialog.value = false
  teacherToDelete.value = null
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

  const { error } = await uploadBulkTeachers(selectedFile.value)

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
