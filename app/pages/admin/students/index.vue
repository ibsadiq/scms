<!-- pages/admin/students/index.vue -->
<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Students</h1>
        <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">Manage student records and enrollments</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <Button variant="outline" @click="showBulkUpload = true" class="w-full sm:w-auto">
          <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="showCreateDialog = true" class="w-full sm:w-auto">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          New Student
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader class="p-4 sm:p-6">
        <div class="space-y-4">
          <div>
            <CardTitle class="text-lg sm:text-xl">All Students</CardTitle>
            <CardDescription class="text-sm">View and manage student records</CardDescription>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <select
              v-model="filterStatus"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
            <select
              v-model="filterGradeLevel"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Grade Levels</option>
              <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
            <select
              v-model="filterClassLevel"
              class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto dark:bg-neutral-800 dark:border-neutral-700"
            >
              <option value="">All Class Levels</option>
              <option v-for="classLevel in classLevels" :key="classLevel.id" :value="classLevel.id">
                {{ classLevel.name }}
              </option>
            </select>
            <Input
              v-model="searchQuery"
              placeholder="Search students..."
              class="w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-neutral-400" />
          <p class="text-sm text-neutral-500 mt-2">Loading students...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="students.length === 0" class="text-center py-12">
          <Icon name="lucide:users" class="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p class="text-neutral-500 dark:text-neutral-400">No students found</p>
          <Button @click="showCreateDialog = true" variant="outline" class="mt-4">
            Enroll Your First Student
          </Button>
        </div>

        <!-- Mobile: Card List -->
        <div v-else>
          <div class="block lg:hidden space-y-3">
            <Card v-for="(student, index) in students" :key="student.id" class="hover:shadow-md transition-shadow">
              <CardContent class="p-4">
                <div class="space-y-3">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}.</span>
                        <h3 class="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate capitalize">
                          {{ student.first_name }} {{ student.last_name }}
                        </h3>
                      </div>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {{ student.admission_number }}
                      </p>
                    </div>
                    <Badge :variant="getStatusVariant(student.status)" class="flex-shrink-0">
                      {{ student.status }}
                    </Badge>
                  </div>

                  <!-- Details Grid -->
                  <div class="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Admission No.</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.admission_number }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Gender</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.gender }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Grade Level</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.grade_level_name || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Class Level</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.class_level_display || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">Classroom</p>
                      <p class="font-medium text-neutral-900 dark:text-neutral-100">{{ student.classroom_name || 'Unassigned' }}</p>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" @click="navigateTo(`/admin/students/${student.id}`)" class="flex-1">
                      <Icon name="lucide:eye" class="w-4 h-4 mr-1.5" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" @click="navigateTo(`/admin/students/${student.id}?edit=true`)" class="flex-1">
                      <Icon name="lucide:pencil" class="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" @click="openDeleteDialog(student)">
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Desktop: Table -->
          <div class="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-16">#</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Class Level</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(student, index) in students" :key="student.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <TableCell class="font-medium text-neutral-500 dark:text-neutral-400">{{ index + 1 }}</TableCell>
                <TableCell class="font-medium">{{ student.admission_number }}</TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-neutral-900 dark:text-neutral-100 capitalize">{{ student.first_name }} {{ student.last_name }}</p>
                    <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ student.parent_contact || 'No contact' }}</p>
                  </div>
                </TableCell>
                <TableCell>{{ student.gender }}</TableCell>
                <TableCell>{{ student.grade_level_name || '-' }}</TableCell>
                <TableCell>{{ student.class_level_display || '-' }}</TableCell>
                <TableCell>{{ student.classroom_display || 'Unassigned' }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(student.status)">
                    {{ student.status }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="navigateTo(`/admin/students/${student.id}`)">
                        <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="navigateTo(`/admin/students/${student.id}?edit=true`)">
                        <Icon name="lucide:pencil" class="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="openDeleteDialog(student)" class="text-red-600">
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

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} students
            </p>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="currentPage--"
                :disabled="currentPage === 1"
              >
                <Icon name="lucide:chevron-left" class="w-4 h-4" />
                Previous
              </Button>

              <!-- Page numbers (show first, last, and current +/- 2) -->
              <template v-for="page in getPageNumbers()" :key="page">
                <span v-if="page === '...'" class="px-3 py-2 text-neutral-400">...</span>
                <Button
                  v-else
                  variant="outline"
                  size="sm"
                  @click="currentPage = page"
                  :class="{ 'bg-primary text-primary-foreground': currentPage === page }"
                >
                  {{ page }}
                </Button>
              </template>

              <Button
                variant="outline"
                size="sm"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                Next
                <Icon name="lucide:chevron-right" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{{ studentToDelete?.first_name }} {{ studentToDelete?.last_name }}</strong> from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete Student
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Bulk Upload Dialog -->
    <Dialog v-model:open="showBulkUpload">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription class="text-sm">
            Upload multiple student records from an Excel file
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              @change="handleFileSelect"
            />
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Upload an Excel file with student data (columns: admission_number, first_name, last_name, etc.)
            </p>
          </div>

          <Alert v-if="uploadError" variant="destructive">
            <Icon name="lucide:alert-circle" class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ uploadError }}</AlertDescription>
          </Alert>

          <Alert v-if="uploadSuccess" class="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <Icon name="lucide:check-circle" class="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle class="text-green-900 dark:text-green-100">Success</AlertTitle>
            <AlertDescription class="text-green-800 dark:text-green-200">
              Students uploaded successfully!
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button variant="outline" @click="showBulkUpload = false" class="w-full sm:w-auto">Cancel</Button>
          <Button @click="handleBulkUpload" :disabled="!selectedFile || uploading" class="w-full sm:w-auto">
            <Icon v-if="uploading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Create Student Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogScrollContent class="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Enroll New Student</DialogTitle>
          <DialogDescription>Add a new student to the system</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleCreateSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Personal Information</h3>

            <!-- Passport Photo Upload -->
            <div class="space-y-2">
              <Label for="passport_photo">Passport Photo</Label>
              <div class="flex items-start gap-4">
                <div v-if="photoPreview" class="w-32 h-32 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <img :src="photoPreview" alt="Passport photo preview" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-32 h-32 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
                  <Icon name="lucide:user" class="w-12 h-12 text-neutral-400" />
                </div>
                <div class="flex-1 space-y-2">
                  <Input
                    id="passport_photo"
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="cursor-pointer"
                  />
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Upload student's passport photo (JPG, PNG). Max size: 2MB
                  </p>
                  <Button
                    v-if="photoPreview"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="clearPhoto"
                  >
                    <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                    Remove Photo
                  </Button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="admission_number">Admission Number *</Label>
                <Input
                  id="admission_number"
                  v-model="createFormData.admission_number"
                  placeholder="e.g., STU2024001"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="admission_date">Admission Date *</Label>
                <DateInput
                  id="admission_date"
                  v-model="createFormData.admission_date"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  v-model="createFormData.first_name"
                  placeholder="John"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  v-model="createFormData.middle_name"
                  placeholder="Optional"
                />
              </div>

              <div class="space-y-2">
                <Label for="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  v-model="createFormData.last_name"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <Label for="date_of_birth">Date of Birth *</Label>
                <DateInput
                  id="date_of_birth"
                  v-model="createFormData.date_of_birth"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="gender">Gender *</Label>
                <select
                  id="gender"
                  v-model="createFormData.gender"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="status">Status *</Label>
                <select
                  id="status"
                  v-model="createFormData.status"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Contact Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="createFormData.email"
                  type="email"
                  placeholder="student@example.com"
                />
              </div>

              <div class="space-y-2">
                <Label for="phone">Phone Number</Label>
                <Input
                  id="phone"
                  v-model="createFormData.phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="address">Address</Label>
              <Textarea
                id="address"
                v-model="createFormData.address"
                placeholder="Enter full address"
                rows="3"
              />
            </div>
          </div>

          <!-- Academic Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Academic Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="grade_level">Grade Level</Label>
                <select
                  id="grade_level"
                  v-model="createFormData.grade_level"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select grade level</option>
                  <option v-for="grade in createGradeLevels" :key="grade.id" :value="grade.id">
                    {{ grade.name }}
                  </option>
                </select>
              </div>

              <div class="space-y-2">
                <Label for="classroom">Classroom</Label>
                <select
                  id="classroom"
                  v-model="createFormData.classroom"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select classroom</option>
                  <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
                    {{ classroom.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Guardian Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Guardian Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label for="guardian">Guardian/Parent</Label>
                <select
                  id="guardian"
                  v-model="createFormData.guardian"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option :value="null">Select guardian</option>
                  <option v-for="parent in parents" :key="parent.id" :value="parent.id">
                    {{ parent.first_name }} {{ parent.last_name }} ({{ parent.relationship }})
                  </option>
                </select>
                <p class="text-xs text-neutral-500">
                  If guardian not in list, add them in the Parents section first
                </p>
              </div>

              <div class="space-y-2">
                <Label for="emergency_contact">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact"
                  v-model="createFormData.emergency_contact"
                  placeholder="Contact person name"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="emergency_phone">Emergency Phone Number</Label>
              <Input
                id="emergency_phone"
                v-model="createFormData.emergency_phone"
                type="tel"
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          <!-- Additional Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold">Additional Information</h3>

            <div class="space-y-2">
              <Label for="medical_info">Medical Information</Label>
              <Textarea
                id="medical_info"
                v-model="createFormData.medical_info"
                placeholder="Allergies, conditions, medications, etc."
                rows="3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDialog = false" :disabled="creating">
              Cancel
            </Button>
            <Button type="submit" :disabled="creating">
              <Icon v-if="creating" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              {{ creating ? 'Enrolling...' : 'Enroll Student' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogScrollContent>
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { DateInput } from '@/components/ui/date-input'
import type { Student, GradeLevel, ClassLevel, Classroom, Parent } from '~~/types'
import { useStudents, type StudentFilters } from '~~/composables/admin/useStudents'
import { useApi } from '~~/composables/useApi'
import { useToast } from '~~/composables/useToast'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  // middleware: 'auth'
})

const { fetchStudents, deleteStudent, uploadBulkStudents, createStudent } = useStudents()
const { apiCall } = useApi()
const { showErrorToast, showSuccessToast } = useErrorHandler()

const loading = ref(true)
const students = ref<Student[]>([])
const gradeLevels = ref<GradeLevel[]>([])
const classLevels = ref<ClassLevel[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterGradeLevel = ref('')
const filterClassLevel = ref('')
const showBulkUpload = ref(false)
const showDeleteDialog = ref(false)
const showCreateDialog = ref(false)
const studentToDelete = ref<Student | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const creating = ref(false)
const classrooms = ref<Classroom[]>([])
const parents = ref<Parent[]>([])
const createGradeLevels = ref<GradeLevel[]>([])

const createFormData = ref<Partial<Student>>({
  admission_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'Male',
  classroom: null,
  grade_level: null,
  guardian: null,
  admission_date: new Date().toISOString().split('T')[0],
  status: 'Active',
  medical_info: '',
  emergency_contact: '',
  emergency_phone: ''
})

const photoPreview = ref<string | null>(null)
const photoFile = ref<File | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Debounce search - only search after 3 characters
const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Only search if user has typed at least 3 characters, or if the field is empty (to show all results)
    if (newValue.length === 0 || newValue.length >= 3) {
      debouncedSearch.value = newValue
      currentPage.value = 1 // Reset to first page on search
    }
  }, 300)
})

