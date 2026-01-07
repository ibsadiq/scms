<!-- components/admin/Sidebar.vue -->
<template>
  <aside class="w-64 bg-[#0A1929] border-r border-neutral-700/50 h-screen flex flex-col overflow-hidden shadow-lg lg:shadow-none">
    <!-- Mobile Close Button -->
    <div class="lg:hidden flex justify-end p-4">
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Icon name="lucide:x" class="w-6 h-6 text-neutral-300" />
      </button>
    </div>

    <div class="px-3 py-6 flex-shrink-0">
      <NuxtLink
        to="/admin"
        class="flex flex-col items-center mb-8 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <!-- App/Product Logo -->
        <div class="h-20 w-44 mb-3 mx-auto">
          <img :src="appLogo()" :alt="product()" class="h-full w-full object-contain" />
        </div>

        <!-- Admin Panel Label -->
        <p class="text-xs text-neutral-300">Admin Panel</p>
      </NuxtLink>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-6">
      <nav class="space-y-1">
        <!-- Dashboard -->
        <div class="pt-4 pb-4">
          <SidebarLink
            to="/admin"
            icon="lucide:layout-dashboard"
            label="Dashboard"
          />
        </div>
        

        <!-- People Section -->
        <div class="pt-4">
          <button
            @click="toggleSection('people')"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-neutral-200 transition-colors"
          >
            <span>Users</span>
            <Icon
              :name="openSections.people ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="openSections.people" class="mt-1 space-y-1">
              <SidebarLink
                to="/admin/students"
                icon="lucide:users"
                label="Students"
              />
              <SidebarLink
                to="/admin/teachers"
                icon="lucide:user-check"
                label="Teachers"
              />
              <SidebarLink
                to="/admin/parents"
                icon="lucide:user-circle"
                label="Parents/Guardians"
              />
            </div>
          </transition>
        </div>

        <!-- Academics Section -->
        <div class="pt-4">
          <button
            @click="toggleSection('academics')"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-neutral-200 transition-colors"
          >
            <span>Academics</span>
            <Icon
              :name="openSections.academics ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="openSections.academics" class="mt-1 space-y-1">
              <SidebarLink
                to="/admin/classrooms"
                icon="lucide:door-open"
                label="Classrooms"
              />
              <SidebarLink
                to="/admin/subjects"
                icon="lucide:book-open"
                label="Subjects"
              />
              <SidebarLink
                to="/admin/timetable"
                icon="lucide:calendar-clock"
                label="Timetable"
              />
              <SidebarLink
                to="/admin/assessments"
                icon="lucide:clipboard-check"
                label="Assessments"
              />
            </div>
          </transition>
        </div>

        <!-- Financial Section -->
        <div class="pt-4">
          <button
            @click="toggleSection('financial')"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-neutral-200 transition-colors"
          >
            <span>Financial</span>
            <Icon
              :name="openSections.financial ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="openSections.financial" class="mt-1 space-y-1">
              <SidebarLink
                to="/admin/finance/payments"
                icon="lucide:receipt"
                label="Payments"
              />
              <SidebarLink
                to="/admin/finance/fee-structures"
                icon="lucide:banknote"
                label="Fee Structures"
              />
              <SidebarLink
                to="/admin/finance/balances"
                icon="lucide:wallet"
                label="Student Balances"
              />
            </div>
          </transition>
        </div>

        <!-- Administration Section -->
        <div class="pt-4">
          <button
            @click="toggleSection('admin')"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-neutral-200 transition-colors"
          >
            <span>Administration</span>
            <Icon
              :name="openSections.admin ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="openSections.admin" class="mt-1 space-y-1">
              <SidebarLink
                to="/admin/invitations"
                icon="lucide:mail"
                label="Invitations"
              />
              <SidebarLink
                to="/admin/academic-years"
                icon="lucide:calendar"
                label="Academic Years"
              />
              <SidebarLink
                to="/admin/terms"
                icon="lucide:calendar-days"
                label="Terms"
              />
              <SidebarLink
                to="/admin/events"
                icon="lucide:calendar-heart"
                label="School Events"
              />
              <SidebarLink
                to="/admin/departments"
                icon="lucide:building-2"
                label="Departments"
              />
              <SidebarLink
                to="/admin/grade-levels"
                icon="lucide:graduation-cap"
                label="Grade Levels"
              />
              <SidebarLink
                to="/admin/class-levels"
                icon="lucide:layers"
                label="Class Levels"
              />
              <SidebarLink
                to="/admin/streams"
                icon="lucide:copy"
                label="Streams"
              />
            </div>
          </transition>
        </div>

        <!-- Admissions Section -->
        <div class="pt-4">
          <button
            @click="toggleSection('admissions')"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-neutral-200 transition-colors"
          >
            <span>Admissions</span>
            <Icon
              :name="openSections.admissions ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="openSections.admissions" class="mt-1 space-y-1">
              <SidebarLink
                to="/admin/admissions/sessions"
                icon="lucide:calendar"
                label="Sessions"
              />
              <SidebarLink
                to="/admin/admissions/fee-structures"
                icon="lucide:banknote"
                label="Fee Structures"
              />
              <SidebarLink
                to="/admin/admissions/applications"
                icon="lucide:file-text"
                label="Applications"
              />
              
              
            </div>
          </transition>
        </div>

        <!-- Reports Section -->
        <div class="pt-4">
          <button
            @click="toggleSection('reports')"
            type="button"
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider hover:text-neutral-200 transition-colors"
          >
            <span>Reports</span>
            <Icon
              :name="openSections.reports ? 'lucide:chevron-up' : 'lucide:chevron-down'"
              class="w-4 h-4"
            />
          </button>
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            leave-active-class="transition-all duration-150 ease-in"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="openSections.reports" class="mt-1 space-y-1">
              <SidebarLink
                to="/admin/reports/students"
                icon="lucide:file-text"
                label="Student Reports"
              />
              <SidebarLink
                to="/admin/reports/financial"
                icon="lucide:file-bar-chart"
                label="Financial Reports"
              />
            </div>
          </transition>
        </div>

        <!-- Settings Section -->
        <div class="pt-4 pb-4">
          <SidebarLink
            to="/admin/settings"
            icon="lucide:settings"
            label="Settings"
          />
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue'
import SidebarLink from './SidebarLink.vue'
import { useBrand } from '~~/composables/useBrand'

