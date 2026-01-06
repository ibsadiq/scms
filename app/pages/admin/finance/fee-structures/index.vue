<!-- pages/admin/finance/fee-structures/index.vue -->
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Fee Structures</h1>
        <p class="text-neutral-600 dark:text-neutral-400 mt-1">Manage school fee structures</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
        New Fee Structure
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>All Fee Structures</CardTitle>
            <CardDescription>View and manage all fee structures</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Search fees..."
              class="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading fee structures...</p>
        </div>

        <div v-else-if="filteredFees.length === 0" class="text-center py-12">
          <Icon name="lucide:banknote" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No fee structures found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Create Your First Fee Structure
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Grade Levels</TableHead>
                <TableHead>Class Levels</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="fee in filteredFees" :key="fee.id">
                <TableCell class="font-medium">{{ fee.name }}</TableCell>
                <TableCell>
                  <span :class="getFeeTypeColor(fee.fee_type)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ fee.fee_type }}
                  </span>
                </TableCell>
                <TableCell class="font-semibold">₦{{ formatCurrency(fee.amount) }}</TableCell>
                <TableCell class="text-sm">
                  <div v-if="fee.grade_level_names && fee.grade_level_names.length > 0" class="space-y-0.5">
                    <div v-for="grade in fee.grade_level_names" :key="grade">
                      {{ grade }}
                    </div>
                  </div>
                  <span v-else class="text-neutral-400 dark:text-neutral-500">All</span>
                </TableCell>
                <TableCell class="text-sm">
                  <div v-if="fee.class_level_names && fee.class_level_names.length > 0" class="space-y-0.5">
                    <div v-for="classLevel in fee.class_level_names" :key="classLevel">
                      {{ classLevel }}
                    </div>
                  </div>
                  <span v-else class="text-neutral-400 dark:text-neutral-500">All</span>
                </TableCell>
                <TableCell class="text-sm">{{ fee.academic_year_name }}</TableCell>
                <TableCell class="text-sm">{{ fee.term_name || 'All Terms' }}</TableCell>
                <TableCell class="text-sm">{{ fee.due_date ? formatDate(fee.due_date) : '-' }}</TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="editFee(fee)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleDelete(fee)" class="text-red-600 dark:text-red-400">
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
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{{ editingFee ? 'Edit Fee Structure' : 'Create Fee Structure' }}</DialogTitle>
          <DialogDescription>
            {{ editingFee ? 'Update fee structure information' : 'Add a new fee structure' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Fee Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="e.g., Tuition Fee"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="fee_type">Fee Type *</Label>
              <select
                id="fee_type"
                v-model="formData.fee_type"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                required
              >
                <option value="Tuition">Tuition</option>
                <option value="Transport">Transport</option>
                <option value="Meals">Meals</option>
                <option value="Books">Books</option>
                <option value="Uniform">Uniform</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="amount">Amount (₦) *</Label>
              <Input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="academic_year">Academic Year *</Label>
              <select
                id="academic_year"
                v-model="formData.academic_year"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                required
              >
                <option value="">Select academic year</option>
                <option v-for="year in academicYears" :key="year.id" :value="year.id">
                  {{ year.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="grade_levels">Grade Levels (Optional)</Label>
              <MultiSelect
                v-model="formData.grade_levels"
                :items="formattedGradeLevels"
                placeholder="Select grade levels..."
                class="w-full"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                Leave empty to apply to all grade levels
              </p>
            </div>

            <div class="space-y-2">
              <Label for="class_levels">Class Levels (Optional)</Label>
              <MultiSelect
                v-model="formData.class_levels"
                :items="formattedClassLevels"
                placeholder="Select class levels..."
                class="w-full"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                <span v-if="formData.grade_levels && formData.grade_levels.length > 0">
                  Showing only class levels for selected grade levels
                </span>
                <span v-else>
                  Leave empty to apply to all class levels
                </span>
              </p>
            </div>

            <div class="space-y-2">
              <Label for="term">Term (Optional)</Label>
              <select
                id="term"
                v-model="formData.term"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option :value="null">All Terms</option>
                <option v-for="term in terms" :key="term.id" :value="term.id">
                  {{ term.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="due_date">Due Date (Optional)</Label>
              <DateInput
                id="due_date"
                v-model="formData.due_date"
              />
            </div>

            <div class="flex items-center space-x-2 pt-6">
              <input
                id="is_mandatory"
                v-model="formData.is_mandatory"
                type="checkbox"
                class="w-4 h-4"
              />
              <Label for="is_mandatory">Mandatory Fee</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ saving ? 'Saving...' : (editingFee ? 'Update' : 'Create') }}
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
import MultiSelect from '@/components/ui/multi-select.vue'
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
import type { FeeStructure, AcademicYear, Term, GradeLevel } from '~~/types'
import { useFees } from '~~/composables/admin/useFees'
import { useAcademicYears } from '~~/composables/admin/useAcademicYears'
import { useTerms } from '~~/composables/admin/useTerms'
import { formatDate } from '~~/utils/helpers'
import { useApi } from '~~/composables/useApi'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const { fetchFees, createFee, updateFee, deleteFee } = useFees()
const { fetchAcademicYears } = useAcademicYears()
const { fetchTerms } = useTerms()

const loading = ref(true)
const saving = ref(false)
const fees = ref<FeeStructure[]>([])
const academicYears = ref<AcademicYear[]>([])
const terms = ref<Term[]>([])
const gradeLevels = ref<GradeLevel[]>([])
const classLevels = ref<any[]>([])
const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingFee = ref<FeeStructure | null>(null)

const formData = ref<Partial<FeeStructure>>({
  name: '',
  fee_type: 'Tuition',
  amount: 0,
  academic_year: 0,
  grade_levels: [],
  class_levels: [],
  term: null,
  is_mandatory: true,
  due_date: null,
})

const filteredFees = computed(() => {
  if (!searchQuery.value) return fees.value
  return fees.value.filter(fee =>
    fee.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    fee.fee_type.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formattedGradeLevels = computed(() =>
  gradeLevels.value.map(grade => ({
    value: grade.id,
    label: grade.name
  }))
)

const formattedClassLevels = computed(() => {
  // If no grade levels are selected, show all class levels
  if (!formData.value.grade_levels || formData.value.grade_levels.length === 0) {
    return classLevels.value.map(classLevel => ({
      value: classLevel.id,
      label: classLevel.name
    }))
  }

  // Filter class levels based on selected grade levels
  return classLevels.value
    .filter(classLevel => formData.value.grade_levels?.includes(classLevel.grade_level))
    .map(classLevel => ({
      value: classLevel.id,
      label: classLevel.name
    }))
})

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getFeeTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'Tuition': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Transport': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Meals': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Books': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Uniform': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return colors[type] || colors['Other']
}

const loadData = async () => {
  loading.value = true

  const { apiCall } = useApi()

  const [feesRes, yearsRes, termsRes, gradeLevelsRes, classLevelsRes] = await Promise.all([
    fetchFees(),
    fetchAcademicYears(),
    fetchTerms(),
    apiCall<GradeLevel[]>('/academic/grade-levels/'),
    apiCall('/academic/class-levels/'),
  ])

  if (feesRes.data) fees.value = feesRes.data
  if (yearsRes.data) academicYears.value = yearsRes.data
  if (termsRes.data) terms.value = termsRes.data
  if (gradeLevelsRes.data) gradeLevels.value = gradeLevelsRes.data
  if (classLevelsRes.data) classLevels.value = classLevelsRes.data

  loading.value = false
}

const editFee = (fee: FeeStructure) => {
  editingFee.value = fee
  formData.value = { ...fee }
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  saving.value = true

  if (editingFee.value) {
    const { data, error: apiError } = await updateFee(editingFee.value.id!, formData.value as FeeStructure)
    if (data) {
      const index = fees.value.findIndex(f => f.id === editingFee.value!.id)
      if (index !== -1) fees.value[index] = data
      showSuccessToast('Fee structure updated successfully')
      closeDialog()
    } else {
      showError('Failed to update fee structure', {
        description: apiError || 'An unexpected error occurred. Please try again.'
      })
    }
  } else {
    const { data, error: apiError } = await createFee(formData.value as FeeStructure)
    if (data) {
      fees.value.push(data)
      showSuccessToast('Fee structure created successfully')
      closeDialog()
    } else {
      showError('Failed to create fee structure', {
        description: apiError || 'An unexpected error occurred. Please try again.'
      })
    }
  }

  saving.value = false
}

const handleDelete = async (fee: FeeStructure) => {
  if (!confirm(`Are you sure you want to delete "${fee.name}"?`)) return

  const { error: apiError } = await deleteFee(fee.id!)
  if (!apiError) {
    fees.value = fees.value.filter(f => f.id !== fee.id)
    showSuccessToast('Fee structure deleted successfully')
  } else {
    showError('Failed to delete fee structure', {
      description: apiError
    })
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingFee.value = null
  formData.value = {
    name: '',
    fee_type: 'Tuition',
    amount: 0,
    academic_year: 0,
    grade_levels: [],
    class_levels: [],
    term: null,
    is_mandatory: true,
    due_date: null,
  }
}

// Watch for grade level changes and filter out invalid class levels
watch(() => formData.value.grade_levels, (newGradeLevels) => {
  if (!newGradeLevels || newGradeLevels.length === 0) {
    // If no grade levels selected, don't clear class levels
    return
  }

  // Filter out class levels that don't belong to the selected grade levels
  if (formData.value.class_levels && formData.value.class_levels.length > 0) {
    const validClassLevels = formData.value.class_levels.filter(classLevelId => {
      const classLevel = classLevels.value.find(cl => cl.id === classLevelId)
      return classLevel && newGradeLevels.includes(classLevel.grade_level)
    })
    formData.value.class_levels = validClassLevels
  }
})

onMounted(() => {
  loadData()
})
</script>
