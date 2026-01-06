<!-- pages/admin/departments/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Departments</h1>
        <p class="text-neutral-600 mt-1">Manage academic departments</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Department
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>View and manage departments</CardDescription>
          </div>
          <Input
            v-model="searchQuery"
            placeholder="Search departments..."
            class="w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading departments...</p>
        </div>

        <div v-else-if="filteredDepartments.length === 0" class="text-center py-12">
          <Icon name="lucide:building-2" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500">No departments found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Department
          </Button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="dept in filteredDepartments"
            :key="dept.id"
            class="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                <Icon name="lucide:building-2" class="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <p class="font-semibold text-lg">{{ dept.name }}</p>
                <p class="text-sm text-neutral-500">
                  Order Rank: {{ dept.order_rank || 'Not set' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" @click="editDepartment(dept)">
                <Icon name="lucide:pencil" class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="handleDelete(dept)" class="text-red-600 hover:text-red-700">
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingDept ? 'Edit Department' : 'Create Department' }}</DialogTitle>
          <DialogDescription>
            {{ editingDept ? 'Update department information' : 'Add a new department to the system' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Department Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., Science Department"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="order_rank">Order Rank</Label>
            <Input
              id="order_rank"
              v-model.number="formData.order_rank"
              type="number"
              placeholder="e.g., 1"
            />
            <p class="text-xs text-neutral-500">Used for ordering in reports</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingDept ? 'Update' : 'Create') }}
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
import { useErrorHandler } from '~~/composables/useErrorHandler'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApi } from '~~/composables/useApi'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Department {
  id?: number
  name: string
  order_rank: number | null
}

const { success, error: showError } = useToast()

const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const departments = ref<Department[]>([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingDept = ref<Department | null>(null)

const formData = ref<Department>({
  name: '',
  order_rank: null
})

const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departments.value
  return departments.value.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const loadDepartments = async () => {
  loading.value = true
  const { data } = await apiCall<Department[]>('/academic/departments/')
  if (data) {
    departments.value = data
  }
  loading.value = false
}

const handleSubmit = async () => {
  saving.value = true

  if (editingDept.value) {
    const { data, error: apiError } = await apiCall<Department>(
      `/academic/departments/${editingDept.value.id}/`,
      { method: 'PATCH', body: formData.value }
    )
    if (data) {
      const index = departments.value.findIndex(d => d.id === editingDept.value!.id)
      if (index !== -1) departments.value[index] = data
      showSuccessToast('Department updated successfully')
      closeDialog()
    } else {
      showError('Failed to update department', {
        description: apiError || 'An unexpected error occurred. Please try again.'
      })
    }
  } else {
    const { data, error: apiError } = await apiCall<Department>(
      '/academic/departments/',
      { method: 'POST', body: formData.value }
    )
    if (data) {
      departments.value.push(data)
      showSuccessToast('Department created successfully')
      closeDialog()
    } else {
      showError('Failed to create department', {
        description: apiError || 'An unexpected error occurred. Please try again.'
      })
    }
  }

  saving.value = false
}

const editDepartment = (dept: Department) => {
  editingDept.value = dept
  formData.value = { ...dept }
  showCreateDialog.value = true
}

const handleDelete = async (dept: Department) => {
  if (!confirm(`Are you sure you want to delete "${dept.name}"?`)) return

  const { error: apiError } = await apiCall(`/academic/departments/${dept.id}/`, {
    method: 'DELETE'
  })

  if (!apiError) {
    departments.value = departments.value.filter(d => d.id !== dept.id)
    showSuccessToast('Department deleted successfully')
  } else {
    showError('Failed to delete department', {
      description: apiError
    })
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingDept.value = null
  formData.value = { name: '', order_rank: null }
}

onMounted(() => {
  loadDepartments()
})
</script>