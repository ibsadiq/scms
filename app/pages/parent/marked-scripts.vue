<!-- pages/parent/marked-scripts.vue -->
<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Children's Marked Scripts</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          View and download your children's marked examination scripts
        </p>
      </div>
      <Button variant="outline" size="sm" @click="loadScripts">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && scripts.length === 0" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <Icon name="lucide:alert-circle" class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Content -->
    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Icon name="lucide:file-text" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Total Scripts</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ scripts.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Icon name="lucide:users" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Children</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ uniqueChildren }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Icon name="lucide:book-open" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Subjects</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ uniqueSubjects }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Icon name="lucide:calendar" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Examinations</p>
                <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {{ uniqueExaminations }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Filter Card -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Filter Scripts</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="space-y-2">
              <Label for="filter_child">Child</Label>
              <select
                id="filter_child"
                v-model="filterChild"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="">All Children</option>
                <option v-for="child in children" :key="child" :value="child">
                  {{ child }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="filter_examination">Examination</Label>
              <select
                id="filter_examination"
                v-model="filterExamination"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="">All Examinations</option>
                <option v-for="exam in examinations" :key="exam" :value="exam">
                  {{ exam }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="filter_subject">Subject</Label>
              <select
                id="filter_subject"
                v-model="filterSubject"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="">All Subjects</option>
                <option v-for="subject in subjects" :key="subject" :value="subject">
                  {{ subject }}
                </option>
              </select>
            </div>

            <div class="flex items-end">
              <Button variant="outline" @click="clearFilters" class="w-full">
                <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Scripts List -->
      <div v-if="filteredScripts.length > 0">
        <!-- Mobile: Card List -->
        <div class="block lg:hidden space-y-3">
          <Card v-for="script in filteredScripts" :key="script.id">
            <CardContent class="p-4">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base truncate">{{ script.student_name }}</h3>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ script.examination_name }}</p>
                  </div>
                  <Badge variant="secondary">{{ script.subject_name }}</Badge>
                </div>

                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  <p>Classroom: {{ script.classroom_name }}</p>
                  <p>Uploaded: {{ formatDate(script.uploaded_on) }}</p>
                  <p>Teacher: {{ script.teacher_name }}</p>
                </div>

                <Button size="sm" @click="downloadScript(script)" class="w-full">
                  <Icon name="lucide:download" class="w-3 h-3 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Desktop: Table -->
        <Card class="hidden lg:block">
          <CardHeader>
            <CardTitle class="text-lg">Marked Scripts ({{ filteredScripts.length }})</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Child</TableHead>
                    <TableHead>Examination</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classroom</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead class="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="script in filteredScripts" :key="script.id">
                    <TableCell class="font-medium">{{ script.student_name }}</TableCell>
                    <TableCell>{{ script.examination_name }}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{{ script.subject_name }}</Badge>
                    </TableCell>
                    <TableCell>{{ script.classroom_name }}</TableCell>
                    <TableCell>{{ script.teacher_name }}</TableCell>
                    <TableCell>{{ formatDate(script.uploaded_on) }}</TableCell>
                    <TableCell class="text-right">
                      <Button size="sm" @click="downloadScript(script)">
                        <Icon name="lucide:download" class="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Empty State -->
      <Card v-else>
        <CardContent class="py-12">
          <div class="text-center text-neutral-500 dark:text-neutral-400">
            <Icon name="lucide:inbox" class="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p class="text-lg font-medium">No marked scripts available</p>
            <p class="text-sm mt-2">
              {{ filterChild || filterExamination || filterSubject ? 'No scripts match your filters' : 'Your children don\'t have any marked scripts yet' }}
            </p>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { MarkedScript } from '~~/types'
import { useMarkedScripts } from '~~/composables/teacher/useMarkedScripts'

definePageMeta({
  middleware: 'parent',
  layout: 'parent'
})

const { fetchMarkedScripts } = useMarkedScripts()

const scripts = ref<MarkedScript[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filterChild = ref('')
const filterExamination = ref('')
const filterSubject = ref('')

const loadScripts = async () => {
  loading.value = true
  error.value = null

  // Fetch scripts for all children of the parent
  const { data, error: apiError } = await fetchMarkedScripts()

  if (data) {
    scripts.value = data
  } else if (apiError) {
    error.value = String(apiError)
  }

  loading.value = false
}

const children = computed(() => {
  const unique = new Set(scripts.value.map(s => s.student_name).filter(Boolean))
  return Array.from(unique).sort()
})

const examinations = computed(() => {
  const unique = new Set(scripts.value.map(s => s.examination_name).filter(Boolean))
  return Array.from(unique).sort()
})

const subjects = computed(() => {
  const unique = new Set(scripts.value.map(s => s.subject_name).filter(Boolean))
  return Array.from(unique).sort()
})

const uniqueChildren = computed(() => children.value.length)
const uniqueSubjects = computed(() => subjects.value.length)
const uniqueExaminations = computed(() => examinations.value.length)

const filteredScripts = computed(() => {
  let filtered = scripts.value

  if (filterChild.value) {
    filtered = filtered.filter(s => s.student_name === filterChild.value)
  }

  if (filterExamination.value) {
    filtered = filtered.filter(s => s.examination_name === filterExamination.value)
  }

  if (filterSubject.value) {
    filtered = filtered.filter(s => s.subject_name === filterSubject.value)
  }

  return filtered.sort((a, b) => {
    const dateA = new Date(a.uploaded_on || 0)
    const dateB = new Date(b.uploaded_on || 0)
    return dateB.getTime() - dateA.getTime()
  })
})

const clearFilters = () => {
  filterChild.value = ''
  filterExamination.value = ''
  filterSubject.value = ''
}

const downloadScript = (script: MarkedScript) => {
  window.open(script.file, '_blank')
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadScripts()
})

useHead({
  title: 'Children\'s Marked Scripts'
})
</script>
