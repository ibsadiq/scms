<!-- pages/admin/grade-levels/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Grade Levels</h1>
        <p class="text-neutral-600 mt-1">Manage school grade levels</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Grade Level
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>All Grade Levels</CardTitle>
        <CardDescription>View and manage grade levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
        </div>

        <div v-else-if="gradeLevels.length === 0" class="text-center py-12">
          <Icon name="lucide:graduation-cap" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500">No grade levels found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Grade Level
          </Button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="grade in gradeLevels"
            :key="grade.id"
            class="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-xl">{{ grade.name }}</CardTitle>
                <div class="flex gap-2">
                  <Button variant="ghost" size="sm" @click="editGrade(grade)">
                    <Icon name="lucide:pencil" class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="handleDelete(grade)" class="text-red-600">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingGrade ? 'Edit Grade Level' : 'Create Grade Level' }}</DialogTitle>
          <DialogDescription>
            {{ editingGrade ? 'Update grade level information' : 'Add a new grade level' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Grade Level Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., Form 1, Grade 7, Year 1"
              required
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Enter the name of the grade level (e.g., Form 1, Grade 7, Year 1)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingGrade ? 'Update' : 'Create') }}
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

interface GradeLevel {
  id?: number
  name: string
}

const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const gradeLevels = ref<GradeLevel[]>([])
const showCreateDialog = ref(false)
const editingGrade = ref<GradeLevel | null>(null)

const formData = ref<GradeLevel>({
  name: ''
})

const loadGradeLevels = async () => {
  loading.value = true
  const { data } = await apiCall<GradeLevel[]>('/academic/grade-levels/')
  if (data) {
    gradeLevels.value = data
  }
  loading.value = false
}

const handleSubmit = async () => {
  saving.value = true

  if (editingGrade.value) {
    const { data, error: apiError } = await apiCall<GradeLevel>(
      `/academic/grade-levels/${editingGrade.value.id}/`,
      { method: 'PATCH', body: { name: formData.value.name } }
    )
    if (data) {
      const index = gradeLevels.value.findIndex(g => g.id === editingGrade.value!.id)
      if (index !== -1) gradeLevels.value[index] = data
      toast.success('Grade level updated successfully')
      closeDialog()
    } else {
      toast.error('Failed to update grade level', {
        description: apiError || 'An unexpected error occurred. Please try again.'
      })
    }
  } else {
    // When creating, only send the name - backend will auto-generate the ID
    const { data, error: apiError } = await apiCall<GradeLevel>(
      '/academic/grade-levels/',
      { method: 'POST', body: { name: formData.value.name } }
    )
    if (data) {
      gradeLevels.value.push(data)
      toast.success('Grade level created successfully')
      closeDialog()
    } else {
      toast.error('Failed to create grade level', {
        description: apiError || 'An unexpected error occurred. Please try again.'
      })
    }
  }

  saving.value = false
}

const editGrade = (grade: GradeLevel) => {
  editingGrade.value = grade
  formData.value = { ...grade }
  showCreateDialog.value = true
}

const handleDelete = async (grade: GradeLevel) => {
  if (!confirm(`Are you sure you want to delete "${grade.name}"?`)) return

  const { error: apiError } = await apiCall(`/academic/grade-levels/${grade.id}/`, {
    method: 'DELETE'
  })

  if (!apiError) {
    gradeLevels.value = gradeLevels.value.filter(g => g.id !== grade.id)
    toast.success('Grade level deleted successfully')
  } else {
    toast.error('Failed to delete grade level', {
      description: apiError
    })
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingGrade.value = null
  formData.value = { name: '' }
}

onMounted(() => {
  loadGradeLevels()
})
</script>