defineEmits<{
  close: []
}>()

type SectionKey = 'people' | 'academics' | 'financial' | 'admin' | 'admissions' | 'reports'

const route = useRoute()
const STORAGE_KEY = 'sidebar_open_sections'

// Determine which section should be open based on current route
const getActiveSectionFromRoute = (): SectionKey | null => {
  const path = route.path
  if (path.includes('/admin/students') || path.includes('/admin/teachers') || path.includes('/admin/parents')) {
    return 'people'
  }
  if (path.includes('/admin/classrooms') || path.includes('/admin/subjects') || path.includes('/admin/timetable') || path.includes('/admin/assessments')) {
    return 'academics'
  }
  if (path.includes('/admin/finance')) {
    return 'financial'
  }
  if (path.includes('/admin/invitations') || path.includes('/admin/academic-years') || path.includes('/admin/terms') || path.includes('/admin/events') || path.includes('/admin/departments') || path.includes('/admin/grade-levels') || path.includes('/admin/class-levels') || path.includes('/admin/streams')) {
    return 'admin'
  }
  if (path.includes('/admin/admissions')) {
    return 'admissions'
  }
  if (path.includes('/admin/reports')) {
    return 'reports'
  }
  return null
}

// Load from localStorage with route-based fallback
const getSavedOpenSections = (): Record<SectionKey, boolean> => {
  if (process.client) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Fallback: open section based on current route
  const activeSection = getActiveSectionFromRoute()
  return {
    people: activeSection === 'people',
    academics: activeSection === 'academics',
    financial: activeSection === 'financial',
    admin: activeSection === 'admin',
    admissions: activeSection === 'admissions',
    reports: activeSection === 'reports',
  }
}

const openSections = reactive<Record<SectionKey, boolean>>(getSavedOpenSections())

// Save to localStorage on change
const saveOpenSections = () => {
  if (process.client) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections))
  }
}

const toggleSection = (section: SectionKey) => {
  // If the section is already open, close it
  if (openSections[section]) {
    openSections[section] = false
  } else {
    // Close all other sections
    Object.keys(openSections).forEach((key) => {
      openSections[key as SectionKey] = false
    })
    // Open the clicked section
    openSections[section] = true
  }
  saveOpenSections()
}

// Watch route changes and auto-open the relevant section
watch(() => route.path, () => {
  const activeSection = getActiveSectionFromRoute()
  if (activeSection && !openSections[activeSection]) {
    // Close all sections
    Object.keys(openSections).forEach((key) => {
      openSections[key as SectionKey] = false
    })
    // Open the active section
    openSections[activeSection] = true
    saveOpenSections()
  }
})

// On mount, ensure the active section is open
onMounted(() => {
  const activeSection = getActiveSectionFromRoute()
  if (activeSection && !openSections[activeSection]) {
    Object.keys(openSections).forEach((key) => {
      openSections[key as SectionKey] = false
    })
    openSections[activeSection] = true
    saveOpenSections()
  }
})

// Get branding from global state (set by init-app plugin)
const { product, appLogo } = useBrand()
</script>
