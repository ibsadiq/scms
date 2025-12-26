<!-- pages/admin/classrooms/create.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/classrooms')">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Create Classroom</h1>
        <p class="text-neutral-600 mt-1">Add a new classroom to the school</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Classroom Details</CardTitle>
        <CardDescription>Enter the information for the new classroom</CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Loading State -->
        <div v-if="loadingData" class="text-center py-12">
          <Loader2 class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading form data...</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Class Level Selection -->
          <div class="space-y-2">
            <Label for="class_level">Class Level *</Label>
            <select
              id="class_level"
              v-model.number="formData.name"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
              required
            >
              <option value="" disabled>Select a class level</option>
              <option v-for="level in classLevels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500">Choose which class level this classroom represents</p>
          </div>

          <!-- Stream Selection -->
          <div class="space-y-2">
            <Label for="stream">Stream</Label>
            <select
              id="stream"
              v-model.number="formData.stream"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option :value="null">No stream assigned</option>
              <option v-for="stream in streams" :key="stream.id" :value="stream.id">
                {{ stream.name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500">Optionally assign a stream (e.g., A, B, C)</p>
          </div>

          <!-- Class Teacher Selection -->
          <div class="space-y-2">
            <Label for="class_teacher">Class Teacher</Label>
            <select
              id="class_teacher"
              v-model.number="formData.class_teacher"
              class="flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              <option :value="null">No teacher assigned yet</option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.first_name }} {{ teacher.last_name }}
              </option>
            </select>
            <p class="text-xs text-neutral-500">Optionally assign a class teacher</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="capacity">Capacity *</Label>
              <Input
                id="capacity"
                v-model.number="formData.capacity"
                type="number"
                min="1"
                placeholder="e.g., 40"
                required
              />
              <p class="text-xs text-neutral-500">Maximum number of students</p>
            </div>

            <div class="space-y-2">
              <Label for="occupied_sits">Occupied Seats</Label>
              <Input
                id="occupied_sits"
                v-model.number="formData.occupied_sits"
                type="number"
                min="0"
                placeholder="e.g., 0"
              />
              <p class="text-xs text-neutral-500">Currently occupied seats</p>
            </div>
          </div>

          <Alert>
            <Info />

            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              Each class level can only have one classroom. Select the class level first, then configure capacity and teacher.
            </AlertDescription>
          </Alert>

          <div class="flex items-center gap-3">
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Creating...' : 'Create Classroom' }}
            </Button>
            <Button type="button" variant="outline" @click="navigateTo('/admin/classrooms')">
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useApi } from '~~/composables/useApi'
import { Info, Loader2, ArrowLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

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
const router = useRouter()

const formData = ref({
  name: '',  // This will be the ClassLevel ID
  stream: null as number | null,
  class_teacher: null as number | null,
  capacity: 40,
  occupied_sits: 0
})

const loading = ref(false)
const loadingData = ref(true)

const classLevels = ref<ClassLevel[]>([])
const teachers = ref<Teacher[]>([])
const streams = ref<Stream[]>([])

// Load ClassLevels, Streams, and Teachers
const loadData = async () => {
  loadingData.value = true

  const [levelsRes, streamsRes, teachersRes] = await Promise.all([
    apiCall<ClassLevel[]>('/academic/class-levels/'),
    apiCall<Stream[]>('/academic/streams/'),
    apiCall<Teacher[]>('/academic/teachers/')
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

  loadingData.value = false
}

const handleSubmit = async () => {
  if (!formData.value.name) {
    toast.error('Validation error', { description: 'Please select a class level' })
    return
  }

  loading.value = true

  const { data, error: apiError } = await apiCall('/academic/classrooms/', {
    method: 'POST',
    body: formData.value
  })

  if (data) {
    toast.success('Classroom created successfully')
    router.push('/admin/classrooms')
  } else {
    toast.error('Failed to create classroom', { description: apiError || 'An unexpected error occurred. Please try again.' })
  }

  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>