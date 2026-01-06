<!-- pages/admin/parents/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Parents & Guardians</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage parent and guardian records</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button variant="outline" @click="showBulkUpload = true" class="w-full sm:w-auto">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Parent/Guardian
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="flex flex-col gap-3 sm:gap-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Parents & Guardians</CardTitle>
            <CardDescription class="text-sm">View and manage parent/guardian records</CardDescription>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <select
              v-model="filterRelationship"
              class="flex h-10 w-full sm:w-auto rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Relationships</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </select>
            <Input
              v-model="searchQuery"
              placeholder="Search parents..."
              class="w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-4 sm:p-6">
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading parents...</p>
        </div>

        <div v-else-if="filteredParents.length === 0" class="text-center py-12">
          <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">No parents found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4 w-full sm:w-auto">
            Add Your First Parent/Guardian
          </Button>
        </div>

        <div v-else>
          <!-- Mobile: Card List -->
          <div class="block lg:hidden space-y-3">
            <Card
              v-for="(parent, index) in filteredParents"
              :key="parent.id"
              class="hover:shadow-md transition-shadow"
            >
              <CardContent class="p-4">
                <div class="space-y-3">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}.</span>
                        <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                          {{ parent.first_name }} {{ parent.last_name }}
                        </h3>
                      </div>
                      <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {{ parent.occupation || 'No occupation specified' }}
                      </p>
                    </div>
                    <Badge variant="outline" class="flex-shrink-0 text-xs">
                      {{ parent.parent_type }}
                    </Badge>
                  </div>

                  <!-- Contact Info -->
                  <div class="space-y-1 text-sm">
                    <div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Icon name="lucide:phone" class="w-4 h-4 flex-shrink-0" />
                      <span class="truncate">{{ parent.phone_number }}</span>
                    </div>
                    <div v-if="parent.email" class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Icon name="lucide:mail" class="w-4 h-4 flex-shrink-0" />
                      <span class="truncate">{{ parent.email }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Icon name="lucide:users" class="w-4 h-4 flex-shrink-0" />
                      <span>{{ parent.children_details?.length || 0 }} Student(s)</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="grid grid-cols-3 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="navigateTo(`/admin/parents/${parent.id}`)"
                      class="w-full text-xs"
                    >
                      <Icon name="lucide:eye" class="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="navigateTo(`/admin/parents/${parent.id}?edit=true`)"
                      class="w-full text-xs"
                    >
                      <Icon name="lucide:pencil" class="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="openDeleteDialog(parent)"
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
                  <TableHead class="w-16">#</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(parent, index) in filteredParents" :key="parent.id">
                  <TableCell class="font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}</TableCell>
                  <TableCell>
                    <div>
                      <p class="font-medium">{{ parent.first_name }} {{ parent.last_name }}</p>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ parent.occupation || 'No occupation specified' }}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{{ parent.parent_type }}</Badge>
                  </TableCell>
                  <TableCell>{{ parent.email || '-' }}</TableCell>
                  <TableCell>{{ parent.phone_number }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Icon name="lucide:users" class="w-4 h-4 text-neutral-400" />
                      <span class="text-sm">{{ parent.children_details?.length || 0 }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="sm">
                          <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="navigateTo(`/admin/parents/${parent.id}`)">
                          <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="navigateTo(`/admin/parents/${parent.id}?edit=true`)">
                          <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="openDeleteDialog(parent)" class="text-red-600 dark:text-red-400">
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
            This will permanently delete <strong>{{ parentToDelete?.first_name }} {{ parentToDelete?.last_name }}</strong> from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Parent/Guardian
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-lg sm:text-xl">Bulk Upload Parents</DialogTitle>
          <DialogDescription class="text-sm">
            Upload multiple parent/guardian records from an Excel file
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
              Upload an Excel file with parent data (columns: first_name, last_name, phone, relationship, etc.)
            </p>
          </div>

          <Alert v-if="uploadError" variant="destructive" class="text-sm">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle class="text-sm">Error</AlertTitle>
            <AlertDescription class="text-xs">{{ uploadError }}</AlertDescription>
          </Alert>

          <Alert v-if="uploadSuccess" class="border-green-200 bg-green-50 text-sm dark:bg-green-900/20 dark:border-green-800">
            <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle class="text-sm text-green-900 dark:text-green-100">Success</AlertTitle>
            <AlertDescription class="text-xs text-green-800 dark:text-green-200">
              Parents uploaded successfully!
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

    <!-- Create Parent Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogScrollContent class="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle class="text-lg sm:text-xl">Add New Parent/Guardian</DialogTitle>
          <DialogDescription class="text-sm">
            Register a new parent or guardian
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleCreateSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Personal Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="create_first_name">First Name *</Label>
                <Input
                  id="create_first_name"
                  v-model="createFormData.first_name"
                  placeholder="John"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="create_middle_name">Middle Name</Label>
                <Input
                  id="create_middle_name"
                  v-model="createFormData.middle_name"
                  placeholder="Optional"
                />
              </div>

              <div class="space-y-2">
                <Label for="create_last_name">Last Name *</Label>
                <Input
                  id="create_last_name"
                  v-model="createFormData.last_name"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="create_parent_type">Relationship *</Label>
                <select
                  id="create_parent_type"
                  v-model="createFormData.parent_type"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="create_gender">Gender</Label>
                <select
                  id="create_gender"
                  v-model="createFormData.gender"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="create_national_id">National ID</Label>
                <Input
                  id="create_national_id"
                  v-model="createFormData.national_id"
                  placeholder="National ID number"
                />
              </div>

              <div class="space-y-2">
                <Label for="create_occupation">Occupation</Label>
                <Input
                  id="create_occupation"
                  v-model="createFormData.occupation"
                  placeholder="e.g., Engineer, Teacher"
                />
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 border rounded-lg dark:border-neutral-700">
              <input
                id="create_single_parent"
                v-model="createFormData.single_parent"
                type="checkbox"
                class="w-4 h-4 border-gray-300 rounded"
              />
              <Label for="create_single_parent" class="cursor-pointer">
                Single Parent
              </Label>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Contact Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="create_phone_number">Primary Phone Number *</Label>
                <Input
                  id="create_phone_number"
                  v-model="createFormData.phone_number"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="create_email">Email</Label>
                <Input
                  id="create_email"
                  v-model="createFormData.email"
                  type="email"
                  placeholder="parent@example.com"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="create_alt_email">Alternative Email</Label>
              <Input
                id="create_alt_email"
                v-model="createFormData.alt_email"
                type="email"
                placeholder="alternative@example.com"
              />
            </div>

            <div class="space-y-2">
              <Label for="create_address">Address</Label>
              <Textarea
                id="create_address"
                v-model="createFormData.address"
                placeholder="Enter full address"
                rows="3"
              />
            </div>
          </div>

          <!-- Student Association -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Associated Students</h3>

            <div class="space-y-2">
              <Label for="create_students">Students</Label>
              <div class="space-y-2">
                <!-- Selected Students Display -->
                <div v-if="selectedStudents.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="student in selectedStudents"
                    :key="student.id"
                    class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20"
                  >
                    {{ student.first_name }} {{ student.last_name }} ({{ student.admission_number }})
                    <button
                      type="button"
                      @click="removeStudent(student.id!)"
                      class="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
                    >
                      <Icon name="lucide:x" class="w-3 h-3" />
                    </button>
                  </span>
                </div>

                <!-- Search Input -->
                <div class="relative">
                  <Input
                    v-model="studentSearch"
                    type="text"
                    placeholder="Type at least 3 characters to search students..."
                    @input="handleStudentSearch"
                  />

                  <!-- Loading State -->
                  <div v-if="searchingStudents" class="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin text-neutral-400" />
                  </div>

                  <!-- Search Results Dropdown -->
                  <div
                    v-if="showStudentDropdown && searchResults.length > 0"
                    class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <div class="p-1">
                      <div
                        v-for="student in searchResults"
                        :key="student.id"
                        @click="addStudent(student)"
                        class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-700"
                      >
                        {{ student.first_name }} {{ student.last_name }} ({{ student.admission_number }})
                      </div>
                    </div>
                  </div>

                  <!-- No Results Message -->
                  <div
                    v-else-if="showStudentDropdown && searchResults.length === 0 && studentSearch.length >= 3 && !searchingStudents"
                    class="absolute z-50 w-full mt-1 rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    No students found matching "{{ studentSearch }}"
                  </div>
                </div>
              </div>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Type at least 3 characters to search for students by name or admission number.
              </p>
            </div>
          </div>

          <!-- Account Setup Options -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Account Setup</h3>
            <div class="flex items-start gap-3 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-700">
              <div class="flex items-center h-5">
                <input
                  id="create_send_invitation"
                  v-model="createFormData.send_invitation"
                  type="checkbox"
                  class="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div class="flex-1">
                <Label for="create_send_invitation" class="font-medium cursor-pointer">
                  Send invitation email
                </Label>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  The parent will receive an email invitation to set up their own password and activate their account.
                  If unchecked, a default password will be set automatically.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter class="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" @click="showCreateDialog = false" class="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" :disabled="creating" class="w-full sm:w-auto">
              <Icon v-if="creating" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ creating ? (createFormData.send_invitation ? 'Sending Invitation...' : 'Registering...') : (createFormData.send_invitation ? 'Send Invitation' : 'Register Parent/Guardian') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogScrollContent>
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
  DialogScrollContent,
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
import { Textarea } from '@/components/ui/textarea'
import type { Parent, Student } from '~~/types'
import { useParents } from '~~/composables/admin/useParents'
import { useToast } from '~~/composables/useToast'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { fetchParents, deleteParent, uploadBulkParents, createParent } = useParents()
const { apiCall } = useApi()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const loading = ref(true)
const parents = ref<Parent[]>([])
const searchQuery = ref('')
const filterRelationship = ref('')
const showBulkUpload = ref(false)
const showDeleteDialog = ref(false)
const parentToDelete = ref<Parent | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)

// Create dialog state
const showCreateDialog = ref(false)
const creating = ref(false)

// Student search state
const studentSearch = ref('')
const searchResults = ref<Student[]>([])
const selectedStudents = ref<Student[]>([])
const searchingStudents = ref(false)
const showStudentDropdown = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const createFormData = ref<Partial<Parent & { send_invitation?: boolean; students?: number[] }>>({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  alt_email: '',
  address: '',
  gender: undefined,
  parent_type: 'Father',
  national_id: '',
  occupation: '',
  monthly_income: undefined,
  single_parent: false,
  students: [],
  send_invitation: true
})

const filteredParents = computed(() => {
  let filtered = parents.value

  if (filterRelationship.value) {
    filtered = filtered.filter(p => p.parent_type === filterRelationship.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.first_name.toLowerCase().includes(query) ||
      p.last_name.toLowerCase().includes(query) ||
      p.phone_number.toLowerCase().includes(query) ||
      p.email?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const loadData = async () => {
  loading.value = true

  const { data } = await fetchParents()
  if (data) parents.value = data

  loading.value = false
}

const openDeleteDialog = (parent: Parent) => {
  parentToDelete.value = parent
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!parentToDelete.value) return

  const { success, error: showError } = useToast()
  const { error } = await deleteParent(parentToDelete.value.id!)

  if (!error) {
    parents.value = parents.value.filter(p => p.id !== parentToDelete.value!.id)
    success('Parent deleted', `${parentToDelete.value.first_name} ${parentToDelete.value.last_name} has been removed from the system`)
  } else {
    showError('Failed to delete parent', error)
  }

  showDeleteDialog.value = false
  parentToDelete.value = null
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

  const { error } = await uploadBulkParents(selectedFile.value)

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

// Search for students by name (backend search)
const searchStudents = async (query: string) => {
  if (query.length < 3) {
    searchResults.value = []
    showStudentDropdown.value = false
    return
  }

  searchingStudents.value = true
  showStudentDropdown.value = true

  try {
    const { data } = await apiCall<Student[]>(`/sis/students/?search=${encodeURIComponent(query)}`)
    if (data) {
      // Check if data is an array, if not, it might be paginated
      const students = Array.isArray(data) ? data : (data as any).results || []

      // Filter out already selected students
      searchResults.value = students.filter(
        (student: Student) => !createFormData.value.students?.includes(student.id!)
      )
    } else {
      searchResults.value = []
    }
  } catch (err) {
    console.error('Error searching students:', err)
    searchResults.value = []
  }

  searchingStudents.value = false
}

// Handle student search with debounce
const handleStudentSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    searchStudents(studentSearch.value)
  }, 300) // 300ms debounce
}

// Add student to selection
const addStudent = (student: Student) => {
  if (!createFormData.value.students?.includes(student.id!)) {
    createFormData.value.students = [...(createFormData.value.students || []), student.id!]
    selectedStudents.value = [...selectedStudents.value, student]
  }
  studentSearch.value = ''
  searchResults.value = []
  showStudentDropdown.value = false
}

// Remove student from selection
const removeStudent = (studentId: number) => {
  createFormData.value.students = createFormData.value.students?.filter(id => id !== studentId)
  selectedStudents.value = selectedStudents.value.filter(s => s.id !== studentId)
}

// Reset create form
const resetCreateForm = () => {
  createFormData.value = {
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    alt_email: '',
    address: '',
    gender: undefined,
    parent_type: 'Father',
    national_id: '',
    occupation: '',
    monthly_income: undefined,
    single_parent: false,
    students: [],
    send_invitation: true
  }
  selectedStudents.value = []
  studentSearch.value = ''
  searchResults.value = []
  showStudentDropdown.value = false
}

// Handle create form submission
const handleCreateSubmit = async () => {
  creating.value = true

  const payload = {
    ...createFormData.value,
    // Convert empty date strings to null
    date_of_birth: createFormData.value.date_of_birth || null
  }

  const { data, error: apiError } = await createParent(payload as Parent)

  if (data) {
    // Show success message based on invitation status
    if (createFormData.value.send_invitation) {
      showSuccessToast(
        `Invitation sent to ${createFormData.value.first_name} ${createFormData.value.last_name}`,
        'They will receive an email to set up their account.'
      )
    } else {
      showSuccessToast(`Parent ${createFormData.value.first_name} ${createFormData.value.last_name} registered successfully`)
    }

    // Close dialog and reset form
    showCreateDialog.value = false
    resetCreateForm()

    // Reload parents list
    loadData()
  } else {
    showErrorToast(apiError, 'Failed to register parent/guardian')
  }

  creating.value = false
}

onMounted(() => {
  loadData()
})
</script>
