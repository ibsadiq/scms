<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
      <p class="text-neutral-600 dark:text-neutral-400 mt-1">
        Manage your school's information and preferences
      </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-neutral-200 dark:border-neutral-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2'
          ]"
        >
          <Icon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="lucide:loader-2" class="w-12 h-12 mx-auto text-neutral-400 animate-spin mb-4" />
      <p class="text-neutral-600 dark:text-neutral-400">Loading settings...</p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- School Information Tab -->
      <div v-if="activeTab === 'school'" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
            <CardDescription>Basic information about your school</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="school-name">School Name *</Label>
              <Input
                id="school-name"
                v-model="formData.school_name"
                placeholder="Enter school name"
              />
            </div>

            <div class="space-y-2">
              <Label for="school-address">School Address</Label>
              <Input
                id="school-address"
                v-model="formData.address"
                placeholder="Enter school address"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="school-city">City</Label>
                <Input
                  id="school-city"
                  v-model="formData.city"
                  placeholder="Enter city"
                />
              </div>

              <div class="space-y-2">
                <Label for="school-state">State</Label>
                <Input
                  id="school-state"
                  v-model="formData.state"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="school-phone">Phone Number</Label>
                <Input
                  id="school-phone"
                  v-model="formData.contact_phone"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>

              <div class="space-y-2">
                <Label for="school-email">Email Address</Label>
                <Input
                  id="school-email"
                  v-model="formData.contact_email"
                  type="email"
                  placeholder="info@school.com"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="school-website">Website (Optional)</Label>
              <Input
                id="school-website"
                v-model="formData.website"
                placeholder="https://www.school.com"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div></div>
          <Button @click="activeTab = 'branding'" variant="outline">
            Next: Branding
            <Icon name="lucide:chevron-right" class="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <!-- Branding Tab -->
      <div v-if="activeTab === 'branding'" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>School Branding</CardTitle>
            <CardDescription>Customize your school's logo and brand colors</CardDescription>
          </CardHeader>
          <CardContent class="space-y-8">
            <!-- Logo Section -->
            <div class="space-y-3">
              <Label class="text-base font-semibold">School Logo</Label>
              <div class="flex items-center gap-6">
                <!-- Logo Preview -->
                <div class="flex-shrink-0">
                  <div
                    v-if="logoPreview || formData.logo_url"
                    class="w-32 h-32 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-800 flex items-center justify-center"
                  >
                    <img
                      :src="logoPreview || formData.logo_url"
                      alt="School Logo"
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <div
                    v-else
                    class="w-32 h-32 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800"
                  >
                    <Icon name="lucide:image" class="w-12 h-12 text-neutral-400" />
                  </div>
                </div>

                <!-- Upload Controls -->
                <div class="flex-1 space-y-3">
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleLogoUpload"
                  />
                  <div class="flex gap-2">
                    <Button @click="logoInput?.click()" variant="outline">
                      <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <Button
                      v-if="logoPreview || formData.logo_url"
                      @click="handleRemoveLogo"
                      variant="outline"
                    >
                      <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    Recommended size: 200x200px. Supported formats: JPG, PNG, SVG. Max: 2MB
                  </p>
                </div>
              </div>
            </div>

            <div class="border-t border-neutral-200 dark:border-neutral-700"></div>

            <!-- Colors Section -->
            <div class="space-y-4">
              <Label class="text-base font-semibold">Brand Colors</Label>

              <!-- Primary Color -->
              <div class="flex items-center gap-4">
                <div class="space-y-2 flex-1">
                  <Label for="primary-color">Primary Color</Label>
                  <div class="flex items-center gap-3">
                    <input
                      id="primary-color"
                      v-model="formData.primary_color"
                      type="color"
                      class="h-10 w-20 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                    />
                    <Input
                      v-model="formData.primary_color"
                      placeholder="#3B82F6"
                      class="flex-1"
                    />
                  </div>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    Main brand color used for buttons, links, and accents
                  </p>
                </div>

                <!-- Color Preview -->
                <div class="space-y-2">
                  <Label>Preview</Label>
                  <div class="flex gap-2">
                    <div
                      :style="{ backgroundColor: formData.primary_color }"
                      class="w-16 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    />
                    <div class="space-y-1">
                      <Button
                        :style="{
                          backgroundColor: formData.primary_color,
                          borderColor: formData.primary_color,
                          color: 'white'
                        }"
                        size="sm"
                      >
                        Button
                      </Button>
                      <div
                        :style="{ color: formData.primary_color }"
                        class="text-sm font-medium"
                      >
                        Text Color
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Secondary Color -->
              <div class="flex items-center gap-4">
                <div class="space-y-2 flex-1">
                  <Label for="secondary-color">Secondary Color (Optional)</Label>
                  <div class="flex items-center gap-3">
                    <input
                      id="secondary-color"
                      v-model="formData.secondary_color"
                      type="color"
                      class="h-10 w-20 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                    />
                    <Input
                      v-model="formData.secondary_color"
                      placeholder="#F59E0B"
                      class="flex-1"
                    />
                  </div>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    Complementary color for secondary elements
                  </p>
                </div>

                <!-- Color Preview -->
                <div class="space-y-2">
                  <Label>Preview</Label>
                  <div class="flex gap-2">
                    <div
                      :style="{ backgroundColor: formData.secondary_color || '#F59E0B' }"
                      class="w-16 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    />
                    <div class="space-y-1">
                      <Button
                        :style="{
                          backgroundColor: formData.secondary_color || '#F59E0B',
                          borderColor: formData.secondary_color || '#F59E0B',
                          color: 'white'
                        }"
                        size="sm"
                        variant="secondary"
                      >
                        Button
                      </Button>
                      <div
                        :style="{ color: formData.secondary_color || '#F59E0B' }"
                        class="text-sm font-medium"
                      >
                        Text Color
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button @click="activeTab = 'school'" variant="outline">
            <Icon name="lucide:chevron-left" class="w-4 h-4 mr-2" />
            Previous: School Information
          </Button>
          <Button @click="activeTab = 'academic'" variant="outline">
            Next: Academic
            <Icon name="lucide:chevron-right" class="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <!-- Academic Tab -->
      <div v-if="activeTab === 'academic'" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic Settings</CardTitle>
            <CardDescription>Configure academic year and term settings</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="academic-year-start">Academic Year Start Month</Label>
              <select
                id="academic-year-start"
                v-model="formData.academic_year_start_month"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="terms-per-year">Number of Terms per Academic Year</Label>
              <select
                id="terms-per-year"
                v-model.number="formData.terms_per_year"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option :value="2">2 Terms</option>
                <option :value="3">3 Terms</option>
                <option :value="4">4 Terms (Quarters)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <!-- Navigation and Save Buttons -->
        <div class="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button @click="activeTab = 'branding'" variant="outline">
            <Icon name="lucide:chevron-left" class="w-4 h-4 mr-2" />
            Previous: Branding
          </Button>
          <Button @click="saveSettings" :disabled="saving">
            <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings, type SchoolSettings } from '~~/composables/useSettings'
