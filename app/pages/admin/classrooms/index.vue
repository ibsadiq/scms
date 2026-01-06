<!-- pages/admin/classrooms/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Classrooms</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage school classrooms</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button variant="outline" @click="showBulkUpload = true" class="w-full sm:w-auto">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Classroom
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Classrooms</CardTitle>
            <CardDescription class="text-sm">View and manage classrooms</CardDescription>
          </div>
          <Input
            v-model="searchQuery"
            placeholder="Search classrooms..."
            class="w-full sm:w-64"
          />
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading classrooms...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredClassrooms.length === 0" class="text-center py-12">
          <Icon name="lucide:door-open" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No classrooms found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Classroom
          </Button>
        </div>

        <!-- Classroom Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card
            v-for="classroom in filteredClassrooms"
            :key="classroom.id"
            class="hover:shadow-md transition-shadow cursor-pointer"
            @click="navigateTo(`/admin/classrooms/${classroom.id}`)"
          >
            <CardHeader class="p-4">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <CardTitle class="text-base sm:text-lg truncate">{{ classroom.name_display || classroom.name }}</CardTitle>
                    <Badge v-if="classroom.stream_name" variant="outline" class="flex-shrink-0 text-xs">
                      {{ classroom.stream_name }}
                    </Badge>
                  </div>
                  <CardDescription class="text-sm truncate" v-if="classroom.class_teacher_name">
                    Teacher: {{ classroom.class_teacher_name }}
                  </CardDescription>
                </div>
                <Badge :variant="getStatusVariant(classroom.class_status)" class="flex-shrink-0 text-xs">
                  {{ classroom.class_status }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="p-4 pt-0">
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-600 dark:text-neutral-400">Capacity</span>
                  <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ classroom.capacity }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-600 dark:text-neutral-400">Occupied</span>
                  <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ classroom.occupied_sits }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-600 dark:text-neutral-400">Available</span>
                  <span class="font-semibold text-green-600 dark:text-green-400">{{ classroom.available_sits }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Classrooms</DialogTitle>
          <DialogDescription class="text-sm">
            Upload multiple classrooms from an Excel file
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
              Upload an Excel file with classroom data
            </p>
          </div>

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

    <!-- Create Classroom Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Classroom</DialogTitle>
          <DialogDescription>
            Add a new classroom to the school
          </DialogDescription>
        </DialogHeader>

        <!-- Loading State -->
        <div v-if="loadingCreateData" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading form data...</p>
        </div>

        <form v-else @submit.prevent="handleCreateSubmit" class="space-y-4">
          <!-- Class Level Selection -->
          <div class="space-y-2">
            <Label for="class_level">Class Level *</Label>
            <select
              id="class_level"
              v-model.number="createFormData.name"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              required
            >
              <option :value="null" disabled>Select a class level</option>
              <option v-for="level in classLevels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Choose which class level this classroom represents</p>
          </div>

          <!-- Stream Selection -->
          <div class="space-y-2">
            <Label for="stream">Stream</Label>
            <select
              id="stream"
              v-model.number="createFormData.stream"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option :value="null">No stream assigned</option>
              <option v-for="stream in streams" :key="stream.id" :value="stream.id">
                {{ stream.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Optionally assign a stream (e.g., A, B, C)</p>
          </div>

          <!-- Class Teacher Selection -->
          <div class="space-y-2">
            <Label for="class_teacher">Class Teacher *</Label>
            <select
              id="class_teacher"
              v-model.number="createFormData.class_teacher"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              required
            >
              <option :value="null" disabled>Select a class teacher</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.first_name }} {{ teacher.last_name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">Select the teacher who will manage this classroom</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="capacity">Capacity *</Label>
              <Input
                id="capacity"
                v-model.number="createFormData.capacity"
                type="number"
                min="1"
                placeholder="e.g., 40"
                required
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Maximum number of students</p>
            </div>

            <div class="space-y-2">
              <Label for="occupied_sits">Occupied Seats</Label>
              <Input
                id="occupied_sits"
                v-model.number="createFormData.occupied_sits"
                type="number"
                min="0"
                placeholder="e.g., 0"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Currently occupied seats</p>
            </div>
          </div>

          <Alert>
            <Icon name="lucide:info" class="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              Each class level can only have one classroom. Select the class level first, then configure capacity and teacher.
            </AlertDescription>
          </Alert>

          <DialogFooter class="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" @click="showCreateDialog = false" class="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" :disabled="creating" class="w-full sm:w-auto">
              <Icon v-if="creating" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ creating ? 'Creating...' : 'Create Classroom' }}
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApi } from '~~/composables/useApi'
import { useClassrooms } from '~~/composables/admin/useClassrooms'
import { useErrorHandler } from '~~/composables/useErrorHandler'


definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Classroom {
  id: number
  name: string
  stream_name?: string | null
  stream_id?: number | null
  class_teacher: string | null
  class_teacher_name?: string
  capacity: number
  occupied_sits: number
  available_sits: number
  class_status: string
}

interface ClassLevel {
  id: number
  name: string
  grade_level: number | null
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface Stream {
  id: number
  name: string
}

const { apiCall } = useApi()
const { createClassroom } = useClassrooms()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const loading = ref(true)
const classrooms = ref<Classroom[]>([])
const searchQuery = ref('')
const showBulkUpload = ref(false)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

// Create dialog state
const showCreateDialog = ref(false)
const creating = ref(false)
const loadingCreateData = ref(false)
const classLevels = ref<ClassLevel[]>([])
const teachers = ref<Teacher[]>([])
const streams = ref<Stream[]>([])

const createFormData = ref({
  name: null as number | null,  // ClassLevel ID
  stream: null as number | null,
  class_teacher: null as number | null,
  capacity: 40,
  occupied_sits: 0
})

const filteredClassrooms = computed(() => {
  if (!searchQuery.value) return classrooms.value
  return classrooms.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.class_teacher_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getStatusVariant = (status: string) => {
  if (status === 'Full') return 'destructive'
  if (status === 'Available') return 'default'
  return 'secondary'
}

const loadClassrooms = async () => {
  loading.value = true
  const { data } = await apiCall<Classroom[]>('/academic/classrooms/')
  if (data) {
    classrooms.value = data
  }
  loading.value = false
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

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  const { error } = await apiCall('/academic/classrooms/bulk-upload/', {
    method: 'POST',
    body: formData
  })

  if (!error) {
    showSuccessToast('Classrooms uploaded successfully')
    showBulkUpload.value = false
    selectedFile.value = null
    loadClassrooms()
  } else {
    showErrorToast(error || 'An unexpected error occurred. Please try again.' , 'Failed to upload classrooms')
  }

  uploading.value = false
}

// Load reference data for create form
const loadCreateReferences = async () => {
  loadingCreateData.value = true

  const [levelsRes, streamsRes, teachersRes] = await Promise.all([
    apiCall<ClassLevel[]>('/academic/class-levels/'),
    apiCall<Stream[]>('/academic/streams/'),
    apiCall<Teacher[]>('/users/teachers/')
  ])

  if (levelsRes.data) {
    classLevels.value = levelsRes.data
  }

  if (streamsRes.data) {
    streams.value = streamsRes.data
  }

  if (teachersRes.data) {
    teachers.value = teachersRes.data
  }

  loadingCreateData.value = false
}

// Reset create form
const resetCreateForm = () => {
  createFormData.value = {
    name: null,
    stream: null,
    class_teacher: null,
    capacity: 40,
    occupied_sits: 0
  }
}

// Handle create form submission
const handleCreateSubmit = async () => {
  if (!createFormData.value.name) {
    showErrorToast('Please select a class level' , 'Validation error')
    return
  }

  if (!createFormData.value.class_teacher) {
    showErrorToast('Please select a class teacher' , 'Validation error')
    return
  }

  creating.value = true

  // Prepare payload with proper number conversion
  // Note: Sending both 'name' and 'name_id' as backend might expect either
  const payload = {
    name: createFormData.value.name,
    name_id: createFormData.value.name,  // Backend DB column name
    stream: createFormData.value.stream,
    class_teacher: createFormData.value.class_teacher,
    capacity: Number(createFormData.value.capacity) || 40,
    occupied_sits: Number(createFormData.value.occupied_sits) || 0
  }

  const { data, error: apiError } = await createClassroom(payload)

  if (data) {
    showSuccessToast('Classroom created successfully')
    showCreateDialog.value = false
    resetCreateForm()
    loadClassrooms()
  } else {
    showErrorToast(apiError || 'An unexpected error occurred. Please try again.' , 'Failed to create classroom')
  }

  creating.value = false
}

// Watch for dialog open to load references
watch(showCreateDialog, (isOpen) => {
  if (isOpen && classLevels.value.length === 0) {
    loadCreateReferences()
  }
})

onMounted(() => {
  loadClassrooms()
})
</script>