// Watch filters to reload data
watch([filterStatus, filterGradeLevel, filterClassLevel, debouncedSearch, currentPage], () => {
  loadData()
})

// Helper function to generate page numbers for pagination
const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxPagesToShow = 5

  if (totalPages.value <= maxPagesToShow) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate range around current page
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (end < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Active':
      return 'default'
    case 'Inactive':
      return 'secondary'
    case 'Graduated':
      return 'outline'
    case 'Withdrawn':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const loadData = async () => {
  loading.value = true

  // Build filters
  const filters: StudentFilters = {
    page: currentPage.value,
    page_size: pageSize.value
  }

  if (debouncedSearch.value) {
    filters.search = debouncedSearch.value
  }

  if (filterStatus.value) {
    filters.status = filterStatus.value
  }

  if (filterGradeLevel.value) {
    filters.grade_level = parseInt(filterGradeLevel.value)
  }

  if (filterClassLevel.value) {
    filters.class_level = filterClassLevel.value
  }

  const [studentsRes, gradeLevelsRes, classLevelsRes] = await Promise.all([
    fetchStudents(filters),
    apiCall<GradeLevel[]>('/academic/grade-levels/'),
    apiCall<ClassLevel[]>('/academic/class-levels/')
  ])

  if (studentsRes.data) {
    students.value = studentsRes.data.results
    totalCount.value = studentsRes.data.count
  }
  if (gradeLevelsRes.data) gradeLevels.value = gradeLevelsRes.data
  if (classLevelsRes.data) classLevels.value = classLevelsRes.data

  loading.value = false
}

const openDeleteDialog = (student: Student) => {
  studentToDelete.value = student
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!studentToDelete.value) return

  const { success, error: showError } = useToast()
  const { error } = await deleteStudent(studentToDelete.value.id!)

  if (!error) {
    students.value = students.value.filter(s => s.id !== studentToDelete.value!.id)
    success('Student deleted', `${studentToDelete.value.first_name} ${studentToDelete.value.last_name} has been removed from the system`)
  } else {
    showError('Failed to delete student', error)
  }

  showDeleteDialog.value = false
  studentToDelete.value = null
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleBulkUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false

  const { error } = await uploadBulkStudents(selectedFile.value)

  if (!error) {
    uploadSuccess.value = true
    setTimeout(() => {
      showBulkUpload.value = false
      selectedFile.value = null
      uploadSuccess.value = false
      loadData()
    }, 1500)
  } else {
    uploadError.value = error
  }

  uploading.value = false
}

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    showError('Photo size too large', 'Photo size must be less than 2MB')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Invalid file type', 'Please upload an image file')
    return
  }

  photoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearPhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  const input = document.getElementById('passport_photo') as HTMLInputElement
  if (input) input.value = ''
}

