<!-- pages/admin/terms/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Terms</h1>
        <p class="text-neutral-600 mt-1">Manage academic terms</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Term
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Terms</CardTitle>
            <CardDescription>View and manage all academic terms</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Search terms..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading terms...</p>
        </div>

        <div v-else-if="filteredTerms.length === 0" class="text-center py-12">
          <Icon name="lucide:calendar-x" class="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p class="text-neutral-500">No terms found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Term
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="term in filteredTerms" :key="term.id">
                <TableCell class="font-medium">{{ term.name }}</TableCell>
                <TableCell>{{ term.academic_year_name }}</TableCell>
                <TableCell>{{ formatDate(term.start_date) }}</TableCell>
                <TableCell>{{ formatDate(term.end_date) }}</TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="editTerm(term)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleDelete(term)" class="text-red-600">
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
          <DialogTitle>{{ editingTerm ? 'Edit Term' : 'Create Term' }}</DialogTitle>
          <DialogDescription>
            {{ editingTerm ? 'Update term information' : 'Add a new term to an academic year' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Term Name *</Label>
            <Input
              id="name"
              v-model="formData.name"
              placeholder="e.g., First Term"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="academic_year">Academic Year *</Label>
            <select
              id="academic_year"
              v-model="formData.academic_year"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select academic year</option>
              <option v-for="year in academicYears" :key="year.id" :value="year.id">
                {{ year.name }}
              </option>
            </select>
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
              <Label for="end_date">End Date *</Label>
              <DateInput
                id="end_date"
                v-model="formData.end_date"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingTerm ? 'Update' : 'Create') }}
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
import { DateInput } from '@/components/ui/date-input'
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
import type { Term, AcademicYear } from '~~/types'
import { useTerms } from '~~/composables/admin/useTerms'
import { useAcademicYears } from '~~/composables/admin/useAcademicYears'
import { formatDate } from '~~/utils/helpers'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
 // middleware: 'auth'
})

const { fetchTerms, createTerm, updateTerm, deleteTerm } = useTerms()
const { fetchAcademicYears } = useAcademicYears()
const { success, error: showError } = useToast()

const loading = ref(true)
const saving = ref(false)
const terms = ref<Term[]>([])
const academicYears = ref<AcademicYear[]>([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingTerm = ref<Term | null>(null)

const formData = ref<Partial<Term>>({
  name: '',
  academic_year: 0,
  start_date: '',
  end_date: ''
})

const filteredTerms = computed(() => {
  if (!searchQuery.value) return terms.value
  return terms.value.filter(term =>
    term.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    term.academic_year_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const loadData = async () => {
  loading.value = true
  const [termsRes, yearsRes] = await Promise.all([
    fetchTerms(),
    fetchAcademicYears()
  ])
  if (termsRes.data) terms.value = termsRes.data
  if (yearsRes.data) academicYears.value = yearsRes.data
  loading.value = false
}

const editTerm = (term: Term) => {
  editingTerm.value = term
  formData.value = { ...term }
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  saving.value = true

  // Validate term dates are within academic year
  const selectedYear = academicYears.value.find(y => y.id === formData.value.academic_year)
  if (selectedYear && formData.value.start_date && formData.value.end_date) {
    const termStart = new Date(formData.value.start_date)
    const termEnd = new Date(formData.value.end_date)
    const yearStart = new Date(selectedYear.start_date)

    // Only validate end date if the academic year has an end date
    if (selectedYear.end_date) {
      const yearEnd = new Date(selectedYear.end_date)

      if (termStart < yearStart || termEnd > yearEnd) {
        const errorMessage = `Term dates must be within the academic year period (${formatDate(selectedYear.start_date)} - ${formatDate(selectedYear.end_date)})`
        showError({ data: { detail: errorMessage } }, 'Invalid dates')
        saving.value = false
        return
      }
    } else {
      // If no end date, just validate start date
      if (termStart < yearStart) {
        const errorMessage = `Term start date must be after academic year start (${formatDate(selectedYear.start_date)})`
        showError({ data: { detail: errorMessage } }, 'Invalid dates')
        saving.value = false
        return
      }
    }

    if (termStart >= termEnd) {
      showError({ data: { detail: 'Start date must be before end date' } }, 'Invalid dates')
      saving.value = false
      return
    }
  }

  const payload = {
    ...formData.value,
    // Convert empty date strings to null
    start_date: formData.value.start_date || null,
    end_date: formData.value.end_date || null
  }

  if (editingTerm.value) {
    const { data, error: apiError } = await updateTerm(editingTerm.value.id!, payload as Term)
    if (data) {
      const index = terms.value.findIndex(t => t.id === editingTerm.value!.id)
      if (index !== -1) terms.value[index] = data
      success('Term updated successfully')
      closeDialog()
    } else {
      showError(apiError, 'Failed to update term')
    }
  } else {
    const { data, error: apiError } = await createTerm(payload as Term)
    if (data) {
      terms.value.push(data)
      success('Term created successfully')
      closeDialog()
    } else {
      showError(apiError, 'Failed to create term')
    }
  }

  saving.value = false
}

const handleDelete = async (term: Term) => {
  if (!confirm(`Are you sure you want to delete "${term.name}"?`)) return

  const { error: apiError } = await deleteTerm(term.id!)
  if (!apiError) {
    terms.value = terms.value.filter(t => t.id !== term.id)
    success('Term deleted successfully')
  } else {
    showError(apiError, 'Failed to delete term')
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingTerm.value = null
  formData.value = { name: '', academic_year: 0, start_date: '', end_date: '' }
}

onMounted(() => {
  loadData()
})
</script>
