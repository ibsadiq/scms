<!-- pages/admin/subjects/[id].vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/subjects')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-neutral-900">
          {{ editMode ? 'Edit Subject' : 'Subject Details' }}
        </h1>
        <p class="text-neutral-600 mt-1">
          {{ editMode ? 'Update subject information' : 'View and manage subject information' }}
        </p>
      </div>
      <Button v-if="!editMode" @click="editMode = true">
        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
    </div>

    <!-- Edit Mode -->
    <Card v-else-if="editMode && subject">
      <CardHeader>
        <CardTitle>Subject Details</CardTitle>
        <CardDescription>Modify the information for this subject</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="name">Subject Name *</Label>
              <Input
                id="name"
                v-model="subject.name"
                placeholder="e.g., Mathematics"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="subject_code">Subject Code</Label>
              <Input
                id="subject_code"
                v-model="subject.subject_code"
                placeholder="e.g., MATH101"
                maxlength="10"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="department">Department *</Label>
            <select
              id="department"
              v-model="subject.department"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="subject.description"
              placeholder="Brief description of the subject..."
              rows="3"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="is_selectable"
                  v-model="subject.is_selectable"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="is_selectable" class="font-normal cursor-pointer">
                  Optional Subject
                </Label>
              </div>
              <p class="text-xs text-neutral-500">Check if this subject is optional for students</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="graded"
                  v-model="subject.graded"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300"
                />
                <Label for="graded" class="font-normal cursor-pointer">
                  Graded Subject
                </Label>
              </div>
              <p class="text-xs text-neutral-500">Check if teachers can submit grades for this subject</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelEdit">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- View Mode -->
    <div v-else-if="subject" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div>
                <CardTitle>{{ subject.name }}</CardTitle>
                <CardDescription class="mt-2">
                  {{ getDepartmentName(subject.department) }}
                </CardDescription>
              </div>
              <div class="flex gap-2">
                <Badge v-if="subject.is_selectable" variant="secondary">Optional</Badge>
                <Badge v-else variant="default">Required</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm font-medium text-neutral-500 mb-1">Subject Code</p>
                <p class="text-lg">{{ subject.subject_code || 'Not set' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-neutral-500 mb-1">Grading</p>
                <div class="flex items-center gap-2">
                  <Icon 
                    :name="subject.graded ? 'lucide:check-circle' : 'lucide:x-circle'" 
                    :class="subject.graded ? 'text-green-600' : 'text-neutral-400'"
                    class="w-5 h-5"
                  />
                  <span>{{ subject.graded ? 'Graded' : 'Not Graded' }}</span>
                </div>
              </div>
            </div>

            <div v-if="subject.description">
              <p class="text-sm font-medium text-neutral-500 mb-2">Description</p>
              <p class="text-neutral-700 leading-relaxed">{{ subject.description }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <Button 
              variant="outline" 
              class="w-full justify-start"
              @click="navigateTo(`/admin/departments`)"
            >
              <Icon name="lucide:building-2" class="w-4 h-4 mr-2" />
              View Departments
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start text-red-600 hover:text-red-700"
              @click="handleDelete"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
              Delete Subject
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-600">Type</span>
              <span class="font-semibold">{{ subject.is_selectable ? 'Optional' : 'Required' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-600">Grading Enabled</span>
              <span class="font-semibold">{{ subject.graded ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-600">Department</span>
              <span class="font-semibold">{{ getDepartmentName(subject.department) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'


definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Subject {
  id?: number
  name: string
  subject_code: string | null
  department: number
  is_selectable: boolean
  graded: boolean
  description: string
}

interface Department {
  id: number
  name: string
}

const { success, error: showError } = useToast()

const route = useRoute()
const router = useRouter()
const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const subject = ref<Subject | null>(null)
const originalData = ref<Subject | null>(null)
const departments = ref<Department[]>([])

const loadData = async () => {
  const id = parseInt(route.params.id as string)
  
  const [subjectRes, deptsRes] = await Promise.all([
    apiCall<Subject>(`/academic/subjects/${id}/`),
    apiCall<Department[]>('/academic/departments/')
  ])

  if (subjectRes.data) {
    subject.value = subjectRes.data
    originalData.value = { ...subjectRes.data }
  }

  if (deptsRes.data) {
    departments.value = deptsRes.data
  }

  if (route.query.edit === 'true') {
    editMode.value = true
  }

  loading.value = false
}

const getDepartmentName = (deptId: number) => {
  const dept = departments.value.find(d => d.id === deptId)
  return dept?.name || 'Unknown'
}

const handleSubmit = async () => {
  if (!subject.value) return

  saving.value = true

  const id = parseInt(route.params.id as string)
  const { data, error: apiError } = await apiCall<Subject>(
    `/academic/subjects/${id}/`,
    { method: 'PATCH', body: subject.value }
  )

  if (data) {
    showSuccessToast('Subject updated successfully')
    originalData.value = { ...subject.value }
    editMode.value = false
  } else {
    showError('Failed to update subject', {
      description: apiError || 'An unexpected error occurred. Please try again.'
    })
  }

  saving.value = false
}

const cancelEdit = () => {
  if (originalData.value) {
    subject.value = { ...originalData.value }
  }
  editMode.value = false
}

const handleDelete = async () => {
  if (!subject.value) return
  if (!confirm(`Are you sure you want to delete "${subject.value.name}"?`)) return

  const { error: apiError } = await apiCall(`/academic/subjects/${subject.value.id}/`, {
    method: 'DELETE'
  })

  if (!apiError) {
    showSuccessToast('Subject deleted successfully')
    router.push('/admin/subjects')
  } else {
    showError('Failed to delete subject', {
      description: apiError
    })
  }
}

onMounted(() => {
  loadData()
})
</script>