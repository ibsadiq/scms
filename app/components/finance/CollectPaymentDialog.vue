<!-- components/finance/CollectPaymentDialog.vue -->
<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-6xl max-h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Collect Payment</DialogTitle>
        <DialogDescription>Record a new student payment and allocate to fees</DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-5 mt-4">
        <!-- Student Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="student">Student <span class="text-red-500">*</span></Label>
            <div class="relative">
              <Input
                id="student"
                v-model="studentSearch"
                placeholder="Search student..."
                @input="searchStudents"
                @focus="showStudentDropdown = true"
                autocomplete="off"
              />
              <!-- Student Dropdown -->
              <div
                v-if="showStudentDropdown && studentResults.length > 0"
                class="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                <div
                  v-for="student in studentResults"
                  :key="student.id"
                  class="px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                  @click="selectStudent(student)"
                >
                  <p class="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                    {{ student.first_name }} {{ student.last_name }}
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    {{ student.admission_number }}
                  </p>
                </div>
              </div>
            </div>
            <p v-if="selectedStudent" class="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <Icon name="lucide:check-circle" class="w-4 h-4" />
              {{ selectedStudent.first_name }} {{ selectedStudent.last_name }} selected
            </p>
          </div>

          <div class="space-y-2">
            <Label for="payer">Payer Name <span class="text-red-500">*</span></Label>
            <Input
              id="payer"
              v-model="formData.payer"
              placeholder="Name of person making payment"
              required
            />
          </div>
        </div>

        <!-- Payment Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="amount">Amount (₦) <span class="text-red-500">*</span></Label>
            <Input
              id="amount"
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="payment_method">Payment Method <span class="text-red-500">*</span></Label>
            <Select v-model="formData.paid_through" required>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="term">Term <span class="text-red-500">*</span></Label>
            <Select v-model="formData.term" required @update:model-value="onTermChange">
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="term in terms" :key="term.id" :value="term.id.toString()">
                  {{ term.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="payment_date">Payment Date <span class="text-red-500">*</span></Label>
            <DateInput
              id="payment_date"
              v-model="formData.payment_date"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="reference">Reference Number</Label>
          <Input
            id="reference"
            v-model="formData.reference_number"
            placeholder="Bank reference, cheque number, etc."
          />
        </div>

        <!-- Student Fee Summary -->
        <div v-if="selectedStudent && studentFees.length > 0" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">
                {{ selectedStudent.first_name }} {{ selectedStudent.last_name }}'s Fees
              </h3>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">Select fees to pay</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-neutral-500 dark:text-neutral-400">Total Outstanding</p>
              <p class="text-lg font-bold text-red-600 dark:text-red-400">
                ₦{{ formatCurrency(totalOutstanding) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Fee Allocation Section -->
        <div v-if="selectedStudent && studentFees.length > 0" class="space-y-3 border-t pt-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Allocate Payment to Fees
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="selectAllUnpaidFees"
              v-if="hasUnpaidFees"
            >
              <Icon name="lucide:check-square" class="w-4 h-4 mr-1" />
              Pay All Outstanding
            </Button>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
            <div
              v-for="fee in studentFees"
              :key="fee.id"
              class="flex items-center justify-between p-3 rounded-lg border transition-colors"
              :class="[
                fee.selected
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              ]"
            >
              <div class="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  :id="`fee-${fee.id}`"
                  v-model="fee.selected"
                  @change="updateFeeAllocation(fee)"
                  class="w-4 h-4 text-primary-600 rounded"
                  :disabled="fee.balance === 0"
                />
                <label :for="`fee-${fee.id}`" class="flex-1 cursor-pointer">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ fee.fee_name }}</p>
                        <span
                          v-if="fee.balance === 0"
                          class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          Paid
                        </span>
                      </div>
                      <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 space-x-3">
                        <span>Owed: ₦{{ formatCurrency(fee.amount_owed) }}</span>
                        <span>Paid: ₦{{ formatCurrency(fee.amount_paid) }}</span>
                        <span class="font-medium" :class="fee.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">
                          Balance: ₦{{ formatCurrency(fee.balance) }}
                        </span>
                      </div>
                    </div>
                    <div v-if="fee.selected" class="flex items-center gap-2">
                      <Label class="text-xs text-neutral-600 dark:text-neutral-400">Pay:</Label>
                      <Input
                        v-model.number="fee.allocation_amount"
                        type="number"
                        step="0.01"
                        :max="fee.balance"
                        min="0"
                        @input="validateAllocation"
                        class="w-32 h-8 text-sm"
                      />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Allocation Summary -->
          <div class="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-600 dark:text-neutral-400">Total Payment:</span>
              <span class="font-medium text-neutral-900 dark:text-neutral-100">₦{{ formatCurrency(formData.amount || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600 dark:text-neutral-400">Allocated:</span>
              <span class="font-medium" :class="totalAllocated > (formData.amount || 0) ? 'text-red-600' : 'text-green-600'">
                ₦{{ formatCurrency(totalAllocated) }}
              </span>
            </div>
            <div class="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-1">
              <span class="text-neutral-600 dark:text-neutral-400">Unallocated:</span>
              <span class="font-medium text-neutral-900 dark:text-neutral-100">
                ₦{{ formatCurrency(Math.max(0, (formData.amount || 0) - totalAllocated)) }}
              </span>
            </div>
          </div>

          <p v-if="totalAllocated > (formData.amount || 0)" class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <Icon name="lucide:alert-circle" class="w-4 h-4" />
            Allocated amount exceeds payment amount
          </p>
        </div>

        <!-- Loading Student Fees -->
        <div v-else-if="selectedStudent && loadingFees" class="text-center py-6">
          <Icon name="lucide:loader-2" class="w-6 h-6 mx-auto text-neutral-400 animate-spin mb-2" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading student fees...</p>
        </div>

        <!-- Dialog Footer -->
        <DialogFooter>
          <Button type="button" variant="outline" @click="closeDialog" :disabled="submitting">
            Cancel
          </Button>
          <Button type="submit" :disabled="submitting || !isFormValid">
            <Icon v-if="submitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4 mr-2" />
            {{ submitting ? 'Saving...' : 'Save Payment' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateInput } from '@/components/ui/date-input'
import { useReceipts } from '~~/composables/admin/useReceipts'
import { useFinance } from '~~/composables/admin/useFinance'
import { useStudents } from '~~/composables/admin/useStudents'
import { useTerms } from '~~/composables/admin/useTerms'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': []
}>()

const { createReceipt, allocateReceiptToFees } = useReceipts()
const { fetchStudentBalance } = useFinance()
const { searchStudents: apiSearchStudents } = useStudents()
const { fetchTerms } = useTerms()

// Form data
const formData = ref({
  payer: '',
  student: null as number | null,
  amount: 0,
  paid_through: '' as 'Cash' | 'Bank Transfer' | 'Cheque' | 'Mobile Money' | 'Card' | '',
  term: '',
  payment_date: '',
  reference_number: '',
})

// Student search
const studentSearch = ref('')
const studentResults = ref<any[]>([])
const showStudentDropdown = ref(false)
const selectedStudent = ref<any>(null)

// Student fees
const studentFees = ref<any[]>([])
const loadingFees = ref(false)

// Terms
const terms = ref<any[]>([])

// UI state
const submitting = ref(false)

// Computed
const totalAllocated = computed(() => {
  return studentFees.value
    .filter(fee => fee.selected)
    .reduce((sum, fee) => sum + (fee.allocation_amount || 0), 0)
})

const totalOutstanding = computed(() => {
  return studentFees.value.reduce((sum, fee) => sum + (fee.balance || 0), 0)
})

const hasUnpaidFees = computed(() => {
  return studentFees.value.some(fee => fee.balance > 0)
})

const isFormValid = computed(() => {
  return (
    formData.value.payer &&
    selectedStudent.value &&
    formData.value.amount &&
    formData.value.amount > 0 &&
    formData.value.paid_through &&
    formData.value.term &&
    formData.value.payment_date &&
    totalAllocated.value <= (formData.value.amount || 0)
  )
})

// Load terms when dialog opens
watch(() => props.open, async (isOpen) => {
  if (isOpen && terms.value.length === 0) {
    const response = await fetchTerms()
    if (response.data) {
      terms.value = response.data
    }
  }
})

// Search students
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const searchStudents = async () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!studentSearch.value || studentSearch.value.length < 2) {
    studentResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    const response = await apiSearchStudents(studentSearch.value)
    if (response.data) {
      studentResults.value = response.data
      showStudentDropdown.value = true
    }
  }, 300)
}

// Select student
const selectStudent = async (student: any) => {
  selectedStudent.value = student
  studentSearch.value = `${student.first_name} ${student.last_name}`
  showStudentDropdown.value = false
  formData.value.student = student.id
  formData.value.payer = `${student.first_name} ${student.last_name}`

  // Load student fees if term is selected
  if (formData.value.term) {
    await loadStudentFees(student.id)
  }
}

// Term change handler
const onTermChange = async () => {
  if (selectedStudent.value && formData.value.term) {
    await loadStudentFees(selectedStudent.value.id)
  }
}

// Load student fees
const loadStudentFees = async (studentId: number) => {
  if (!formData.value.term) return

  loadingFees.value = true
  const response = await fetchStudentBalance(studentId, Number(formData.value.term))
  loadingFees.value = false

  if (response.data && response.data.fee_breakdown) {
    studentFees.value = response.data.fee_breakdown.map((fee: any) => ({
      ...fee,
      selected: false,
      allocation_amount: 0,
    }))
  }
}

// Update fee allocation
const updateFeeAllocation = (fee: any) => {
  if (fee.selected) {
    const remainingPayment = (formData.value.amount || 0) - totalAllocated.value
    fee.allocation_amount = Math.min(fee.balance, remainingPayment)
  } else {
    fee.allocation_amount = 0
  }
}

// Validate allocation
const validateAllocation = () => {
  studentFees.value.forEach(fee => {
    if (fee.selected && fee.allocation_amount > fee.balance) {
      fee.allocation_amount = fee.balance
    }
  })
}

// Select all unpaid fees
const selectAllUnpaidFees = () => {
  if (!formData.value.amount || formData.value.amount <= 0) {
    toast.error('Please enter payment amount first')
    return
  }

  let remainingAmount = formData.value.amount

  // Sort fees by balance (smallest first for better allocation)
  const unpaidFees = studentFees.value
    .filter(fee => fee.balance > 0)
    .sort((a, b) => a.balance - b.balance)

  // Allocate to each unpaid fee
  unpaidFees.forEach(fee => {
    if (remainingAmount > 0) {
      fee.selected = true
      const allocAmount = Math.min(fee.balance, remainingAmount)
      fee.allocation_amount = allocAmount
      remainingAmount -= allocAmount
    }
  })

  if (remainingAmount < formData.value.amount) {
    toast.success('Fees selected and allocated')
  } else {
    toast.info('Enter a payment amount to allocate to fees')
  }
}

// Handle submit
const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Please fill all required fields')
    return
  }

  submitting.value = true

  try {
    // Create receipt
    const receiptResponse = await createReceipt({
      payer: formData.value.payer,
      student: formData.value.student,
      amount: formData.value.amount!,
      paid_through: formData.value.paid_through,
      term: Number(formData.value.term),
      payment_date: formData.value.payment_date,
      reference_number: formData.value.reference_number,
    })

    if (receiptResponse.error) {
      toast.error(receiptResponse.error)
      submitting.value = false
      return
    }

    // Allocate to fees if any selected
    const allocations = studentFees.value
      .filter(fee => fee.selected && fee.allocation_amount > 0)
      .map(fee => ({
        fee_assignment_id: fee.id,
        amount: fee.allocation_amount,
      }))

    if (allocations.length > 0) {
      const allocationResponse = await allocateReceiptToFees(
        receiptResponse.data!.id!,
        allocations
      )

      if (allocationResponse.error) {
        toast.warning('Receipt created but fee allocation failed: ' + allocationResponse.error)
      }
    }

    toast.success(`Payment recorded successfully! Receipt #${receiptResponse.data!.receipt_number}`)
    resetForm()
    emit('success')
    closeDialog()
  } catch (error) {
    toast.error('Failed to create receipt')
    console.error(error)
  } finally {
    submitting.value = false
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    payer: '',
    student: null,
    amount: 0,
    paid_through: '' as 'Cash' | 'Bank Transfer' | 'Cheque' | 'Mobile Money' | 'Card' | '',
    term: '',
    payment_date: '',
    reference_number: '',
  }
  studentSearch.value = ''
  selectedStudent.value = null
  studentFees.value = []
  studentResults.value = []
  showStudentDropdown.value = false
}

// Close dialog
const closeDialog = () => {
  emit('update:open', false)
  // Reset form after animation
  setTimeout(resetForm, 300)
}

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Click outside to close dropdown
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('#student')) {
      showStudentDropdown.value = false
    }
  })
})
</script>
