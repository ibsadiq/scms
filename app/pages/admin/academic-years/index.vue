<!-- pages/admin/academic-years/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Academic Years</h1>
        <p class="text-neutral-600 mt-1">Manage school academic years</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Academic Year
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Academic Years</CardTitle>
            <CardDescription>View and manage all academic years</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Search years..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading academic years...</p>
        </div>

        <div v-else-if="filteredYears.length === 0" class="text-center py-12">
          <Icon name="lucide:calendar-x" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500">No academic years found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Academic Year
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="year in filteredYears" :key="year.id">
                <TableCell class="font-medium">{{ year.name }}</TableCell>
                <TableCell>{{ formatDate(year.start_date) }}</TableCell>
                <TableCell>{{ year.end_date ? formatDate(year.end_date) : 'Ongoing' }}</TableCell>
                <TableCell>
                  <Badge v-if="year.active_year" variant="default">Active</Badge>
                  <Badge v-else variant="secondary">Inactive</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="editYear(year)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleDelete(year)" class="text-red-600">
                        <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          <DialogTitle>{{ editingYear ? 'Edit Academic Year' : 'Create Academic Year' }}</DialogTitle>
          <DialogDescription>
            {{ editingYear ? 'Update academic year information' : 'Add a new academic year to the system' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Year Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., 2024/2025"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="start_date">Start Date *</Label>
              <DateInput
                id="start_date"
                v-model="formData.start_date"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="end_date">End Date</Label>
              <DateInput
                id="end_date"
                v-model="formData.end_date"
              />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <input
              id="active"
              v-model="formData.active_year"
              type="checkbox"
              class="w-4 h-4 rounded border-neutral-300"
            />
            <Label for="active" class="font-normal cursor-pointer">
              Set as active year
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingYear ? 'Update' : 'Create') }}
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
import { DateInput } from '@/components/ui/date-input'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AcademicYear } from '~~/types'
import { useAcademicYears } from '~~/composables/admin/useAcademicYears'
import { formatDate } from '~~/utils/helpers'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
  //// middleware: 'auth'
})

const { success, error: showError } = useToast()

const { fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } = useAcademicYears()

const loading = ref(true)
const saving = ref(false)
const academicYears = ref<AcademicYear[]>([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingYear = ref<AcademicYear | null>(null)

const formData = ref<AcademicYear>({
  name: '',
  start_date: '',
  end_date: null,
  active_year: false
})

const filteredYears = computed(() => {
  if (!searchQuery.value) return academicYears.value
  return academicYears.value.filter(year =>
    year.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const loadYears = async () => {
  loading.value = true
  const { data } = await fetchAcademicYears()
  if (data) {
    academicYears.value = data
  }
  loading.value = false
}

const editYear = (year: AcademicYear) => {
  editingYear.value = year
  formData.value = { ...year }
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  saving.value = true

  const payload = {
    ...formData.value,
    // Convert empty date strings to null
    start_date: formData.value.start_date || null,
    end_date: formData.value.end_date || null
  }

  if (editingYear.value) {
    const { data, error: apiError } = await updateAcademicYear(editingYear.value.id!, payload)
    if (data) {
      const index = academicYears.value.findIndex(y => y.id === editingYear.value!.id)
      if (index !== -1) academicYears.value[index] = data
      showSuccessToast('Academic year updated successfully')
      closeDialog()
    } else {
      showErrorToast(apiError, 'Failed to update academic year')
    }
  } else {
    const { data, error: apiError } = await createAcademicYear(payload)
    if (data) {
      academicYears.value.push(data)
      showSuccessToast('Academic year created successfully')
      closeDialog()
    } else {
      showErrorToast(apiError, 'Failed to create academic year')
    }
  }

  saving.value = false
}

const handleDelete = async (year: AcademicYear) => {
  if (!confirm(`Are you sure you want to delete "${year.name}"?`)) return

  const { error: apiError } = await deleteAcademicYear(year.id!)
  if (!apiError) {
    academicYears.value = academicYears.value.filter(y => y.id !== year.id)
    showSuccessToast('Academic year deleted successfully')
  } else {
    showError('Failed to delete academic year', {
      description: apiError
    })
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingYear.value = null
  formData.value = { name: '', start_date: '', end_date: null, active_year: false }
}

onMounted(() => {
  loadYears()
})
</script>