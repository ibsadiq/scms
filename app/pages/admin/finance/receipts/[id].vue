<template>
  <div class="space-y-6">
    <!-- Action Buttons - Hidden on Print -->
    <div class="no-print flex items-center justify-between">
      <Button variant="ghost" size="sm" @click="navigateTo('/admin/finance/payments')">
        <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
        Back
      </Button>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="downloadReceipt" v-if="receipt">
          <Icon name="lucide:download" class="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-12 h-12 mx-auto text-neutral-400 animate-spin mb-4" />
      <p class="text-neutral-600 dark:text-neutral-400">Loading receipt...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="lucide:alert-circle" class="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Error Loading Receipt</h3>
      <p class="text-neutral-600 dark:text-neutral-400 mb-4">{{ error }}</p>
      <Button @click="loadReceipt">
        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>

    <!-- Receipt Content -->
    <div v-else-if="receipt" class="space-y-6">
      <!-- Document Header with School Branding -->
      <div
        class="receipt-document bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 border border-neutral-200 dark:border-neutral-800"
        :style="{ '--primary-color': settings?.primary_color || '#3b82f6' }"
      >
        <!-- School Header -->
        <div class="text-center mb-8 pb-6 border-b-4" :style="{ borderColor: settings?.primary_color || '#3b82f6' }">
          <div class="flex items-center justify-center gap-4 mb-4">
            <img
              v-if="settings?.school_logo_url"
              :src="settings.school_logo_url"
              alt="School Logo"
              class="w-20 h-20 object-contain"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <div v-else class="w-20 h-20 flex items-center justify-center bg-primary/10 rounded-lg">
              <Icon name="lucide:school" class="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 class="text-3xl font-bold" :style="{ color: settings?.primary_color || '#3b82f6' }">{{ settings?.school_name || 'School Name' }}</h1>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {{ settings?.school_address || 'School Address' }}{{ settings?.school_city ? `, ${settings.school_city}` : '' }}{{ settings?.school_state ? `, ${settings.school_state}` : '' }}
              </p>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                <span v-if="settings?.school_phone">Phone: {{ settings.school_phone }}</span>
                <span v-if="settings?.school_phone && settings?.school_email"> | </span>
                <span v-if="settings?.school_email">Email: {{ settings.school_email }}</span>
              </p>
            </div>
          </div>
          <div class="mt-4">
            <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">OFFICIAL RECEIPT</h2>
          </div>
        </div>

        <!-- Receipt Number and Status -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Receipt Number</p>
            <p class="text-2xl font-bold font-mono" :style="{ color: settings?.primary_color || '#3b82f6' }">#{{ receipt.receipt_number }}</p>
          </div>
          <span
            class="inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold no-print"
            :class="getStatusClass(receipt.status)"
          >
            {{ receipt.status }}
          </span>
          <span class="print-only hidden text-sm font-semibold">
            Status: {{ receipt.status }}
          </span>
        </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
        <!-- Main Receipt Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Receipt Details Card -->
          <Card>
            <CardHeader>
              <CardTitle>Receipt Information</CardTitle>
              <CardDescription>Details about this payment receipt</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Receipt Number</Label>
                  <p class="font-mono font-semibold text-lg">#{{ receipt.receipt_number }}</p>
                </div>
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Date</Label>
                  <p class="font-medium">{{ formatDate(receipt.date) }}</p>
                </div>
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Payment Date</Label>
                  <p class="font-medium">{{ receipt.payment_date ? formatDate(receipt.payment_date) : formatDate(receipt.date) }}</p>
                </div>
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Term</Label>
                  <p class="font-medium">{{ receipt.term_name || 'N/A' }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Payer Information -->
          <Card>
            <CardHeader>
              <CardTitle>Payer Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Payer Name</Label>
                  <p class="font-medium">{{ receipt.payer }}</p>
                </div>
                <div v-if="receipt.student_name">
                  <Label class="text-neutral-500 dark:text-neutral-400">Student</Label>
                  <p class="font-medium">{{ receipt.student_name }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Payment Details -->
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Payment Method</Label>
                  <div class="flex items-center gap-2 mt-1">
                    <Icon :name="getPaymentMethodIcon(receipt.paid_through)" class="w-5 h-5" />
                    <p class="font-medium">{{ receipt.paid_through }}</p>
                  </div>
                </div>
                <div v-if="receipt.reference_number">
                  <Label class="text-neutral-500 dark:text-neutral-400">Reference Number</Label>
                  <p class="font-mono font-medium">{{ receipt.reference_number }}</p>
                </div>
                <div>
                  <Label class="text-neutral-500 dark:text-neutral-400">Received By</Label>
                  <p class="font-medium">{{ receipt.received_by_name || 'N/A' }}</p>
                </div>
              </div>
              <div v-if="receipt.remarks">
                <Label class="text-neutral-500 dark:text-neutral-400">Remarks</Label>
                <p class="text-sm mt-1 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">{{ receipt.remarks }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Fee Allocations -->
          <Card v-if="receipt.fee_allocations && receipt.fee_allocations.length > 0">
            <CardHeader>
              <CardTitle>Fee Allocations</CardTitle>
              <CardDescription>How this payment was allocated to student fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <div
                  v-for="allocation in receipt.fee_allocations"
                  :key="allocation.id"
                  class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md"
                >
                  <div>
                    <p class="font-medium">{{ allocation.fee_structure_name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ allocation.fee_type }}</p>
                  </div>
                  <p class="font-semibold text-green-700 dark:text-green-400">
                    ₦{{ formatCurrency(allocation.amount) }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6 print:hidden">
          <!-- Amount Summary -->
          <Card>
            <CardHeader>
              <CardTitle>Amount Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-neutral-600 dark:text-neutral-400">Total Amount</span>
                  <span class="font-semibold text-lg">₦{{ formatCurrency(receipt.amount) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-neutral-600 dark:text-neutral-400">Allocated</span>
                  <span class="font-medium text-green-700 dark:text-green-400">
                    ₦{{ formatCurrency(receipt.allocated_amount || 0) }}
                  </span>
                </div>
                <div class="flex items-center justify-between pt-2 border-t">
                  <span class="font-medium text-neutral-600 dark:text-neutral-400">Unallocated</span>
                  <span class="font-semibold text-orange-700 dark:text-orange-400">
                    ₦{{ formatCurrency(receipt.unallocated_amount || 0) }}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Actions -->
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Button class="w-full" variant="outline" @click="editReceipt" v-if="receipt.status !== 'Cancelled'">
                <Icon name="lucide:edit" class="w-4 h-4 mr-2" />
                Edit Receipt
              </Button>
              <Button
                class="w-full"
                variant="outline"
                @click="allocateFees"
                v-if="receipt.unallocated_amount && receipt.unallocated_amount > 0 && receipt.status !== 'Cancelled'"
              >
                <Icon name="lucide:coins" class="w-4 h-4 mr-2" />
                Allocate to Fees
              </Button>
              <Button
                class="w-full"
                variant="outline"
                @click="cancelReceipt"
                v-if="receipt.status !== 'Cancelled'"
              >
                <Icon name="lucide:x-circle" class="w-4 h-4 mr-2" />
                Cancel Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Signature Section - Only for Print -->
      <div class="print-only hidden mt-16 pt-8 border-t-2 border-neutral-300">
        <div class="flex justify-between items-end">
          <div class="text-center">
            <div class="border-t-2 border-neutral-800 pt-2 mt-16 w-64">
              <p class="text-sm font-semibold">Received By</p>
              <p class="text-sm mt-1">{{ receipt.received_by_name || '________________' }}</p>
            </div>
          </div>
          <div class="text-center">
            <div class="border-t-2 border-neutral-800 pt-2 mt-16 w-64">
              <p class="text-sm font-semibold">Authorized Signature</p>
              <p class="text-sm mt-1">________________</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer - Only for Print -->
      <div class="print-only hidden mt-12 pt-6 border-t border-neutral-300 text-center text-sm text-neutral-600">
        <p>This is an official receipt generated by the School Management System.</p>
        <p class="mt-2">For any queries, please contact the finance office.</p>
        <p class="mt-3 text-xs">Generated on {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
      </div>
      </div>
    </div>

    <!-- Fee Allocation Dialog -->
    <Dialog v-model:open="showAllocateDialog">
      <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate to Student Fees</DialogTitle>
          <DialogDescription>
            Allocate ₦{{ formatCurrency(receipt?.unallocated_amount || 0) }} to student's unpaid fees
          </DialogDescription>
        </DialogHeader>

        <div v-if="studentBalance" class="space-y-4">
          <!-- Student Info -->
          <div class="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md">
            <p class="font-medium">{{ studentBalance.student_name }}</p>
            <div class="flex items-center justify-between text-sm mt-1">
              <span class="text-neutral-600 dark:text-neutral-400">Total Balance</span>
              <span class="font-semibold text-red-600 dark:text-red-400">
                ₦{{ formatCurrency(studentBalance.balance) }}
              </span>
            </div>
          </div>

          <!-- Allocation Summary -->
          <div class="p-3 border rounded-md space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600 dark:text-neutral-400">Unallocated Amount</span>
              <span class="font-medium">₦{{ formatCurrency(receipt?.unallocated_amount || 0) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-600 dark:text-neutral-400">Total Allocated</span>
              <span class="font-medium text-green-600 dark:text-green-400">
                ₦{{ formatCurrency(totalAllocated) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm pt-2 border-t">
              <span class="font-medium">Remaining</span>
              <span class="font-semibold" :class="remainingAmount < 0 ? 'text-red-600 dark:text-red-400' : ''">
                ₦{{ formatCurrency(remainingAmount) }}
              </span>
            </div>
          </div>

          <!-- Fee Breakdown -->
          <div class="space-y-3">
            <Label>Select fees to allocate payment</Label>
            <div
              v-for="fee in studentBalance.fee_breakdown"
              :key="fee.id"
              class="p-3 border rounded-md space-y-2"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-sm">{{ fee.fee_name }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Balance: ₦{{ formatCurrency(fee.balance) }}
                  </p>
                </div>
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="
                    fee.status === 'Paid'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : fee.status === 'Partial'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  "
                >
                  {{ fee.status }}
                </span>
              </div>
              <div v-if="fee.balance > 0" class="flex items-center gap-2">
                <Input
                  v-model.number="allocations[fee.id]"
                  type="number"
                  :placeholder="`Max: ₦${formatCurrency(fee.balance)}`"
                  :max="fee.balance"
                  min="0"
                  step="0.01"
                  class="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  @click="allocations[fee.id] = Math.min(fee.balance, remainingAmount + (allocations[fee.id] || 0))"
                >
                  Max
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showAllocateDialog = false" :disabled="allocatingFees">
            Cancel
          </Button>
          <Button @click="handleAllocateToFees" :disabled="allocatingFees || totalAllocated === 0">
            <Icon v-if="allocatingFees" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Allocate Fees
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Receipt Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Receipt</DialogTitle>
          <DialogDescription>Update receipt information</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-payer">Payer Name</Label>
            <Input id="edit-payer" v-model="editForm.payer" />
          </div>

          <div class="space-y-2">
            <Label for="edit-amount">Amount (₦)</Label>
            <Input id="edit-amount" v-model.number="editForm.amount" type="number" step="0.01" />
          </div>

          <div class="space-y-2">
            <Label for="edit-method">Payment Method</Label>
            <select
              id="edit-method"
              v-model="editForm.paid_through"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="edit-payment-date">Payment Date</Label>
            <Input id="edit-payment-date" v-model="editForm.payment_date" type="date" />
          </div>

          <div class="space-y-2">
            <Label for="edit-reference">Reference Number</Label>
            <Input id="edit-reference" v-model="editForm.reference_number" />
          </div>

          <div class="space-y-2">
            <Label for="edit-remarks">Remarks</Label>
            <textarea
              id="edit-remarks"
              v-model="editForm.remarks"
              rows="3"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false" :disabled="editingReceipt">
            Cancel
          </Button>
          <Button @click="handleEditReceipt" :disabled="editingReceipt">
            <Icon v-if="editingReceipt" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Cancel Receipt Dialog -->
    <Dialog v-model:open="showCancelDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this receipt? This action will mark the receipt as cancelled and reverse any fee allocations.
          </DialogDescription>
        </DialogHeader>

        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div class="flex items-start gap-3">
            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div class="text-sm text-red-800 dark:text-red-300">
              <p class="font-medium mb-1">Warning</p>
              <p>Cancelling this receipt cannot be undone. The receipt will be permanently marked as cancelled.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showCancelDialog = false" :disabled="cancellingReceipt">
            Keep Receipt
          </Button>
          <Button variant="destructive" @click="handleCancelReceipt" :disabled="cancellingReceipt">
            <Icon v-if="cancellingReceipt" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Cancel Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useReceipts, type Receipt, type FeeAllocation } from '~~/composables/admin/useReceipts'
import { useFinance } from '~~/composables/admin/useFinance'
import { useSettings, type SchoolSettings } from '~~/composables/useSettings'
import type { StudentFeeBalance } from '~~/types'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const route = useRoute()
const receiptId = computed(() => parseInt(route.params.id as string))

const { fetchReceipt, allocateReceiptToFees, updateReceipt } = useReceipts()
const { fetchStudentBalance } = useFinance()
const { fetchSettings } = useSettings()

// Data
const receipt = ref<Receipt | null>(null)
const settings = ref<SchoolSettings | null>(null)
const loading = ref(false)
const error = ref('')

// Fee allocation dialog
const showAllocateDialog = ref(false)
const studentBalance = ref<StudentFeeBalance | null>(null)
const allocations = ref<Record<number, number>>({})
const allocatingFees = ref(false)

// Edit dialog
const showEditDialog = ref(false)
const editForm = ref<Partial<Receipt>>({})
const editingReceipt = ref(false)

// Cancel dialog
const showCancelDialog = ref(false)
const cancellingReceipt = ref(false)

// Load receipt
const loadReceipt = async () => {
  loading.value = true
  error.value = ''

  const response = await fetchReceipt(receiptId.value)
  loading.value = false

  if (response.data) {
    receipt.value = response.data
  } else if (response.error) {
    error.value = response.error
    showErrorToast(response.error , 'Failed to load receipt')
  }
}

// Format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Format date
const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Get status class
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return classes[status] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
}

// Get payment method icon
const getPaymentMethodIcon = (method: string) => {
  const icons: Record<string, string> = {
    'Cash': 'lucide:banknote',
    'Bank Transfer': 'lucide:landmark',
    'Cheque': 'lucide:file-text',
    'Mobile Money': 'lucide:smartphone',
    'Card': 'lucide:credit-card',
  }
  return icons[method] || 'lucide:wallet'
}

// Download receipt as PDF
const downloadReceipt = () => {
  // Create a print-friendly version and trigger browser print dialog
  // User can then "Save as PDF" from the print dialog
  const printContent = generateReceiptHTML()

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    showError('Please allow popups to download receipt')
    return
  }

  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

const generateReceiptHTML = () => {
  if (!receipt.value) return ''

  const schoolName = settings.value?.school_name || 'School Name'
  const schoolAddress = settings.value?.school_address || 'School Address'
  const schoolCity = settings.value?.school_city || ''
  const schoolState = settings.value?.school_state || ''
  const schoolPhone = settings.value?.school_phone || ''
  const schoolEmail = settings.value?.school_email || ''
  const logoUrl = settings.value?.school_logo_url || ''
  const primaryColor = settings.value?.primary_color || '#2563eb'

  // Generate lighter shade for backgrounds
  const lightColor = primaryColor + '20' // Add opacity

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt #${receipt.value.receipt_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 15px;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
      font-size: 11px;
    }
    .header {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid ${primaryColor};
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }
    .header img {
      max-width: 60px;
      max-height: 60px;
    }
    .header h1 {
      font-size: 20px;
      color: ${primaryColor};
      margin-bottom: 4px;
    }
    .header h2 {
      font-size: 16px;
      color: ${primaryColor};
      margin-top: 8px;
    }
    .header p {
      color: #64748b;
      font-size: 10px;
      line-height: 1.4;
    }
    .receipt-number {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 10px 0;
      color: ${primaryColor};
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .section {
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: ${primaryColor};
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 15px;
    }
    .info-item {
      margin-bottom: 0;
    }
    .info-label {
      font-size: 9px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 11px;
      font-weight: 500;
      color: #1e293b;
    }
    .amount-box {
      background: ${lightColor};
      border: 2px solid ${primaryColor};
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      margin: 12px 0;
    }
    .amount-label {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .amount-value {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
    }
    .allocations-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .allocations-table th {
      background: ${lightColor};
      padding: 6px 8px;
      text-align: left;
      font-size: 10px;
      color: #475569;
      border-bottom: 2px solid ${primaryColor};
    }
    .allocations-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11px;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #64748b;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }
    .signature-line {
      border-top: 2px solid #333;
      width: 200px;
      text-align: center;
      padding-top: 6px;
    }
    .signature-label {
      font-size: 9px;
      color: #64748b;
    }
    .signature-name {
      margin-top: 2px;
      font-weight: 500;
      font-size: 10px;
    }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
      @page {
        margin: 0.5cm;
        size: A4;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      ${logoUrl ? `<img src="${logoUrl}" alt="School Logo" />` : ''}
      <div>
        <h1>${schoolName}</h1>
        <p>${schoolAddress}${schoolCity ? `, ${schoolCity}` : ''}${schoolState ? `, ${schoolState}` : ''}</p>
        ${schoolPhone || schoolEmail ? `<p>${schoolPhone}${schoolPhone && schoolEmail ? ' | ' : ''}${schoolEmail}</p>` : ''}
      </div>
    </div>
    <h2>OFFICIAL RECEIPT</h2>
  </div>

  <div class="receipt-number">
    Receipt #${receipt.value.receipt_number}
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <span class="status-badge status-${receipt.value.status.toLowerCase()}">
      ${receipt.value.status}
    </span>
  </div>

  <div class="section">
    <div class="section-title">Receipt Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Receipt Number</div>
        <div class="info-value">#${receipt.value.receipt_number}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date</div>
        <div class="info-value">${formatDate(receipt.value.date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Payment Date</div>
        <div class="info-value">${receipt.value.payment_date ? formatDate(receipt.value.payment_date) : formatDate(receipt.value.date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Term</div>
        <div class="info-value">${receipt.value.term_name || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="amount-box">
    <div class="amount-label">Amount Paid</div>
    <div class="amount-value">₦${formatCurrency(receipt.value.amount)}</div>
  </div>

  <div class="section">
    <div class="section-title">Payer Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Payer Name</div>
        <div class="info-value">${receipt.value.payer}</div>
      </div>
      ${receipt.value.student_name ? `
      <div class="info-item">
        <div class="info-label">Student</div>
        <div class="info-value">${receipt.value.student_name}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Payment Details</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${receipt.value.paid_through}</div>
      </div>
      ${receipt.value.reference_number ? `
      <div class="info-item">
        <div class="info-label">Reference Number</div>
        <div class="info-value">${receipt.value.reference_number}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <div class="info-label">Received By</div>
        <div class="info-value">${receipt.value.received_by_name || 'N/A'}</div>
      </div>
    </div>
    ${receipt.value.remarks ? `
    <div class="info-item" style="margin-top: 16px;">
      <div class="info-label">Remarks</div>
      <div class="info-value">${receipt.value.remarks}</div>
    </div>
    ` : ''}
  </div>

  ${receipt.value.fee_allocations && receipt.value.fee_allocations.length > 0 ? `
  <div class="section">
    <div class="section-title">Fee Allocations</div>
    <table class="allocations-table">
      <thead>
        <tr>
          <th>Fee Structure</th>
          <th>Fee Type</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${receipt.value.fee_allocations.map(allocation => `
        <tr>
          <td>${allocation.fee_structure_name}</td>
          <td>${allocation.fee_type}</td>
          <td style="text-align: right; font-weight: 600; color: #16a34a;">₦${formatCurrency(allocation.amount)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Amount Summary</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Total Amount</div>
        <div class="info-value">₦${formatCurrency(receipt.value.amount)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Allocated</div>
        <div class="info-value" style="color: #16a34a;">₦${formatCurrency(receipt.value.allocated_amount || 0)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Unallocated</div>
        <div class="info-value" style="color: #ea580c;">₦${formatCurrency(receipt.value.unallocated_amount || 0)}</div>
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-line">
      <div class="signature-label">Received By</div>
      <div class="signature-name">${receipt.value.received_by_name || '_________________'}</div>
    </div>
    <div class="signature-line">
      <div class="signature-label">Authorized Signature</div>
      <div class="signature-name">_________________</div>
    </div>
  </div>

  <div class="footer">
    <p>This is an official receipt. For queries, contact the finance office.</p>
    <p style="margin-top: 4px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
  </div>
</body>
</html>
  `
}

// Edit receipt
const editReceipt = () => {
  if (!receipt.value) return

  editForm.value = {
    payer: receipt.value.payer,
    amount: receipt.value.amount,
    paid_through: receipt.value.paid_through,
    payment_date: receipt.value.payment_date,
    reference_number: receipt.value.reference_number,
    remarks: receipt.value.remarks,
  }
  showEditDialog.value = true
}

const handleEditReceipt = async () => {
  if (!receipt.value?.id) return

  editingReceipt.value = true
  const response = await updateReceipt(receipt.value.id, editForm.value)
  editingReceipt.value = false

  if (response.data) {
    showSuccessToast('Receipt updated successfully')
    showEditDialog.value = false
    await loadReceipt()
  } else if (response.error) {
    showErrorToast(response.error , 'Failed to update receipt')
  }
}

// Allocate fees
const allocateFees = async () => {
  if (!receipt.value?.student) {
    showErrorToast('No student associated with this receipt' , 'Cannot allocate fees')
    return
  }

  // Fetch student's unpaid fees
  const response = await fetchStudentBalance(receipt.value.student, receipt.value.term || undefined)

  if (response.data) {
    studentBalance.value = response.data
    allocations.value = {}
    showAllocateDialog.value = true
  } else if (response.error) {
    showErrorToast(response.error , 'Failed to load student fees')
  }
}

const handleAllocateToFees = async () => {
  if (!receipt.value?.id) return

  // Convert allocations object to array format expected by API
  const allocationArray: FeeAllocation[] = Object.entries(allocations.value)
    .filter(([_, amount]) => amount > 0)
    .map(([feeId, amount]) => ({
      fee_assignment_id: parseInt(feeId),
      amount: amount,
    }))

  if (allocationArray.length === 0) {
    showError('Please allocate amount to at least one fee')
    return
  }

  // Validate total allocation doesn't exceed unallocated amount
  const totalAllocated = allocationArray.reduce((sum, a) => sum + a.amount, 0)
  if (totalAllocated > (receipt.value.unallocated_amount || 0)) {
    showError('Total allocation exceeds unallocated amount')
    return
  }

  allocatingFees.value = true
  const response = await allocateReceiptToFees(receipt.value.id, allocationArray)
  allocatingFees.value = false

  if (response.data) {
    showSuccessToast('Fees allocated successfully')
    showAllocateDialog.value = false
    await loadReceipt()
  } else if (response.error) {
    showErrorToast(response.error , 'Failed to allocate fees')
  }
}

const totalAllocated = computed(() => {
  return Object.values(allocations.value).reduce((sum, amount) => sum + amount, 0)
})

const remainingAmount = computed(() => {
  return (receipt.value?.unallocated_amount || 0) - totalAllocated.value
})

// Cancel receipt
const cancelReceipt = () => {
  showCancelDialog.value = true
}

const handleCancelReceipt = async () => {
  if (!receipt.value?.id) return

  cancellingReceipt.value = true
  const response = await updateReceipt(receipt.value.id, { status: 'Cancelled' })
  cancellingReceipt.value = false

  if (response.data) {
    showSuccessToast('Receipt cancelled successfully')
    showCancelDialog.value = false
    await loadReceipt()
  } else if (response.error) {
    showErrorToast(response.error , 'Failed to cancel receipt')
  }
}

// Load settings and receipt
const loadData = async () => {
  // Load settings
  const settingsResponse = await fetchSettings()
  if (settingsResponse.data) {
    settings.value = settingsResponse.data
  }

  // Load receipt
  await loadReceipt()
}

// Load on mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Print Styles */
@media print {
  /* Hide elements not needed for print */
  .no-print {
    display: none !important;
  }

  /* Show print-only elements */
  .print-only {
    display: block !important;
  }

  /* Reset page layout for print */
  body {
    background: white !important;
  }

  /* Optimize document for printing */
  .receipt-document {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 20px !important;
    max-width: 100% !important;
  }

  /* Remove card shadows and borders for cleaner print */
  .card {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }

  /* Ensure proper page breaks */
  .space-y-6 {
    page-break-inside: avoid;
  }

  /* Adjust grid for print */
  .print\\:grid-cols-1 {
    grid-template-columns: 1fr !important;
  }

  /* Hide sidebar on print */
  .print\\:hidden {
    display: none !important;
  }

  /* Adjust font sizes for print */
  body {
    font-size: 12pt;
  }

  /* Ensure colors print correctly */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Page margins */
  @page {
    margin: 1cm;
    size: A4;
  }

  /* Prevent page breaks inside important sections */
  .card {
    page-break-inside: avoid;
  }
}

/* Print-only utilities */
.print-only {
  display: none;
}

@media print {
  .print-only {
    display: block;
  }
}
</style>