const loadReferences = async () => {
  const [gradeLevelsRes, classroomsRes, parentsRes] = await Promise.all([
    apiCall<GradeLevel[]>('/academic/grade-levels/'),
    apiCall<Classroom[]>('/academic/classrooms/'),
    apiCall<Parent[]>('/users/parents/')
  ])

  if (gradeLevelsRes.data) createGradeLevels.value = gradeLevelsRes.data
  if (classroomsRes.data) classrooms.value = classroomsRes.data
  if (parentsRes.data) parents.value = parentsRes.data
}

const handleCreateSubmit = async () => {
  creating.value = true

  try {
    // Prepare payload with proper date handling
    const payload = {
      ...createFormData.value,
      // Convert empty date strings to null
      date_of_birth: createFormData.value.date_of_birth || null,
      admission_date: createFormData.value.admission_date || null
    }

    // If photo is uploaded, we need to send as FormData
    if (photoFile.value) {
      const formDataToSend = new FormData()

      // Append all form fields
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Append photo file
      formDataToSend.append('image', photoFile.value)

      // Send with FormData
      const { data, error: apiError } = await apiCall<Student>('/sis/students/', {
        method: 'POST',
        body: formDataToSend
      })

      if (data) {
        showSuccessToast('Student enrolled successfully')
        showCreateDialog.value = false

        // Reset form
        createFormData.value = {
          admission_number: '',
          first_name: '',
          middle_name: '',
          last_name: '',
          date_of_birth: '',
          gender: 'Male',
          classroom: null,
          grade_level: null,
          guardian: null,
          admission_date: new Date().toISOString().split('T')[0],
          status: 'Active',
          medical_info: '',
          emergency_contact: '',
          emergency_phone: ''
        }
        photoPreview.value = null
        photoFile.value = null

        // Reload students list
        await loadData()
      } else {
        showErrorToast(apiError, 'Failed to enroll student')
        creating.value = false
      }
    } else {
      // Send as regular JSON
      const { data, error: apiError } = await createStudent(payload as Student)

      if (data) {
        showSuccessToast('Student enrolled successfully')
        showCreateDialog.value = false

        // Reset form
        createFormData.value = {
          admission_number: '',
          first_name: '',
          middle_name: '',
          last_name: '',
          date_of_birth: '',
          gender: 'Male',
          classroom: null,
          grade_level: null,
          guardian: null,
          admission_date: new Date().toISOString().split('T')[0],
          status: 'Active',
          medical_info: '',
          emergency_contact: '',
          emergency_phone: ''
        }
        photoPreview.value = null
        photoFile.value = null

        // Reload students list
        await loadData()
      } else {
        showErrorToast(apiError, 'Failed to enroll student')
        creating.value = false
      }
    }
  } catch (err: any) {
    showErrorToast(err, 'Failed to enroll student')
    creating.value = false
  }

  creating.value = false
}

onMounted(() => {
  loadData()
  loadReferences()
})
</script>
