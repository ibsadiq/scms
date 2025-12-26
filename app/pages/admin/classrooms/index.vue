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
        <Button @click="navigateTo('/admin/classrooms/create')" class="w-full sm:w-auto">
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
          <Button @click="navigateTo('/admin/classrooms/create')" variant="outline" class="mt-4">
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
                    <CardTitle class="text-base sm:text-lg truncate">{{ classroom.name }}</CardTitle>
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
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApi } from '~~/composables/useApi'
import { toast } from 'vue-sonner'


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

const { apiCall } = useApi()

const loading = ref(true)
const classrooms = ref<Classroom[]>([])
const searchQuery = ref('')
const showBulkUpload = ref(false)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

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
    toast.success('Classrooms uploaded successfully')
    showBulkUpload.value = false
    selectedFile.value = null
    loadClassrooms()
  } else {
    toast.error('Failed to upload classrooms', { description: error || 'An unexpected error occurred. Please try again.' })
  }

  uploading.value = false
}

onMounted(() => {
  loadClassrooms()
})
</script>