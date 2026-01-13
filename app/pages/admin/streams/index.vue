<!-- pages/admin/streams/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Streams</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage classroom streams</p>
      </div>
      <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Stream
      </Button>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Streams</CardTitle>
            <CardDescription class="text-sm">Create and manage streams for classrooms</CardDescription>
          </div>
          <Input
            v-model="searchQuery"
            placeholder="Search streams..."
            class="w-full sm:w-64"
          />
        </div>
      </CardHeader>

      <CardContent class="p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Loading streams...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredStreams.length === 0" class="text-center py-12 px-4">
          <Icon name="lucide:layers" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No streams found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Stream
          </Button>
        </div>

        <!-- Streams Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Stream Name
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
              <tr
                v-for="(stream, index) in filteredStreams"
                :key="stream.id"
                class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {{ index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <Badge variant="outline" class="text-lg font-semibold px-3 py-1">
                      {{ stream.name }}
                    </Badge>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="editStream(stream)"
                    >
                      <Icon name="lucide:pencil" class="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      @click="deleteStream(stream)"
                    >
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingStream ? 'Edit Stream' : 'Create New Stream' }}</DialogTitle>
          <DialogDescription class="text-sm">
            {{ editingStream ? 'Update stream information' : 'Add a new stream for classrooms' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Stream Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., A, B, C"
              required
              maxlength="50"
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Usually a single letter (A-Z) or number
            </p>
          </div>

          <DialogFooter class="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              @click="cancelForm"
              class="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              :disabled="saving"
              class="w-full sm:w-auto"
            >
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingStream ? 'Update' : 'Create') }}
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
})

interface Stream {
  id: number
  name: string
}

const { success, error: showError } = useToast()

const { apiCall } = useApi()

const loading = ref(true)
const saving = ref(false)
const streams = ref<Stream[]>([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingStream = ref<Stream | null>(null)

const formData = ref({
  name: ''
})

const filteredStreams = computed(() => {
  if (!searchQuery.value) return streams.value
  return streams.value.filter(s =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const loadStreams = async () => {
  loading.value = true
  const { data } = await apiCall<Stream[]>('/academic/streams/')
  if (data) {
    streams.value = data
  }
  loading.value = false
}

const editStream = (stream: Stream) => {
  editingStream.value = stream
  formData.value.name = stream.name
  showCreateDialog.value = true
}

const deleteStream = async (stream: Stream) => {
  if (!confirm(`Are you sure you want to delete stream "${stream.name}"? This may affect classrooms using this stream.`)) {
    return
  }

  const { error: apiError } = await apiCall(`/academic/streams/${stream.id}/`, {
    method: 'DELETE'
  })

  if (!apiError) {
    await loadStreams()
    success('Stream deleted successfully')
  } else {
    showError('Failed to delete stream', apiError || 'An unexpected error occurred.')
  }
}

const handleSubmit = async () => {
  saving.value = true

  const endpoint = editingStream.value
    ? `/academic/streams/${editingStream.value.id}/`
    : '/academic/streams/'

  const method = editingStream.value ? 'PATCH' : 'POST'

  const { data, error: apiError } = await apiCall(endpoint, {
    method,
    body: formData.value
  })

  if (data) {
    success(`Stream ${editingStream.value ? 'updated' : 'created'} successfully`)
    showCreateDialog.value = false
    cancelForm()
    loadStreams()
  } else {
    showError(`Failed to ${editingStream.value ? 'update' : 'create'} stream`, apiError || 'An unexpected error occurred. Please try again.')
  }

  saving.value = false
}

const cancelForm = () => {
  showCreateDialog.value = false
  editingStream.value = null
  formData.value.name = ''
}

onMounted(() => {
  loadStreams()
})
</script>
