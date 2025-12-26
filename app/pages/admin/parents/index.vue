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
        <Button @click="navigateTo('/admin/parents/create')" class="w-full sm:w-auto">
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
          <Button @click="navigateTo('/admin/parents/create')" variant="outline" class="mt-4 w-full sm:w-auto">
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
import type { Parent } from '~~/types'
import { useParents } from '~~/composables/admin/useParents'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { fetchParents, deleteParent, uploadBulkParents } = useParents()

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

onMounted(() => {
  loadData()
})
</script>
