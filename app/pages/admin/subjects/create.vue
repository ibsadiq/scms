<!-- pages/admin/subjects/create.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/subjects')">
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Create Subject</h1>
        <p class="text-neutral-600 mt-1">Add a new subject to the curriculum</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Subject Details</CardTitle>
        <CardDescription>Enter the information for the new subject</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="name">Subject Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="e.g., Mathematics"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="subject_code">Subject Code</Label>
              <Input
                id="subject_code"
                v-model="formData.subject_code"
                placeholder="e.g., MATH101"
                maxlength="10"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="department">Department *</Label>
            <select
              id="department"
              v-model="formData.department"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Brief description of the subject..."
              rows="3"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="is_selectable"
                  v-model="formData.is_selectable"
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
                  v-model="formData.graded"
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
            <Button type="submit" :disabled="loading || !formData.department">
              <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Creating...' : 'Create Subject' }}
            </Button>
            <Button type="button" variant="outline" @click="navigateTo('/admin/subjects')">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '~~/composables/useApi'
import { toast } from 'vue-sonner'


definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

interface Subject {
  name: string
  subject_code: string | null
  department: number | string
  is_selectable: boolean
  graded: boolean
  description: string
}

interface Department {
  id: number
  name: string
}

const { apiCall } = useApi()
const router = useRouter()

const formData = ref<Subject>({
  name: '',
  subject_code: null,
  department: '',
  is_selectable: false,
  graded: true,
  description: ''
})

const departments = ref<Department[]>([])
const loading = ref(false)

onMounted(async () => {
  const { data } = await apiCall<Department[]>('/academic/departments/')
  if (data) {
    departments.value = data
  }
})

const handleSubmit = async () => {
  loading.value = true

  const { data, error: apiError } = await apiCall<Subject>('/academic/subjects/', {
    method: 'POST',
    body: formData.value
  })

  if (data) {
    toast.success('Subject created successfully')
    router.push('/admin/subjects')
  } else {
    toast.error('Failed to create subject', {
      description: apiError || 'An unexpected error occurred. Please try again.'
    })
  }

  loading.value = false
}
</script>