import { useErrorHandler } from '~~/composables/useErrorHandler'
import { useToast } from '~~/composables/useToast'

definePageMeta({
  layout: 'admin',
})

const { success, error: showError } = useToast()

const { fetchSettings, updateSettings, uploadLogo, removeLogo, applyPrimaryColor, applySecondaryColor } = useSettings()

// Tabs
const tabs = [
  { id: 'school', label: 'School Information', icon: 'lucide:school' },
  { id: 'branding', label: 'Branding', icon: 'lucide:palette' },
  { id: 'academic', label: 'Academic', icon: 'lucide:calendar' },
]

const activeTab = ref('school')

// State
const loading = ref(false)
const saving = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const logoPreview = ref('')
const logoFile = ref<File | null>(null)

// Form data
const formData = ref<Partial<SchoolSettings>>({
  school_name: '',
  address: '',
  city: '',
  state: '',
  contact_phone: '',
  contact_email: '',
  website: '',
  logo_url: '',
  primary_color: '#3B82F6',
  secondary_color: '',
  academic_year_start_month: 9,
  terms_per_year: 3,
})

const originalData = ref({ ...formData.value })

// Load settings
const loadSettings = async () => {
  loading.value = true

  const response = await fetchSettings()

  if (response.data) {
    formData.value = { ...response.data }
    originalData.value = { ...response.data }

    // Apply primary color to UI
    if (response.data.primary_color) {
      applyPrimaryColor(response.data.primary_color)
    }
  } else if (response.error) {
    showErrorToast(response.error , 'Failed to load settings')
  }

  loading.value = false
}

// Handle logo upload
const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    showErrorToast('Logo must be less than 2MB' , 'File too large')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showErrorToast('Please upload an image file' , 'Invalid file type')
    return
  }

  logoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Remove logo
const handleRemoveLogo = async () => {
  // If there's a preview (unsaved), just clear it
  if (logoPreview.value) {
    logoPreview.value = ''
    logoFile.value = null
    if (logoInput.value) {
      logoInput.value.value = ''
    }
    return
  }

  // If there's a saved logo, call API to remove it
  if (formData.value.logo_url) {
    const response = await removeLogo()
    if (response.data) {
      formData.value.logo_url = ''
      showSuccessToast('Logo removed successfully')
    } else if (response.error) {
      showErrorToast(response.error , 'Failed to remove logo')
    }
  }
}

// Save settings
const saveSettings = async () => {
  // Validate
  if (!formData.value.school_name) {
    showError('School name is required')
    return
  }

  saving.value = true

  try {
    // Upload logo if changed
    if (logoFile.value) {
      const logoResponse = await uploadLogo(logoFile.value)
      if (logoResponse.error) {
        showErrorToast(logoResponse.error , 'Failed to upload logo')
        saving.value = false
        return
      }
      logoFile.value = null
      logoPreview.value = ''
    }

    // Prepare settings data - exclude logo fields since they're handled separately
    const { logo, logo_url, ...settingsData } = formData.value

    // Save settings to API
    const response = await updateSettings(settingsData)

    if (response.data) {
      originalData.value = { ...response.data }
      formData.value = { ...response.data }

      // Apply new colors
      if (response.data.primary_color) {
        applyPrimaryColor(response.data.primary_color)
      }
      if (response.data.secondary_color) {
        applySecondaryColor(response.data.secondary_color)
      }

      showSuccessToast('Settings saved successfully')
    } else if (response.error) {
      showErrorToast(response.error , 'Failed to save settings')
    }
  } catch (error) {
    showError('Failed to save settings')
  } finally {
    saving.value = false
  }
}

// Load on mount
onMounted(() => {
  loadSettings()
})
</script>
