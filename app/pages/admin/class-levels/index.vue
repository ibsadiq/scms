<!-- pages/admin/class-levels/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Class Levels</h1>
        <p class="text-neutral-600 mt-1">Manage school class levels</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Class Level
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>All Class Levels</CardTitle>
        <CardDescription>View and manage class levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
        </div>

        <div v-else-if="classLevels.length === 0" class="text-center py-12">
          <Icon name="lucide:layers" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500">No class levels found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Class Level
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="classLevel in classLevels" :key="classLevel.id">
                <TableCell class="font-medium">{{ classLevel.name }}</TableCell>
                <TableCell>{{ getGradeLevelName(classLevel.grade_level) }}</TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" @click="editClassLevel(classLevel)">
                      <Icon name="lucide:pencil" class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="handleDelete(classLevel)" class="text-red-600">
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

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingClassLevel ? 'Edit Class Level' : 'Create Class Level' }}</DialogTitle>
          <DialogDescription>
            {{ editingClassLevel ? 'Update class level information' : 'Add a new class level' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="grade_level">Grade Level *</Label>
            <select
              id="grade_level"
              v-model="formData.grade_level"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              required
            >
              <option :value="null" disabled>Select grade level</option>
              <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Select the grade level this class belongs to
            </p>
          </div>

          <div class="space-y-2">
            <Label for="name">Class Level Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., Form 1A, JSS 1, SSS 2"
              required
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Enter the specific class name (e.g., JSS 1, Form 1A, Grade 7)
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingClassLevel ? 'Update' : 'Create') }}
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface ClassLevel {
  id?: number
  name: string
  grade_level: number | null
}

interface GradeLevel {
  id: number
  name: string
}

const { success, error: showError } = useToast()

const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const classLevels = ref<ClassLevel[]>([])
const gradeLevels = ref<GradeLevel[]>([])
const showCreateDialog = ref(false)
const editingClassLevel = ref<ClassLevel | null>(null)

const formData = ref<ClassLevel>({
  name: '',
  grade_level: null
})

const getGradeLevelName = (id: number | null) => {
  if (!id) return 'None'
  const grade = gradeLevels.value.find(g => g.id === id)
  return grade?.name || 'Unknown'
}

const loadData = async () => {
  loading.value = true
  const [classLevelsRes, gradeLevelsRes] = await Promise.all([
    apiCall<ClassLevel[]>('/academic/class-levels/'),
    apiCall<GradeLevel[]>('/academic/grade-levels/')
  ])
  
  if (classLevelsRes.data) classLevels.value = classLevelsRes.data
  if (gradeLevelsRes.data) gradeLevels.value = gradeLevelsRes.data
  
  loading.value = false
}

const handleSubmit = async () => {
  saving.value = true

  if (editingClassLevel.value) {
    const { data, error: apiError } = await apiCall<ClassLevel>(
      `/academic/class-levels/${editingClassLevel.value.id}/`,
      { method: 'PATCH', body: { name: formData.value.name, grade_level: formData.value.grade_level } }
    )
    if (data) {
      const index = classLevels.value.findIndex(c => c.id === editingClassLevel.value!.id)
      if (index !== -1) classLevels.value[index] = data
      success('Class level updated successfully')
      closeDialog()
    } else {
      showError('Failed to update class level', apiError || 'An unexpected error occurred. Please try again.')
    }
  } else {
    const { data, error: apiError } = await apiCall<ClassLevel>(
      '/academic/class-levels/',
      { method: 'POST', body: { name: formData.value.name, grade_level: formData.value.grade_level } }
    )
    if (data) {
      classLevels.value.push(data)
      success('Class level created successfully')
      closeDialog()
    } else {
      showError('Failed to create class level', apiError || 'An unexpected error occurred. Please try again.')
    }
  }

  saving.value = false
}

const editClassLevel = (classLevel: ClassLevel) => {
  editingClassLevel.value = classLevel
  formData.value = { ...classLevel }
  showCreateDialog.value = true
}

const handleDelete = async (classLevel: ClassLevel) => {
  if (!confirm(`Are you sure you want to delete "${classLevel.name}"?`)) return

  const { error: apiError } = await apiCall(`/academic/class-levels/${classLevel.id}/`, {
    method: 'DELETE'
  })

  if (!apiError) {
    classLevels.value = classLevels.value.filter(c => c.id !== classLevel.id)
    success('Class level deleted successfully')
  } else {
    showError('Failed to delete class level', apiError || 'An unexpected error occurred.')
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingClassLevel.value = null
  formData.value = { name: '', grade_level: null }
}

onMounted(() => {
  loadData()
})
</script>